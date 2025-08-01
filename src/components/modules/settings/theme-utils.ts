// This file centralizes the logic for applying dynamic theme styles to the application.

/**
 * Applies a theme object as CSS custom properties to the root element.
 * @param theme - An object where keys are CSS variable names (e.g., '--main-background-color')
 * and values are valid CSS color strings.
 */
export const applyTheme = (theme: Record<string, string>) => {
    const root = document.documentElement;
    if (!theme) return;
    Object.entries(theme).forEach(([key, value]) => {
        if (key.startsWith('--')) {
            root.style.setProperty(key, value);
        }
    });
};

/**
 * Applies a design object as CSS custom properties to the root element.
 * @param design - An object where keys are CSS variable names (e.g., '--border-radius-global')
 * and values are valid CSS strings (e.g., '1.5rem').
 */
export const applyDesign = (design: Record<string, string>) => {
    const root = document.documentElement;
    if (!design) return;
    Object.entries(design).forEach(([key, value]) => {
         if (key.startsWith('--')) {
            root.style.setProperty(key, value);
        }
    });
};
