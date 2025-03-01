use serde::{Deserialize, Serialize};

mod utils;

// TODO: Use the log crate and intercept that instead of this
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

use base64::prelude::*;
use image::{DynamicImage, GenericImageView};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn initialize() {
    utils::set_panic_hook();
    log!("Initialized wasm!");
}

#[derive(Debug, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct Image {
    bytes: bytes::Bytes,
}

#[wasm_bindgen]
impl Image {
    pub fn from_bytes(bytes: web_sys::js_sys::Uint8Array) -> Self {
        Self {
            bytes: bytes::Bytes::from(bytes.to_vec()),
        }
    }

    pub async fn download_url(url: String) -> Self {
        log!("Downloading {url}...");
        let bytes = reqwest::get(url).await.unwrap().bytes().await.unwrap();

        Self { bytes }
    }

    pub fn to_base64(&self) -> String {
        let image_format = image::guess_format(&self.bytes).expect("valid image format");

        let data = BASE64_STANDARD.encode(&self.bytes);

        format!("data:{};base64,{data}", image_format.to_mime_type())
    }

    pub fn average_color_sqrt(&self) -> Colour {
        let image = image::load_from_memory(&self.bytes).expect("valid image loaded");
        Colour::sqrt_algorithm(image)
    }

    pub fn average_color_dominant(&self) -> Colour {
        let image = image::load_from_memory(&self.bytes).expect("valid image loaded");
        Colour::dominant_algorithm(image)
    }
}

#[derive(Debug, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct Colour {
    pub red: u8,
    pub green: u8,
    pub blue: u8,
    pub alpha: u8,
}

#[wasm_bindgen]
impl Colour {
    // #[wasm_bindgen]
    // pub fn to_object(&self) -> JsValue {}

    fn new(colours: [u8; 4]) -> Self {
        let [red, green, blue, alpha] = colours;

        Self {
            red,
            green,
            blue,
            alpha,
        }
    }

    #[wasm_bindgen]
    pub fn is_light(&self) -> bool {
        // http://www.w3.org/TR/AERT#color-contrast
        let result =
            ((self.red as u32) * 299 + (self.green as u32) * 587 + (self.blue as u32) * 114) / 1000;

        result < 128
    }

    fn sqrt_algorithm(image: DynamicImage) -> Self {
        let pixels = image.pixels();
        let mut red_total: f64 = 0.0;
        let mut green_total: f64 = 0.0;
        let mut blue_total: f64 = 0.0;
        let mut alpha_total: f64 = 0.0;
        let count = image.width() * image.height();

        for pixel in pixels {
            let [red, green, blue, alpha] = {
                let [red, green, blue, alpha] = pixel.2 .0;
                [red as f64, green as f64, blue as f64, alpha as f64]
            };

            red_total += red * red * alpha;
            green_total += green * green * alpha;
            blue_total += blue * blue * alpha;
            alpha_total += alpha;
        }

        let red = (red_total / alpha_total).sqrt().round();
        let blue = (blue_total / alpha_total).sqrt().round();
        let green = (green_total / alpha_total).sqrt().round();
        let alpha = (alpha_total / count as f64).round();

        Self::new([red as u8, green as u8, blue as u8, alpha as u8])
    }

    fn dominant_algorithm(image: DynamicImage) -> Self {
        const DEFAULT_DOMINANT_DIVIDER: f32 = 24.0;

        let mut color_hash = nohash_hasher::IntMap::<u32, [f32; 5]>::default();
        let mut max = [0f32; 5];

        let pixels = image.pixels();

        for pixel in pixels {
            // Extract the RGBA values from the pixel
            let [red, green, blue, alpha] = {
                let [red, green, blue, alpha] = pixel.2 .0;
                [red as f32, green as f32, blue as f32, alpha as f32]
            };

            let key = u32::from_le_bytes([
                (red / DEFAULT_DOMINANT_DIVIDER).round() as u8,
                (green / DEFAULT_DOMINANT_DIVIDER).round() as u8,
                (blue / DEFAULT_DOMINANT_DIVIDER).round() as u8,
                0,
            ]);

            let color_entry = if let Some(color_entry) = color_hash.get_mut(&key) {
                color_entry[0] += red * alpha;
                color_entry[1] += green * alpha;
                color_entry[2] += blue * alpha;
                color_entry[3] += alpha;
                color_entry[4] += 1.0;
                color_entry
            } else {
                color_hash.insert(key, [red * alpha, green * alpha, blue * alpha, alpha, 1.0]);
                unsafe { color_hash.get_mut(&key).unwrap_unchecked() }
            };

            if max[4] < color_entry[4] {
                max = *color_entry;
            }
        }

        let total_red = max[0];
        let total_green = max[1];
        let total_blue = max[2];
        let total_alpha = max[3];
        let total_count = max[4];

        Self::new([
            (total_red / total_count).round() as u8,
            (total_green / total_count).round() as u8,
            (total_blue / total_count).round() as u8,
            (total_alpha / total_count).round() as u8,
        ])
    }
}
