"use client";

import {
  Bookmark,
  Check,
  Blend,
  CircleDot,
  Copy,
  Expand,
  PanelLeftClose,
  SlidersHorizontal,
  MoveHorizontal,
  MoveVertical,
  RotateCcw,
  RotateCw,
  ZoomIn,
  Waves,
  Gauge,
  Layers3,
  Palette,
  PanelRight,
  Shuffle,
  Sparkles,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AetheriaParams, AetheriaRenderer, createArtworkPreviews, CustomColors, DEFAULT_PARAMS, drawArtworkText, PALETTES, ARTWORK_STYLES, FLOW_MODES, randomSeed, TEXT_FONTS, TextFont } from "@/lib/engine";
import { normalizeParams, paramsFromQuery, paramsToQuery, isColor } from "@/lib/params";
import { ExportPreview } from "./ExportPreview";
import { PatternControls } from "./PatternControls";
import { PRESET_COLORS, PRESETS, PresetId } from "@/lib/presets";
import { AetheriaMark } from "@/components/AetheriaMark";
import { Atmosphere } from "@/components/Atmosphere";

const STORAGE_KEY = "aetheria.saved-seeds.v1";

type SavedArtwork = {
  id: string;
  createdAt: number;
  params: AetheriaParams;
  preview?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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
  const paramsRef = useRef(params);
  const requestDrawRef = useRef<() => void>(() => {});
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    paramsRef.current = params;
    requestDrawRef.current();
  }, [params]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: AetheriaRenderer | null = null;
    let observer: ResizeObserver | null = null;
    let frame = 0;
    let disposed = false;

    const draw = () => {
      frame = 0;
      if (disposed || !renderer) return;
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(bounds.width * dpr));
      const height = Math.max(1, Math.round(bounds.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      renderer.render(paramsRef.current, { time: 0 });
    };

    // Coalesce edits and resizes into one frame; idle artwork does no rendering work.
    const requestDraw = () => {
      if (!disposed && !frame) frame = requestAnimationFrame(draw);
    };

    const initializationTimer = window.setTimeout(() => {
      if (disposed) return;
      try {
        renderer = new AetheriaRenderer(canvas);
      } catch {
        setRenderError(true);
        return;
      }
      requestDrawRef.current = requestDraw;
      observer = new ResizeObserver(requestDraw);
      observer.observe(canvas);
      requestDraw();
    }, 64);

    return () => {
      disposed = true;
      requestDrawRef.current = () => {};
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
      aria-label={`Static ${PALETTES[params.palette].name} ${ARTWORK_STYLES[params.style].label.toLowerCase()} wallpaper preview${params.text.trim() ? ` with centered text ${params.text.trim()}` : ""}`}

    />
  );
}

function ArtworkTextCanvas({ text, textColor, textFont }: Pick<AetheriaParams, "text" | "textColor" | "textFont">) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const draw = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(bounds.width * dpr));
      const height = Math.max(1, Math.round(bounds.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      } else {
        context.clearRect(0, 0, width, height);
      }
      drawArtworkText(context, { text, textColor, textFont }, width, height);
    };

    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    draw();
    return () => observer.disconnect();
  }, [text, textColor, textFont]);

  return <canvas ref={canvasRef} className="artwork-text-canvas" aria-hidden="true" />;
}

