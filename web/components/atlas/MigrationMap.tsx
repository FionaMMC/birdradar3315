"use client";

import { useEffect, useRef, useState } from "react";
import { sitePath, stripBasePath } from "@/lib/site-path";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getMigrationHeatCells, type MigrationDataset, type MigrationHeatCell, type MigrationPoint } from "@/lib/migration-data";
import { densityTransfer, migrationKernel, pearlColor } from "./map-palette";
import styles from "./MigrationMap.module.css";
import ObservationHeatLayer from "./ObservationHeatLayer";
import { uniqueObservationPoints } from "./observation-heat";
import { nearbyLongitudeNear, nearbyPointAttribution, validNearbyCoordinate, type NearbyPoint, type NearbyResponse } from "@/lib/nearby-data";

export type MigrationMapLayer = "density" | "tracks" | "observations" | "observation-heat";
export type AreaCenter = { latitude: number; longitude: number };

export interface NearbyMapSelection {
  center: AreaCenter | null;
  data: NearbyResponse | null;
  selectedSpecies: string | null;
  month: number | null;
  onSelectSpecies: (id: string) => void;
  onMove: (center: AreaCenter) => void;
}

export interface MigrationMapProps {
  data: MigrationDataset | null;
  layer: MigrationMapLayer;
  opacity: number;
  observationDenominator?: number;
  /** Change for a new geographic selection, not for each month of playback. */
  focusKey?: string;
  onMapReady?: () => void;
  /** The same map can focus a local observation sample without remounting. */
  nearby?: NearbyMapSelection;
}

const EMPTY_DATA: MigrationDataset = { version: 1, generatedAt: "", sources: [], species: [], tracks: [], occurrences: [] };

function nearbyPopupNode(point: NearbyPoint) {
  const attribution = nearbyPointAttribution(point);
  const externalLink = (label: string, href: string) => {
    const link = document.createElement("a");
    link.textContent = label; link.href = href; link.target = "_blank"; link.rel = "noopener noreferrer";
    return link;
  };
  const node = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = point.commonName || point.scientificName;
  const date = document.createElement("p");
  date.textContent = `Recorded ${point.eventDate.slice(0, 10)}`;
  const note = document.createElement("small");
  note.textContent = "Published observation · not a live bird location";
  const uncertainty = document.createElement("small");
  uncertainty.textContent = point.coordinateUncertaintyInMeters === null ? "Location uncertainty not supplied by the publisher." : `Reported location uncertainty: ${point.coordinateUncertaintyInMeters.toLocaleString()} m.`;
  const credits = document.createElement("small");
  credits.textContent = [point.recordedBy ? `Recorded by ${point.recordedBy}` : null, point.rightsHolder && point.rightsHolder !== point.recordedBy ? `Rights holder: ${point.rightsHolder}` : null].filter(Boolean).join(" · ");
  const dataset = document.createElement("p");
  dataset.append("Dataset: ", attribution.datasetUrl ? externalLink(point.datasetName, attribution.datasetUrl) : document.createTextNode(point.datasetName));
  const license = document.createElement("p");
  license.append("License: ", attribution.licenseUrl ? externalLink(attribution.licenseLabel, attribution.licenseUrl) : document.createTextNode(attribution.licenseLabel));
  node.append(name, date, note, uncertainty);
  if (credits.textContent) node.append(credits);
  node.append(dataset, license);
  if (attribution.recordUrl) node.append(externalLink("View original record", attribution.recordUrl));
  return node;
}

