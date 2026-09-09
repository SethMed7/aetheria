"use client";

import { ArrowLeft, Download, Expand, Minimize, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Atmosphere } from "@/components/Atmosphere";
import { AetheriaParams, ARTWORK_STYLES } from "@/lib/engine";
import { downloadWallpaper, EXPORT_RESOLUTIONS, renderWallpaper } from "@/lib/export";

export function ExportPreview({ params, onClose }: { params: AetheriaParams; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [resolutionId, setResolutionId] = useState("4k");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ id: string; params: AetheriaParams; blob: Blob; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState("");
  const resolution = EXPORT_RESOLUTIONS.find((item) => item.id === resolutionId)!;
  const ready = result?.id === resolutionId && result.params === params ? result : null;

  useEffect(() => {
    const dialog = dialogRef.current!;
    const fullscreenTarget = fullscreenRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog.showModal();
    const changed = () => setFullscreen(document.fullscreenElement === fullscreenTarget);
    document.addEventListener("fullscreenchange", changed);
    return () => {
      document.removeEventListener("fullscreenchange", changed);
      if (document.fullscreenElement === fullscreenTarget) void document.exitFullscreen().catch(() => {});
      dialog.close();
      previousFocus?.focus();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let url: string | undefined;
    // Give the loading state a paint before asking the GPU for the full-size PNG.
    const timer = window.setTimeout(async () => {
      try {
        const blob = await renderWallpaper(params, resolution);
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setResult({ id: resolution.id, params, blob, url });
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Preview could not be rendered.");
      }
    }, 80);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (url) URL.revokeObjectURL(url);
    };
  }, [params, resolution, attempt]);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await fullscreenRef.current?.requestFullscreen();
    } catch {
      setNotice("Full screen is unavailable in this browser. The complete artwork is shown below.");
    }
  };

  return (
    <dialog ref={dialogRef} className="export-preview" aria-labelledby="preview-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <div ref={fullscreenRef} className="preview-frame">
      <Atmosphere />
      <header className="preview-toolbar">
        <button type="button" className="top-button preview-back" aria-label="Back to editor" onClick={onClose}><ArrowLeft size={16} /><span>Back to editor</span></button>
        <div className="preview-title"><h2 id="preview-title">{ARTWORK_STYLES[params.style].label}</h2><span>Seed {params.seed}</span></div>
        <div className="preview-actions">
          <label className="preview-resolution"><span className="sr-only">Export size</span>
            <select value={resolutionId} onChange={(event) => { setResolutionId(event.target.value); setError(null); setNotice(""); }}>
              {EXPORT_RESOLUTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <button type="button" className="top-button fullscreen-button" onClick={toggleFullscreen} aria-label={fullscreen ? "Exit full screen" : "Enter full screen"} title={fullscreen ? "Exit full screen" : "Full screen"}>
            {fullscreen ? <Minimize size={16} /> : <Expand size={16} />}
          </button>
          <button type="button" className="top-button primary-button preview-download" aria-label="Download PNG" disabled={!ready} onClick={() => { if (ready) { downloadWallpaper(ready.blob, params, resolution); setNotice(`${resolution.label} PNG downloaded`); } }}>
            <Download size={16} /><span>Download PNG</span>
          </button>
        </div>
      </header>
      <div className="preview-artwork" aria-busy={!ready && !error}>
        {ready ? (
          // This blob is the actual export, rendered locally, and must not pass through an image optimizer.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ready.url} width={resolution.width} height={resolution.height} alt={`${ARTWORK_STYLES[params.style].label} wallpaper, seed ${params.seed}, ${resolution.detail}${params.text ? `, ${params.text}` : ""}`} />
        ) : error ? <div className="preview-message" role="alert"><strong>Couldn’t render this preview</strong><p>{error}</p><button type="button" className="top-button" onClick={() => { setError(null); setAttempt((value) => value + 1); }}><RefreshCw size={15} />Try again</button></div>
          : <div className="preview-message" role="status"><span className="spinner" /><strong>Preparing your {resolution.label} preview</strong><p>Rendering the complete image at {resolution.detail}.</p></div>}
      </div>
      <footer className="preview-footer"><span>{resolution.detail} · PNG</span><span role="status" aria-live="polite">{notice || "The image you see is the image you download."}</span></footer>
      </div>
    </dialog>
  );
}
