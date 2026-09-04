"use client";

import {
  Bookmark,
  Check,
  ChevronDown,
  Blend,
  CircleDot,
  Copy,
  Download,
  Gauge,
  ImageDown,
  Layers3,
  Palette,
  PanelRight,
  Shuffle,
  Sparkles,
  Trash2,
  Waves,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AetheriaParams, AetheriaRenderer, createArtworkPreviews, CustomColors, DEFAULT_PARAMS, PALETTES, PaletteId, RenderMode, randomSeed } from "@/lib/engine";
import { EXPORT_RESOLUTIONS, ExportResolution, exportWallpaper } from "@/lib/export";

const STORAGE_KEY = "aetheria.saved-seeds.v1";

type SavedArtwork = {
  id: string;
  createdAt: number;
  params: AetheriaParams;
  preview?: string;
};

type PresetId = Exclude<PaletteId, "custom">;

const PRESET_COLORS: Record<PresetId, CustomColors> = {
  obsidian: { background: "#dbe0e0", primary: "#00b8d1", secondary: "#006ec2" },
  solar: { background: "#e0d6c2", primary: "#f06414", secondary: "#b81f12" },
  violet: { background: "#c9ccdb", primary: "#843bea", secondary: "#216bdb" },
  emerald: { background: "#c9d9d1", primary: "#009e78", secondary: "#006679" },
  coral: { background: "#e6d1d1", primary: "#f24059", secondary: "#a81542" },
  cobalt: { background: "#cfd6e6", primary: "#1459f2", secondary: "#261fa6" },
  citron: { background: "#dbdfbf", primary: "#a1e00d", secondary: "#29872e" },
  mono: { background: "#dededb", primary: "#292b2e", secondary: "#6b6e70" },
};

const PRESETS: Array<{ id: PresetId; note: string; params: Partial<AetheriaParams> }> = [
  { id: "obsidian", note: "Cyan halftone", params: { curves: 78, turbulence: 0.64, spread: 0.82, thickness: 1.08, grain: 0.08 } },
  { id: "solar", note: "Amber diffusion", params: { curves: 68, turbulence: 0.72, spread: 0.74, thickness: 1.22, grain: 0.1 } },
  { id: "violet", note: "Ultraviolet mesh", params: { curves: 86, turbulence: 0.78, spread: 0.9, thickness: 0.96, grain: 0.07 } },
  { id: "emerald", note: "Mineral field", params: { curves: 62, turbulence: 0.48, spread: 0.78, thickness: 1.18, grain: 0.09 } },
  { id: "coral", note: "Warm pigment", params: { curves: 72, turbulence: 0.58, spread: 0.88, thickness: 1.12, grain: 0.08 } },
  { id: "cobalt", note: "Deep electric", params: { curves: 84, turbulence: 0.7, spread: 0.76, thickness: 0.92, grain: 0.07 } },
  { id: "citron", note: "Acid botanical", params: { curves: 66, turbulence: 0.52, spread: 0.84, thickness: 1.14, grain: 0.09 } },
  { id: "mono", note: "Graphic neutral", params: { curves: 76, turbulence: 0.6, spread: 0.8, thickness: 0.88, grain: 0.13 } },
];

const MODES: Array<{ id: RenderMode; label: string }> = [
  { id: "dots", label: "Dots" },
  { id: "waves", label: "Waves" },
  { id: "sheaths", label: "Sheaths" },
  { id: "blend", label: "Blend" },
];

const DOT_A_POINTS = [
  [10, 4], [14, 4], [18, 4],
  [6, 8], [22, 8],
  [6, 12], [22, 12],
  [6, 16], [10, 16], [14, 16], [18, 16], [22, 16],
  [6, 20], [22, 20],
  [6, 24], [22, 24],
] as const;

function AetheriaMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      {DOT_A_POINTS.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.45" fill="currentColor" />)}
    </svg>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isColor(value: string | null): value is string {
  return Boolean(value && /^#[0-9a-f]{6}$/i.test(value));
}

function normalizeParams(value: Partial<AetheriaParams>): AetheriaParams {
  const palette = value.palette && value.palette in PALETTES ? value.palette : DEFAULT_PARAMS.palette;
  const renderMode = MODES.some((mode) => mode.id === value.renderMode) ? value.renderMode! : DEFAULT_PARAMS.renderMode;
  return {
    ...DEFAULT_PARAMS,
    ...value,
    palette,
    renderMode,
    customColors: {
      ...DEFAULT_PARAMS.customColors,
      ...(value.customColors ?? {}),
    },
  };
}

function paramsFromUrl(): Partial<AetheriaParams> {
  const query = new URLSearchParams(window.location.search);
  const palette = query.get("palette") as PaletteId | null;
  const blend = query.get("blend");
  const mode = query.get("mode") as RenderMode | null;
  const numberValue = (key: string, min: number, max: number) => {
    const queryValue = query.get(key);
    if (queryValue === null) return undefined;
    const raw = Number(queryValue);
    return Number.isFinite(raw) ? clamp(raw, min, max) : undefined;
  };
  const result: Partial<AetheriaParams> = {};
  const seed = numberValue("seed", 1, 999999999);
  const curves = numberValue("curves", 50, 100);
  const turbulence = numberValue("turbulence", 0.1, 1);
  const spread = numberValue("spread", 0.2, 1.25);
  const thickness = numberValue("thickness", 0.5, 2.6);
  const grain = numberValue("grain", 0, 0.28);
  if (seed !== undefined) result.seed = seed;
  if (palette && palette in PALETTES) result.palette = palette;
  if (curves !== undefined) result.curves = curves;
  if (turbulence !== undefined) result.turbulence = turbulence;
  if (spread !== undefined) result.spread = spread;
  if (thickness !== undefined) result.thickness = thickness;
  if (grain !== undefined) result.grain = grain;
  if (blend === "screen" || blend === "overlay") result.blendMode = blend;
  if (MODES.some((option) => option.id === mode)) result.renderMode = mode!;
  const background = query.get("background");
  const primary = query.get("primary");
  const secondary = query.get("secondary");
  if (isColor(background) || isColor(primary) || isColor(secondary)) {
    result.customColors = {
      background: isColor(background) ? background : DEFAULT_PARAMS.customColors.background,
      primary: isColor(primary) ? primary : DEFAULT_PARAMS.customColors.primary,
      secondary: isColor(secondary) ? secondary : DEFAULT_PARAMS.customColors.secondary,
    };
  }
  return result;
}

function formatValue(value: number, suffix = "") {
  return Number.isInteger(value) ? `${value}${suffix}` : `${value.toFixed(2)}${suffix}`;
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  icon,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  icon: React.ReactNode;
  onChange: (value: number) => void;
  display?: string;
}) {
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <label className="control-row">
      <span className="control-label">
        <span className="control-icon" aria-hidden="true">{icon}</span>
        {label}
      </span>
      <span className="control-value">{display ?? formatValue(value)}</span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ "--progress": `${progress}%` } as React.CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function ArtCanvas({ params }: { params: AetheriaParams }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const paramsRef = useRef(params);
  const needsRender = useRef(true);
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    paramsRef.current = params;
    needsRender.current = true;
  }, [params]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: AetheriaRenderer | null = null;
    let observer: ResizeObserver | null = null;
    let initializationTimer = 0;
    let frame = 0;
    let disposed = false;

    const initialize = () => {
      if (disposed) return;
      try {
        renderer = new AetheriaRenderer(canvas);
      } catch {
        setRenderError(true);
        return;
      }
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let lastFrame = 0;
      const start = performance.now();

      const resize = () => {
        const bounds = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const nextWidth = Math.max(1, Math.round(bounds.width * dpr));
        const nextHeight = Math.max(1, Math.round(bounds.height * dpr));
        if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
          canvas.width = nextWidth;
          canvas.height = nextHeight;
          needsRender.current = true;
        }
      };

      const draw = (now: number) => {
        const animationDue = document.visibilityState === "visible" && !reducedMotion && now - lastFrame > 32;
        if (renderer && (needsRender.current || animationDue)) {
          const elapsed = reducedMotion ? 0 : (now - start) / 1000;
          renderer.render(paramsRef.current, {
            time: elapsed + pointer.current.x * 0.34 + pointer.current.y * 0.12,
          });
          needsRender.current = false;
          lastFrame = now;
        }
        frame = requestAnimationFrame(draw);
      };

      observer = new ResizeObserver(() => {
        resize();
        needsRender.current = true;
      });
      observer.observe(canvas);
      resize();
      draw(start);
    };

    initializationTimer = window.setTimeout(initialize, 64);

    return () => {
      disposed = true;
      window.clearTimeout(initializationTimer);
      cancelAnimationFrame(frame);
      observer?.disconnect();
      renderer?.destroy();
    };
  }, []);

  if (renderError) {
    return (
      <div className="canvas-error" role="alert">
        <AetheriaMark size={30} />
        <strong>WebGL 2 is unavailable</strong>
        <span>Enable hardware acceleration or open Aetheria in a current browser.</span>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="art-canvas"
      aria-label={`Animated ${PALETTES[params.palette].name} ${params.renderMode} wallpaper preview`}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        pointer.current = {
          x: event.clientX / bounds.width - 0.5,
          y: event.clientY / bounds.height - 0.5,
        };
      }}
    />
  );
}