function popupNode(title: string, lines: string[], note: string, url?: string, linkLabel = "View source record", birdId?: string) {
  const node = document.createElement("div");
  const heading = document.createElement("strong");
  heading.textContent = title;
  node.appendChild(heading);
  for (const line of lines) {
    const paragraph = document.createElement("p");
    paragraph.textContent = line;
    node.appendChild(paragraph);
  }
  const detail = document.createElement("small");
  detail.textContent = note;
  node.appendChild(detail);
  if (birdId) {
    const profile = document.createElement("a");
    profile.textContent = "Meet this bird →";
    profile.href = sitePath(`/species/${encodeURIComponent(birdId)}?from=map&returnTo=${encodeURIComponent(stripBasePath(window.location.pathname).replace(/\/$/, "") + window.location.search)}`);
    profile.style.display = "block";
    node.appendChild(profile);
  }
  // Source metadata is data, never executable markup.
  if (url && /^https:\/\//i.test(url)) {
    const link = document.createElement("a");
    link.textContent = linkLabel;
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    node.appendChild(link);
  }
  return node;
}

function pointCoordinates(data: MigrationDataset, layer: MigrationMapLayer): L.LatLngTuple[] {
  return layer === "observations" || layer === "observation-heat"
    ? data.occurrences.map((point) => [point.latitude, point.longitude])
    : data.tracks.flatMap((track) => track.points.map((point): L.LatLngTuple => [point.latitude, point.longitude]));
}

function fitSample(map: L.Map, data: MigrationDataset, layer: MigrationMapLayer) {
  const coordinates = pointCoordinates(data, layer);
  if (!coordinates.length) return;
  const size = map.getSize();
  const compact = size.x < 760;
  map.fitBounds(L.latLngBounds(coordinates), {
    paddingTopLeft: compact ? [28, 194] : [Math.min(320, size.x * .23), 120],
    paddingBottomRight: compact ? [48, 210] : [Math.min(270, size.x * .2), 175],
    maxZoom: layer === "observations" || layer === "observation-heat" ? 6 : 5,
    animate: false,
  });
}

/** One canvas for the field and telemetry. Repaint only when the view or data changes. */
class MigrationCanvas extends L.Layer {
  private canvas?: HTMLCanvasElement;
  private map?: L.Map;
  private frame = 0;
  private transitionFrame = 0;
  private transitionRequested = false;
  private cells: MigrationHeatCell[] = [];
  private data: MigrationDataset;
  private mode: MigrationMapLayer;
  private opacity: number;

  constructor(data: MigrationDataset, mode: MigrationMapLayer, opacity: number) {
    super();
    this.data = data;
    this.mode = mode;
    this.opacity = opacity;
    this.cells = getMigrationHeatCells(data);
  }

  onAdd(map: L.Map): this {
    this.map = map;
    this.canvas = L.DomUtil.create("canvas", "leaflet-layer leaflet-zoom-hide");
    this.canvas.style.pointerEvents = "none";
    this.canvas.setAttribute("aria-hidden", "true");
    map.getPane("overlayPane")!.appendChild(this.canvas);
    map.on("moveend resize viewreset", this.schedule, this);
    map.on("click", this.inspect, this);
    this.schedule();
    return this;
  }

  onRemove(map: L.Map): this {
    cancelAnimationFrame(this.frame);
    cancelAnimationFrame(this.transitionFrame);
    map.off("moveend resize viewreset", this.schedule, this);
    map.off("click", this.inspect, this);
    this.canvas?.remove();
    this.canvas = undefined;
    this.map = undefined;
    return this;
  }

  update(data: MigrationDataset, mode: MigrationMapLayer, opacity: number, allowTransition: boolean) {
    this.transitionRequested = allowTransition && this.data !== data && mode === "density" && this.mode === "density" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (this.data !== data) this.cells = getMigrationHeatCells(data);
    this.data = data;
    this.mode = mode;
    this.opacity = Math.max(0, Math.min(1, opacity));
    this.schedule();
  }

  cancelTransition() {
    this.transitionRequested = false;
    cancelAnimationFrame(this.transitionFrame);
  }

