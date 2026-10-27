import { createReadStream, createWriteStream } from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import type { Readable } from 'node:stream';
import sharp from 'sharp';

interface UploadFile {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  filepath?: string;
  tmpWorkingDirectory: string;
  getStream: () => Readable;
}

// Runs before Strapi generates thumbnails and responsive sizes, so every
// derived image inherits the WebP encoding and matching metadata.
export async function convertPhotoToWebp(file: UploadFile) {
  if (file.mime === 'image/webp') return file;

  const filepath = path.join(file.tmpWorkingDirectory, `webp-${file.hash}.webp`);
  const transformer = sharp({ animated: true }).rotate().webp({ quality: 80 });
  let info: sharp.OutputInfo | undefined;
  transformer.on('info', (output) => { info = output; });
  await pipeline(file.getStream(), transformer, createWriteStream(filepath));
  if (!info) throw new Error('WebP conversion did not produce image metadata');

  return {
    ...file,
    name: `${path.parse(file.name).name}.webp`,
    ext: '.webp',
    mime: 'image/webp',
    filepath,
    getStream: () => createReadStream(filepath),
    width: info.width,
    height: info.pageHeight ?? info.height,
    size: Math.round((info.size / 1000) * 100) / 100,
    sizeInBytes: info.size,
  };
}

export default (plugin: any) => {
  const service = plugin.services['image-manipulation'];
  // Sharp reports AVIF as HEIF, which Strapi's format allowlist misses.
  for (const method of ['isImage', 'isOptimizableImage'] as const) {
    const original = service[method];
    service[method] = async (file: UploadFile) => {
      if (await original(file)) return true;
      if (file.mime !== 'image/avif' || !file.filepath) return false;
      try {
        const metadata = await sharp(file.filepath).metadata();
        return metadata.format === 'heif' && metadata.compression === 'av1';
      } catch {
        return false;
      }
    };
  }
  // Strapi calls optimize only for supported raster photos (JPEG, PNG,
  // TIFF, AVIF, WebP). SVG, GIF, and other uploads keep their usual behavior.
  service.optimize = convertPhotoToWebp;
  return plugin;
};
