# Core UI Components

The user interface of **GROW YouR NEED Saas School** is built upon a set of core layout components that create the OS-like feel. These components are persistent across the application and manage primary navigation and essential controls.

## 1. Global Header (`/components/layout/GlobalHeader.tsx`)

The header is positioned at the top of the screen and serves three main purposes:

-   **Module Title**: Displays the name of the currently active module (e.g., "Dashboard", "Analytics"). This provides clear context for the user.
-   **Global Search**: A search input for finding information across all modules. This is currently a UI placeholder.
-   **Shopping Cart**: An icon that displays a badge with the number of items in the cart. Clicking it toggles the `CartOverlay`.

## 2. Main Navigation Sidebar (Right) (`/components/layout/MainNavigationSidebar.tsx`)

This is the primary navigation hub of the application, located on the right side.

-   **Purpose**: Provides access to the core, high-level modules of the application.
-   **Appearance**: A vertical, glassmorphic bar containing large, vibrant, gradient-backed icons for each module. When a module is active, its icon scales up and gains a glowing ring for visual feedback.
-   **Functionality**:
    -   Clicking an icon sets it as the `activeModule` in the global context, which renders the corresponding component in the main content area.
    -   Hovering over an icon reveals a tooltip with the module's name.
    -   The entire sidebar can be hidden or shown using the toggle button on the far right of the `BottomDock`.

### Buttons
-   **Dashboard**: Navigates to the main overview.
-   **Analytics**: Opens the detailed analytics suite.
-   **School Hub**: Accesses the comprehensive school management tools.
-   **Communications**: Opens the internal messaging/email client.
-   **Knowledge Base**: Navigates to the educational content library.
-   **Concierge AI**: Opens the AI assistant module.
-   **Marketplace**: Navigates to the school's e-commerce platform.
-   **System Settings**: Opens the application configuration panel.

## 3. Contextual Sidebar (Left) (`/components/layout/ContextualSidebar.tsx`)

This sidebar is located on the left and provides access to secondary, full-screen "overlay" applications.

-   **Purpose**: Launches immersive, focused applications that take over the screen.
-   **Appearance**: Similar to the main sidebar but with more subtle, monochrome icons that light up on hover.
-   **Functionality**:
    -   Clicking an icon launches its corresponding overlay component.
    -   The sidebar is hidden by default and can be toggled open or closed using the button on the far left of the `BottomDock`.

### Buttons
-   **Studio**: Opens the productivity suite (word processor, spreadsheet, etc.).
-   **Marketplace**: Opens the full-screen version of the Marketplace.
-   **Media**: (Placeholder) Opens a media browser.
-   **Lifestyle**: (Placeholder) Opens a lifestyle/wellness app.
-   **Hobbies**: Opens the hobbies and interests tracker.
-   **Gamification**: Opens the gamification and rewards dashboard.

## 4. Bottom Dock (`/components/layout/BottomDock.tsx`)

The dock is positioned at the bottom of the screen and provides system-level information and controls.

-   **Functionality**:
    -   **Clock**: Displays the current time.
    -   **Sidebar Toggles**: Two buttons on the far left and far right toggle the visibility of the Contextual and Main sidebars, respectively.
    -   **Minimized App Tray**: When an overlay application is minimized, its icon appears in the dock. Clicking it restores the application to full screen.
    -   **Quick Launch Icons**: (Placeholder) Icons for frequently used tools like Mail, News, etc.