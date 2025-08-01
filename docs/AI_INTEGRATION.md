# AI Integration with Google Gemini

The **GROW YouR NEED Saas School** platform deeply integrates the Google Gemini API (`@google/genai`) to power a wide array of intelligent features. This document outlines each AI-driven feature and where it can be found in the application.

---

## Core Conversational AI

### 1. Aura Concierge
-   **Location**: Concierge AI Module -> Chat -> Aura Concierge
-   **Component**: `/components/modules/concierge-ai/AuraConcierge.tsx`
-   **Hook**: `/hooks/useConciergeAI.ts`
-   **Functionality**: A general-purpose, conversational AI assistant. It uses a streaming chat session (`chat.sendMessageStream`) for real-time, dynamic responses. A system instruction defines its helpful "Aura Concierge" persona.

### 2. AI Study Assistant
-   **Location**: School Hub -> Student -> AI Study Assistant
-   **Component**: `/components/modules/school-hub/student/AIStudyAssistant.tsx`
-   **Functionality**: A specialized tutor bot. Its system instruction explicitly tells it to guide students using the Socratic method rather than providing direct answers.

### 3. AI Homework Helper
-   **Location**: School Hub -> Parent -> Homework Support & AI Coach
-   **Component**: `/components/modules/school-hub/parent/HomeworkSupport.tsx`
-   **Functionality**: Similar to the Study Assistant, this tool helps parents guide their children through homework problems by providing explanations and leading questions.

---

## Content Generation & Analysis

### 4. Policy Generator
-   **Location**: School Hub -> School -> Policy Generator
-   **Component**: `/components/modules/school-hub/school/PolicyGenerator.tsx`
-   **Functionality**: Generates a complete, well-structured school policy document from a simple topic and target audience. It uses a detailed prompt to instruct the AI on the required format (Purpose, Scope, etc.).

### 5. Community Feedback AI
-   **Location**: School Hub -> School -> Community Feedback AI
-   **Component**: `/components/modules/school-hub/school/CommunityFeedbackAI.tsx`
-   **Functionality**: Takes raw, unstructured text feedback and uses the Gemini API's JSON mode with a response schema to return a structured analysis, including sentiment, a summary, key themes, and actionable suggestions.

### 6. AI-Assisted Grading
-   **Location**: School Hub -> Teacher -> AI-Assisted Grading & Feedback
-   **Component**: `/components/modules/school-hub/teacher/AIGrading.tsx`
-   **Functionality**: A teacher provides a student's submission and a grading rubric. The AI evaluates the work against the rubric and provides a detailed breakdown of scores and constructive feedback.

### 7. Smart Gap Detector
-   **Location**: School Hub -> Teacher -> Smart Gap Detector
-   **Component**: `/components/modules/school-hub/teacher/SmartGapDetector.tsx`
-   **Functionality**: Analyzes a list of student answers to a common question, identifies recurring misunderstandings (knowledge gaps), and suggests targeted teaching strategies to address them.

### 8. AI Content Generator (for Teachers)
-   **Location**: School Hub -> Teacher -> Customized Content Generator
-   **Component**: `/components/modules/school-hub/teacher/ContentGenerator.tsx`
-   **Functionality**: A versatile tool for teachers to generate quizzes, lesson plans, or activity ideas based on a topic and grade level.

### 9. AI Announcement Drafter
-   **Location**: School Hub -> School -> Announcements
-   **Component**: `/components/modules/school-hub/school/Announcements.tsx`
-   **Functionality**: An AI assistant is built into the announcement creation form. An administrator can provide a title and select a tone, and the AI will generate a clear, well-written announcement.

---

## Predictive & Communication AI

### 10. Predictive Analytics
-   **Location**: School Hub -> Administration -> Predictive Analytics
-   **Component**: `/components/modules/school-hub/administration/PredictiveAnalytics.tsx`
-   **Functionality**: Uses historical data and contextual notes as input for a prompt. It leverages Gemini's JSON mode with a schema to forecast future trends (like enrollment) and identify potential risk factors.

### 11. Crisis Communication Drafts
-   **Location**: School Hub -> Administration -> Crisis Management Hub
-   **Component**: `/components/modules/school-hub/administration/CrisisManagementHub.tsx`
-   **Functionality**: Helps administrators quickly draft clear and calm messages for parents during crisis situations (e.g., inclement weather, security threats). The prompt is tailored based on the crisis type and communication channel (Email vs. SMS).

### 12. Real-Time Translation
-   **Location**: School Hub -> Parent -> Real-Time Communication
-   **Component**: `/components/modules/school-hub/parent/ParentCommunication.tsx`
-   **Functionality**: In the parent-teacher chat, parents can click a "Translate" button on any message from a teacher. This sends the message text to the Gemini API with a prompt to translate it to English.

### 13. AI Message Drafting
-   **Location**: School Hub -> Parent -> Real-Time Communication
-   **Component**: `/components/modules/school-hub/parent/ParentCommunication.tsx`
-   **Functionality**: Parents can open a modal and type a simple intent (e.g., "ask about my son's missing homework"). The AI rewrites this into a polite, professional, and clear message that can be sent to the teacher.

### 14. Predictive Budgeting
-   **Location**: School Hub -> Finance -> Predictive Budgeting
-   **Component**: `/components/modules/school-hub/finance/PredictiveBudgeting.tsx`
-   **Functionality**: Generates a 2-year budget forecast for a selected department based on historical spending and contextual notes.

### 15. Vocabulary Game Generation
-   **Location**: Gamification Overlay -> Learning Games -> Language Game
-   **Component**: `/components/modules/gamification/learning-games/vocabulary-voyage/VocabularyVoyage.tsx`
-   **Functionality**: When the game starts, it calls the Gemini API with a JSON schema to generate a unique set of 5 vocabulary words, their correct definitions, and three plausible but incorrect definitions, ensuring a new quiz every time.