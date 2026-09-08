import { AetheriaParams, ARTWORK_STYLES, DEFAULT_PARAMS, FLOW_MODES, PALETTES, TEXT_FONTS } from "./engine";

export const PARAM_LIMITS = {
  seed: [1, 999999999],
  curves: [50, 100],
  turbulence: [0, 1],
  spread: [0.2, 1.25],
  thickness: [0.5, 2.6],
  grain: [0, 0.28],
  offsetX: [-1, 1],
  offsetY: [-1, 1],
  rotation: [-180, 180],
  zoom: [0.4, 3],
  wavelength: [0.3, 3],
  amplitude: [0, 2],
  relief: [0, 1],
} as const;

export function isColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

function member<T extends string>(value: unknown, options: Record<T, unknown>, fallback: T): T {
  return typeof value === "string" && Object.hasOwn(options, value) ? value as T : fallback;
}

// Old seeds deliberately default to the original dots / organic composition.
export function normalizeParams(value: Partial<AetheriaParams> = {}): AetheriaParams {
  const params = {
    ...DEFAULT_PARAMS,
    style: member(value.style, ARTWORK_STYLES, DEFAULT_PARAMS.style),
    flow: member(value.flow, FLOW_MODES, DEFAULT_PARAMS.flow),
    palette: member(value.palette, PALETTES, DEFAULT_PARAMS.palette),
    textFont: member(value.textFont, TEXT_FONTS, DEFAULT_PARAMS.textFont),
    blendMode: value.blendMode === "overlay" ? "overlay" as const : "screen" as const,
    text: typeof value.text === "string" ? value.text.slice(0, 48) : DEFAULT_PARAMS.text,
    textColor: isColor(value.textColor) ? value.textColor : DEFAULT_PARAMS.textColor,
    customColors: { ...DEFAULT_PARAMS.customColors },
  };
  for (const key of Object.keys(PARAM_LIMITS) as Array<keyof typeof PARAM_LIMITS>) {
    const numeric = value[key];
    const [min, max] = PARAM_LIMITS[key];
    if (typeof numeric === "number" && Number.isFinite(numeric)) params[key] = Math.min(max, Math.max(min, numeric));
  }
  params.seed = Math.round(params.seed);
  for (const key of ["background", "primary", "secondary"] as const) {
    const color = value.customColors?.[key];
    if (isColor(color)) params.customColors[key] = color;
  }
  return params;
}

export function paramsFromQuery(query: URLSearchParams): AetheriaParams {
  const numeric: Partial<AetheriaParams> = {};
  for (const key of Object.keys(PARAM_LIMITS) as Array<keyof typeof PARAM_LIMITS>) {
    const raw = query.get(key);
    if (raw !== null && raw.trim() !== "") numeric[key] = Number(raw);
  }
  // All untrusted URL values pass through normalization before reaching the renderer.
  return normalizeParams({
    ...numeric,
    style: query.get("style"), flow: query.get("flow"), palette: query.get("palette"),
    blendMode: query.get("blend"), textFont: query.get("font"),
    text: query.has("text") ? query.get("text") : DEFAULT_PARAMS.text,
    textColor: query.get("textColor"),
    customColors: { background: query.get("background"), primary: query.get("primary"), secondary: query.get("secondary") },
  } as Partial<AetheriaParams>);
}

export function paramsToQuery(params: AetheriaParams): URLSearchParams {
  const query = new URLSearchParams({
    style: params.style, flow: params.flow, palette: params.palette,
    blend: params.blendMode, text: params.text, font: params.textFont, textColor: params.textColor,
    ...params.customColors,
  });
  for (const key of Object.keys(PARAM_LIMITS) as Array<keyof typeof PARAM_LIMITS>) query.set(key, String(params[key]));
  return query;
}
