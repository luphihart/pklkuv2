import sharp from 'sharp';

export async function compressAndWatermarkImage(
  buffer: Buffer,
  watermarkText?: string,
): Promise<Buffer> {
  let image = sharp(buffer).resize({ width: 800, withoutEnlargement: true });

  if (watermarkText) {
    const svgWatermark = Buffer.from(`
      <svg width="600" height="60">
        <rect x="0" y="0" width="100%" height="100%" fill="rgba(0, 0, 0, 0.5)"/>
        <text x="15" y="38" font-size="20" fill="white" font-family="sans-serif" font-weight="bold">${watermarkText}</text>
      </svg>
    `);
    image = image.composite([{ input: svgWatermark, gravity: 'south' }]);
  }

  return image.jpeg({ quality: 80 }).toBuffer();
}
