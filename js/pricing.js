/* ============================================================
   SolidReach — public pricing (Typewriter design)
   Reads plans live from Firestore and builds the #plans section:
   one row per team type in its own accent colour, with every
   plan visible at once (no sticky or scroll-driven layout).
   All text is inserted with textContent, so nothing an editor
   types can break the page.
   ============================================================ */

import { db, PLANS_COLLECTION } from "./firebase-config.js";
import { GROUPS, CATEGORIES, DEFAULT_PLANS } from "./pricing-data.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const SR = window.SR;
const h = SR.h, money = SR.money;
const CHECK = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';

const num = (s) => { const v = parseFloat(String(s || "").replace(/[^0-9.]/g, "")); return isFinite(v) ? v : null; };
const byOrder = (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0);

function card(p, c) {
  const a = h("article", "p-card" + (p.featured ? " is-featured" : ""));
  const top = h("div", "p-top");
  top.appendChild(h("span", "p-name", p.title || ""));
  if (p.badge) top.appendChild(h("span", "p-badge", p.badge));
  a.appendChild(top);

  const pr = h("div", "p-price");
  const amt = h("span", "p-amt", p.price || "");
  const v = num(p.price);
  if (v != null && /^\s*\$/.test(p.price || "")) amt.dataset.value = v;
  pr.appendChild(amt);
  if (p.period) pr.appendChild(h("span", "p-per", p.period === "/mo" ? "/month" : p.period));
  if (p.oldPrice) pr.appendChild(h("s", "p-old", p.oldPrice));
  a.appendChild(pr);

  const ul = h("ul", "p-feats");
  (p.features || []).forEach((f) => { const li = h("li"); li.innerHTML = CHECK; li.appendChild(h("span", null, f)); ul.appendChild(li); });
  a.appendChild(ul);

  const b = h("button", "p-cta", "Get Started →"); b.type = "button";
  b.addEventListener("click", () => SR.openForm(
    { title: p.title || "", priceText: p.price || "", period: p.period || "" },
    { group: c.label, title: c.title, needs: c.needs, industries: c.industries }));
  a.appendChild(b);
  return a;
}

/* one coloured row per team type; every plan is visible at once */
function render(root, plans) {
  root.className = "pr";
  root.innerHTML = "";
  let count = 0;
  GROUPS.forEach((g) => {
    CATEGORIES.filter((c) => c.groupId === g.id).forEach((c) => {
      const ps = plans.filter((p) => p.category === c.id).sort(byOrder);
      if (!ps.length) return;
      count++;
      const band = h("section", "pr-band"); band.id = c.id; band.style.setProperty("--acc", c.accent);
      band.setAttribute("aria-label", c.title);
      const head = h("div", "pr-head");
      head.appendChild(h("h3", "pr-title", c.title));
      if (c.desc) head.appendChild(h("p", "pr-desc", c.desc));
      band.appendChild(head);
      const body = h("div", "pr-body");
      const grd = h("div", "p-grid"); ps.forEach((p) => grd.appendChild(card(p, c))); body.appendChild(grd);
      if (c.note) body.appendChild(h("p", "pc-note", c.note));
      band.appendChild(body);
      root.appendChild(band);
    });
  });
  return count;
}

function animate(root) {
  if (!SR.G) return;
  const gsap = window.gsap;
  root.querySelectorAll(".pr-band").forEach((band) => {
    gsap.from(band, { y: 30, opacity: 0, duration: 0.6, ease: "power2.out", clearProps: "transform,opacity", scrollTrigger: { trigger: band, start: "top 88%" } });
  });
  /* prices count up from zero when they scroll into view */
  root.querySelectorAll(".p-amt[data-value]").forEach((el) => {
    const target = +el.dataset.value, o = { v: 0 }, final = el.textContent;
    gsap.to(o, { v: target, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%", once: true },
      onUpdate: () => { el.textContent = money(o.v); }, onComplete: () => { el.textContent = final; } });
  });
}

async function loadPlans() {
  try {
    const snap = await getDocs(collection(db, PLANS_COLLECTION));
    const plans = [];
    snap.forEach((d) => plans.push(d.data()));
    const ids = new Set(CATEGORIES.map((c) => c.id));
    const current = plans.filter((p) => ids.has(p.category));
    if (current.length) return current;
    console.warn("[pricing] No plans for the current team types in Firebase yet; showing the default plans.");
  } catch (err) {
    console.error("[pricing] failed to load from Firebase, showing the default plans:", err);
  }
  return DEFAULT_PLANS;
}

(async function () {
  const root = document.getElementById("plans");
  if (!root) return;
  const plans = await loadPlans();
  if (!render(root, plans)) {
    root.innerHTML = "";
    root.appendChild(h("p", "pricing-status", "Pricing is being updated. Please check back shortly or book a free consultation."));
    return;
  }
  animate(root);
  SR.pricingReady();
})();
