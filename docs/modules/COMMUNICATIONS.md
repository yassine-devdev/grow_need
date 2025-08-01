# Module: Communications

**File Path**: `/components/modules/CommunicationsModule.tsx`

The Communications module is a self-contained, email-like client within the application. It provides a familiar three-pane layout for managing internal messages.

## Layout and Functionality

The interface is divided into three vertical panes:

### 1. Folder Pane (Left)
-   **Compose Button**: A prominent button to create a new message.
-   **Folder List**: A navigation list of message folders.
    -   `Inbox`
    -   `Sent`
    -   `Drafts`
    -   `Spam`
    -   `Trash`
-   **Unread Count**: A badge next to each folder displays the number of unread messages. The "Inbox" badge is highlighted for better visibility.

### 2. Message List Pane (Center)
-   This pane displays a list of messages from the selected folder.
-   Each message preview shows:
    -   The sender's name.
    -   The message subject.
    -   The time it was received.
-   **Unread Indicator**: A colored dot on the left indicates an unread message.
-   **Selection**: Clicking a message in this list opens it in the Reading Pane and marks it as the "selected" message.

### 3. Reading Pane (Right)
-   This pane displays the full content of the selected message.
-   **Header**: Shows the message subject, sender's avatar and name, and the timestamp.
-   **Body**: The main content of the message is displayed here. Currently, it uses placeholder text.
-   **Empty State**: If no message is selected, a placeholder message with an icon is shown, prompting the user to select an email to read.
