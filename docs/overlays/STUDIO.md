# Overlay: Studio

**File Path**: `/components/overlays/StudioOverlay.tsx`

The Studio is a full-screen overlay application that provides a suite of powerful, real-time productivity and creative tools. It's designed for content creation and editing directly within the main application, replacing the previous placeholder content.

## Navigation
The Studio has its own L1/L2 navigation system.

### L1 Tabs
-   **Design**: A powerful, real-time graphic design tool.
-   **Video**: An interactive video editor.
-   **Coder**: (Placeholder) A code editor.
-   **Office**: (Placeholder) A suite of office productivity applications.

---

## 1. Design Studio
**Component**: `/components/overlays/studio/DesignStudio.tsx`

A fully functional, multi-page design tool inspired by professional applications like Figma and Canva.

### Core Features
-   **Real-time Canvas**: A zoomable, pannable canvas for creating designs.
-   **Element Manipulation**: Drag, resize (with 8 handles), and rotate any element or group of elements.
-   **Multi-Page Projects**: Create and manage multiple pages within a single design.
-   **Layers & Pages Management**: A dedicated sidebar to manage the stacking order (z-index) of elements and navigate between pages.
-   **Grouping**: Select multiple elements and group them to act as a single unit.
-   **Alignment Tools**: Precisely align multiple selected elements (left, center, right, top, middle, bottom).
-   **Undo/Redo**: A complete history system (`useHistory` hook) lets you step backward and forward through changes.
-   **Persistence**: Save projects to and load projects from the browser's local storage.
-   **Export**: Export the final design as a high-resolution PNG image.

### UI Components
-   **Sidebar (`/design/Sidebar.tsx`)**: A tabbed interface to access:
    -   **Layers**: View and reorder all elements on the active page.
    -   **Pages**: Manage the pages in your project.
    -   **Elements**: Add pre-defined shapes (rectangles, circles, etc.).
    -   **Text**: Add heading, subheading, or body text elements.
    -   **Uploads**: Upload your own images to use in the design.
    -   **Projects**: Save, load, and delete your work.
-   **Toolbar (`/design/Toolbar.tsx`)**: A context-sensitive top bar that shows properties for the selected element(s), including:
    -   Fill Color, Stroke Color, Stroke Width, Border Radius
    -   Font Family, Font Size, Font Weight, Text Color
    -   Alignment, Grouping, Layer Order (Bring Forward/Back)
    -   Opacity
-   **Canvas (`/design/Canvas.tsx`)**: The main work area that handles rendering, selection, panning, and zooming.
-   **SelectionManager (`/design/SelectionManager.tsx`)**: Renders the bounding box, resize handles, and rotation handle around selected elements and manages the complex logic for these transformations.

---

## 2. Video Editor
**Component**: `/components/overlays/studio/video/VideoEditor.tsx`

A foundational video editor with a professional, multi-panel layout.

### Core Features
-   **Interactive Timeline**: A zoomable, scrubbable timeline for arranging clips.
-   **Multi-Track Support**: Layer video, images, text, and shapes on different tracks.
-   **Clip Manipulation**: Drag to move clips in time, and drag the handles on either end to trim their duration.
-   **Real-Time Preview**: The preview window instantly reflects the state of the timeline at the playhead's position.
-   **Splitting**: A "Split" tool to cut a selected clip in two at the playhead's position.
-   **Properties Inspector**: Select a clip to edit its transform (position, scale, rotation) and opacity in the right sidebar.

### UI Components
-   **Left Sidebar (`/video/components/LeftSidebar.tsx`)**: A tabbed interface to access media bins for video/images, text elements, and shapes.
-   **Preview Area (`/video/components/PreviewArea.tsx`)**: The central video player that shows the final output.
-   **Right Sidebar (`/video/components/RightSidebar.tsx`)**: A properties panel that displays controls for the currently selected clip.
-   **Timeline (`/video/components/Timeline/Timeline.tsx`)**: The main component at the bottom that orchestrates the ruler, tracks, clips, and playhead. It contains all the complex logic for user interactions.