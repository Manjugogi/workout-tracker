# Workout Tracker - Project Structure Guide

This document explains the purpose of every file and folder in your project. It is designed to help you understand "what goes where" and how the computer uses these files to build and run your application.

## 📂 Root Directory (`f:\Programs\workout-tracker`)
This is the main folder containing the entire full-stack application (Frontend + Backend).

| File / Folder | Type | Purpose & How it Works |
| :--- | :--- | :--- |
| **`package.json`** | ⚙️ Config | **The "ID Card" of your project.** It lists the project's name, version, and most importantly, the **dependencies** (external code libraries like React, Expo) that your app needs to run. The "scripts" section tells `npm` what to do when you type commands like `npm start`. |
| **`package-lock.json`** | 🔒 Config | **The exact ingredient list.** While `package.json` might say "I need React version 18 or higher", this file says "I am currently using exactly React version 18.2.0". This ensures that if you share this code with a friend, they get the *exact* same versions of everything. |
| **`tsconfig.json`** | 🟦 TypeScript | **The Rulebook for TypeScript.** It tells the computer how to translate your TypeScript code (which is strict and has types) into JavaScript (which browsers and phones actually understand). |
| **`app.json`** | 📱 Config | **Expo Configuration.** This file tells Expo (the tool running your mobile app) what your app's name is, what the icon looks like, the version number, and specific settings for Android and iOS builds (like permissions or bundle identifiers). |
| **`App.tsx`** | ⚛️ Code | **The Entry Point.** This is the very first component that loads when you open the app on your phone. It usually sets up the navigation (moving between screens) and global themes. |
| **`index.ts`** | ⚛️ Code | **The Ignition Key.** This tiny file is what standard React Native uses to "register" your app as a running process on the phone. It points to `App.tsx` to start the show. |
| **`eas.json`** | ☁️ Config | **Cloud Build Settings.** Configures how **EAS (Expo Application Services)** should build your APK in the cloud. It defines profiles like "development", "preview", and "production". |
| **`render.yaml`** | ☁️ Config | **Render Deployment Config.** Instructions for Render.com. It tells Render "I have two things to run: a Node.js web service (backend) and a PostgreSQL database", and explains how to build and start them. |
| **`android/`** | 🤖 Folder | **Native Android Code.** This folder is auto-generated and contains the actual Java/Kotlin code that makes up the Android app shell. You rarely touch this unless you are changing deep native settings (like `AndroidManifest.xml`). |
| **`assets/`** | 🖼️ Folder | **Images & Fonts.** Stores static files like your app icon (`icon.png`) and splash screen (`splash.png`). |
| **`node_modules/`** | 📦 Folder | **The Library.** This massive folder contains the actual code for all the dependencies listed in `package.json`. You never edit this directly; `npm install` manages it. |
| **`update-api-url.ps1`** | 📜 Script | **Utility Script.** A custom PowerShell script we wrote to automatically find and replace the API URL in all your source files, making switching between Local and Cloud easier. |

---

## 📂 `src/` (The Frontend Code)
This is where 99% of your work on the Mobile App happens. It follows a standard React Native structure.

| Folder | Purpose |
| :--- | :--- |
| **`components/`** | **LEGO Blocks.** Small, reusable pieces of UI. For example, a `CustomButton.tsx` or `Card.tsx` that you use on multiple screens. |
| **`screens/`** | **The Pages.** Full-page views that the user navigates to. Examples: `LoginScreen.tsx`, `WorkoutDetailScreen.tsx`. Each screen usually combines multiple components. |
| **`store/`** | **The Brain (State Management).** Uses a library called `Zustand`. These files (`authStore.ts`, `profileStore.ts`) hold "Global Data" that needs to be accessed from anywhere in the app, like the user's login token or their profile info. |
| **`navigation/`** | **The Map.** Defines how screens connect. It sets up the "Stack" (pushing screens on top of each other) or "Tabs" (bottom menu bar). |
| **`hooks/`** | **Reusable Logic.** Custom functions that don't render UI but handle logic, like "useTheme" or "useCustomFont". |
| **`theme/`** | **Design System.** Contains `theme.ts` which defines your app's colors, spacing, and fonts in one place. If you change a color here, it updates across the entire app. |
| **`utils/`** | **Helper Functions.** Small tools like date formatters or math calculations that don't belong in a specific component. |
| **`data/`** | **Static Data.** Lists of constant data, like your `exerciseCatalog.ts` which lists all available exercises. |

---

## 📂 `server/` (The Backend Code)
This is a completely separate "mini-project" inside your main folder. It runs on a server (or your laptop) to handle the database and logic.

| File / Folder | Purpose |
| :--- | :--- |
| **`package.json`** | Just like the root one, but specifically for the **Backend**. It lists server libraries like `express` (web server) and `pg` (database driver). |
| **`src/index.ts`** | **The Server Starter.** This file starts the web server, listens for requests on port 5000, and connects all the routes. |
| **`src/db/`** | **Database Connection.** Contains `index.ts` which manages the pool of connections to your PostgreSQL database. |
| **`src/routes/`** | **API Endpoints.** Each file handles a specific feature. `auth.ts` handles login/signup, `protocols.ts` handles workouts. When your app requests `GET /protocols`, this folder handles it. |
| **`src/middleware/`** | **The Bouncers.** Code that runs *before* a request is processed. `authenticate.ts` checks if the user has a valid token before letting them access private data. |
| **`schema.sql`** | **The Blueprint.** A SQL file that defines the structure of your database tables (`users`, `protocols`, `exercises`). You run this to set up a new database. |
| **`init-db-remote.js`** | **Setup Script.** A script we wrote to connect to your remote Render database and run the `schema.sql` to set it up for the first time. |

## 🏗️ Why is it structured this way?

1.  **Separation of Concerns:** We keep the **Frontend** (`src`) separate from the **Backend** (`server`). This means you could theoretically replace the mobile app with a website later and keep the same backend.
2.  **Modularity:** Inside `src`, we separate `screens` (pages) from `components` (parts). This makes code easier to find and re-use.
3.  **Safety:** `package.json` and `tsconfig.json` ensure that anyone working on this project (or any server building it) follows the exact same rules and uses the exact same tools.

---

### How to use this guide
*   **Editing the Look:** Go to `src/screens` or `src/components`.
*   **Changing Data Logic:** Go to `src/store`.
*   **Changing Server Logic:** Go to `server/src/routes`.
*   **Adding Libraries:** Edit `package.json` (usually via `npm install`).
