# Module: System Settings

**File Path**: `/components/modules/SystemSettingsModule.tsx`

The System Settings module provides administrators with granular control over the application's configuration. It is organized into several categories, each handling a specific aspect of the system.

## Navigation System
The module uses the standard L1/L2 navigation pattern.

### L1 Tabs
-   **General**: Basic school information and appearance.
-   **Users & Roles**: Management of all user accounts.
-   **Integrations**: Connecting to third-party services.
-   **Billing**: Subscription and payment information.
-   **Security**: Security policies and logs.
-   **API**: Developer tools for programmatic access.

---

## Settings Panels

### General
-   **School Profile**: Edit the school's name, address, and contact information.
-   **Branding**: A powerful theme editor to customize the application's entire color scheme. (See [Theming Documentation](./../THEMING.md) for details).
-   **Localization**: Set the default language, timezone, and currency.
-   **Notifications**: Configure email notification preferences.

### Users & Roles
-   **Staff, Students, Parents**: View and manage user accounts for each user type.
-   **Roles & Permissions**: Define user roles (e.g., Admin, Teacher) and configure the permissions associated with each role.

### Integrations
-   **Marketplace**: Configure marketplace settings, such as enabling/disabling it and setting commission rates.
-   **Connected Apps**: Manage integrations with third-party apps like Google Drive and Slack.

### Billing
-   **Subscription Plan**: View the current subscription plan and usage metrics.
-   **Payment Methods**: Add or remove credit cards for billing.
-   **Invoices**: View and download past invoices.

### Security
-   **Password Policy**: Enforce password requirements, such as minimum length and complexity.
-   **Two-Factor Auth (2FA)**: Require users to set up 2FA for enhanced security.
-   **Audit Log**: A chronological log of important actions taken within the application for security and compliance tracking.

### API
-   **API Keys**: Generate and manage API keys for external applications to interact with the school's data.
-   **Webhooks**: Configure webhooks to send real-time data to external services when specific events occur.
