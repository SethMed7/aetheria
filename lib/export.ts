import { AetheriaParams, AetheriaRenderer, PALETTES } from "@/lib/engine";

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

export async function exportWallpaper(params: AetheriaParams, resolution: ExportResolution) {
  const canvas = document.createElement("canvas");
  canvas.width = resolution.width;
  canvas.height = resolution.height;
  const renderer = new AetheriaRenderer(canvas);
  renderer.render(params, { time: 0, sync: true });
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("The PNG could not be encoded."));
    }, "image/png");
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const palette = PALETTES[params.palette].name.toLowerCase().replaceAll(" ", "-");
  anchor.download = `aetheria-${palette}-${params.seed}-${resolution.id}.png`;
  anchor.href = url;
  anchor.click();
  renderer.destroy();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
