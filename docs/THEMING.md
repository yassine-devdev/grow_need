# Theming & Design System

**File Paths**: 
- `/components/modules/settings/Branding.tsx`
- `/components/modules/settings/Design.tsx`
- `/components/modules/settings/theme-utils.ts`

The application features a powerful, real-time customization system that gives administrators full control over the application's entire look and feel. This is managed through the "Branding" and "Design" screens within the System Settings module.

## How It Works

The system is built upon CSS Custom Properties (Variables).

1.  **State Management**: The `Branding` and `Design` components hold React state objects (`themeColors`, `design`) that contain key-value pairs for all customizable properties (e.g., `--main-background-color: '#1e1935'`, `--border-radius-global: '1.5rem'`).

2.  **Applying Styles**: `useEffect` hooks in each component call utility functions (`applyTheme`, `applyDesign`) whenever their respective state changes. These functions generate a CSS string that defines a series of CSS variables within the `:root` selector and injects them into the document's `<head>`.

    ```css
    /* Example of generated CSS */
    :root {
        /* From Branding */
        --main-background-color: #1e1935;
        --card-border: 1px solid rgba(96, 165, 250, 0.2);
        
        /* From Design */
        --border-radius-global: 1.5rem;
        --header-height: 4rem;
    }
    ```

3.  **Component Styling**: Throughout the application's CSS files, components use these variables instead of hardcoded values. This architecture allows the entire UI to update instantly as an administrator adjusts the settings.

## 1. Color Customization (Branding)

The "Branding" screen allows for complete control over the application's color scheme.

-   **Presets**: A selection of pre-designed themes (e.g., "Cyberpunk", "Solarized") that can be applied with a single click.
-   **Accordions**: Colors are grouped into logical categories (Layout, Navigation, Cards, UI Elements) to keep the interface organized.
-   **Color Pickers**: Each color property has a dedicated color picker component, which includes both a standard visual color wheel and a text input for precise hex or rgba values.
-   **Live Preview**: A section of the screen displays sample components that update in real-time, giving the administrator an immediate preview of their changes.

## 2. Layout & Sizing Customization (Design)

The "Design" screen allows for control over the application's structure and scale.

-   **Slider Controls**: Each property is controlled by a slider for intuitive, visual adjustment.
-   **Customizable Properties**:
    -   **Global Styles**: `Border Radius`
    -   **Navigation**: `Header Height`, `Main Nav Width`, `Main Nav Icon Size`
    -   **Cards**: `Stat Card Padding`, font sizes for titles and values, icon sizes.
-   **Real-Time Updates**: Just like the color theme, all changes to design metrics are applied instantly across the entire application.

## Persistence

-   **Saving**: When the "Save" button is clicked in either panel, the current state object is serialized to JSON and saved in the browser's `localStorage` under the keys `aura-theme` or `aura-design`.
-   **Loading**: When the application loads, the components' initial state is hydrated from `localStorage`. If no saved theme/design is found, it falls back to the defaults.
-   **Resetting**: The "Reset to Default" button removes the settings from `localStorage` and resets the state, immediately reverting the application's appearance.