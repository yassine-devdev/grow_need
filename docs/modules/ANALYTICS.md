# Module: Analytics

**File Path**: `/components/modules/AnalyticsModule.tsx`

The Analytics module is a comprehensive suite for data visualization and exploration. It uses a two-level navigation system to organize a wide variety of reports.

## Navigation System

### Level 1 (L1) Tabs
A horizontal row of tabs at the top allows users to switch between major categories of analytics. The active tab is highlighted.
-   **Overview**: General user and traffic metrics.
-   **Marketing**: Performance of marketing and SEO efforts.
-   **Finance**: Financial data, including revenue and expenses.

### Level 2 (L2) Sidebar
A vertical icon-only sidebar appears on the left, just inside the main content pane. The icons shown in this sidebar change based on the selected L1 tab. Clicking an icon loads the corresponding report into the main view. Hovering over an icon reveals its name in a tooltip.

## Reports

### Overview Reports
-   **Live Users**: A real-time dashboard showing the current number of active users, a live graph of users over the last 30 minutes, a device breakdown, and top active pages.
-   **Traffic Sources**: A pie chart and table showing the breakdown of user traffic by source (Direct, Organic Search, Referral, Social).
-   **Events**: A table and bar chart showing custom events tracked within the application (e.g., `course_start`, `assignment_submit`).
-   **All Traffic**: A line chart showing traffic over time by channel, along with a detailed table with metrics like users, sessions, and bounce rate.
-   **Google Ads**: A dashboard summarizing Google Ads campaign performance with metrics like impressions, clicks, CTR, and CPC.
-   **Referrals**: A table listing the top websites that refer traffic.
-   **Demographics**: Bar charts showing the age and gender distribution of users.
-   **Geo**: A table and bar chart showing the geographic distribution of users by country.
-   **Behavior**: Key behavioral metrics like bounce rate and pages per session, plus tables for top landing and exit pages.

### Marketing Reports
-   **Campaign Performance**: Compares marketing campaigns based on spend, conversions, and cost-per-acquisition (CPA).
-   **SEO Queries**: Shows top search queries that lead users to the site from search engines, including impressions, clicks, and average position.
-   **Social Overview**: Displays follower counts and growth trends for major social media platforms.

### Finance Reports
-   **Revenue Summary**: Shows total year-to-date revenue, a monthly revenue trend chart, and a breakdown of revenue by source.
-   **Expenses by Category**: A donut chart and table breaking down expenditures by category (e.g., Salaries, Operations).
-   **P&L Statement**: A simplified Profit & Loss statement comparing the current quarter to the previous one.