export function Studio() {
  const [params, setParams] = useState<AetheriaParams>(DEFAULT_PARAMS);
  const [saved, setSaved] = useState<SavedArtwork[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(true);
  const [editorSection, setEditorSection] = useState<"pattern" | "color" | "text">("pattern");
  const collapseRef = useRef<HTMLButtonElement>(null);
  const showEditorRef = useRef<HTMLButtonElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setParams(paramsFromQuery(new URLSearchParams(window.location.search)));
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as SavedArtwork[];
        if (Array.isArray(stored)) {
          const normalized = stored.filter((item) => item && typeof item.id === "string" && item.params && typeof item.params === "object").slice(0, 24).map((item) => {
            const legacyParams = item.params as Partial<AetheriaParams> & { renderMode?: unknown };
            const needsDotsPreview = Object.prototype.hasOwnProperty.call(legacyParams, "renderMode");
            const needsTextPreview = typeof legacyParams.text !== "string" || !(legacyParams.textFont && legacyParams.textFont in TEXT_FONTS) || !isColor(legacyParams.textColor ?? null);
            return {
              ...item,
              params: normalizeParams(legacyParams),
              preview: needsDotsPreview || needsTextPreview ? undefined : item.preview,
            };
          });
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
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* Storage may be disabled. */ }
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
      if (previewOpen) return;
      const target = event.target as HTMLElement | null;
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey || target?.closest("[contenteditable=true]")) return;
      if (event.code === "Space" && !event.repeat && !target?.matches("input, button, summary, textarea, select")) {
        event.preventDefault();
        shuffle();
      }
      if (event.key.toLowerCase() === "g" && !target?.matches("input, textarea, select")) setGalleryOpen((open) => !open);
      if (event.key === "Escape") {
        if (galleryOpen) setGalleryOpen(false);
        else { setEditorOpen(true); requestAnimationFrame(() => collapseRef.current?.focus()); }
      }
      if (event.key.toLowerCase() === "h" && !target?.matches("input, textarea, select")) {
        setEditorOpen((open) => !open);
        requestAnimationFrame(() => (editorOpen ? showEditorRef : collapseRef).current?.focus());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shuffle, previewOpen, galleryOpen, editorOpen]);

  const selectPreset = (id: PresetId) => {
    const preset = PRESETS.find((item) => item.id === id);
    if (!preset) return;
    setParams((current) => ({ ...current, palette: id, customColors: PRESET_COLORS[id] }));
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
    const query = paramsToQuery(params);
    const url = `${window.location.origin}${window.location.pathname}?${query}`;
    window.history.replaceState(null, "", url);
    try {
      await navigator.clipboard.writeText(url);
      setToast("Share link copied");
    } catch {
      setToast("Share link added to the address bar");
    }
  };

  const isSaved = useMemo(() => saved.some((item) => JSON.stringify(item.params) === JSON.stringify(params)), [params, saved]);

  return (
    <main className="studio-shell">
      <Atmosphere />
      <h1 className="sr-only">Aetheria generative background studio</h1>
      <ArtCanvas params={params} />
      {editorOpen && <div className="canvas-scrim" aria-hidden="true" />}
      <ArtworkTextCanvas text={params.text} textColor={params.textColor} textFont={params.textFont} />

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
          <button className="top-button icon-only-mobile" type="button" onClick={share} aria-label="Share artwork">
            <Copy size={16} /><span>Share</span>
          </button>
          <button className={`top-button icon-only-mobile ${isSaved ? "is-active" : ""}`} type="button" onClick={saveCurrent} aria-label={isSaved ? "Artwork saved" : "Save artwork"}>
            {isSaved ? <Check size={16} /> : <Bookmark size={16} />}<span>{isSaved ? "Saved" : "Save"}</span>
          </button>
          <button className="top-button gallery-button" type="button" onClick={() => setGalleryOpen(true)} aria-label={`Open saved artwork gallery${saved.length > 0 ? `, ${saved.length} saved` : ""}`} aria-expanded={galleryOpen}>
            <PanelRight size={16} /><span>Gallery</span>{saved.length > 0 && <em>{saved.length}</em>}
          </button>
          <button type="button" className="top-button primary-button" onClick={() => { setGalleryOpen(false); setPreviewOpen(true); }} aria-label="Preview and export wallpaper"><Expand size={16} /><span>Preview & export</span></button>
        </nav>
      </header>

      <aside id="generation-controls" className="control-panel" aria-label="Generation controls" hidden={!editorOpen}>
        <div className="panel-heading">
          <div>
            <span className="panel-title">Atmosphere</span>
            <span className="panel-subtitle">Shape the field</span>
          </div>
          <div className="panel-heading-actions">
          <button className="shuffle-button" type="button" onClick={shuffle} title="Shuffle (Space)">
            <Shuffle size={15} /> Shuffle <kbd>Space</kbd>
          </button>
          <button ref={collapseRef} type="button" className="collapse-editor" aria-label="Hide editor" aria-expanded={editorOpen} aria-controls="generation-controls" title="Hide editor (H)" onClick={() => { setEditorOpen(false); requestAnimationFrame(() => showEditorRef.current?.focus()); }}><PanelLeftClose size={17} /></button>
          </div>
        </div>
        <div className="editor-sections" role="group" aria-label="Editor section">
          {(["pattern", "color", "text"] as const).map((section) => <button key={section} type="button" aria-pressed={editorSection === section} className={editorSection === section ? "selected" : ""} onClick={() => setEditorSection(section)}>{section[0].toUpperCase() + section.slice(1)}</button>)}
        </div>
        <div className="panel-body">
        <div hidden={editorSection !== "color"}>
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

        <SliderControl label="Film grain" value={params.grain} min={0} max={0.28} step={0.01} icon={<Blend size={15} />} onChange={(value) => update("grain", value)} display={`${Math.round(params.grain * 100)}%`} />
        <div className="blend-control">
          <span><Sparkles size={15} /> Compositing</span>
          <div role="group" aria-label="Color blend mode">
            {(["screen", "overlay"] as const).map((mode) => <button key={mode} type="button" className={params.blendMode === mode ? "selected" : ""} onClick={() => update("blendMode", mode)} aria-pressed={params.blendMode === mode}>{mode[0].toUpperCase() + mode.slice(1)}</button>)}
          </div>
        </div>
        </div>
        <div hidden={editorSection !== "text"} className="text-control">
          <div className="text-control-heading">
            <span><Type size={15} /> Center text</span>
            <label className="text-color" title="Text color">
              <input type="color" value={params.textColor} onChange={(event) => update("textColor", event.target.value)} aria-label="Text color" />
              <span>Color</span>
            </label>
          </div>
          <input
            className="text-input"
            type="text"
            value={params.text}
            maxLength={48}
            placeholder="Leave blank to hide"
            aria-label="Centered artwork text"
            onChange={(event) => update("text", event.target.value)}
          />
          <div className="font-options" role="group" aria-label="Text font">
            {(Object.entries(TEXT_FONTS) as Array<[TextFont, (typeof TEXT_FONTS)[TextFont]]>).map(([id, font]) => (
              <button key={id} type="button" className={params.textFont === id ? "selected" : ""} onClick={() => update("textFont", id)} aria-pressed={params.textFont === id}>
                <span style={{ fontFamily: font.family, fontWeight: font.weight }}>Aa</span>
                {font.label}
              </button>
            ))}
          </div>
        </div>

        <div hidden={editorSection !== "pattern"}>
          <PatternControls params={params} onChange={update} />
          <div className="controls-stack">
            <SliderControl label={params.style === "dots" ? "Dot density" : "Pattern density"} value={params.curves} min={50} max={100} step={1} icon={<CircleDot size={15} />} onChange={(value) => update("curves", value)} />
            <SliderControl label={params.style === "dots" ? "Dot scale" : "Shape scale"} value={params.thickness} min={0.5} max={2.6} step={0.05} icon={<Layers3 size={15} />} onChange={(value) => update("thickness", value)} display={`${params.thickness.toFixed(2)}×`} />
            {params.style !== "dots" && <SliderControl label="Relief" value={params.relief} min={0} max={1} step={0.01} icon={<Sparkles size={15} />} onChange={(value) => update("relief", value)} display={`${Math.round(params.relief * 100)}%`} />}
          </div>
          <details className="composition-controls" open>
            <summary>Wave & position <span>Move, turn, and shape</span></summary>
            <SliderControl label="Horizontal position" value={params.offsetX} min={-1} max={1} step={0.01} icon={<MoveHorizontal size={15} />} onChange={(value) => update("offsetX", value)} display={`${Math.round(params.offsetX * 100)}%`} />
            <SliderControl label="Vertical position" value={params.offsetY} min={-1} max={1} step={0.01} icon={<MoveVertical size={15} />} onChange={(value) => update("offsetY", value)} display={`${Math.round(params.offsetY * 100)}%`} />
            <SliderControl label="Rotation" value={params.rotation} min={-180} max={180} step={1} icon={<RotateCw size={15} />} onChange={(value) => update("rotation", value)} display={`${params.rotation}°`} />
            <SliderControl label="Zoom" value={params.zoom} min={0.4} max={3} step={0.05} icon={<ZoomIn size={15} />} onChange={(value) => update("zoom", value)} display={`${params.zoom.toFixed(2)}×`} />
            <SliderControl label="Wave spacing" value={params.wavelength} min={0.3} max={3} step={0.05} icon={<Waves size={15} />} onChange={(value) => update("wavelength", value)} display={`${params.wavelength.toFixed(2)}×`} />
            {params.flow !== "rows" && <SliderControl label="Wave height" value={params.amplitude} min={0} max={2} step={0.05} icon={<Waves size={15} />} onChange={(value) => update("amplitude", value)} display={`${Math.round(params.amplitude * 100)}%`} />}
            {params.flow !== "rows" && <SliderControl label="Turbulence" value={params.turbulence} min={0} max={1} step={0.01} icon={<Gauge size={15} />} onChange={(value) => update("turbulence", value)} display={`${Math.round(params.turbulence * 100)}%`} />}
            <SliderControl label="Field spread" value={params.spread} min={0.2} max={1.25} step={0.01} icon={<Layers3 size={15} />} onChange={(value) => update("spread", value)} display={`${Math.round(params.spread * 100)}%`} />
            <button type="button" className="reset-composition" onClick={() => setParams((current) => ({ ...current, offsetX: 0, offsetY: 0, rotation: 0, zoom: 1, wavelength: 1, amplitude: 1, turbulence: DEFAULT_PARAMS.turbulence, spread: DEFAULT_PARAMS.spread }))}><RotateCcw size={13} /> Reset composition</button>
          </details>
        </div>
        </div>
        <div className="panel-footer"><span>{ARTWORK_STYLES[params.style].label} · {FLOW_MODES[params.flow]}</span><button type="button" onClick={() => setPreviewOpen(true)}><Expand size={13} /> Clean preview</button></div>
      </aside>

      {!editorOpen && <button ref={showEditorRef} type="button" className="show-editor top-button" aria-expanded={false} aria-controls="generation-controls" onClick={() => { setEditorOpen(true); requestAnimationFrame(() => collapseRef.current?.focus()); }}><SlidersHorizontal size={16} /> Show editor <kbd>H</kbd></button>}

      <div className="corner-note" aria-hidden="true">
        <span>{ARTWORK_STYLES[params.style].label.toUpperCase()}</span>
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
              <p>Save an atmosphere to keep its text, palette, seed, and field settings close.</p>
              <button type="button" onClick={() => { saveCurrent(); setGalleryOpen(false); }}>Save current atmosphere</button>
            </div>
          ) : saved.map((item) => (
            <article className="saved-item" key={item.id}>
              <button className="saved-load" type="button" onClick={() => { setParams(normalizeParams(item.params)); setGalleryOpen(false); }}>
                <span
                  className={`saved-preview palette-${item.params.palette}`}
                  style={item.preview ? { backgroundImage: `url(${item.preview})` } : undefined}
                  role="img"
                  aria-label={`${ARTWORK_STYLES[item.params.style].label} preview for seed ${item.params.seed}${item.params.text.trim() ? ` with text ${item.params.text.trim()}` : ""}`}
                />
                <span className="saved-copy">
                  <strong>{PALETTES[item.params.palette].name}</strong>
                  <small>{ARTWORK_STYLES[item.params.style].label} · Seed {item.params.seed}</small>
                </span>
              </button>
              <button className="delete-saved" type="button" onClick={() => deleteSaved(item.id)} aria-label={`Delete seed ${item.params.seed}`}><Trash2 size={15} /></button>
            </article>
          ))}
        </div>
      </aside>

      {previewOpen && <ExportPreview params={params} onClose={() => setPreviewOpen(false)} />}

      <div className={`toast ${toast ? "visible" : ""}`} role="status" aria-live="polite">
        <Check size={15} /> {toast}
      </div>
    </main>
  );
}
