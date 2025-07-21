import { Jimp } from 'jimp';

/**
 * Creates a solid color PNG image and writes it to the specified path.
 * @param path The file path to write the image to.
 * @param width The width of the image in pixels.
 * @param height The height of the image in pixels.
 * @param color The color as [R, G, B, A] (0-255 each).
 */
export async function createSolidColorImage(
  path: string,
  width: number,
  height: number,
  color: [number, number, number, number] = [255, 0, 0, 255],
) {
  const image = new Jimp({ width, height });
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (this: any, x, y, idx) {
    this.bitmap.data[idx + 0] = color[0]; // Red
    this.bitmap.data[idx + 1] = color[1]; // Green
    this.bitmap.data[idx + 2] = color[2]; // Blue
    this.bitmap.data[idx + 3] = color[3]; // Alpha
  });
  await image.write(path as any);
}
