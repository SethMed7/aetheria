# Contributing to Aetheria

Thank you for helping improve Aetheria. The project stays intentionally focused: one expressive procedural style, immediate controls, deterministic seeds, and local browser exports.

## Before you start

- Search existing issues and pull requests.
- Open an issue before starting a large feature or visual direction change.
- Keep proposals within the product principles in [`PRODUCT.md`](PRODUCT.md).
- Do not add analytics, accounts, required cloud services, or server-side artwork processing.

## Local setup

Requirements:

- [Bun](https://bun.sh/) 1.4 or newer
- A current browser with WebGL 2

```bash
git clone https://github.com/SethMed7/aetheria.git
cd aetheria
bun install
bun dev
```

Open the local URL printed by Next.js.

## Development checks

Run these before opening a pull request:

```bash
bun run lint
bun run build
STATIC_EXPORT=true NEXT_PUBLIC_BASE_PATH=/aetheria bun run build
```

For interface changes, also verify:

- Keyboard navigation and visible focus
- Reduced-motion behavior
- No clipping or horizontal overflow at 390, 768, 1280, and 1680 pixels
- At least one browser with a coarse pointer or touch emulation
- The studio still exports a valid PNG

## Pull requests

Keep pull requests small and explain:

1. What changed
2. Why the change belongs in Aetheria
3. How it was tested
4. Screenshots or recordings for visible changes

All changes to `main` require a pull request, passing checks, and owner review. The repository owner may use the configured bypass for maintenance and releases.

## Code style

- Use strict TypeScript.
- Prefer direct, focused functions over abstraction layers.
- Reuse the rendering engine for previews and exports.
- Use semantic HTML and native controls before custom interaction patterns.
- Keep generated artwork visually primary.
- Avoid card-heavy layouts, ornamental interface chrome, and decorative motion.

## Reporting bugs

Use the bug report form and include:

- Browser and operating system
- GPU or hardware acceleration status when relevant
- Reproduction steps
- Expected and actual behavior
- A shareable Aetheria URL when the bug is seed-specific

Security issues should not be filed publicly. Follow [`SECURITY.md`](SECURITY.md).
