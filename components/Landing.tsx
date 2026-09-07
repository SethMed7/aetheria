"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleAlert,
  Code2,
  Download,
  LoaderCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createArtworkPreviews } from "@/lib/engine";
import { EXPORT_RESOLUTIONS, exportWallpaper } from "@/lib/export";
import { STARTER_ARTWORKS, studioHref } from "@/lib/presets";
import { AetheriaMark } from "@/components/AetheriaMark";

const STARTER_RESOLUTION = EXPORT_RESOLUTIONS[0];

export function Landing() {
  const [previews, setPreviews] = useState<string[]>([]);
  const [previewError, setPreviewError] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    message: string;
    kind: "success" | "error";
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      try {
        const generated = createArtworkPreviews(
          STARTER_ARTWORKS.map((artwork) => artwork.params),
          960,
          600,
        );
        if (!cancelled) setPreviews(generated);
      } catch {
        if (!cancelled) setPreviewError(true);
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const downloadStarter = async (index: number) => {
    const artwork = STARTER_ARTWORKS[index];
    if (!artwork || !STARTER_RESOLUTION) return;

    setDownloading(artwork.id);
    try {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
      await exportWallpaper(artwork.params, STARTER_RESOLUTION);
      setNotice({ message: `${artwork.name} downloaded in 4K`, kind: "success" });
    } catch (error) {
      setNotice({
        message: error instanceof Error ? error.message : "The artwork could not be downloaded.",
        kind: "error",
      });
    } finally {
      setDownloading(null);
    }
  };

  const heroStyle = previews[0]
    ? { backgroundImage: `url(${previews[0]})` }
    : undefined;

  return (
    <main id="main-content" className="landing-shell">
      <a className="skip-link" href="#starter-art">
        Skip to free artwork
      </a>

      <header className="landing-nav">
        <Link href="/" className="landing-brand" aria-label="Aetheria home">
          <AetheriaMark size={28} />
          <span>Aetheria</span>
        </Link>
        <nav aria-label="Primary navigation">
          <a href="#starter-art">Free artwork</a>
          <a
            href="https://github.com/SethMed7/aetheria"
            target="_blank"
            rel="noreferrer"
          >
            Source <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <Link className="nav-studio-link" href="/studio">
            Open studio <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </nav>
      </header>

      <section className="landing-hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">
            Backgrounds made of dots.
            <span>Tuned by hand.</span>
          </h1>
          <p>
            A free, open-source WebGL instrument for shaping cinematic
            backgrounds in seconds. No account. No upload. No watermark.
          </p>
          <div className="hero-actions">
            <Link className="landing-primary-action" href="/studio">
              Generate your own <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <a className="landing-text-link" href="#starter-art">
              Browse free downloads
            </a>
          </div>
        </div>

        <div
          className={`hero-art palette-obsidian ${previews[0] ? "is-rendered" : ""}`}
          style={heroStyle}
          role="img"
          aria-label="Cyan Drift, a cyan and silver warped halftone background"
        >
          <span className="hero-art-label">Cyan Drift</span>
          <span className="hero-art-data">Seed 184729 · WebGL 2</span>
        </div>
      </section>

      <section id="starter-art" className="starter-section" aria-labelledby="starter-title">
        <div className="section-intro">
          <h2 id="starter-title">Start with one. Keep every pixel.</h2>
          <p>
            Six ready-made 4K PNGs, rendered in your browser and free for any
            project. Open one in the studio to change its color, texture, seed,
            or type.
          </p>
        </div>

        <div className="starter-gallery">
          {STARTER_ARTWORKS.map((artwork, index) => {
            const preview = previews[index];
            const isDownloading = downloading === artwork.id;
            return (
              <figure className="starter-artwork" key={artwork.id}>
                <div
                  className={`starter-preview palette-${artwork.id} ${preview ? "is-rendered" : ""}`}
                  style={preview ? { backgroundImage: `url(${preview})` } : undefined}
                  role="img"
                  aria-label={`${artwork.name}: ${artwork.description}`}
                />
                <figcaption>
                  <div>
                    <h3>{artwork.name}</h3>
                    <p>{artwork.description}</p>
                  </div>
                  <div className="starter-actions">
                    <button
                      type="button"
                      disabled={Boolean(downloading)}
                      onClick={() => downloadStarter(index)}
                      aria-label={`Download ${artwork.name} as a 4K PNG`}
                    >
                      {isDownloading ? (
                        <LoaderCircle className="spin-icon" size={15} aria-hidden="true" />
                      ) : (
                        <Download size={15} aria-hidden="true" />
                      )}
                      {isDownloading ? "Rendering" : "Download 4K"}
                    </button>
                    <Link href={studioHref(artwork.params)}>
                      Make it yours <ArrowUpRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>

        {previewError && (
          <p className="preview-note" role="status">
            Live previews need WebGL 2. Downloads remain available in a supported browser.
          </p>
        )}
      </section>

      <section className="open-section" aria-labelledby="open-title">
        <div className="open-heading">
          <h2 id="open-title">The source is part of the product.</h2>
          <a
            href="https://github.com/SethMed7/aetheria"
            target="_blank"
            rel="noreferrer"
          >
            <Code2 size={18} aria-hidden="true" />
            Explore on GitHub
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
        <div className="open-principles">
          <article>
            <span>01</span>
            <h3>Local by design</h3>
            <p>Your artwork, saved seeds, and exports stay in your browser.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Built for remixing</h3>
            <p>MIT licensed, readable TypeScript, and one focused WebGL shader.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Full-resolution output</h3>
            <p>Export lossless 4K, 5K, and vertical mobile PNGs without a server.</p>
          </article>
        </div>
      </section>

      <section className="final-invitation" aria-labelledby="final-title">
        <div>
          <h2 id="final-title">One seed away from your own atmosphere.</h2>
          <p>Shape it, save it, export it. Aetheria is free from first dot to final pixel.</p>
        </div>
        <Link href="/studio">
          Open the studio <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>

      <footer className="landing-footer">
        <Link href="/" className="landing-brand" aria-label="Aetheria home">
          <AetheriaMark size={24} />
          <span>Aetheria</span>
        </Link>
        <p>Open source under the MIT License.</p>
        <a href="https://sethmedina.com" target="_blank" rel="noreferrer">
          Made by Seth Medina <ArrowUpRight size={13} aria-hidden="true" />
        </a>
      </footer>

      <div className={`landing-toast ${notice ? `visible ${notice.kind}` : ""}`} role="status" aria-live="polite">
        {notice?.kind === "error" ? (
          <CircleAlert size={15} aria-hidden="true" />
        ) : (
          <Check size={15} aria-hidden="true" />
        )}
        {notice?.message}
      </div>
    </main>
  );
}
