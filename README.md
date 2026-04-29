# Starforged Void-Link Terminal
 
**A browser‑based tabletop role‑playing game engine for Ironsworn: Starforged, built on Datasworn data, powered by Google Sheets as its persistent storage layer.**  

---  

## 📚 Overview  

This repository contains a **self‑contained web application** that serves as the front‑end for a tabletop RPG (compatible with Ironsworn/Starforged/Sworn systems). Its primary goals are:  

* **Consume official Datasworn data** – The game’s content (characters, items, locations, etc.) is sourced directly from the open‑source *Datasworn* project via a CDN‑hosted JSON file.  
* **Persist player state** – All character statistics, sector archives, and logs are stored in Google Sheets using a lightweight Apps Script backend.  
* **Enable multiplayer & session logging** – The system supports real‑time interaction between players and maintains immutable logs for auditability.  

The intent behind this project is described in detail in **[development_roadmap.md](development_roadmap.md)**, which outlines the long‑term vision, technical milestones, and planned feature set.

---  

## 🗂️ Repository Structure  

```
├── css/                     # Static stylesheet (style.css) + documentation
│   ├── about this file.md
│   └── style.css
│
├── Google_App_Scripts_Code/ # Server‑side code executed as a Google Apps Script web app
│   └── Code.gs               # Handles all HTTP POST requests and Sheets operations
│
├── js/                      # Frontend JavaScript modules (no build step required)
│   ├── about the js files.md  # Documentation of JS module organization
│   ├── datasworn.js           # Core wrapper that fetches & parses Datasworn JSON via CDN
│   └── sync.js                # Communication layer to Google Apps Script (REST API)
│
├── modules/                 # Individual HTML “pages” for different game features
│   ├── asset-browser/
│   │   └── asset-browser.html
│   ├── asset-tracker/
│   │   └── asset-tracker.html
│   ├── character-sheet/
│   │   └── character-sheet.html
│   ├── compendium/
│   │   └── compendium.html   # Main hub for browsing items, oracles, and truths
│   ├── journal/
│   │   └── journal.html      # Session log viewer & note‑taking tool
│   ├── map/
│   │   └── map.html
│   └── about these files.md    # Documentation of module layout
│
├── development_roadmap.md   # **Describes the project’s intent, roadmap, and future directions**
├── LICENSE.md               # License information (see file for details)
├── multiplayer.md           # Details on real‑time multiplayer support and networking
├── README.md                # This file – entry point for humans & LLMs
├── super-hud.html           # Special UI component (not part of core modules)
└── ... other root files ...
```

### Key Files Explained  

| File | Purpose |
|------|---------|
| **development_roadmap.md** | Outlines the project’s vision, technical roadmap, and planned feature set. It explains *why* Datasworn is used as a data source and how multiplayer will be integrated. |
| **multiplayer.md** | Describes how real‑time player interaction is achieved (e.g., WebSocket considerations, session handling). |
| **LICENSE.md** | Contains the open‑source license governing this repository. |
| **datasworn.js** | JavaScript module that fetches Datasworn’s JSON from `https://cdn.jsdelivr.net/npm/@datasworn/starforged/json/starforged.json`, normalizes schema differences (V1 → V2), and exposes helper methods (`init`, `getAssets`, `findNode`). |
| **sync.js** | Client‑side wrapper that sends POST requests to the Google Apps Script backend. Handles saving stats, logs, and sector data; loads character statistics and sector archives. |
| **Code.gs** | Server‑side Google Apps Script that implements all REST endpoints (`saveStat`, `loadStats`, `logEntry`, `saveSector`, etc.) using Google Sheets as its database. |
| **HTML modules (e.g., compendium.html, character-sheet.html)** | UI components that consume data from `datasworn.js` and present it in a user‑friendly way. They rely on the global `window.dataswornCore` object for data access. |

---  

## 🚀 Getting Started  

1. **Clone the repository**  
   ```bash
   git clone https://github.com/samsrauy/void-link.git
   cd void-link
   ```

2. **Open the application**  
   The project is purely static HTML/JS; no build tools or server setup are required. Open `index.html` in a browser to view the main hub.

3. **Configure Google Apps Script (backend)**  
   - Deploy `Google_App_Scripts_Code/Code.gs` as a **Web App** from the Apps Script editor.  
   - Set the “Execute as” permission to *Me* and “Who has access” to *Anyone, even anonymous*.  
   - Copy the **Web App URL** (the “Current web app URL”) and store it in your browser’s `localStorage` under the key `voidLinkServer`. This is required for `sync.js` to communicate with the backend.

4. **Run locally**  
   Simply open any HTML file (e.g., `compendium.html`) in a modern browser. All interactions will use the Datasworn CDN and, when needed, your deployed Apps Script endpoint.

