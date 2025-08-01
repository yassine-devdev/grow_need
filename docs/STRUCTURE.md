# Project Structure

The codebase for **GROW YouR NEED Saas School** is organized logically to separate concerns, promote reusability, and ensure maintainability.

```
/
├── components/
│   ├── icons/              # Icon library configuration and exports
│   ├── layout/             # Global layout components (Header, Dock, Sidebars)
│   ├── modules/            # Main application modules and their sub-components
│   │   ├── analytics/
│   │   ├── concierge-ai/
│   │   ├── gamification/
│   │   ├── hobbies/
│   │   ├── knowledge-base/
│   │   ├── marketplace/
│   │   ├── school-hub/
│   │   │   ├── administration/
│   │   │   ├── finance/
│   │   │   ├── marketing/
│   │   │   ├── parent/
│   │   │   ├── school/
│   │   │   ├── student/
│   │   │   └── teacher/
│   │   └── settings/
│   ├── overlays/           # Full-screen overlay applications
│   │   └── studio/
│   │       ├── design/     # Design Studio components
│   │       └── video/      # Video Editor components
│   └── ui/                 # Reusable UI elements (StatCard, GlassmorphicContainer)
├── docs/                   # Full project documentation (you are here)
│   ├── modules/            # In-depth documentation for each module
│   ├── overlays/           # In-depth documentation for each overlay
│   └── school-hub/         # Role-specific documentation for the School Hub
├── hooks/
│   ├── useAppContext.ts    # Global state management context
│   └── useConciergeAI.ts   # Hook for Gemini chat functionality
├── App.tsx                 # Main application component, orchestrates layout and routing
├── constants.tsx           # App-wide constants (module/app definitions)
├── index.html              # The single HTML entry point with importmap for CDN dependencies
├── index.tsx               # Main React render entry point
├── metadata.json           # Project metadata
├── types.ts                # Global TypeScript type definitions
└── README.md               # Main project README
```

## Top-Level Directories

### `/components`
This is the heart of the application's UI. It's further divided to group related components.
-   `/components/icons`: A custom-built icon system that groups icons from `lucide-react` into logical categories. This makes it easy to find and use icons related to specific features (e.g., `Icons.AIGrading`, `Icons.LearningPulseTracker`).
-   `/components/layout`: Contains the persistent UI elements that form the main application shell: `GlobalHeader`, `BottomDock`, `MainNavigationSidebar`, and `ContextualSidebar`.
-   `/components/modules`: Each subdirectory corresponds to a primary module in the application (e.g., `/analytics`, `/school-hub`). These contain the main view for the module and all its sub-components.
-   `/components/overlays`: Contains the components for full-screen applications like `StudioOverlay`. The subdirectories are highly organized, for example:
    -   `/overlays/studio/design`: All components related to the functional Design Studio.
    -   `/overlays/studio/video`: All components related to the functional Video Editor.
-   `/components/ui`: A collection of generic, reusable UI components like `GlassmorphicContainer` and `StatCard` that are used throughout the application to maintain a consistent look and feel.

### `/docs`
Contains all project documentation files in Markdown format, providing a comprehensive guide to the application's architecture and features. The structure mirrors the application, with dedicated folders for modules, overlays, and the different roles within the School Hub.

### `/hooks`
Houses custom React hooks that encapsulate complex logic.
-   `useAppContext.ts`: Provides the global `AppContext`, which is a single source of truth for application-wide state (e.g., active module, cart items, open overlays). This avoids prop-drilling and simplifies state management.
-   `useConciergeAI.ts`: A dedicated hook that manages the entire lifecycle of a chat session with the Google Gemini API, including initialization, sending messages, handling streaming responses, and managing state for loading and errors.

## Top-Level Files

-   **`App.tsx`**: The root React component. It sets up the `AppContextProvider` and renders the main application layout (`AppContent`), which includes the header, sidebars, dock, and the currently active module or overlay.
-   **`constants.tsx`**: Centralizes the definitions for all modules and overlays. It maps IDs, names, icons, and components together, making it easy to manage the application's structure and navigation.
-   **`index.html`**: The sole HTML file. It's notable for using an **importmap**, which allows the application to import dependencies like React and `@google/genai` directly from a CDN without a build step (like Webpack or Vite). This simplifies the development setup significantly.
-   **`index.tsx`**: The entry point for the React application, where `App` is rendered into the root DOM element.
-   **`metadata.json`**: Contains basic information about the application.
-   **`types.ts`**: Defines shared TypeScript interfaces and enums used across the project, such as `AppModule`, `OverlayApp`, and `CartItem`, ensuring type safety and consistency.
-   **`README.md`**: The main project README file with a high-level overview and setup instructions.