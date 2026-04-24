---
name: Autoflow Modernist
colors:
  surface: '#fff8f6'
  surface-dim: '#f1d4cc'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ed'
  surface-container: '#ffe9e4'
  surface-container-high: '#ffe2da'
  surface-container-highest: '#fadcd4'
  on-surface: '#271813'
  on-surface-variant: '#5b4039'
  inverse-surface: '#3e2c27'
  inverse-on-surface: '#ffede8'
  outline: '#907067'
  outline-variant: '#e4beb4'
  surface-tint: '#b02f00'
  primary: '#b02f00'
  on-primary: '#ffffff'
  primary-container: '#ff5722'
  on-primary-container: '#541200'
  inverse-primary: '#ffb5a0'
  secondary: '#5b5e6c'
  on-secondary: '#ffffff'
  secondary-container: '#dddff0'
  on-secondary-container: '#5f6270'
  tertiary: '#655d4f'
  on-tertiary: '#ffffff'
  tertiary-container: '#999080'
  on-tertiary-container: '#2f291d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb5a0'
  on-primary-fixed: '#3b0900'
  on-primary-fixed-variant: '#862200'
  secondary-fixed: '#e0e1f2'
  secondary-fixed-dim: '#c4c5d6'
  on-secondary-fixed: '#181b27'
  on-secondary-fixed-variant: '#434654'
  tertiary-fixed: '#ede1cf'
  tertiary-fixed-dim: '#d0c5b3'
  on-tertiary-fixed: '#201b10'
  on-tertiary-fixed-variant: '#4d4638'
  background: '#fff8f6'
  on-background: '#271813'
  surface-variant: '#fadcd4'
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  metric-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.1'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base_unit: 4px
  sidebar_width: 240px
  container_max_width: 1440px
  gutter: 24px
  padding_card: 24px
  padding_input_v: 12px
  padding_button_v: 12px
---

## Brand & Style

This design system embodies a **Modern SaaS** aesthetic, blending the clinical precision of Linear with the approachable warmth of Stripe. It is designed for marketing professionals who require high-velocity automation tools that feel both powerful and effortless. 

The visual language is rooted in **Minimalism** with a **Tactile** edge. It prioritizes clarity through generous whitespace and a "warm-neutral" canvas, ensuring that complex automation workflows remain digestible. The interface evokes a sense of "organized energy"—reliable enough for enterprise data, yet vibrant enough to inspire creative marketing strategies.

## Colors

The palette is anchored by a high-energy **Primary Orange**, used strategically for calls to action and critical focus states. This is balanced by **Dark Navy** for professional grounding in typography and secondary UI elements. 

The background utilizes a sophisticated soft gradient from peach to cream, moving away from "stark white" to create a more premium, editorial feel. Semantic colors are saturated to ensure immediate recognition within high-density data dashboards.

## Typography

This design system uses a dual-font strategy. **Plus Jakarta Sans** is employed for headlines and metrics to provide a modern, geometric personality. **Inter** is used for body text and functional UI labels to ensure maximum legibility and a systematic feel. 

Metrics are treated as primary visual elements, using semi-bold weights and tighter tracking to emphasize performance data.

## Layout & Spacing

The layout utilizes a **Fixed-Fluid Hybrid Grid**. The sidebar is fixed at 240px, while the main content area utilizes a 12-column fluid grid with a maximum cap of 1440px to maintain readability on ultra-wide monitors.

A strict 4px baseline grid governs all vertical rhythm. Elements are grouped using generous internal padding (24px) to reinforce the sense of "breathing room" found in Notion-inspired layouts.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Tonal Layering**. 

1. **Surface:** The base page uses the soft peach/cream gradient.
2. **Cards:** Elevated on pure white surfaces with a subtle, diffused shadow (`0 2px 8px rgba(0,0,0,0.08)`).
3. **Interactions:** A "hover lift" effect is mandatory for all clickable cards, achieved by shifting the Y-offset of the shadow and slightly decreasing the blur to simulate physical proximity.
4. **Modals:** Use a heavier backdrop blur (8px) with a semi-transparent Navy overlay (20% opacity) to isolate focus.

## Shapes

The shape language is consistently **Rounded**, using an 8px (0.5rem) base radius for inputs and buttons, and a 12px (0.75rem) radius for cards. This creates a friendly, modern silhouette that avoids the sharpness of traditional enterprise software.

Circular shapes are reserved exclusively for avatars and "status indicator" icons within metric cards.

## Components

### Buttons
- **Primary:** Solid Orange (#FF5722) with White text. 8px radius. Use for main conversion actions.
- **Secondary:** Navy (#1A1D29) outline with Navy text. 12px vertical padding. Use for alternative paths.

### Cards & Metrics
- **Standard Card:** White background, 12px radius, 24px padding. 
- **Metric Card:** Includes an Orange icon circle (15% opacity background) for the category icon. Numbers must be 32px semi-bold. Sparklines should use the primary orange or success green depending on the trend.

### Inputs
- **Text Fields:** 8px radius, Light Gray (#E9ECEF) border. 
- **Focus State:** 2px Orange focus ring with a 4px soft glow (10% opacity) to provide clear feedback.

### Navigation (Sidebar)
- **Structure:** 240px fixed width, White background.
- **Active State:** Light Orange background (#FFF3E0) with a 4px solid Orange left-border indicator. This provides a clear visual anchor for the user's location within the flow.

### Flow Nodes (Product Specific)
- **Automation Steps:** Smaller cards (16px padding) with connector lines. Use Navy for "Triggers" and Orange for "Actions" to differentiate at a glance.