---  

## 🧩 How Data Flows Through This System  

1. **Datasource** – *Datasworn* publishes its game data as JSON via a public CDN URL (`https://cdn.jsdelivr.net/npm/@datasworn/starforged/json/starforged.json`).  
2. **Frontend (void‑link)** – `datasworn.js` loads this JSON, parses it into a usable JavaScript object (`window.dataswornCore`), and provides helper methods for the UI modules.  
3. **UI Modules** – HTML pages (e.g., `compendium.html`) query `dataswornCore` to render interactive cards, tables, and forms. No server‑side rendering is required; all data is fetched client‑side.  
4. **Persistence Layer** – When a player saves character stats, creates a sector log, or updates inventory:  
   - `sync.js` packages the request into a JSON payload (`action`, `id`, …).  
   - The request is POSTed to the URL stored in `localStorage` (`voidLinkServer`).  
   - **Google Apps Script (Code.gs)** receives the request, writes/reads the appropriate Google Sheet, and returns a JSON response indicating success or failure.  

This separation ensures that **datasworn remains the single source of truth for game content**, while **Google Sheets provides durable storage** for player‑specific data without requiring a custom backend.

---  

## 📖 Documentation References  

- **[development_roadmap.md](development_roadmap.md)** – High‑level intent, milestones, and future feature roadmap.  
- **[multiplayer.md](multiplayer.md)** – Technical details on real‑time multiplayer implementation (if applicable).  
- **datasworn.js** – Core logic for fetching and normalizing Datasworn data.  
- **sync.js & Code.gs** – Full description of the client‑server communication flow and Google Sheets integration.  

---  

## 🤝 Contributing  

Contributions are welcome! Please follow these steps:  

1. Fork the repository.  
2. Create a feature branch (`git checkout -b feature/your-feature`).  
3. Ensure all changes adhere to the project’s coding standards (see `about the js files.md` for JS conventions).  
4. Submit a Pull Request with a clear description of the change and any relevant screenshots.  

> **Note:** All data modifications must go through the Google Apps Script backend; direct edits to Google Sheets are discouraged.

---  

## 📜 License  

See **[LICENSE.md](LICENSE.md)** for licensing terms. The repository is distributed under an open‑source license (MIT or equivalent).  

---  

*This README was crafted to be understandable by both human readers and large language models, ensuring that anyone can quickly grasp the purpose, structure, and operation of the **void-link** project.*

Q: Do I worry about security?
A: How Security Actually Works in This Setup
You are still getting excellent security with "Execute as: Me" and "Who has access: Anyone".

Here is why it is safe:

1. The Obscured Endpoint: The only way someone can write to your sheet is if they have your specific, 60-character Web App URL and they know exactly how your sync.js formats its JSON payloads. It is virtually unguessable.

2. File-Level Security: Just like you envisioned, the Game Master should absolutely share the actual Google Sheet and Google Doc with their friends' Gmail accounts! The players will log into Google to look at the raw files.

3. The API Gatekeeper: The Web App simply acts as an open mailbox that takes letters (stat updates) from the GitHub site and drops them into the GM's secure Sheet.

By keeping the Web App open to "Anyone," you ensure the GitHub code can drop off the data seamlessly, while the actual Google Drive files remain locked down to your friends' specific Gmail accounts.

Q: But that's not *real* security, right?
A: Well, ehh..... no you're not exactly correct. What is the risk is the better question. Let's make some assumptions, bad guy wants to mess with you. Ok, here's what they can techially do:
1. Injecting Nonsense: If someone somehow got the URL and fired a payload like {"action": "saveStat", "id": "hacker", "field": "health", "value": 999}, your script just goes, "Okay, creating a new row for 'hacker'." Next time you open your sheet, you see a junk row, delete it, and move on.
2. No Malicious Execution: The Code.gs only knows how to do exactly three things: find a row and update a cell, read a row and return it, or append a paragraph to a specific Google Doc. There is no way for a payload to "trick" it into deleting your spreadsheet or reading your private emails.
3. Data Extraction (The One Tiny Caveat): Technically, because we built a loadStats action, an attacker could get data OUT, but only if they guessed your secret URL and guessed your exact Callsign. And even if they did... what are they stealing? The fact that your space smuggler has 3 Supply and 2 Momentum? It's tabletop game data, not credit card numbers.

>[!Warning]
>Do NOT use sensitive information for your online TTRPG character.
>No, sensitive data does not make a cleaver TTRPG riddle.
><br><br>That is all....

<img width="75%" height="75%" alt="image" src="https://github.com/user-attachments/assets/0cadd84b-c95c-45c9-95dc-ab72d018abc7" />

