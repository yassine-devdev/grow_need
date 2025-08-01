# Module: Knowledge Base

**File Path**: `/components/modules/KnowledgeBaseModule.tsx`

The Knowledge Base is a digital library and resource center for students and teachers. It provides a structured way to browse, search, and access educational materials.

## Navigation System

The module uses the same L1/L2 navigation pattern as the Analytics and School Hub modules.

### L1 Tabs
-   **Subjects**: Browse content organized by academic subject (e.g., Math, Science).
-   **Courses**: View full course materials.
-   **Exams**: Access exam preparation materials and archives of past exams.
-   **Library**: A digital library of eBooks, articles, and videos.

### L2 Sidebar
The vertical icon sidebar on the left displays categories relevant to the selected L1 tab. For example, if "Subjects" is selected, the L2 sidebar will show icons for Mathematics, Science, Languages, etc.

## Content Display

The main content area (`/components/modules/knowledge-base/KnowledgeBaseContentPlaceholder.tsx`) provides a standardized layout for displaying resources.

### Key Features
-   **Header**: Displays the title and breadcrumbs for the current category (e.g., "Mathematics", "Subjects / Mathematics").
-   **Filter Bar**: Contains a search input and dropdown filters for grade level and content type, allowing users to narrow down the results.
-   **Content Grid**: Resources are displayed as a grid of "Content Cards". Each card includes:
    -   An icon representing the content type (e.g., course, video).
    -   The title of the resource.
    -   Descriptive tags (e.g., "Math", "Grade 9").
    -   A "View" button to access the content and a "Save" button to bookmark it.
