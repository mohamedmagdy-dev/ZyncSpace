# ZyncSpace

ZyncSpace is a real-time, responsive web chat application built with React 19, Vite, Tailwind CSS, and Google Firebase. It delivers 1-on-1 private messaging, instant user search, real-time message synchronization, profile customization with client-side image compression, and route protection.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Firestore Data Model](#firestore-data-model)
- [Installation and Setup](#installation-and-setup)
- [Environment and Configuration](#environment-and-configuration)
- [Scripts](#scripts)
- [Security and Route Protection](#security-and-route-protection)
- [License](#license)

---

## Overview

ZyncSpace provides a modern web interface for direct communication. It leverages Firebase Authentication for credential verification and Cloud Firestore for low-latency data streaming. The application is structured with a mobile-first responsive design, transitioning between conversation lists and active chats on smaller screens while presenting a dual-pane layout on desktop displays.

---

## Key Features

### 1. Real-Time One-on-One Messaging
- Live bidirectional message exchange powered by Cloud Firestore snapshot listeners.
- Instant chat room creation between registered users using normalized deterministic identifiers.
- Automatic conversation ordering based on latest activity timestamps.
- Optimistic UI updates with input restoration upon transmission failure.

### 2. Contact Discovery and Chat Initiation
- Dynamic search interface querying registered users across the platform in real time.
- Direct initiation of private chat rooms with metadata initialization.
- Automatic filtering to prevent self-targeting in contact searches.

### 3. Profile Management and Client-Side Image Compression
- User profile editing modal supporting custom display names and avatars.
- Client-side image optimization using an HTML5 Canvas pipeline (`imageUtils.js`):
  - Proportional dimension scaling to a maximum width/height of 240 pixels.
  - High-efficiency JPEG compression (~15-25 KB output).
  - Direct Base64 persistence in Firestore, avoiding unnecessary external storage overhead.

### 4. Authentication and Session Handling
- Secure email/password authentication via Firebase Auth.
- Account registration with optional immediate avatar upload.
- Password recovery flow via Firebase password reset emails.
- Global authentication state persistence using Zustand, synchronized with Firebase `onAuthStateChanged`.

### 5. Responsive UI and Micro-Interactions
- Adaptive layout switching:
  - Mobile: Sidebar and chat view alternate with seamless back navigation.
  - Desktop: Split-screen sidebar and active conversation pane.
- Notification management using Sonner toast messages.
- Form validation handled via React Hook Form.

---

## Tech Stack

### Core Technologies
- React 19 (UI Library)
- Vite 8 (Build Tool and Development Server)
- React Router 8 (Client-Side Routing)

### State and Data Management
- Google Firebase 12 (Authentication, Cloud Firestore)
- Zustand 5 (Global State Management)

### Styling and Animation
- Tailwind CSS 4 (Utility-First Styling)
- GSAP 3 (Animations)
- Sonner (Toast Notifications)

### Form Management
- React Hook Form (Input Handling and Validation)

---

## Project Architecture

```
chat-app/
├── firebase.config.js          # Firebase SDK initialization
├── index.html                  # HTML entry point
├── package.json                # Project manifest and dependencies
├── vite.config.js              # Vite configuration
└── src/
    ├── App.jsx                 # Application router and layout definition
    ├── main.jsx                # React root bootstrap
    ├── assets/                 # Static media and default assets
    ├── components/
    │   ├── AppLogo.jsx         # Global application branding
    │   ├── FormInputs.jsx      # Reusable form fields and search inputs
    │   ├── ProfileSettingsModal.jsx # User profile and avatar management modal
    │   ├── ProtectedRoute.jsx  # Auth-gated and guest-only route wrappers
    │   └── SearchNewContacts.jsx    # Contact discovery and chat creation modal
    ├── lib/
    │   └── imageUtils.js       # Canvas-based Base64 image compression utility
    ├── pages/
    │   ├── ChatPage.jsx        # Primary chat interface and conversation manager
    │   ├── LoginPage.jsx       # Authentication entry point
    │   ├── RegisterPage.jsx    # Account registration with avatar upload
    │   └── ResetPasswordPage.jsx # Password recovery screen
    ├── store/
    │   └── useAuthStore.jsx    # Zustand authentication and user profile store
    └── styles/
        ├── App.css             # Theme variables and global styles
        └── index.css           # Tailwind directives and base rules
```

---

## Firestore Data Model

### `users` Collection
Stores user profiles and metadata created upon registration or profile updates.
```json
{
  "uid": "string",
  "displayName": "string",
  "email": "string",
  "photoURL": "string (Base64 JPEG data URI or URL)",
  "createdAt": "Timestamp"
}
```

### `chats` Collection
Maintains 1-on-1 chat room definitions and conversation summaries. The document ID is deterministically generated by sorting participant UIDs alphabetically (`[uidA, uidB].sort().join("_")`).
```json
{
  "participants": ["uidA", "uidB"],
  "participantDetails": {
    "uidA": {
      "displayName": "string",
      "photoURL": "string"
    },
    "uidB": {
      "displayName": "string",
      "photoURL": "string"
    }
  },
  "lastMessage": {
    "text": "string",
    "senderId": "string",
    "timestamp": "Timestamp"
  },
  "updatedAt": "Timestamp",
  "createdAt": "Timestamp"
}
```

### `chats/{chatId}/messages` Subcollection
Contains individual messages sent within a specific chat room.
```json
{
  "senderId": "string",
  "text": "string",
  "timestamp": "Timestamp"
}
```

---

## Installation and Setup

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher) or yarn / pnpm
- A Firebase project with Authentication (Email/Password) and Cloud Firestore enabled

### Step 1: Clone the Repository
```bash
git clone https://github.com/mohamedmagdy-dev/ZyncSpace.git
cd ZyncSpace
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Firebase
Verify that `firebase.config.js` is populated with your Firebase project credentials:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Step 4: Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite local development server with Hot Module Replacement |
| `npm run build` | Compiles and optimizes assets for production distribution |
| `npm run preview` | Runs a local static server to preview the production build |
| `npm run lint` | Runs ESLint across project files |

---

## Security and Route Protection

The application implements authentication guards through the `ProtectedRoute` component:

- Authenticated Access: Routes such as `/chat` require a valid session. Unauthenticated users are redirected to `/login`.
- Guest-Only Routes: Public entry points (`/login`, `/register`, `/reset-password`) utilize the `guestOnly` property, redirecting authenticated users directly to `/chat`.
- Hydration Fallback: Displays a loading indicator while Firebase resolves initial session status (`authReady`), preventing unwanted redirects or layout flash.

---

## License

This project is licensed under the MIT License. You are free to use, modify, and distribute this software for personal and commercial projects.
