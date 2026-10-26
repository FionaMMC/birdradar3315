import L from "leaflet";
import { densityTransfer, migrationKernel, pearlColor } from "./map-palette";
import { observationHeatCells, type ObservationHeatPoint, type ObservationHeatCell } from "./observation-heat";

export interface ObservationHeatOptions {
  points: readonly ObservationHeatPoint[];
  /** All selected species' records in the source period, before the month filter. */
  denominator: number;
  cellDegrees: number;
  /** Finite geographic radius in latitude degrees. Longitude is latitude-corrected. */
  supportDegrees: number;
  paletteId: string;
  opacity: number;
  visible: boolean;
}

/** Shared pearl material for regional and neighbourhood observation samples. */
export default class ObservationHeatLayer extends L.Layer {
  private canvas?: HTMLCanvasElement;
  private map?: L.Map;
  private frame = 0;
  private fadeFrame = 0;
  private crossfade = false;
  private cells: ObservationHeatCell[];
  constructor(private heatOptions: ObservationHeatOptions) {
    super();
    this.cells = observationHeatCells(heatOptions.points, heatOptions.denominator, heatOptions.cellDegrees);
  }
  onAdd(map: L.Map): this {
    this.map = map;
    this.canvas = L.DomUtil.create("canvas", "leaflet-layer leaflet-zoom-hide");
    this.canvas.style.pointerEvents = "none";
    this.canvas.setAttribute("aria-hidden", "true");
    map.getPane("overlayPane")!.appendChild(this.canvas);
    map.on("moveend resize viewreset", this.schedule, this);
    this.schedule();
    return this;
  }
  onRemove(map: L.Map): this {
    cancelAnimationFrame(this.frame); cancelAnimationFrame(this.fadeFrame);
    map.off("moveend resize viewreset", this.schedule, this);
    this.canvas?.remove(); this.canvas = undefined; this.map = undefined;
    return this;
  }
  update(options: ObservationHeatOptions, allowTransition = false) {
    this.crossfade = allowTransition && options.visible && this.heatOptions.visible && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.heatOptions = options;
    this.cells = observationHeatCells(options.points, options.denominator, options.cellDegrees);
    this.schedule();
  }
  private schedule = (event?: L.LeafletEvent) => {
    if (event) { this.crossfade = false; cancelAnimationFrame(this.fadeFrame); }
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.draw());
  };
  private draw() {
    if (!this.map || !this.canvas) return;
    const size = this.map.getSize();
    if (size.x <= 0 || size.y <= 0 || size.x > 8192 || size.y > 8192) return;
    cancelAnimationFrame(this.fadeFrame);
    const previous = this.crossfade && this.canvas.width * this.canvas.height <= 4_100_000 ? document.createElement("canvas") : null;
    if (previous) { previous.width = this.canvas.width; previous.height = this.canvas.height; previous.getContext("2d")?.drawImage(this.canvas, 0, 0); }
    this.crossfade = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(4_000_000 / (size.x * size.y)));
    this.canvas.width = Math.round(size.x * dpr); this.canvas.height = Math.round(size.y * dpr);
    this.canvas.style.width = `${size.x}px`; this.canvas.style.height = `${size.y}px`;
    L.DomUtil.setPosition(this.canvas, this.map.containerPointToLayerPoint([0, 0]));
    const context = this.canvas.getContext("2d");
    if (!context || !this.heatOptions.visible || !this.cells.length) return;
    const resolution = Math.max(2, Math.sqrt(size.x * size.y / 700_000));
    const width = Math.ceil(size.x / resolution), height = Math.ceil(size.y / resolution);
    const field = new Float32Array(width * height);
    const worldWidth = this.map.getPixelWorldBounds()!.getSize().x;
    const degreePixels = worldWidth / 360;
    for (const cell of this.cells) {
      // No screen-space minimum: zooming out never invents broad coverage.
      const radius = this.heatOptions.supportDegrees * degreePixels / Math.max(.087, Math.cos(cell.latitude * Math.PI / 180)) / resolution;
      if (radius <= 0) continue;
      const projected = this.map.latLngToContainerPoint([cell.latitude, cell.longitude]);
      const cy = projected.y / resolution;
      if (cy + radius < 0 || cy - radius >= height) continue;
      for (const copy of [-1, 0, 1]) {
        const cx = (projected.x + copy * worldWidth) / resolution;
        if (cx + radius < 0 || cx - radius >= width) continue;
        const minX = Math.max(0, Math.floor(cx - radius)), maxX = Math.min(width - 1, Math.ceil(cx + radius));
        const minY = Math.max(0, Math.floor(cy - radius)), maxY = Math.min(height - 1, Math.ceil(cy + radius));
        for (let y = minY; y <= maxY; y++) {
          const dy = ((y - cy) / radius) ** 2;
          for (let x = minX; x <= maxX; x++) field[y * width + x] += cell.weight * migrationKernel(((x - cx) / radius) ** 2 + dy);
        }
      }
    }
    const scratch = document.createElement("canvas"); scratch.width = width; scratch.height = height;
    const scratchContext = scratch.getContext("2d");
    if (!scratchContext) return;
    const pixels = scratchContext.createImageData(width, height);
    for (let index = 0; index < field.length; index++) {
      const fraction = field[index];
      if (fraction < .00001) continue;
      const pearl = densityTransfer(fraction);
      const veil = Math.min(1, fraction / .012);
      const color = pearlColor(this.heatOptions.paletteId, pearl);
      const striation = Math.pow((Math.cos(pearl * 145) + 1) / 2, 20) * .28 * Math.sqrt(veil);
      const pixel = index * 4;
      pixels.data[pixel] = color[0] + (246 - color[0]) * striation;
      pixels.data[pixel + 1] = color[1] + (244 - color[1]) * striation;
      pixels.data[pixel + 2] = color[2] + (249 - color[2]) * striation;
      pixels.data[pixel + 3] = Math.round(255 * Math.pow(veil, .42) * (.55 + pearl * .4));
    }
    scratchContext.putImageData(pixels, 0, 0);
    context.scale(dpr, dpr); context.globalAlpha = Math.max(0, Math.min(1, this.heatOptions.opacity));
    context.globalCompositeOperation = "screen"; context.imageSmoothingEnabled = true; context.imageSmoothingQuality = "high";
    context.drawImage(scratch, 0, 0, size.x, size.y);
    if (previous && previous.width === this.canvas.width && previous.height === this.canvas.height) {
      const next = document.createElement("canvas"); next.width = this.canvas.width; next.height = this.canvas.height;
      next.getContext("2d")?.drawImage(this.canvas, 0, 0);
      const started = performance.now();
      const blend = (now: number) => {
        if (!this.canvas) return;
        const progress = Math.min(1, (now - started) / 320), ease = 1 - (1 - progress) ** 3;
        context.setTransform(1, 0, 0, 1, 0, 0); context.globalCompositeOperation = "source-over"; context.clearRect(0, 0, next.width, next.height);
        context.globalAlpha = 1 - ease; context.drawImage(previous, 0, 0); context.globalAlpha = ease; context.drawImage(next, 0, 0); context.globalAlpha = 1;
        if (progress < 1) this.fadeFrame = requestAnimationFrame(blend);
      };
      blend(started);
    }
  }
}