  private schedule = (event?: L.LeafletEvent) => {
    // A changed projection replaces the field immediately. Crossfade is only
    // valid for data updates in the same geographic frame.
    if (event) this.cancelTransition();
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.draw());
  };

  private draw() {
    if (!this.map || !this.canvas) return;
    const size = this.map.getSize();
    // A delayed stylesheet or transient layout must never allocate a page-sized
    // texture. The map lives within a viewport, even during responsive resizing.
    if (!Number.isFinite(size.x * size.y) || size.x <= 0 || size.y <= 0 || size.x > 8192 || size.y > 8192) return;
    cancelAnimationFrame(this.transitionFrame);
    const previous = this.transitionRequested && this.canvas.width > 0 && this.canvas.height > 0 && this.canvas.width * this.canvas.height <= 4_100_000 ? document.createElement("canvas") : null;
    if (previous) { previous.width = this.canvas.width; previous.height = this.canvas.height; previous.getContext("2d")?.drawImage(this.canvas, 0, 0); }
    this.transitionRequested = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(4_000_000 / (size.x * size.y)));
    this.canvas.width = Math.round(size.x * dpr);
    this.canvas.height = Math.round(size.y * dpr);
    this.canvas.style.width = `${size.x}px`;
    this.canvas.style.height = `${size.y}px`;
    L.DomUtil.setPosition(this.canvas, this.map.containerPointToLayerPoint([0, 0]));
    const context = this.canvas.getContext("2d");
    if (!context) return;
    context.scale(dpr, dpr);
    context.globalAlpha = this.opacity;
    if (this.mode === "density") this.drawDensity(context, size);
    if (this.mode === "tracks") this.drawTracks(context, size);
    if (previous && previous.width === this.canvas.width && previous.height === this.canvas.height) {
      const next = document.createElement("canvas");
      next.width = this.canvas.width; next.height = this.canvas.height;
      next.getContext("2d")?.drawImage(this.canvas, 0, 0);
      const started = performance.now();
      const blend = (now: number) => {
        if (!this.canvas) return;
        const progress = Math.min(1, (now - started) / 320);
        const ease = 1 - (1 - progress) ** 3;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, next.width, next.height);
        context.globalAlpha = 1 - ease; context.drawImage(previous, 0, 0);
        context.globalAlpha = ease; context.drawImage(next, 0, 0);
        context.globalAlpha = 1;
        if (progress < 1) this.transitionFrame = requestAnimationFrame(blend);
      };
      blend(started);
    }
  }

  private drawDensity(context: CanvasRenderingContext2D, size: L.Point) {
    if (!this.map) return;
    // Render the smoothly varying field at half resolution, then interpolate onto
    // the retina canvas. Geographic support remains bounded to nearby 1° cells.
    const resolution = Math.max(2, Math.sqrt(size.x * size.y / 1_000_000));
    const width = Math.ceil(size.x / resolution);
    const height = Math.ceil(size.y / resolution);
    const worldWidth = this.map.getPixelWorldBounds()!.getSize().x;
    const degreePixels = worldWidth / 360;
    const groups = new Map<string, MigrationHeatCell[]>();
    for (const cell of this.cells) {
      if (!groups.has(cell.speciesId)) groups.set(cell.speciesId, []);
      groups.get(cell.speciesId)!.push(cell);
    }
    const scratch = document.createElement("canvas");
    scratch.width = width;
    scratch.height = height;
    const scratchContext = scratch.getContext("2d");
    if (!scratchContext) return;
    for (const [speciesId, cells] of groups) {
      const numerator = new Float32Array(width * height);
      const denominator = new Float32Array(width * height);
      for (const cell of cells) {
        const projected = this.map.latLngToContainerPoint([cell.latitude, cell.longitude]);
        const radiusX = Math.min(120, Math.max(8, degreePixels * 2.4)) / resolution;
        const radiusY = Math.min(140, Math.max(8, degreePixels * 2.4 / Math.max(.3, Math.cos(cell.latitude * Math.PI / 180)))) / resolution;
        const cy = projected.y / resolution;
        if (cy + radiusY < 0 || cy - radiusY >= height) continue;
        for (const worldOffset of [-worldWidth, 0, worldWidth]) {
          const cx = (projected.x + worldOffset) / resolution;
          if (cx + radiusX < 0 || cx - radiusX >= width) continue;
          const minX = Math.max(0, Math.floor(cx - radiusX));
          const maxX = Math.min(width - 1, Math.ceil(cx + radiusX));
          const minY = Math.max(0, Math.floor(cy - radiusY));
          const maxY = Math.min(height - 1, Math.ceil(cy + radiusY));
          for (let y = minY; y <= maxY; y++) {
            const dy = ((y - cy) / radiusY) ** 2;
            for (let x = minX; x <= maxX; x++) {
              const kernel = migrationKernel(((x - cx) / radiusX) ** 2 + dy);
              if (!kernel) continue;
              const index = y * width + x;
              numerator[index] += cell.weight * kernel;
              denominator[index] += kernel;
            }
          }
        }
      }
      const pixels = scratchContext.createImageData(width, height);
      for (let index = 0; index < numerator.length; index++) {
        if (denominator[index] < .001) continue;
        // Weighted mean keeps more nearby grid cells from inflating the sampled
        // fraction. A fixed transfer curve is shared across every month.
        // A fixed denominator floor tapers the field to zero at its finite
        // edge; overlapping measured cells still cannot inflate sample share.
        const fraction = numerator[index] / Math.max(1, denominator[index]);
        const pearl = densityTransfer(fraction);
        const veil = Math.min(1, denominator[index]);
        const color = pearlColor(speciesId, pearl);
        // Fine, deterministic isobands follow the measured field, never an
        // invented flowing path. They remain still for reduced-motion users.
        const striation = Math.pow((Math.cos(pearl * 145) + 1) / 2, 20) * .28 * Math.sqrt(veil);
        const pixel = index * 4;
        pixels.data[pixel] = color[0] + (246 - color[0]) * striation;
        pixels.data[pixel + 1] = color[1] + (244 - color[1]) * striation;
        pixels.data[pixel + 2] = color[2] + (249 - color[2]) * striation;
        pixels.data[pixel + 3] = Math.round(255 * Math.pow(veil, .48) * (.68 + pearl * .3));
      }
      scratchContext.putImageData(pixels, 0, 0);
      context.globalCompositeOperation = "screen";
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(scratch, 0, 0, size.x, size.y);
    }
    context.globalCompositeOperation = "source-over";
  }

  private drawTracks(context: CanvasRenderingContext2D, size: L.Point) {
    if (!this.map) return;
    const species = new Map(this.data.species.map((item) => [item.id, item]));
    const worldWidth = this.map.getPixelWorldBounds()!.getSize().x;
    context.lineCap = "round";
    context.lineJoin = "round";
    for (const track of this.data.tracks) {
      if (!track.points.length) continue;
      const points = track.points.map((point) => this.map!.latLngToContainerPoint([point.latitude, point.longitude]));
      const bounds = L.bounds(points);
      const color = species.get(track.speciesId)?.color ?? "#9bcdda";
      for (const offset of [-worldWidth, 0, worldWidth]) {
        const visible = bounds.max!.x + offset > -100 && bounds.min!.x + offset < size.x + 100 && bounds.max!.y > -100 && bounds.min!.y < size.y + 100;
        if (!visible) continue;
        context.strokeStyle = color;
        context.fillStyle = color;
        if (points.length === 1) {
          context.globalAlpha = this.opacity * .65;
          context.beginPath();
          context.arc(points[0].x + offset, points[0].y, 1.7, 0, Math.PI * 2);
          context.fill();
          continue;
        }
        context.beginPath();
        points.forEach((point, i) => i === 0 ? context.moveTo(point.x + offset, point.y) : context.lineTo(point.x + offset, point.y));
        context.globalAlpha = this.opacity * .08;
        context.lineWidth = 4;
        context.stroke();
        context.globalAlpha = this.opacity * .47;
        context.lineWidth = .85;
        context.stroke();
      }
    }
    context.globalAlpha = this.opacity;
  }

  private inspect = (event: L.LeafletMouseEvent) => {
    if (!this.map || (this.mode === "observations" || this.mode === "observation-heat") || this.opacity === 0) return;
    let distance = this.mode === "density" ? 28 : 14;
    let selected: { point: Pick<MigrationPoint, "latitude" | "longitude">; displayLongitude?: number; speciesId: string; individualId?: string; sourceId?: string; timestamp?: string; cell?: MigrationHeatCell } | undefined;
    const worldWidth = this.map.getPixelWorldBounds()!.getSize().x;
    const check = (candidate: NonNullable<typeof selected>) => {
      const at = this.map!.latLngToContainerPoint([candidate.point.latitude, candidate.point.longitude]);
      for (const copy of [-1, 0, 1]) {
        const nextDistance = L.point(at.x + copy * worldWidth, at.y).distanceTo(event.containerPoint);
        if (nextDistance < distance) { distance = nextDistance; selected = { ...candidate, displayLongitude: candidate.point.longitude + copy * 360 }; }
      }
    };
    if (this.mode === "density") {
      for (const cell of this.cells) check({ point: cell, speciesId: cell.speciesId, cell });
    } else {
      for (const track of this.data.tracks) for (const point of track.points) {
        check({ point, speciesId: track.speciesId, individualId: track.individualId, sourceId: track.sourceId, timestamp: point.timestamp });
      }
    }
    if (!selected) return;
    const chosen = selected as NonNullable<typeof selected>;
    const species = this.data.species.find((item) => item.id === chosen.speciesId);
    const source = this.data.sources.find((item) => item.id === chosen.sourceId) ?? this.data.sources.find((item) => this.data.tracks.some((track) => track.speciesId === chosen.speciesId && track.sourceId === item.id));
    const lines = chosen.cell
      ? [`${chosen.cell.individualCount} tracked ${chosen.cell.individualCount === 1 ? "individual" : "individuals"} visited this 1° cell.`, `${(chosen.cell.weight * 100).toFixed(1)}% of the selected species sample.`]
      : [`Tracked individual ${chosen.individualId}`, new Date(chosen.timestamp!).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC"];
    const note = chosen.cell
      ? "Historical sample activity. The smoothed colour scale saturates at 10% and does not estimate bird abundance."
      : "A recorded position. Lines interpolate between consecutive fixes; data gaps remain open.";
    L.popup({ className: styles.popup, maxWidth: 290 }).setLatLng([chosen.point.latitude, chosen.displayLongitude ?? chosen.point.longitude]).setContent(popupNode(species?.name ?? "Tracked bird", lines, note, source?.url, "View tracking study", species?.id)).openOn(this.map);
  };
}

