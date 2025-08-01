# Overlay: Marketplace

**File Path**: `/components/overlays/MarketplaceOverlay.tsx`

The Marketplace overlay is the full-screen, immersive version of the Marketplace module. While the core functionality is the same as the module view, the overlay provides a more spacious and focused shopping experience.

## Purpose
The primary purpose of having a separate overlay is to offer a dedicated, application-like environment for e-commerce activities, free from the distractions of the main dashboard interface.

## Functionality
-   **Renders the Core Module**: The overlay acts as a wrapper that renders the complete `MarketplaceModule` (`/components/modules/MarketplaceModule.tsx`) within its content area.
-   **Standard Overlay Controls**: It includes the standard window controls in its header for minimizing and closing the application.
-   **Access**: It can be launched from the Contextual Sidebar on the left.

By reusing the main module, the application avoids code duplication while still providing two distinct ways to access the marketplace.
