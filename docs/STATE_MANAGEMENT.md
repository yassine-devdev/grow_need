# State Management

**File Path**: `/hooks/useAppContext.ts`

The application utilizes React's Context API for global state management, providing a centralized and easy-to-access store for application-wide data. This approach avoids the complexity of "prop-drilling" (passing props down through many levels of components).

## `AppContextProvider`
This is the provider component that wraps the entire application in `App.tsx`. It is responsible for creating and managing the state and providing it to all child components.

## `useAppContext` Hook
This custom hook is the designated way for components to access the global state. Any component that needs to read or update the global state can simply call `const context = useAppContext();`.

## Managed State

The `AppContext` manages several key pieces of the application's state:

### 1. Module Navigation
-   `activeModule`: An enum (`AppModuleId`) that stores the ID of the currently visible main module (e.g., `DASHBOARD`, `ANALYTICS`).
-   `setActiveModule(moduleId)`: The function to change the active module.

### 2. Sidebar Visibility
-   `isMainSidebarOpen`: A boolean controlling the visibility of the right-hand Main Navigation Sidebar.
-   `toggleMainSidebar()`: A function to toggle the main sidebar's state.
-   `isContextualSidebarOpen`: A boolean controlling the visibility of the left-hand Contextual Sidebar.
-   `toggleContextualSidebar()`: A function to toggle the contextual sidebar's state.

### 3. Overlay Application Management
-   `openOverlays`: An array of `OverlayId`s for all overlays that have been launched, including those that are minimized.
-   `activeOverlay`: An `OverlayId` (or `null`) representing the currently visible, full-screen overlay. An overlay can be in `openOverlays` but not `activeOverlay` if it is minimized.
-   `launchOverlay(id)`: Adds an overlay to `openOverlays` and sets it as the `activeOverlay`.
-   `closeOverlay(id)`: Removes an overlay from `openOverlays` and clears the `activeOverlay` if it was the one being closed.
-   `minimizeOverlay(id)`: Clears the `activeOverlay` (hiding the window) but keeps its ID in `openOverlays` so its icon appears in the `BottomDock`.
-   `restoreOverlay(id)`: Sets a minimized overlay (which is already in `openOverlays`) as the `activeOverlay` again, making it visible.

### 4. Shopping Cart Management
-   `cart`: An array of `CartItem` objects, representing the items in the user's shopping cart.
-   `isCartOpen`: A boolean to control the visibility of the `CartOverlay`.
-   `toggleCart()`: Toggles the `isCartOpen` state.
-   `addToCart(product)`: Adds a product to the cart or increments its quantity if it already exists. Also sets `isCartOpen` to true.
-   `removeFromCart(productId)`: Removes an item from the cart entirely.
-   `updateCartItemQuantity(productId, quantity)`: Changes the quantity of an item in the cart. If the quantity drops to 0 or less, the item is removed.
-   `clearCart()`: Removes all items from the cart.

## Optimization
The context value is memoized using `useMemo` to prevent unnecessary re-renders of consumer components when parts of the state they don't depend on have changed.