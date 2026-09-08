import {
  AetheriaParams,
  CustomColors,
  DEFAULT_PARAMS,
  PaletteId,
} from "@/lib/engine";
import { paramsToQuery } from "./params";

export type PresetId = Exclude<PaletteId, "custom">;

export const PRESET_COLORS: Record<PresetId, CustomColors> = {
  obsidian: { background: "#dbe0e0", primary: "#00b8d1", secondary: "#006ec2" },
  solar: { background: "#e0d6c2", primary: "#f06414", secondary: "#b81f12" },
  violet: { background: "#c9ccdb", primary: "#843bea", secondary: "#216bdb" },
  emerald: { background: "#c9d9d1", primary: "#009e78", secondary: "#006679" },
  coral: { background: "#e6d1d1", primary: "#f24059", secondary: "#a81542" },
  cobalt: { background: "#cfd6e6", primary: "#1459f2", secondary: "#261fa6" },
  citron: { background: "#dbdfbf", primary: "#a1e00d", secondary: "#29872e" },
  mono: { background: "#dededb", primary: "#292b2e", secondary: "#6b6e70" },
};

export const PRESETS: Array<{
  id: PresetId;
  note: string;
  params: Partial<AetheriaParams>;
}> = [
  { id: "obsidian", note: "Cyan halftone", params: { curves: 78, turbulence: 0.64, spread: 0.82, thickness: 1.08, grain: 0.08 } },
  { id: "solar", note: "Amber diffusion", params: { curves: 68, turbulence: 0.72, spread: 0.74, thickness: 1.22, grain: 0.1 } },
  { id: "violet", note: "Ultraviolet mesh", params: { curves: 86, turbulence: 0.78, spread: 0.9, thickness: 0.96, grain: 0.07 } },
  { id: "emerald", note: "Mineral field", params: { curves: 62, turbulence: 0.48, spread: 0.78, thickness: 1.18, grain: 0.09 } },
  { id: "coral", note: "Warm pigment", params: { curves: 72, turbulence: 0.58, spread: 0.88, thickness: 1.12, grain: 0.08 } },
  { id: "cobalt", note: "Deep electric", params: { curves: 84, turbulence: 0.7, spread: 0.76, thickness: 0.92, grain: 0.07 } },
  { id: "citron", note: "Acid botanical", params: { curves: 66, turbulence: 0.52, spread: 0.84, thickness: 1.14, grain: 0.09 } },
  { id: "mono", note: "Graphic neutral", params: { curves: 76, turbulence: 0.6, spread: 0.8, thickness: 0.88, grain: 0.13 } },
];

export const STARTER_ARTWORKS: Array<{
  id: PresetId;
  name: string;
  description: string;
  params: AetheriaParams;
}> = [
  { id: "obsidian", name: "Cyan Drift", description: "Cool signal blue over soft silver.", params: createStarter("obsidian", 184729) },
  { id: "solar", name: "Solar Flare", description: "Burnt orange moving through warm stone.", params: createStarter("solar", 623918) },
  { id: "violet", name: "Cyber Violet", description: "Violet and cobalt in a dense current.", params: createStarter("violet", 371460) },
  { id: "emerald", name: "Emerald Flow", description: "Mineral green over a quiet field.", params: createStarter("emerald", 805214) },
  { id: "coral", name: "Coral Pulse", description: "A warm red field with a dark center.", params: createStarter("coral", 492076) },
  { id: "cobalt", name: "Cobalt Bloom", description: "Electric blue with a deep-violet edge.", params: createStarter("cobalt", 716305) },
];

function createStarter(id: PresetId, seed: number): AetheriaParams {
  const preset = PRESETS.find((item) => item.id === id);
  return {
    ...DEFAULT_PARAMS,
    ...preset?.params,
    seed,
    palette: id,
    customColors: PRESET_COLORS[id],
    text: "",
  };
}

export function studioHref(params: AetheriaParams) {
  return `/studio?${paramsToQuery(params)}`;
}
