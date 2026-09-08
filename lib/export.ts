import { AetheriaParams, AetheriaRenderer, drawArtworkText, PALETTES } from "@/lib/engine";

export interface ExportResolution {
  id: string;
  label: string;
  detail: string;
  width: number;
  height: number;
}

export const EXPORT_RESOLUTIONS: ExportResolution[] = [
  { id: "4k", label: "4K Desktop", detail: "3840 × 2160", width: 3840, height: 2160 },
  { id: "5k", label: "5K Desktop", detail: "5120 × 2880", width: 5120, height: 2880 },
  { id: "mobile", label: "Mobile", detail: "2160 × 3840", width: 2160, height: 3840 },
];

export async function renderWallpaper(params: AetheriaParams, resolution: ExportResolution): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = resolution.width;
  canvas.height = resolution.height;
  const composed = document.createElement("canvas");
  composed.width = resolution.width;
  composed.height = resolution.height;
  const context = composed.getContext("2d");
  if (!context) throw new Error("The text layer could not be created.");
  let renderer: AetheriaRenderer | undefined;
  try {
    renderer = new AetheriaRenderer(canvas);
    renderer.render(params, { time: 0, sync: true });
    context.drawImage(canvas, 0, 0, resolution.width, resolution.height);
    drawArtworkText(context, params, resolution.width, resolution.height);
    return await new Promise<Blob>((resolve, reject) => {
      composed.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error("The PNG could not be encoded."));
      }, "image/png");
    });
  } finally {
    renderer?.destroy(true);
    canvas.width = canvas.height = composed.width = composed.height = 1;
  }
}

export function downloadWallpaper(blob: Blob, params: AetheriaParams, resolution: ExportResolution) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const palette = PALETTES[params.palette].name.toLowerCase().replaceAll(" ", "-");
  anchor.download = `aetheria-${params.style}-${palette}-${params.seed}-${resolution.id}.png`;
  anchor.href = url;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export async function exportWallpaper(params: AetheriaParams, resolution: ExportResolution) {
  downloadWallpaper(await renderWallpaper(params, resolution), params, resolution);
}
