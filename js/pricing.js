/* ============================================================
   SolidReach — public pricing loader
   Reads pricing plans live from Firestore and renders them into
   the #pricing section. All text is inserted with textContent,
   so nothing an editor types can break the page layout.
   ============================================================ */

import { db, PLANS_COLLECTION } from "./firebase-config.js";
import { CATEGORIES } from "./pricing-data.js";
import {
  collection, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function buildCard(plan) {
  const col = el("div", "col-lg-4 col-md-6 mb-4");

  const card = el("div", "pricing-card" + (plan.featured ? " featured" : ""));

  if (plan.badge) {
    card.appendChild(el("span", "featured-badge", plan.badge));
  }

  const header = el("div", "pricing-header");
  header.appendChild(el("h3", null, plan.title || ""));

  const price = el("div", "price", plan.price || "");
  if (plan.period) price.appendChild(el("span", null, plan.period));
  header.appendChild(price);

  if (plan.oldPrice) {
    header.appendChild(el("span", "price-old", plan.oldPrice));
  }
  card.appendChild(header);

  const ul = el("ul", "pricing-features");
  (plan.features || []).forEach(function (feat) {
    const li = document.createElement("li");
    const icon = document.createElement("i");
    icon.className = "fas fa-check";
    li.appendChild(icon);
    li.appendChild(document.createTextNode(" " + feat));
    ul.appendChild(li);
  });
  card.appendChild(ul);

  const cta = el("a", "btn-pricing", plan.ctaText || "Choose Plan");
  cta.setAttribute("href", plan.ctaLink || "#contact");
  card.appendChild(cta);

  col.appendChild(card);
  return col;
}

function sortPlans(a, b) {
  const oa = Number(a.order) || 0;
  const ob = Number(b.order) || 0;
  return oa - ob;
}

async function loadPricing() {
  const status = document.getElementById("pricing-status");

  try {
    const snap = await getDocs(collection(db, PLANS_COLLECTION));
    const plans = [];
    snap.forEach(function (doc) { plans.push(doc.data()); });

    let rendered = 0;
    CATEGORIES.forEach(function (cat) {
      const group = document.getElementById("group-" + cat.id);
      const row = document.getElementById("pricing-" + cat.id);
      if (!row) return;
      row.innerHTML = "";

      const inCat = plans.filter(function (p) { return p.category === cat.id; });
      inCat.sort(sortPlans);

      inCat.forEach(function (p) { row.appendChild(buildCard(p)); });
      rendered += inCat.length;

      // Hide the whole group (incl. its title) when it has no plans.
      if (group) group.style.display = inCat.length ? "" : "none";
    });

    if (status) status.textContent = rendered ? "" : "Pricing is being updated — please check back shortly.";
  } catch (err) {
    console.error("[pricing] failed to load from Firebase:", err);
    if (status) status.textContent = "Pricing couldn't be loaded right now. Please refresh, or contact us for current pricing.";
  }
}

document.addEventListener("DOMContentLoaded", loadPricing);
