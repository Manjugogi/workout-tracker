# How It All Works: The Lifecycle of Your App

This document explains the "magic" that happens behind the scenes. It traces the journey of your code from text files on your laptop to a living, breathing application on a user's phone.

---

## Part 1: The "Translation" (Build Time)
Computers don't actually read your `.tsx` or `.ts` files directly when the app is running. Those are for **humans**. Before anything runs, a translation process happens.

### 1. On the Server Side
*   **The Translator**: When you deploy to Render, a tool runs (configured in `package.json`) that reads your `tsconfig.json`.
*   **The Action**: It translates your strict TypeScript code into standard JavaScript.
*   **The Result**: It creates a `dist/` (distribution) folder. **This** is what actually runs in the cloud. The original `src/` folder is basically ignored after this point.

### 2. On the Phone Side (The APK)
*   **The Bundler**: When you run `eas build`, a tool called "Metro" takes all your hundreds of files (`App.tsx`, screens, components) and smushes them into **one giant JavaScript file** called a "Bundle".
*   **The Container**: This bundle is wrapped inside a native Android shell (managed by the `android/` folder). This shell knows how to talk to the phone's camera, GPS, and screen.
*   **The Result**: An `.apk` file. This contains the native shell + your JS bundle + your assets (images).

---

## Part 2: Two Worlds (Who lives where?)

Imagine two separate islands that can only talk via walkie-talkie (Internet).

### 🌍 Island A: The Cloud (Server)
**Status**: ACTIVE 24/7.
**Who lives here?**
1.  **Node.js**: The program running your `dist/index.js` file. It sits and waits explicitly for "Requests".
2.  **PostgreSQL**: Your database. It is a giant filing cabinet that stores every user, workout, and profile.
*   **What it does**: It is purely **REACTIVE**. It does nothing until a Phone asks it to.

### 📱 Island B: The User's Pocket (Phone)
**Status**: Asleep until opened.
**Who lives here?**
1.  **The App Shell**: The icon on the home screen.
2.  **The JS Bundle**: Your actual code logic.
3.  **Local Storage**: A tiny memory chip on the phone (using `AsyncStorage`) to remember the user's "Session Token" so they don't have to log in every time.

---

## Part 3: Steps When a User Opens the App

Here is the millisecond-by-millisecond breakdown of what happens when a user taps your app icon:

1.  **Waking Up**: The Android OS loads the App Shell.
2.  **Loading the Brain**: The App Shell starts the "Javascript Engine" (Hermes) and loads your big Bundle.
3.  **Execution Starts**: The engine looks for `index.ts`, which points to `App.tsx`.
4.  **The Fork within the Road**:
    *   `App.tsx` runs.
    *   It checks `authStore`. "Do I have a saved token in Local Storage?"
    *   **If YES**: It navigates to the **Home Screen**.
    *   **If NO**: It navigates to the **Login Screen**.

---

## Part 4: The Conversation (Client <-> Server)

Let's say the user clicks **"Save Profile"**. How does the phone tell the server?

### 1. The Request (Phone -> Server)
The phone packages up a message (HTTP Request):
*   **Address**: `https://your-app.render.com/api/profile`
*   **Method**: `POST` (meaning "I want to create/update data")
*   **The Payload**: `{ "name": "John", "height": 180 }`
*   **The Ticket**: "Authorization: Bearer xyz123..." (The Token proving who they are).

### 2. Processing (Server)
The Server receives the message:
1.  **Security Check (`middleware/authenticate.ts`)**: "Is this Token valid? Who is this user?" -> "Ah, it is User ID 5".
2.  **The Logic (`routes/profile.ts`)**: "User 5 wants to update their profile."
3.  **The Database**: The server talks to PostgreSQL: "UPDATE profiles SET name='John' WHERE user_id=5".
4.  **Confirm**: Database says "Done".

### 3. The Response (Server -> Phone)
The server sends a reply back:
*   **Status**: `200 OK` (Green Light)
*   **Body**: `{ "status": "success", "updated_profile": ... }`

### 4. Update UI (Phone)
*   Your app receives the `200 OK`.
*   It updates the screen to show "Profile Saved!" checkmark.

---

## Part 5: "Keeping the Connection"

**Surprising Fact**: There is **NO** permanent connection.

*   The server and phone are **Strangers** every time they talk.
*   The server completely forgets the phone existed the millisecond after it sends the "Response".
*   **How do they remember each other?**
    *   **The Token**: Every single time the phone talks, it must show its ID badge (The JWT Token). "Hi, it's me again (Token XYZ)."
    *   This is why the server is called "Stateless". It doesn't need to keep a phone line open. It just checks the ID badge every single time a request comes in.

---

## Summary
*   **Files**: Your code is translated into a simple language the machines understand.
*   **Server**: Waits in the cloud for requests. Reactive.
*   **Phone**: Runs the UI and sends requests. Proactive.
*   **Database**: The only place where truth lives permanently.