function ExportMenu({ onExport, exporting }: { onExport: (resolution: ExportResolution) => void; exporting: string | null }) {
  return (
    <details className="export-menu">
      <summary className="top-button primary-button">
        {exporting ? <span className="spinner" aria-hidden="true" /> : <Download size={16} />}
        <span>{exporting ? "Rendering" : "Export"}</span>
        <ChevronDown size={14} />
      </summary>
      <div className="export-popover">
        <div className="popover-heading">
          <span>Export PNG</span>
          <span>Lossless</span>
        </div>
        {EXPORT_RESOLUTIONS.map((resolution) => (
          <button key={resolution.id} type="button" disabled={Boolean(exporting)} onClick={() => onExport(resolution)}>
            <span className="export-icon"><ImageDown size={16} /></span>
            <span><strong>{resolution.label}</strong><small>{resolution.detail}</small></span>
            {exporting === resolution.id && <span className="spinner" aria-label="Rendering" />}
          </button>
        ))}
      </div>
    </details>
  );
}

export function Studio() {
  const [params, setParams] = useState<AetheriaParams>(DEFAULT_PARAMS);
  const [saved, setSaved] = useState<SavedArtwork[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setParams((current) => normalizeParams({ ...current, ...paramsFromUrl() }));
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as SavedArtwork[];
        if (Array.isArray(stored)) {
          const normalized = stored.slice(0, 24).map((item) => ({ ...item, params: normalizeParams(item.params) }));
          const missing = normalized.filter((item) => !item.preview);
          if (missing.length === 0) {
            setSaved(normalized);
            return;
          }
          try {
            const generated = createArtworkPreviews(missing.map((item) => item.params));
            let previewIndex = 0;
            const hydrated = normalized.map((item) => item.preview ? item : { ...item, preview: generated[previewIndex++] });
            setSaved(hydrated);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(hydrated)); } catch { /* Storage can be disabled or full. */ }
          } catch {
            setSaved(normalized);
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const update = useCallback(<K extends keyof AetheriaParams>(key: K, value: AetheriaParams[K]) => {
    setParams((current) => ({ ...current, [key]: value }));
  }, []);

  const shuffle = useCallback(() => {
    setParams((current) => ({
      ...current,
      seed: randomSeed(),
      turbulence: clamp(current.turbulence + (Math.random() - 0.5) * 0.24, 0.1, 1),
      spread: clamp(current.spread + (Math.random() - 0.5) * 0.2, 0.2, 1.25),
    }));
    setToast("New atmosphere generated");
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.code === "Space" && !event.repeat && !target?.matches("input, button, summary, textarea, select")) {
        event.preventDefault();
        shuffle();
      }
      if (event.key.toLowerCase() === "g" && !target?.matches("input, textarea, select")) setGalleryOpen((open) => !open);
      if (event.key === "Escape") setGalleryOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shuffle]);

  const selectPreset = (id: PresetId) => {
    const preset = PRESETS.find((item) => item.id === id);
    if (!preset) return;
    setParams((current) => ({ ...current, ...preset.params, palette: id, customColors: PRESET_COLORS[id] }));
  };

  const activeColors = params.palette === "custom" ? params.customColors : PRESET_COLORS[params.palette];

  const updateCustomColor = (key: keyof CustomColors, value: string) => {
    setParams((current) => ({
      ...current,
      palette: "custom",
      customColors: { ...activeColors, [key]: value },
    }));
  };

  const saveCurrent = () => {
    const duplicate = saved.some((item) => JSON.stringify(item.params) === JSON.stringify(params));
    if (duplicate) {
      setToast("This atmosphere is already saved");
      return;
    }
    let preview: string | undefined;
    try {
      [preview] = createArtworkPreviews([params]);
    } catch {
      // Preserve the seed even if this browser cannot encode a thumbnail.
    }
    const next = [{ id: crypto.randomUUID(), createdAt: Date.now(), params, preview }, ...saved].slice(0, 24);
    setSaved(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setToast("Saved to your gallery");
    } catch {
      setToast("Saved for this session — browser storage is full");
    }
  };

  const deleteSaved = (id: string) => {
    const next = saved.filter((item) => item.id !== id);
    setSaved(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      setToast("Removed for this session — browser storage is unavailable");
    }
  };

  const share = async () => {
    const query = new URLSearchParams({
      seed: String(params.seed),
      palette: params.palette,
      curves: String(params.curves),
      turbulence: params.turbulence.toFixed(2),
      spread: params.spread.toFixed(2),
      thickness: params.thickness.toFixed(2),
      grain: params.grain.toFixed(2),
      blend: params.blendMode,
      mode: params.renderMode,
      background: params.customColors.background,
      primary: params.customColors.primary,
      secondary: params.customColors.secondary,
    });
    const url = `${window.location.origin}${window.location.pathname}?${query}`;
    window.history.replaceState(null, "", url);
    try {
      await navigator.clipboard.writeText(url);
      setToast("Share link copied");
    } catch {
      setToast("Share link added to the address bar");
    }
  };

  const handleExport = async (resolution: ExportResolution) => {
    setExporting(resolution.id);
    try {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
      await exportWallpaper(params, resolution);
      setToast(`${resolution.label} PNG exported`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Export failed");
    } finally {
      setExporting(null);
    }
  };

  const isSaved = useMemo(() => saved.some((item) => JSON.stringify(item.params) === JSON.stringify(params)), [params, saved]);

  return (
    <main className="studio-shell">
      <h1 className="sr-only">Aetheria generative background studio</h1>
      <ArtCanvas params={params} />
      <div className="canvas-scrim" aria-hidden="true" />

      <header className="topbar">
        <Link href="/" className="brand" aria-label="Aetheria home">
          <span className="brand-mark"><AetheriaMark /></span>
          <span>Aetheria</span>
        </Link>
        <div className="seed-readout" aria-label={`Current seed ${params.seed}`}>
          <span className="signal-dot" />
          Seed {params.seed}
        </div>
        <nav className="top-actions" aria-label="Artwork actions">
          <button className="top-button icon-only-mobile" type="button" onClick={share}>
            <Copy size={16} /><span>Share</span>
          </button>
          <button className={`top-button icon-only-mobile ${isSaved ? "is-active" : ""}`} type="button" onClick={saveCurrent}>
            {isSaved ? <Check size={16} /> : <Bookmark size={16} />}<span>{isSaved ? "Saved" : "Save"}</span>
          </button>
          <button className="top-button gallery-button" type="button" onClick={() => setGalleryOpen(true)} aria-expanded={galleryOpen}>
            <PanelRight size={16} /><span>Gallery</span>{saved.length > 0 && <em>{saved.length}</em>}
          </button>
          <ExportMenu onExport={handleExport} exporting={exporting} />
        </nav>
      </header>

      <aside className="control-panel" aria-label="Generation controls">
        <div className="panel-heading">
          <div>
            <span className="panel-title">Atmosphere</span>
            <span className="panel-subtitle">Shape the field</span>
          </div>
          <button className="shuffle-button" type="button" onClick={shuffle} title="Shuffle (Space)">
            <Shuffle size={15} /> Shuffle <kbd>Space</kbd>
          </button>
        </div>

        <div className="palette-control">
          <div className="palette-heading">
            <span><Palette size={15} /> Color</span>
            <strong>{PALETTES[params.palette].name}</strong>
          </div>
          <div className="palette-swatches" role="group" aria-label="Palette presets">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={params.palette === preset.id ? "selected" : ""}
                onClick={() => selectPreset(preset.id)}
                aria-label={`${PALETTES[preset.id].name}: ${preset.note}`}
                aria-pressed={params.palette === preset.id}
                title={PALETTES[preset.id].name}
              >
                <span className={`preset-orb palette-${preset.id}`} />
              </button>
            ))}
          </div>
          <div className="custom-colors" aria-label="Custom palette colors">
            {([
              ["background", "Canvas"],
              ["primary", "Primary"],
              ["secondary", "Accent"],
            ] as const).map(([key, label]) => (
              <label key={key}>
                <input
                  type="color"
                  value={activeColors[key]}
                  onChange={(event) => updateCustomColor(key, event.target.value)}
                  aria-label={`${label} color`}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mode-control">
          <span className="mode-label">Field style</span>
          <div role="group" aria-label="Field rendering style">
            {MODES.map((mode) => {
              const icon = mode.id === "dots" ? <CircleDot size={14} /> : mode.id === "waves" ? <Waves size={14} /> : mode.id === "sheaths" ? <Layers3 size={14} /> : <Blend size={14} />;
              return (
                <button key={mode.id} type="button" className={params.renderMode === mode.id ? "selected" : ""} onClick={() => update("renderMode", mode.id)} aria-pressed={params.renderMode === mode.id}>
                  {icon}<span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="controls-stack">
          <SliderControl label="Mesh density" value={params.curves} min={50} max={100} step={1} icon={<Waves size={15} />} onChange={(value) => update("curves", value)} />
          <SliderControl label="Turbulence" value={params.turbulence} min={0.1} max={1} step={0.01} icon={<Gauge size={15} />} onChange={(value) => update("turbulence", value)} display={`${Math.round(params.turbulence * 100)}%`} />
          <SliderControl label="Field spread" value={params.spread} min={0.2} max={1.25} step={0.01} icon={<Layers3 size={15} />} onChange={(value) => update("spread", value)} display={`${Math.round(params.spread * 100)}%`} />
          <SliderControl label="Pattern scale" value={params.thickness} min={0.5} max={2.6} step={0.05} icon={<CircleDot size={15} />} onChange={(value) => update("thickness", value)} display={`${params.thickness.toFixed(2)}×`} />
          <SliderControl label="Film grain" value={params.grain} min={0} max={0.28} step={0.01} icon={<Blend size={15} />} onChange={(value) => update("grain", value)} display={`${Math.round(params.grain * 100)}%`} />
        </div>

        <div className="blend-control">
          <span><Sparkles size={15} /> Compositing</span>
          <div role="group" aria-label="Color blend mode">
            {(["screen", "overlay"] as const).map((mode) => (
              <button key={mode} type="button" className={params.blendMode === mode ? "selected" : ""} onClick={() => update("blendMode", mode)} aria-pressed={params.blendMode === mode}>
                {mode[0].toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="corner-note" aria-hidden="true">
        <span>{params.renderMode.toUpperCase()} FIELD</span>
        <i />
        <span>{params.curves} DENSITY</span>
      </div>

      {galleryOpen && <button className="gallery-backdrop" aria-label="Close gallery" onClick={() => setGalleryOpen(false)} />}
      <aside className={`gallery-drawer ${galleryOpen ? "open" : ""}`} inert={!galleryOpen} aria-hidden={!galleryOpen} aria-label="Saved artwork gallery">
        <div className="gallery-header">
          <div><span>Saved atmospheres</span><small>Stored in this browser</small></div>
          <button type="button" onClick={() => setGalleryOpen(false)} aria-label="Close gallery"><X size={18} /></button>
        </div>
        <div className="gallery-list">
          {saved.length === 0 ? (
            <div className="empty-gallery">
              <span><Bookmark size={22} /></span>
              <strong>Your gallery is quiet</strong>
              <p>Save an atmosphere to keep its palette, seed, and field settings close.</p>
              <button type="button" onClick={() => { saveCurrent(); setGalleryOpen(false); }}>Save current atmosphere</button>
            </div>
          ) : saved.map((item) => (
            <article className="saved-item" key={item.id}>
              <button className="saved-load" type="button" onClick={() => { setParams(normalizeParams(item.params)); setGalleryOpen(false); }}>
                <span
                  className={`saved-preview palette-${item.params.palette}`}
                  style={item.preview ? { backgroundImage: `url(${item.preview})` } : undefined}
                  role="img"
                  aria-label={`${item.params.renderMode} preview for seed ${item.params.seed}`}
                />
                <span className="saved-copy">
                  <strong>{PALETTES[item.params.palette].name}</strong>
                  <small>Seed {item.params.seed} · {item.params.renderMode}</small>
                </span>
              </button>
              <button className="delete-saved" type="button" onClick={() => deleteSaved(item.id)} aria-label={`Delete seed ${item.params.seed}`}><Trash2 size={15} /></button>
            </article>
          ))}
        </div>
      </aside>

      <div className={`toast ${toast ? "visible" : ""}`} role="status" aria-live="polite">
        <Check size={15} /> {toast}
      </div>
    </main>
  );
}