export default function MigrationMap({ data, layer, opacity, observationDenominator, focusKey = "default", onMapReady, nearby }: MigrationMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const overlay = useRef<MigrationCanvas | null>(null);
  const observations = useRef<L.LayerGroup | null>(null);
  const observationHeat = useRef<ObservationHeatLayer | null>(null);
  const area = useRef<L.LayerGroup | null>(null);
  const areaMarkers = useRef<{ marker: L.CircleMarker; latitude: number; longitude: number }[]>([]);
  const nearbyMarkers = useRef<{ marker: L.CircleMarker; speciesId: string; latitude: number; longitude: number }[]>([]);
  const tiles = useRef<L.TileLayer | null>(null);
  const current = useRef({ data, layer, opacity, observationDenominator, onMapReady, nearby });
  current.current = { data, layer, opacity, observationDenominator, onMapReady, nearby };
  const [tileFailed, setTileFailed] = useState(false);
  const [zoom, setZoom] = useState(3);
  const fittedSelection = useRef<string | null>(null);
  const previousSelection = useRef<string | null>(null);
  const isNearby = nearby !== undefined;
  const nearbyData = nearby?.data;
  const nearbySpecies = nearby?.selectedSpecies;
  const nearbyMonth = nearby?.month;
  const centerLatitude = nearby?.center?.latitude;
  const centerLongitude = nearby?.center?.longitude;

  useEffect(() => {
    if (!container.current) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const instance = L.map(container.current, {
      center: [10, -78], zoom: 3, minZoom: 2, maxZoom: 15, zoomSnap: .25, zoomDelta: 1,
      zoomControl: false, attributionControl: true, preferCanvas: false,
      zoomAnimation: !reducedMotion, fadeAnimation: !reducedMotion, markerZoomAnimation: !reducedMotion,
      worldCopyJump: true, keyboard: true,
    });
    map.current = instance;
    instance.attributionControl.setPrefix(false);
    instance.createPane("geographicLabels").style.zIndex = "420";
    instance.getPane("geographicLabels")!.style.pointerEvents = "none";
    const imagery = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 15, attribution: 'Imagery © <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a>, Maxar, Earthstar Geographics, GIS User Community',
      crossOrigin: "anonymous", keepBuffer: 3,
    });
    let failedTiles = 0;
    let loadedTiles = 0;
    imagery.on("loading", () => { failedTiles = 0; loadedTiles = 0; });
    imagery.on("tileerror", () => { failedTiles += 1; if (failedTiles > 2) setTileFailed(true); });
    imagery.on("tileload", () => { loadedTiles += 1; if (loadedTiles > 2 && failedTiles === 0) setTileFailed(false); });
    imagery.addTo(instance);
    tiles.current = imagery;
    L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", {
      pane: "geographicLabels", opacity: .55, maxZoom: 15,
      attribution: 'Labels © <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a>',
    }).addTo(instance);
    const field = new MigrationCanvas(current.current.data ?? EMPTY_DATA, current.current.nearby ? "observation-heat" : current.current.layer, current.current.opacity).addTo(instance);
    overlay.current = field;
    observationHeat.current = new ObservationHeatLayer({ points: [], denominator: 0, cellDegrees: 1, supportDegrees: 2.4, paletteId: "bar-tailed-godwit", opacity: current.current.opacity, visible: false }).addTo(instance);
    observations.current = L.layerGroup().addTo(instance);
    area.current = L.layerGroup().addTo(instance);
    instance.on("zoomend", () => setZoom(instance.getZoom()));
    instance.on("moveend", () => {
      // Keep a nearby search and its records on the same visible world copy.
      for (const entry of [...nearbyMarkers.current, ...areaMarkers.current]) {
        entry.marker.setLatLng([entry.latitude, nearbyLongitudeNear(entry.longitude, instance.getCenter().lng)]);
      }
      const position = instance.getCenter().wrap();
      current.current.nearby?.onMove({ latitude: Math.max(-85, Math.min(85, position.lat)), longitude: position.lng });
    });
    const resize = new ResizeObserver(() => instance.invalidateSize({ animate: false, pan: false }));
    resize.observe(container.current);
    current.current.onMapReady?.();
    return () => {
      resize.disconnect();
      instance.remove();
      map.current = null;
      overlay.current = null;
      observations.current = null;
      observationHeat.current = null;
      area.current = null;
      areaMarkers.current = [];
      nearbyMarkers.current = [];
      tiles.current = null;
    };
  }, []);

  useEffect(() => {
    const sample = data ?? EMPTY_DATA;
    const selectionKey = isNearby ? `nearby:${centerLatitude},${centerLongitude}` : focusKey;
    const allowTransition = previousSelection.current === selectionKey;
    // Local occurrences never enter the telemetry canvas or become linked routes.
    overlay.current?.update(sample, isNearby ? "observation-heat" : layer, opacity, allowTransition);
    const selectedPoints = (nearbyData?.points ?? []).filter((point) => !nearbySpecies || point.speciesId === nearbySpecies);
    const localPoints = selectedPoints.filter((point) => nearbyMonth == null || Number(point.eventDate.slice(5, 7)) === nearbyMonth);
    observationHeat.current?.update(isNearby ? {
      points: localPoints, denominator: uniqueObservationPoints(selectedPoints).length,
      cellDegrees: .01, supportDegrees: .054, paletteId: "bar-tailed-godwit", opacity, visible: layer !== "observations",
    } : {
      points: sample.occurrences, denominator: observationDenominator ?? uniqueObservationPoints(sample.occurrences).length,
      cellDegrees: 1, supportDegrees: 2.4, paletteId: sample.species[0]?.id ?? "bar-tailed-godwit", opacity, visible: layer === "observation-heat",
    }, allowTransition);
    previousSelection.current = selectionKey;
    if (isNearby) return;
    map.current?.closePopup();
    const group = observations.current;
    if (!group) return;
    group.clearLayers();
    nearbyMarkers.current = [];
    if (layer !== "observations" && layer !== "observation-heat") return;
    const species = new Map(sample.species.map((item) => [item.id, item]));
    for (const occurrence of sample.occurrences) {
      const bird = species.get(occurrence.speciesId);
      const source = sample.sources.find((item) => item.id === occurrence.sourceId);
      const dataset = source?.attributions?.find((item) => item.datasetKey === occurrence.datasetKey);
      L.circleMarker([occurrence.latitude, occurrence.longitude], {
        radius: layer === "observation-heat" ? 10 : 4.5, color: "#eee8fc", weight: .8, opacity: layer === "observation-heat" ? 0 : opacity * .8,
        fillColor: bird?.color ?? "#c5abf5", fillOpacity: layer === "observation-heat" ? 0 : opacity * .75,
      }).bindPopup(popupNode(
        bird?.name ?? "Bird observation",
        [new Date(occurrence.timestamp).toLocaleDateString("en-GB", { dateStyle: "long", timeZone: "UTC" }), `${occurrence.latitude.toFixed(3)}°, ${occurrence.longitude.toFixed(3)}°`, dataset?.title ?? "GBIF occurrence record"],
        `An independent observation, not a linked flight path. License: ${occurrence.license}`,
        occurrence.url,
        "View source record",
        bird?.id,
      ), { className: styles.popup, maxWidth: 300 }).addTo(group);
    }
  }, [data, layer, opacity, observationDenominator, focusKey, isNearby, nearbyData, nearbySpecies, nearbyMonth, centerLatitude, centerLongitude]);

  useEffect(() => {
    if (!isNearby) return;
    const group = observations.current;
    if (!group) return;
    map.current?.closePopup();
    group.clearLayers();
    nearbyMarkers.current = [];
    for (const point of nearbyData?.points ?? []) {
      if (!validNearbyCoordinate(point.latitude, point.longitude) || nearbyMonth != null && Number(point.eventDate.slice(5, 7)) !== nearbyMonth) continue;
      const longitude = nearbyLongitudeNear(point.longitude, map.current?.getCenter().lng ?? nearbyData?.center.longitude ?? point.longitude);
      const marker = L.circleMarker([point.latitude, longitude], {
        radius: 4.5, color: "#e9f9f4", weight: 1, opacity: 0, fillColor: "#8fd7cd", fillOpacity: 0,
      }).bindPopup(nearbyPopupNode(point), { className: styles.popup, maxWidth: 300 })
        .on("click", () => current.current.nearby?.onSelectSpecies(point.speciesId)).addTo(group);
      nearbyMarkers.current.push({ marker, speciesId: point.speciesId, latitude: point.latitude, longitude: point.longitude });
    }
  }, [isNearby, nearbyData, nearbyMonth]);

  useEffect(() => {
    if (!isNearby) return;
    const showPoints = layer === "observations";
    for (const { marker, speciesId } of nearbyMarkers.current) {
      const active = !nearbySpecies || speciesId === nearbySpecies;
      marker.setStyle({ weight: active ? 1 : .3, opacity: showPoints ? opacity * (active ? .95 : .12) : 0, fillOpacity: showPoints ? opacity * (active ? .8 : .08) : 0 });
      marker.setRadius(showPoints ? active && nearbySpecies ? 7 : 4.5 : active ? 10 : 0);
    }
  }, [isNearby, nearbyData, nearbyMonth, nearbySpecies, layer, opacity]);

  useEffect(() => {
    area.current?.clearLayers();
    areaMarkers.current = [];
    if (!isNearby || !map.current) return;
    // Refocus only for entering/changing a place; month, bird and opacity changes
    // retain the user's current map position and zoom.
    fittedSelection.current = null;
    if (centerLatitude === undefined || centerLongitude === undefined) return;
    const instance = map.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    overlay.current?.cancelTransition();
    instance.flyTo([centerLatitude, centerLongitude], 10, { animate: !reduced, duration: .8 });
    const group = area.current;
    if (group) {
      const ring = L.circle([centerLatitude, centerLongitude], { radius: 25000, color: "#b9d9de", weight: 1, opacity: .45, dashArray: "3 7", fillOpacity: .025, interactive: false }).addTo(group);
      const dot = L.circleMarker([centerLatitude, centerLongitude], { radius: 6, color: "#fff2cf", weight: 2, fillColor: "#1d3038", fillOpacity: 1, interactive: false }).addTo(group);
      areaMarkers.current = [ring, dot].map((marker) => ({ marker, latitude: centerLatitude, longitude: centerLongitude }));
    }
  }, [isNearby, centerLatitude, centerLongitude]);

  useEffect(() => {
    if (isNearby || !data) return;
    const hasPositions = layer === "observations" || layer === "observation-heat" ? data.occurrences.length > 0 : data.tracks.some((track) => track.points.length > 0);
    if (map.current && hasPositions && fittedSelection.current !== focusKey) {
      overlay.current?.cancelTransition();
      map.current.stop();
      fitSample(map.current, data, layer);
      fittedSelection.current = focusKey;
    }
  }, [focusKey, data, layer, isNearby]);

  function fitSelection() {
    if (!map.current) return;
    if (nearby?.center) map.current.setView([nearby.center.latitude, nearby.center.longitude], 10, { animate: false });
    else if (!nearby && data) fitSample(map.current, data, layer);
  }

  return (
    <div className={styles.frame} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div ref={container} className={styles.canvas} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-label={isNearby ? "Map of recorded birds near your chosen area. Use arrow keys to pan, plus and minus to zoom." : "Interactive historical bird migration map. Use arrow keys to pan and plus or minus to zoom."} />
      <div className={styles.controls} aria-label="Map controls">
        <button type="button" aria-label="Zoom in" title="Zoom in" disabled={zoom >= 15} onClick={() => map.current?.zoomIn()}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16M4 12h16" /></svg></button>
        <button type="button" aria-label="Zoom out" title="Zoom out" disabled={zoom <= 2} onClick={() => map.current?.zoomOut()}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16" /></svg></button>
        <button type="button" className={styles.fit} aria-label={isNearby ? "Return to searched area" : "Fit selected data on map"} title={isNearby ? "Return to searched area" : "Fit selected data"} disabled={isNearby ? !nearby?.center : !data} onClick={fitSelection}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4" /><circle cx="12" cy="12" r="3" /></svg></button>
      </div>
      {tileFailed && <div className={styles.warning} role="status"><span>Satellite imagery is unavailable. Bird records remain visible.</span><button type="button" onClick={() => { setTileFailed(false); tiles.current?.redraw(); }}>Retry imagery</button></div>}
    </div>
  );
}
