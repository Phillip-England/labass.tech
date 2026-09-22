# LaBass grid pattern

This is the faint engineering-paper grid behind the landing-page hero. It is a pair of one-pixel CSS gradients: one repeats horizontally to form horizontal lines, and the other repeats vertically to form vertical lines. It uses no image asset, so it stays sharp at every resolution.

## Exact implementation

Add an empty element as the first child of the section that needs the grid:

```html
<div class="hero-grid" aria-hidden="true"></div>
```

The containing section must establish a positioning context:

```css
.hero {
  position: relative;
  overflow: hidden;
}
```

Then use this CSS exactly:

```css
.hero-grid {
  background-image:
    linear-gradient(rgba(10, 21, 34, .07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(10, 21, 34, .07) 1px, transparent 1px);
  background-size: 52px 52px;
  inset: 0;
  opacity: .7;
  position: absolute;
}
```

## How it works

- `inset: 0` stretches the grid across the section. The parent’s `position: relative` keeps it contained there.
- The first gradient has no angle, so it repeats a 1px dark horizontal line every 52px.
- The second gradient is rotated `90deg`, producing the equivalent vertical line every 52px.
- The line color is the site navy (`rgb(10, 21, 34)`) at 7% alpha. The element’s overall 70% opacity softens the final visual further, making the effective line darkness subtle rather than decorative or busy.
- `transparent` fills the remaining 51px in both repeated tiles, so the two gradients intersect as a clean square grid.
- The grid is behind hero content because it is an early, absolutely-positioned child; keep real content in a positioned element with a higher `z-index` (the current `.hero-content` uses `z-index: 1`).

## Responsive variant

For smaller screens, reduce the spacing so the pattern retains its rhythm:

```css
@media (max-width: 740px) {
  .hero-grid {
    background-size: 34px 34px;
  }
}
```

To reuse the look in a different project, change only the line color and spacing. Keep the same low alpha and two-gradient structure; increasing opacity noticeably will make the grid compete with the logo and call to action.
