# SolidReach — Dynamic Pricing Setup (Firebase)

Your pricing section now loads from **Firebase (Firestore)**, and your team edits
it from **`dashboard.html`** — no code, no contacting anyone. This guide gets it
running. One-time setup, ~15 minutes.

---

## What was added to the project

| File | What it does |
|------|--------------|
| `js/firebase-config.js` | Your Firebase connection settings (**you paste your values here**). |
| `js/pricing-data.js` | The two groups + the starter/default plans. |
| `js/pricing.js` | Loads plans from Firebase into the public site's pricing section. |
| `dashboard.html` | Password-protected editor: add / edit / delete / reorder plans. |
| `firestore.rules` | Security: public can read, only your editors can change. |
| `index.html` / `css/style.css` | Pricing section is now dynamic; small CSS added. |

---

## Step 1 — Create a Firebase project

1. Go to <https://console.firebase.google.com> and sign in with a Google account.
2. **Add project** → name it e.g. `solidreach-pricing` → you can disable Google
   Analytics → **Create project**.

## Step 2 — Register a Web app & copy the config

1. In the project, click the **Web** icon (`</>`) to add a web app.
2. Give it a nickname (e.g. `SolidReach Site`) → **Register app**.
3. Firebase shows a `firebaseConfig = { ... }` object. Copy it.
4. Open **`js/firebase-config.js`** and replace the placeholder object with yours
   (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).
   > These values are safe to keep in the code — Firebase web config is public by
   > design. Your data is protected by the security rules, not by hiding this.

## Step 3 — Turn on Email/Password login and add your editors

1. Left menu → **Build → Authentication → Get started**.
2. **Sign-in method** tab → enable **Email/Password** → Save.
3. **Users** tab → **Add user** → create an account for each person who should be
   able to edit pricing (2–3 emails + a password each). Give them these logins.
   > There is **no public sign-up** — only accounts you create here can log in.

## Step 4 — Create the Firestore database

1. Left menu → **Build → Firestore Database → Create database**.
2. Choose a location close to your customers → start in **production mode** →
   Enable.

## Step 5 — Publish the security rules

1. Firestore Database → **Rules** tab.
2. Open **`firestore.rules`** from this project, and **replace the three
   `editor@example.com` emails with the real editor emails** you created in Step 3.
3. Paste the whole file's contents into the Rules editor → **Publish**.

## Step 6 — Add your website domain to Auth

1. Authentication → **Settings → Authorized domains → Add domain**.
2. Add your live domain (e.g. `solidreachco.com`). `localhost` is already allowed
   for testing.

---

## Step 7 — First load: add your plans

The dashboard and site must be opened over **http/https**, not by double-clicking
the file (browsers block modules on `file://`). Use your normal hosting, or test
locally (see below).

1. Open **`dashboard.html`** in your browser.
2. Sign in with one of the editor accounts.
3. Click **“Load default plans”** — this fills Firebase with your current set
   (Launch, Scale, Close ⭐, Growth, Dominate + the three Individual Services).
4. Open the site's **#pricing** section — the plans now come from Firebase.

That's it. From now on your team just opens `dashboard.html`, signs in, and edits.

---

## Daily use (for your editors)

- **Edit a plan:** dashboard → **Edit** → change name, price, old price, badge,
  features (one per line) → **Save**. Live immediately.
- **Reorder:** the **↑ / ↓** buttons move a card within its group.
- **Add / remove:** **+ Add plan** / **Delete**.
- **Featured card:** tick “Highlight this card”, and/or set a **Badge** like
  `MOST POPULAR`.

## The one line that stays in code

"Need a custom team? Let's build one for you." sits just under the pricing groups
in `index.html`. It rarely changes; edit that line there if ever needed.

---

## Testing locally (optional)

From the project folder, run a tiny web server and open the printed URL:

```
python -m http.server 8000
```

Then visit `http://localhost:8000/` (site) and `http://localhost:8000/dashboard.html`
(editor).

## Troubleshooting

- **“Missing or insufficient permissions.”** The signed-in email isn't in
  `firestore.rules`, or you didn't Publish the rules. Re-check Step 5.
- **Pricing section empty / “couldn't be loaded.”** Config not pasted (Step 2),
  Firestore not created (Step 4), or plans not added yet (Step 7).
- **Can't sign in.** The account wasn't created in Authentication → Users (Step 3),
  or Email/Password isn't enabled (Step 3).
- **Works locally but not live.** Add your domain in Authorized domains (Step 6).
