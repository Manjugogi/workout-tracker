# The Workout Tracker: A Beginner's Guide

**Project Overview**
This document serves as a "User Manual" for your Workout Tracker application code. It explains how the different parts of your project work together, written specifically for first-time app developers.

---

## Chapter 1: The Big Picture
Your application is actually **two separate programs** talking to each other:

1.  **The Mobile App (Frontend)**: This is what you see and touch on your phone. It handles buttons, screens, and colors.
2.  **The Server (Backend)**: This is the "brain" that lives in the cloud (on Render). It remembers your data (workouts, profiles) even if you delete the app from your phone.

They communicate over the internet using "API Requests" (like a waiter taking an order from a customer to the kitchen).

---

## Chapter 2: The Main Folder (Root)
*Location: `f:\Programs\workout-tracker\`*

This folder is the "HQ" of your project. It contains configuration files that manage both the app and the server.

*   **`package.json`**: Think of this as the **"Ingredient List"**. It tells the computer exactly which external tools (called "dependencies") your app needs to run.
*   **`package-lock.json`**: This is the **"Strict Receipt"**. It ensures that if you share your code, everyone uses the *exact* same version of ingredients you used, so nothing breaks.
*   **`app.json`**: The **"Identity Card"** for your mobile app. It defines the app's name ("Workout Tracker"), the icon, and the version number (e.g., 1.0.0).
*   **`App.tsx`**: The **"Front Door"**. When you tap the app icon on your phone, this is the very first file that opens. It sets up the navigation system.
*   **`index.ts`**: The **"Ignition Key"**. This tiny file is technical glue. It tells the Android system "Hey, I am a React Native app, please load `App.tsx` to start."
*   **`tsconfig.json`**: The **"Translator's Rulebook"**. Your code is written in TypeScript (Strict English), but phones only understand JavaScript (Basic English). This file tells the computer how to translate between them.
*   **`assets/`**: This folder holds your **Pictures**. It is where `icon.png` (app icon) and `splash.png` (loading screen) live.

### The "Do Not Touch" Folders
You will see these folders, but you rarely need to open them. They are managed automatically by the computer.
*   **`node_modules/`**: The **"Library"**. Remember `package.json` was the shopping list? This folder is the actual shopping bag. It contains thousands of files for all the tools you use (like React, Maps, Camera tools). It is gigantic and can be re-downloaded anytime with `npm install`.
*   **`.expo/`**: **"Temporary files"**. Expo uses this to store temporary settings while your app is running on your phone. It's like a scratchpad.
*   **`android/`**: The **"Engine Room"**. This contains the native Java and Kotlin code that Android phones run. We usually let Expo manage this, but it's there if you ever need to perform "open heart surgery" on the app configuration.

---

## Chapter 3: The Mobile App Code (`src`)
*Location: `f:\Programs\workout-tracker\src\`*
...

---

## Chapter 6: The "Dictionary" of Extensions
What do those letters at the end of the file mean?

| Extension | Name | Plain English Explanation |
| :--- | :--- | :--- |
| **`.json`** | **J**ava**S**cript **O**bject **N**otation | **"Data Only"**. These files are just lists of text settings. They don't "do" anything; they just hold information (like names, versions, settings). Humans and computers can both read them easily. |
| **`.ts`** | **T**ype**S**cript | **"Logic Code"**. These files contain the logic of your app (math, data fetching, rules). They use TypeScript, which adds safety checks to your code to prevent bugs. |
| **`.tsx`** | **T**ype**S**cript **X** (XML) | **"Visual Code"**. These are special TypeScript files that contain **UI Elements** (buttons, text, screens). The "X" stands for the HTML-like tags (like `<View>` or `<Text>`) you see inside them. |
| **`.yaml`** | **Y**AML **A**in't **M**arkup **L**anguage | **"Blueprints"**. Similar to JSON, but designed to be even easier for humans to read. It's mostly used for **Cloud Instructions** (like telling Render.com what size server you want). It uses indentation (spaces) to organize things. |
| **`.md`** | **M**ark**d**own | **"Notes"**. Simple text files with formatting (like this document!). Asterisks make things **bold**, hashes make # Headers. It's the standard for documentation. |
| **`.ps1`** | **P**ower**S**hell | **"Windows Script"**. A script file for Windows. When you run it, it executes a series of commands on your computer automatically. |

---

## Chapter 7: Deep Dive - What's Inside the Files?

Here is a line-by-line explanation of the confusing parts of those main config files.

### 1. `package.json` (The Ingredient List)
If you open this file, you see a few key sections:

*   **`"name"`, `"version"`**: Self-explanatory.
*   **`"scripts"`**: Shortcuts for commands.
    *   `"start": "expo start"`: When you type `npm start`, it actually runs `expo start`. It saves you from typing long commands.
    *   `"test": "jest"`: Runs your tests.
*   **`"dependencies"`**: The tools your app **needs** to run.
    *   `"react": "18.2.0"`: The core brain of the app.
    *   `"expo": "~51.0.0"`: The toolset that lets React run on a phone.
*   **`"devDependencies"`**: Tools only **YOU** need (the developer).
    *   `"typescript"`: Used to check your code for errors while you type. The app doesn't need this once it's built, only you do.

### 2. `app.json` (The Mobile ID Card)
This tells the App Stores (Google/Apple) about your app.

*   **`"expo"`**: Everything lives under this tag.
    *   **`"name"`**: "Workout Tracker" (The name under the icon on your home screen).
    *   **`"slug"`**: "workout-tracker" (A URL-friendly nickname for your app).
    *   **`"version"`**: "1.0.0" (The version users see).
    *   **`"orientation"`**: "portrait" (Locks the app to vertical mode so it doesn't spin when you turn your phone).
    *   **`"icon"`**: "./assets/icon.png" (Path to your app icon).
    *   **`"android"`**: Specific settings for Android.
        *   **`"package"`**: "com.yourname.workouttracker". **Crucial.** This is the unique ID for your app in the Google Play Store. No two apps in the world can have the same package name.

### 3. `index.ts` (The Ignition)
This file is usually just one line!
```typescript
registerRootComponent(App);
```
*   **`App`**: It imports the code from `App.tsx`.
*   **`registerRootComponent`**: This is a command from Expo. It tells the phone's operating system: *"Hello, I am ready. Please take the component named 'App' and put it on the full screen right now."*

### 4. `package-lock.json` (The DNA Record)
**You never edit this file manually.**
Why does it exist?
*   In `package.json`, you might say "I want React version `^18.0.0`". The `^` means "Version 18.0.0 is okay, but 18.1.0 is also okay."
*   If you install the app today, you might get 18.1.0. If your friend installs it next month, they might get 18.2.0. This could cause bugs if 18.2.0 is different!
*   **`package-lock.json`** freezes time. It records: "User installed version 18.1.4 at 2:00 PM".
*   When your friend runs `npm install`, the computer looks at the Lock file, not the JSON file, to ensure they get **exactly** 18.1.4 too.


This is where 90% of your work happens. This folder contains all the visible parts of your app.

### 1. The Pages (`screens/`)
Each file here represents one full screen on your phone.
*   **`LoginScreen.tsx`**: The screen where users sign in.
*   **`WorkoutDetailScreen.tsx`**: Shows the details of a specific workout protocol.
*   **`ProfileScreen.tsx`**: Shows the user's avatar and stats.

### 2. The Building Blocks (`components/`)
These are small, reusable pieces used on multiple screens.
*   Instead of writing the code for a "Blue Button" on every page, you write it once here (e.g., `CustomButton.tsx`) and use it everywhere.

### 3. The Memory (`store/`)
This is the app's **"Short-term Memory"**.
*   **`authStore.ts`**: Remembers if the user is logged in (keeps their "Token").
*   **`profileStore.ts`**: Remembers the user's name, height, and weight while the app is open.

### 4. The Design (`theme/`)
*   **`theme.ts`**: This file controls your colors and fonts. If you want to change the app from Blue to Red, you change it here once, and it updates everywhere.

---

## Chapter 4: The Cloud Server (`server`)
*Location: `f:\Programs\workout-tracker\server\`*

This folder is the "Kitchen" hidden away from the customer. It handles the heavy lifting.

*   **`src/routes/`**: These are the **"Menu Items"** your server offers.
    *   `auth.ts`: Handles requests to Login or Signup.
    *   `protocols.ts`: Handles requests to Save or Load workouts.
*   **`src/db/`**: The **"Connection to the Vault"**. This code manages the connection to your PostgreSQL database where all data is permanently stored.
*   **`schema.sql`**: The **"Blueprint"**. It is a list of instructions that created your database tables (like `Users` table, `Workouts` table) in the first place.

---

## Chapter 5: Deployment Files
These files help move your code from your laptop to the real world.

*   **`eas.json`**: Instructions for **Expo** on how to build the APK file for Android phones.
*   **`render.yaml`**: Instructions for **Render.com** on how to set up your server and database in the cloud.
*   **`update-api-url.ps1`**: A helper script (written by us) to quickly switch your app from "Local Mode" (testing on laptop) to "Cloud Mode" (real users).

---

## Summary
*   **Want to change how it looks?** Go to `src/screens` or `src/theme`.
*   **Want to change how data is saved?** Go to `server/src/routes`.
*   **Building a new version?** You'll interact with `eas.json` and `package.json`.
