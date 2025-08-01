# Module: Concierge AI

**File Path**: `/components/modules/ConciergeAIModule.tsx`

The Concierge AI module is the central hub for interacting with the application's AI assistant, "Aura Concierge," powered by the Google Gemini API. It also provides access to various specialized AI tools.

## Navigation System
The module uses an L1/L2 navigation system to organize its features.

### L1 Tabs
-   **Chat**: The primary conversational interface with the AI.
-   **AI Tools**: A collection of specialized tools for specific tasks like summarization and translation.
-   **Prompt Library**: A curated list of pre-written prompts for various educational and administrative tasks.
-   **Settings**: Configuration options for the AI's behavior and performance.

## Core Feature: Aura Concierge Chat

**File Path**: `/components/modules/concierge-ai/AuraConcierge.tsx`

This is the main chat interface.

### Functionality
-   **Conversational AI**: Users can have a natural, back-and-forth conversation with the AI.
-   **Streaming Responses**: The AI's responses are streamed in real-time, word by word, providing a more dynamic and responsive user experience.
-   **Chat History**: The chat is persistent, leveraging the `history` feature of the Gemini API's chat session.
-   **System Instruction**: The AI is given a system instruction to define its persona as "Aura Concierge," ensuring its responses are helpful, friendly, and context-aware.
-   **Custom Hook**: All chat logic is encapsulated in the `useConciergeAI` hook (`/hooks/useConciergeAI.ts`), which manages the Gemini chat session, message state, loading state, and error handling.

### UI Elements
-   **Message List**: The main area displays the conversation history, with user messages aligned to the right and AI messages to the left.
-   **Avatars**: Distinct avatars are used to differentiate between the user and the AI.
-   **Input Area**: A auto-resizing textarea at the bottom for users to type their messages.
-   **Typing Indicator**: A subtle animation appears while the AI is generating a response.
