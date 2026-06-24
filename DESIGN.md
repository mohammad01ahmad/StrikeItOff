---
name: Serene Focus
colors:
  surface: '#fff8f2'
  surface-dim: '#e1d9d0'
  surface-bright: '#fff8f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2e9'
  surface-container: '#f5ede3'
  surface-container-high: '#efe7dd'
  surface-container-highest: '#e9e1d8'
  on-surface: '#1e1b16'
  on-surface-variant: '#4d4540'
  inverse-surface: '#34302a'
  inverse-on-surface: '#f8efe6'
  outline: '#7e756f'
  outline-variant: '#cfc4bd'
  surface-tint: '#635d5a'
  primary: '#181512'
  on-primary: '#ffffff'
  primary-container: '#2d2926'
  on-primary-container: '#96908b'
  inverse-primary: '#cdc5c0'
  secondary: '#615e57'
  on-secondary: '#ffffff'
  secondary-container: '#e8e2d9'
  on-secondary-container: '#67645d'
  tertiary: '#141615'
  on-tertiary: '#ffffff'
  tertiary-container: '#292a29'
  on-tertiary-container: '#91918f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9e1dc'
  primary-fixed-dim: '#cdc5c0'
  on-primary-fixed: '#1e1b18'
  on-primary-fixed-variant: '#4b4642'
  secondary-fixed: '#e8e2d9'
  secondary-fixed-dim: '#cbc6bd'
  on-secondary-fixed: '#1d1b16'
  on-secondary-fixed-variant: '#494640'
  tertiary-fixed: '#e3e2e0'
  tertiary-fixed-dim: '#c7c6c5'
  on-tertiary-fixed: '#1a1c1b'
  on-tertiary-fixed-variant: '#464746'
  background: '#fff8f2'
  on-background: '#1e1b16'
  surface-variant: '#e9e1d8'
typography:
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 24px
  gutter: 16px
  section-gap: 40px
---

## Brand & Style

This design system is built for a task tracking environment that prioritizes mental clarity and calm productivity. The target audience includes professionals and creatives who find traditional "productivity" apps overstimulating or cluttered.

The aesthetic follows a **Minimalist** philosophy with a focus on negative space and subtle tonal transitions. It avoids heavy shadows and loud interruptions, opting instead for a "Zen" interface that feels airy and premium. The emotional response should be one of immediate relief—moving from the chaos of a mental to-do list into a structured, peaceful digital sanctuary.

## Colors

The palette is intentionally restrained to promote focus. 
- **Primary**: A deep, warm charcoal used exclusively for text and high-priority actions to ensure legibility.
- **Secondary**: A soft, "Oatmeal" beige used for subtle UI differentiation and secondary backgrounds.
- **Tertiary**: The base "Alabaster" white/cream that serves as the canvas for the entire application.
- **Neutral**: A muted taupe for inactive states, icons, and placeholder text.

Avoid pure #FFFFFF; use the tertiary cream to maintain a soft, tactile paper-like quality that reduces eye strain.

## Typography

The typography uses **Manrope** for its modern, balanced, and highly legible geometric qualities. It provides a clean structure without feeling overly clinical. 

To introduce a "technical but organized" secondary layer, **JetBrains Mono** is used for small labels, metadata, and timestamps. This monospaced contrast reinforces the task-tracking utility of the app while maintaining the minimalist aesthetic. Headlines should utilize tight letter-spacing to feel premium and intentional.

## Layout & Spacing

The layout is defined by generous white space and a **Fluid Grid** model tailored for mobile efficiency.
- **Margins**: Use a strict 24px side margin for all primary content to create an "airy" frame around tasks.
- **Rhythm**: Vertical rhythm is based on an 8px baseline. Use 40px gaps between major sections to prevent visual crowding.
- **Mobile Reflow**: Elements should utilize full-width cards or "ghost containers" that span the width between margins. Elements never touch the edge of the screen.

## Elevation & Depth

This design system rejects traditional heavy shadows in favor of **Tonal Layers** and **Low-contrast Outlines**. 
- **Depth**: Layers are created by placing the secondary beige against the tertiary white background. 
- **Borders**: Use very thin (1px) borders in a color only slightly darker than the surface it sits on (e.g., a 5% darker beige) to define boundaries.
- **Interactive States**: When an item is pressed or elevated, use a very soft, high-diffusion "Ambient Shadow" (15% opacity, 20px blur) to suggest it has been lifted from the page.

## Shapes

The shape language is **Rounded**, using 0.5rem (8px) as the standard corner radius. This provides a friendly, approachable feel that softens the minimalist aesthetic. Larger containers like task cards should use `rounded-xl` (1.5rem) to emphasize their role as distinct, tactile objects within the interface.

## Components

- **Buttons**: Primary buttons are solid Charcoal with White text. Secondary buttons are Ghost style with a thin beige border. All buttons use 8px rounding.
- **Task Cards**: Use the tertiary color against a secondary background. No borders; use a very subtle ambient shadow to differentiate.
- **Lists**: Minimalist list items separated by whitespace or a 1px hairline divider (10% opacity charcoal).
- **Checkboxes**: Circular rather than square to match the "calm" aesthetic. When checked, they should fill with the primary charcoal color.
- **Inputs**: Bottom-border only for a cleaner, editorial look during task entry. Labels sit above in JetBrains Mono.
- **Progress Indicators**: Thin, 2px horizontal lines. Avoid thick bars or heavy circular loaders; use subtle transitions to indicate completion.
