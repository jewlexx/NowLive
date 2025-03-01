import { fileURLToPath } from "bun";
import { getAverageColor } from "fast-average-color-node";
import getImageType from "image-type";
import path from "path";
import { log } from "./logging";

export async function run() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const profileImageBytes = await Bun.file(
    path.join(__dirname, "../profile_image-300x300-emiru.png"),
  ).arrayBuffer();
  const profileImageBuffer = Buffer.from(profileImageBytes);

  const colour = await getAverageColor(profileImageBuffer, {
    algorithm: "dominant",
  });

  log(colour.rgba);

  const base64 = profileImageBuffer.toString("base64url");
  const imageType = await getImageType(profileImageBuffer);

  const base64Url = `data:${imageType?.mime};base64,${base64}`;

  // log(base64Url);
}

if (import.meta.main) {
  run();
}
