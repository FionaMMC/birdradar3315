/** Species hue is stable; increasing pearl lightness expresses sample activity. */
type RGB = readonly [number, number, number];

/** Fixed across species and months: the visible legend is 0% / 5% / 10%+. */
export const DENSITY_SATURATION = .1;

export function densityTransfer(fraction: number): number {
  return Math.pow(Math.min(1, Math.max(0, fraction) / DENSITY_SATURATION), .45);
}

const PEARL_PALETTES: Record<string, readonly RGB[]> = {
  osprey: [[22, 119, 177], [49, 185, 242], [133, 121, 244], [209, 149, 242], [255, 174, 132], [255, 236, 203]],
  "bar-tailed-godwit": [[28, 116, 180], [60, 185, 224], [152, 132, 238], [218, 159, 230], [255, 192, 161], [255, 242, 212]],
  "eastern-curlew": [[124, 86, 156], [194, 113, 180], [237, 144, 162], [249, 177, 155], [255, 211, 176], [255, 243, 215]],
  "waved-albatross": [[14, 116, 141], [34, 178, 205], [72, 220, 231], [127, 235, 216], [195, 244, 205], [239, 252, 224]],
};

export function pearlColor(speciesId: string, value: number): RGB {
  const palette = PEARL_PALETTES[speciesId] ?? PEARL_PALETTES.osprey;
  const position = Math.min(1, Math.max(0, value)) * (palette.length - 1);
  const index = Math.min(palette.length - 2, Math.floor(position));
  const mix = position - index;
  return [0, 1, 2].map((channel) => palette[index][channel] + (palette[index + 1][channel] - palette[index][channel]) * mix) as [number, number, number];
}

/** A finite kernel: no heat is drawn beyond the measured cell's neighbourhood. */
export function migrationKernel(squaredDistance: number): number {
  if (squaredDistance >= 1 || squaredDistance < 0) return 0;
  const edge = 1 - squaredDistance;
  return edge * edge * (0.28 + 0.72 * edge * edge);
}
