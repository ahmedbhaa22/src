/* ============================================================
   SolidReach — public pricing (Typewriter design, Sidebar layout)
   Reads plans live from Firestore and builds the #plans section:
   one chapter per solution with a sticky sidebar, and one block
   per team type with its own accent colour.
   All text is inserted with textContent, so nothing an editor
   types can break the page.
   ============================================================ */

import { db, PLANS_COLLECTION } from "./firebase-config.js";
import { GROUPS, CATEGORIES, DEFAULT_PLANS } from "./pricing-data.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const SR = window.SR;
const h = SR.h, money = SR.money;
const CHECK = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';

const two = (n) => (n < 10 ? "0" : "") + n;
const num = (s) => { const v = parseFloat(String(s || "").replace(/[^0-9.]/g, "")); return isFinite(v) ? v : null; };
const byOrder = (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0);

function fromLabel(plans) {
  const vals = plans.map((p) => num(p.price)).filter((v) => v != null);
  return plans.length + " plan" + (plans.length === 1 ? "" : "s") + (vals.length ? " · from " + money(Math.min(...vals)) + "/mo" : "");
}

function card(p, c, group) {
  const a = h("article", "p-card" + (p.featured ? " is-featured" : ""));
  const top = h("div", "p-top");
  if (p.badge) top.appendChild(h("span", "p-badge", p.badge));
  top.appendChild(h("span", "p-name", p.title || ""));
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

function render(root, plans) {
  root.className = "va";
  root.innerHTML = "";
  const groups = GROUPS.map((g) => ({
    g, cats: CATEGORIES.filter((c) => c.groupId === g.id)
      .map((c) => ({ c, plans: plans.filter((p) => p.category === c.id).sort(byOrder) }))
      .filter((x) => x.plans.length)
  })).filter((x) => x.cats.length);

  groups.forEach(({ g, cats }, gi) => {
    const ch = h("section", "va-ch va-" + g.id);
    const grid = h("div", "va-grid");

    const side = h("aside", "va-side");
    side.appendChild(h("span", "va-kicker", "Solution " + (gi + 1) + " of " + groups.length));
    side.appendChild(h("h3", "va-title", g.title));
    const ph = h("div", "va-photo"); const im = h("img"); im.src = g.img; im.alt = ""; im.loading = "lazy"; ph.appendChild(im); side.appendChild(ph);
    side.appendChild(h("p", "va-blurb", g.blurb));
    const nav = h("ol", "va-nav");
    cats.forEach(({ c, plans: ps }) => {
      const li = h("li"); const a = h("a"); a.href = "#" + c.id; a.dataset.t = c.id; a.style.setProperty("--acc", c.accent);
      const bt = h("b"); bt.appendChild(h("i", "va-dot")); bt.appendChild(document.createTextNode(c.title)); a.appendChild(bt);
      a.appendChild(h("small", null, fromLabel(ps)));
      const bar = h("span", "va-bar"); bar.appendChild(h("i")); a.appendChild(bar);
      a.appendChild(h("span", "va-here", "Viewing"));
      li.appendChild(a); nav.appendChild(li);
    });
    side.appendChild(nav);
    grid.appendChild(side);

    const main = h("div", "va-main");
    cats.forEach(({ c, plans: ps }, ci) => {
      const cw = h("div", "va-cat"); cw.id = c.id; cw.style.setProperty("--acc", c.accent);
      const bar = h("div", "va-type");
      bar.appendChild(h("span", "va-num", two(ci + 1)));
      const tt = h("div", "va-tt");
      tt.appendChild(h("span", "va-tk", cats.length > 1 ? "Type " + (ci + 1) + " of " + cats.length + " · " + g.short : g.short));
      tt.appendChild(h("h4", "va-tname", c.title));
      bar.appendChild(tt);
      bar.appendChild(h("span", "pc-meta", fromLabel(ps)));
      cw.appendChild(bar);
      if (c.desc) cw.appendChild(h("p", "pc-desc va-desc", c.desc));
      const grd = h("div", "p-grid"); ps.forEach((p) => grd.appendChild(card(p, c, g))); cw.appendChild(grd);
      if (c.note) cw.appendChild(h("p", "pc-note", c.note));
      main.appendChild(cw);
    });
    grid.appendChild(main);
    ch.appendChild(grid);
    root.appendChild(ch);
  });
  return groups.length;
}

/* exactly one highlighted team type per solution; it stays on until another one takes over */
function setActive(link) {
  link.closest(".va-nav").querySelectorAll("a").forEach((a) => {
    const on = a === link;
    a.classList.toggle("on", on);
    if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
  });
}

function animate(root) {
  if (!SR.G) return;
  const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  root.querySelectorAll(".va-ch").forEach((ch) => {
    gsap.from(ch.querySelectorAll(".va-side > *"), { y: 30, opacity: 0, stagger: 0.08, duration: 0.7, ease: "power2.out", clearProps: "transform,opacity", scrollTrigger: { trigger: ch, start: "top 75%" } });
    gsap.fromTo(ch.querySelector(".va-photo img"), { yPercent: -8, scale: 1.15 }, { yPercent: 8, scale: 1.15, ease: "none", scrollTrigger: { trigger: ch, start: "top bottom", end: "bottom top", scrub: true } });
  });
  root.querySelectorAll(".va-cat").forEach((cw) => {
    gsap.from(cw.querySelectorAll(".p-card"), { y: 40, opacity: 0, duration: 0.65, stagger: 0.08, ease: "power2.out", clearProps: "transform,opacity", scrollTrigger: { trigger: cw, start: "top 82%" } });
    const tb = cw.querySelector(".va-type");
    gsap.from(tb, { clipPath: "inset(0 100% 0 0 round 18px)", duration: 0.9, ease: "power3.inOut", clearProps: "clipPath", scrollTrigger: { trigger: cw, start: "top 80%" } });
    gsap.from(tb.querySelector(".va-num"), { yPercent: 110, opacity: 0, duration: 0.7, delay: 0.35, ease: "back.out(2)", clearProps: "transform,opacity", scrollTrigger: { trigger: cw, start: "top 80%" } });
    ScrollTrigger.create({ trigger: cw, start: "top 140px", end: "bottom 200px", toggleClass: { targets: tb, className: "stuck" } });
    const link = root.querySelector('.va-nav a[data-t="' + cw.id + '"]');
    const bar = link.querySelector(".va-bar i");
    ScrollTrigger.create({ trigger: cw, start: "top 60%", end: "bottom 60%",
      onToggle: (s) => { if (s.isActive) setActive(link); },
      onUpdate: (s) => { bar.style.transform = "scaleX(" + s.progress.toFixed(3) + ")"; } });
  });
  /* prices count up from zero when they scroll into view */
  root.querySelectorAll(".p-amt[data-value]").forEach((el) => {
    const target = +el.dataset.value, o = { v: 0 }, final = el.textContent;
    gsap.to(o, { v: target, duration: 1.3, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%", once: true },
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
  root.querySelectorAll(".va-nav").forEach((nav) => {
    const first = nav.querySelector("a"); if (first) setActive(first);
    nav.addEventListener("click", (e) => { const a = e.target.closest("a"); if (a) setActive(a); });
  });
  animate(root);
  SR.pricingReady();
})();
