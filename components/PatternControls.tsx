"use client";

import { useEffect, useState } from "react";
import { AetheriaParams, ARTWORK_STYLES, ArtworkStyle, createArtworkPreviews, DEFAULT_PARAMS, FLOW_MODES, FlowMode } from "@/lib/engine";

export function PatternControls({ params, onChange }: { params: AetheriaParams; onChange: <K extends keyof AetheriaParams>(key: K, value: AetheriaParams[K]) => void }) {
  const [previews, setPreviews] = useState<string[]>([]);
  const styles = Object.keys(ARTWORK_STYLES) as ArtworkStyle[];

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setPreviews(createArtworkPreviews((Object.keys(ARTWORK_STYLES) as ArtworkStyle[]).map((style) => ({ ...DEFAULT_PARAMS, style, text: "", curves: 50, zoom: ["dots", "ribbons", "terraces"].includes(style) ? 1 : 2.5 })), 160, 100));
      } catch { /* Labels keep the selector usable when WebGL is unavailable. */ }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return <section className="pattern-control" aria-label="Pattern and flow">
    <div className="section-label"><span>Pattern</span><span>{ARTWORK_STYLES[params.style].label}</span></div>
    <div className="style-options" role="group" aria-label="Artwork style">
      {styles.map((style, index) => <button type="button" key={style} className={params.style === style ? "selected" : ""} aria-pressed={params.style === style} onClick={() => onChange("style", style)}>
        <span className="style-thumbnail" style={previews[index] ? { backgroundImage: `url(${previews[index]})` } : undefined} aria-hidden="true" />
        <span>{ARTWORK_STYLES[style].label}</span>
      </button>)}
    </div>
    <p className="style-description">{ARTWORK_STYLES[params.style].description}</p>
    <div className="section-label"><span>Flow</span></div>
    <div className="flow-options" role="group" aria-label="Pattern flow">
      {(Object.keys(FLOW_MODES) as FlowMode[]).map((flow) => <button type="button" key={flow} aria-pressed={params.flow === flow} className={params.flow === flow ? "selected" : ""} onClick={() => onChange("flow", flow)}>{FLOW_MODES[flow]}</button>)}
    </div>
  </section>;
}
