/* ============================================================
   SolidReach — Firebase config (SHARED)
   Used by the public site (js/pricing.js) and the editor
   dashboard (dashboard.html).

   👉 STEP 1 of setup: replace the placeholder values below with
      YOUR Firebase web app config. You get these from:
      Firebase Console → Project settings → General →
      "Your apps" → Web app → SDK setup and configuration → Config.

   These values are NOT secrets — Firebase web config is meant to
   live in client-side code. Your data is protected by the
   Firestore security rules (see firestore.rules), not by hiding
   this config.
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// ⬇⬇⬇ REPLACE THIS WHOLE OBJECT WITH YOURS ⬇⬇⬇
const firebaseConfig = {
  apiKey: "AIzaSyDpkwWm2CmG-gpqWeWpwH1d1Fc-pj5YirU",
  authDomain: "solidreach-pricing.firebaseapp.com",
  projectId: "solidreach-pricing",
  storageBucket: "solidreach-pricing.firebasestorage.app",
  messagingSenderId: "571559451893",
  appId: "1:571559451893:web:640d11c13c3ba8443939bc",
  measurementId: "G-E2L0H078MK"
};
// ⬆⬆⬆ REPLACE THIS WHOLE OBJECT WITH YOURS ⬆⬆⬆

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Firestore collection that holds the pricing plans.
export const PLANS_COLLECTION = "pricingPlans";
