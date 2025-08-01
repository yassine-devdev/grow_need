# Module: Marketplace

**File Path**: `/components/modules/MarketplaceModule.tsx`

The Marketplace is the integrated e-commerce platform for the school. It allows users to buy and sell goods, purchase event tickets, and book services.

## Navigation System

The module uses an L1/L2 navigation system.

### L1 Tabs
-   **Store**: Physical and digital products.
-   **Events**: Tickets for school events.
-   **Services**: Booking for services like tutoring and counseling.
-   **Packages & Deals**: Bundled products and special offers.
-   **My Marketplace**: A personal area for users to manage their orders, listings, and payment settings.

### L2 Sidebar
The vertical icon sidebar displays sub-categories based on the selected L1 tab. For example, under "Store," it shows icons for "Apparel," "Books," etc.

## Core Functionality

### Product Display
-   **Product Cards (`/components/modules/marketplace/ProductCard.tsx`)**: The primary component for displaying an item. It shows an image, category, title, price, and an "Add to Cart" button.
-   **Content Layout (`/components/modules/marketplace/MarketplaceContentPlaceholder.tsx`)**: The main view uses a standardized layout with a header, filter/search bar, and a grid of product cards.

### Shopping Cart (`/components/overlays/CartOverlay.tsx`)
-   **Global Access**: The cart is accessible from anywhere in the application via the icon in the `GlobalHeader`.
-   **State Management**: The cart's state (items, quantities) is managed globally by the `useAppContext` hook.
-   **Functionality**:
    -   Displays a list of all items added to the cart.
    -   Allows users to increase, decrease, or remove items.
    -   Shows a running subtotal.
    -   Includes "Clear Cart" and "Proceed to Checkout" buttons.
    -   Adding an item to the cart automatically opens the cart overlay.
