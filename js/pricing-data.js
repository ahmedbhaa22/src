/* ============================================================
   SolidReach — pricing data helpers (SHARED)
   - CATEGORIES: the two groups + their display titles + order
   - DEFAULT_PLANS: the starter content used by the dashboard's
     "Load default plans" button (first-time seeding only).
   Editors change everything from the dashboard after that; this
   file is only the initial seed.
   ============================================================ */

// Groups render in this order. Add/rename here if you ever want
// a new group (also add it to the dashboard's category dropdown).
export const CATEGORIES = [
  { id: "packages",   title: "SolidReach Packages" },
  { id: "individual", title: "Individual Services" }
];

export const DEFAULT_PLANS = [
  // ---- SolidReach Packages ----
  { category: "packages", order: 1, title: "Launch", price: "$1,500", period: "/mo",
    oldPrice: "", badge: "", featured: false,
    features: ["1 Cold Caller", "+40 qualified leads/month", "24/7 Client Success Manager", "List & Dialer Included"],
    ctaText: "Choose Plan", ctaLink: "#contact" },

  { category: "packages", order: 2, title: "Scale", price: "$2,800", period: "/mo",
    oldPrice: "$3,000", badge: "", featured: false,
    features: ["2 Cold Callers", "+80 qualified leads/month", "24/7 Client Success Manager", "List & Dialer Included"],
    ctaText: "Choose Plan", ctaLink: "#contact" },

  { category: "packages", order: 3, title: "Close", price: "$3,449", period: "/mo",
    oldPrice: "$3,720", badge: "MOST POPULAR", featured: true,
    features: ["2 Cold Callers + PT Acquisition Manager", "+80 qualified leads/month", "24/7 Client Success Manager", "List & Dialer Included"],
    ctaText: "Choose Plan", ctaLink: "#contact" },

  { category: "packages", order: 4, title: "Growth", price: "$5,299", period: "/mo",
    oldPrice: "$6,000", badge: "", featured: false,
    features: ["4 Cold Callers", "+160 qualified leads/month", "24/7 Client Success Manager", "List & Dialer Included"],
    ctaText: "Choose Plan", ctaLink: "#contact" },

  { category: "packages", order: 5, title: "Dominate", price: "$7,499", period: "/mo",
    oldPrice: "$8,940", badge: "", featured: false,
    features: ["5 Cold Callers + FT Acquisition Manager", "+160 qualified leads/month", "24/7 Client Success Manager", "List & Dialer Included"],
    ctaText: "Choose Plan", ctaLink: "#contact" },

  // ---- Individual Services ----
  { category: "individual", order: 1, title: "Lead Manager", price: "$1,260", period: "/mo",
    oldPrice: "", badge: "", featured: false,
    features: ["Lead Follow-Up & Management", "CRM Management", "Lead Qualification & Organization"],
    ctaText: "Choose Plan", ctaLink: "#contact" },

  { category: "individual", order: 2, title: "Acquisition Manager", price: "$1,440", period: "/mo",
    oldPrice: "", badge: "", featured: false,
    features: ["Lead Qualification & Negotiation", "Comps, ARV, Offers & Follow-Up", "Deal Analysis & Acquisition"],
    ctaText: "Choose Plan", ctaLink: "#contact" },

  { category: "individual", order: 3, title: "Disposition Manager", price: "$1,440", period: "/mo",
    oldPrice: "", badge: "", featured: false,
    features: ["Cash Buyer Outreach", "Buyer List Management", "Deal Marketing & Negotiation"],
    ctaText: "Choose Plan", ctaLink: "#contact" }
];
