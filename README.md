# Starforged Void-Link Terminal

A synchronized, multiplayer-ready character and campaign manager for Ironsworn: Starforged. 

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

