# GROW YouR NEED Saas School

A futuristic, glassmorphic dashboard for SaaS educational institutions, featuring a modular interface, real-time data visualization, and powerful AI integrations powered by the Google Gemini API.

![GROW YouR NEED Screenshot](https://storage.googleapis.com/aurea-6a2ba.appspot.com/public/aura-os-screenshot.png)

---

## Table of Contents

- [About The Project](#about-the-project)
- [Detailed Documentation](#detailed-documentation)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [AI Integration](#ai-integration)

---

## About The Project

**GROW YouR NEED** is a web-based, OS-like dashboard designed to be a central hub for a modern educational SaaS platform. It combines stunning visuals with powerful functionality, creating an intuitive and engaging user experience for administrators, teachers, parents, and students.

The entire interface is built around a **glassmorphic** design language, utilizing blurred backgrounds, vibrant gradients, and clean typography to create a sense of depth and modernity. The architecture is highly modular, allowing for easy expansion and management of different functionalities.

---

## Detailed Documentation

For a complete breakdown of the project structure, components, modules, AI features, and more, please refer to the full documentation.

**[➡️ View Full Project Documentation](./docs/README.md)**

---

## Key Features

- **Modular Architecture:** The application is divided into distinct modules (`Dashboard`, `Analytics`, `School Hub`, etc.), each handling a specific domain of functionality.
- **Overlay Applications:** Full-screen applications like `Studio`, `Hobbies`, and `Marketplace` launch over the main interface, providing immersive, focused experiences.
- **Real-time Design Studio:** A powerful, multi-page graphic design tool with layers, element manipulation (drag, resize, rotate), a properties panel, and PNG export.
- **Interactive Video Editor:** A foundational video editor with an interactive timeline, media bin, real-time preview, and clip properties inspector.
- **Comprehensive Role-Based Dashboards:** The `School Hub` provides unique, feature-rich dashboards and tools tailored specifically for School Admins, Teachers, Students, and Parents.
- **Deep AI Integration:** Leverages the Google Gemini API for over a dozen features, including a conversational AI assistant, AI-assisted grading, content generation, predictive analytics, and real-time translation.
- **Advanced Theming System:** A settings panel that allows for real-time customization of the entire application's color scheme, layout, and sizing.
- **No Build Step Required:** Uses an `importmap` in `index.html` to load ES modules directly from a CDN, simplifying the development setup.

---

## Tech Stack

- **Frontend:**
  - [React](https://react.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/) (via CDN)
- **AI Engine:**
  - [@google/genai](https://www.npmjs.com/package/@google/genai) (Google Gemini API)
- **Icons:**
  - [Lucide React](https://lucide.dev/)
- **Charting:**
  - [Recharts](https://recharts.org/)

---

## Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

You only need a modern web browser that supports ES modules.

### API Key Setup

This project relies on the Google Gemini API for its AI features. The application is hardcoded to look for the API key in `process.env.API_KEY`. For development, replace this with your actual API key where `new GoogleGenAI()` is called.

**Warning:** Do not commit your API key to a public repository.

### Installation

1.  Clone the repository or download the source files.
2.  Since there is no build step, you just need to serve the files from a local web server. The easiest way is using `serve`:
    ```bash
    # If you don't have serve, install it globally
    npm install -g serve

    # Navigate to the project directory and run the server
    serve .
    ```
3.  Open your browser and navigate to the local address provided by `serve` (e.g., `http://localhost:3000`).

---

## AI Integration

The Google Gemini API is a core part of the **GROW YouR NEED** experience. For a full list of AI features, please see the [AI Integration Documentation](./docs/AI_INTEGRATION.md).