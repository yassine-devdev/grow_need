# Module: Dashboard

**File Path**: `/components/modules/DashboardModule.tsx`

The Dashboard is the default landing page of the application. It provides a high-level, at-a-glance overview of the most critical metrics and trends for the institution.

## Key Components

### 1. Stat Cards (`/components/ui/StatCard.tsx`)
A row of four prominent "Stat Cards" is displayed at the top. Each card is a glassmorphic container that highlights a key performance indicator (KPI).

-   **Title**: The name of the metric (e.g., "Total Students").
-   **Value**: The current value of the metric (e.g., "1,284").
-   **Icon**: A relevant icon for quick visual identification.
-   **Trend**: A small text indicator showing the recent trend (e.g., "+12% this month"). The color of the trend text (green or red) indicates a positive or negative change.

The default cards displayed are:
-   Total Students
-   Revenue
-   New Enrollments
-   Active Courses

### 2. Engagement Overview Chart
The main section of the dashboard is dedicated to a large line chart that visualizes user engagement over time.

-   **Technology**: Uses the `recharts` library for rendering.
-   **Appearance**: The chart is housed in a bordered, glassmorphic container with a custom, themed tooltip that appears on hover.
-   **Data**: It visualizes two data series by default:
    -   **Page Views (PV)**: Plotted as a purple line.
    -   **Unique Visitors (UV)**: Plotted as a green line.
-   **Axes**:
    -   The X-axis represents time (e.g., months of the year).
    -   The Y-axis represents the count of views/visitors.
-   **Interactivity**: Hovering over a data point on the chart displays a tooltip with the specific values for that point in time. A legend is also displayed below the chart.
