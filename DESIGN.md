---
name: Aetheria
description: A tactile halftone instrument where generated artwork remains the dominant surface.
colors:
  landing-paper: "#e3edf0"
  landing-ink: "#020d12"
  landing-muted: "#415359"
  landing-dark: "#000507"
  signal-cyan: "#00bacc"
  signal-cyan-deep: "#006a86"
  studio-panel: "#04080b"
  studio-ink: "#ecf3f5"
  studio-muted: "#99a7ad"
  studio-mint: "#00c09e"
  danger: "#f75d5c"
  focus: "#12e0d8"
typography:
  display:
    fontFamily: "Helvetica Neue, Avenir Next, Segoe UI Variable, system-ui, sans-serif"
    fontSize: "clamp(3.2rem, 8vw, 7.8rem)"
    fontWeight: 740
    lineHeight: 0.9
    letterSpacing: "-0.065em"
  headline:
    fontFamily: "Helvetica Neue, Avenir Next, Segoe UI Variable, system-ui, sans-serif"
    fontSize: "clamp(2.7rem, 8vw, 6.8rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.065em"
  body:
    fontFamily: "Helvetica Neue, Avenir Next, Segoe UI Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "SFMono-Regular, Consolas, monospace"
    fontSize: "0.7rem"
    fontWeight: 700
    lineHeight: 1.4
rounded:
  sm: "7px"
  md: "8px"
  lg: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
  xxl: "96px"
components:
  landing-button-primary:
    backgroundColor: "{colors.signal-cyan}"
    textColor: "{colors.landing-ink}"
    rounded: "{rounded.sm}"
    padding: "0 17px"
    height: "48px"
  landing-button-dark:
    backgroundColor: "{colors.landing-dark}"
    textColor: "{colors.studio-ink}"
    rounded: "{rounded.sm}"
    padding: "0 18px"
    height: "50px"
  studio-button-primary:
    backgroundColor: "{colors.studio-mint}"
    textColor: "{colors.studio-ink}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "36px"
---

<!-- Generated from PRODUCT.md, app/globals.css, components/Landing.tsx, and components/Studio.tsx. Those sources are canonical. Regenerate this file when they change; do not hand-edit it into a second source of truth. -->

# Design System: Aetheria

## Overview

**Creative North Star: "The Silver Halftone Atelier"**

Aetheria should feel like a precise printmaking table occupied by a living digital material. The landing page uses soft silver daylight to make the generated fields feel physical; the studio shifts into a dim working environment so controls recede and the artwork takes over.

The composition is bold but quiet. Large type, asymmetric art, hairline divisions, and long stretches of unboxed space create hierarchy. Interface chrome stays sparse. Artwork supplies the texture and color instead of decorative interface effects.

**Key Characteristics:**

- Generated fields are the largest and most colorful objects.
- Typography is tightly set, direct, and substantially larger than body copy.
- Layouts group with alignment, rhythm, and hairlines instead of repeated cards.
- The landing page is light; the studio is dark because the physical use contexts differ.
- Motion is responsive and brief. The artwork may move; the interface rests.

## Colors

The palette moves between silver daylight and a blue-tinted near-black studio, connected by cyan as the action signal. Starter artwork may use the full curated palette, but interface actions remain cyan or mint.

### Named Rules

**The Artwork Owns Color Rule.** Full-spectrum color belongs inside generated artwork. Interface color marks actions, focus, and state only.

**The Tinted Neutral Rule.** Never use pure white or pure black. Every neutral carries a trace of the cyan-blue atmosphere.

**The Two Rooms Rule.** The landing page is a bright viewing room. The studio is a dark working room. Do not flatten them into one generic theme.

## Typography

**Display and body font:** Helvetica Neue with Avenir Next, Segoe UI Variable, and system UI fallbacks.

**Data font:** SFMono-Regular with Consolas fallback.

The single sans family is deliberate: broad, tightly tracked display type carries the brand while familiar body shapes keep technical language readable. Monospace appears only for real data such as seeds, dimensions, and keyboard commands.

### Hierarchy

- **Display:** Weight 740 with fluid sizing and a 0.9 line height. Reserved for the primary statement in each major surface.
- **Headline:** Weight 700 with high scale contrast. Used once per landing section.
- **Title:** Weight 670 around 1.15rem. Used for artwork names and compact product groups.
- **Body:** 1rem with a 1.6 line height and a maximum practical measure of 65 characters.
- **Label:** 0.7rem monospace. Used for seed values, dimensions, and numbered principles.

### Named Rules

**The Tight Display Rule.** Large display text is optically tight; body text never inherits its tracking or compressed line height.

**The Honest Mono Rule.** Monospace communicates data, never a decorative shortcut for “technical.”

## Elevation

Aetheria is flat by default. Landing-page depth comes from tonal section changes and artwork against open space. The studio uses lighter translucent surfaces over the canvas only where controls require separation. Shadows are limited to actionable primary buttons, artwork prints, and transient overlays.

### Named Rules

**The Light Has a Source Rule.** A shadow must explain a raised interactive object or a physical artwork print. Smudge glows and ambient interface shadows are forbidden.

**The No Nested Surface Rule.** Never place a card inside another card. Use spacing, hairlines, or typography within a grouped surface.

## Components

### Buttons

- Primary landing actions are cyan with dark ink, 7px corners, and a 48px minimum height.
- Dark inverse actions use the studio background against cyan sections.
- Secondary actions are text links with an underline or direct arrow cue.
- Every button and link has a high-contrast focus ring. Hover changes color without shifting layout.

### Cards and containers

- Artwork figures are images with captions, not decorative cards.
- Product principles are unboxed columns separated by 1px hairlines.
- The studio control panel is the one major floating container because controls need separation from dynamic artwork.
- Cards never become the default section wrapper.

### Inputs and controls

- Studio fields use dark tonal surfaces, 7px to 9px corners, and persistent labels.
- Range controls show their current value as text, so color is never the only state signal.
- Interactive targets are at least 44px on touch viewports.

### Navigation

- Landing navigation is transparent over the silver surface and collapses to brand plus primary action on narrow screens.
- Studio navigation floats over the canvas and prioritizes share, save, gallery, and export.
- Navigation labels use plain action language. Decorative eyebrows are prohibited.

### Artwork

- Preview and export imagery comes from the same deterministic WebGL engine.
- Starter artwork is arranged with alternating widths instead of an identical card grid.
- Fallback color fields may stand in only when WebGL 2 is unavailable; the interface must explain the limitation.

## Do's and Don'ts

### Do

- **Do** keep artwork edge-to-edge or large enough to dominate its section.
- **Do** use cyan for primary landing actions and mint for studio actions.
- **Do** group with whitespace, alignment, and hairlines before adding a container.
- **Do** preserve visible keyboard focus, reduced motion, and 44px touch targets.
- **Do** keep exports, saved seeds, and generation local to the browser.
- **Do** use exact, outcome-based labels such as “Download 4K” and “Open the studio.”

### Don't

- **Don't** use neon contour-line fields, ornamental sci-fi HUD styling, or novelty vaporwave motifs.
- **Don't** let controls compete with the canvas.
- **Don't** build identical card grids or cards inside cards.
- **Don't** use gradient text, decorative glassmorphism, side-stripe borders, or unmotivated glows.
- **Don't** add eyebrows above section headings.
- **Don't** use monospace as a costume for a technical product.
- **Don't** animate layout properties or loop decorative interface motion behind text.
- **Don't** use em dashes in interface copy.
