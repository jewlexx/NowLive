import { fileURLToPath } from "bun";
import init, { Image } from "image-helpers";
import path from "path";
import { log } from "./logging";

export async function run() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const profileImageBytes = await Bun.file(
    path.join(__dirname, "../profile_image-300x300.png"),
  ).bytes();

  await init();

  const image = Image.from_bytes(profileImageBytes);
  const colour = image.average_color();

  const red = colour.red;
  const green = colour.green;
  const blue = colour.blue;
  const alpha = colour.alpha;

  log(`red: ${red}, green: ${green}, blue: ${blue}, alpha: ${alpha}`);

  const base64 = image.to_base64();

  log(base64);
}

if (import.meta.main) {
  run();
}
