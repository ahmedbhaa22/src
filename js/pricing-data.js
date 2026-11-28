/* ============================================================
   SolidReach — pricing data helpers (SHARED by the site + dashboard)
   - GROUPS: kept for the dashboard/site structure (one group today)
   - CATEGORIES: the team types shown on the site, in order. A plan's
     `category` field must be one of these ids.
   - DEFAULT_PLANS: starter content used by the dashboard's
     "Load default plans" button. The public site also falls back
     to these if Firebase has no plans for the new team types yet.
   Editors change plans from the dashboard after that.
   ============================================================ */

export const GROUPS = [
  { id: "main", title: "Our Teams", short: "", img: "assets/img/realestate.jpg", blurb: "" }
];

// Team types render in this order.
export const CATEGORIES = [
  { id: "lg", groupId: "main", accent: "#1A5FD0",
    title: "Lead Generation & Appointment Setting Teams", label: "Lead Generation & Appointment Setting",
    desc: "Get more conversations with qualified prospects, booked appointments, and a consistent pipeline of new opportunities.",
    note: "All include prospect lists, dialer, caller management, performance monitoring, and a dedicated Client Success Manager.",
    needs: ["Cold Calling", "Lead Generation", "Lead Qualification", "Appointment Setting", "Follow-Up"],
    industries: ["Real Estate", "Roofing", "Solar", "Insurance", "Other"] },
  { id: "ma", groupId: "main", accent: "#0F9D84",
    title: "Managed Acquisition Teams (Real Estate)", label: "Managed Acquisition (Real Estate)",
    desc: "Build a dedicated team to manage your real estate leads, acquisitions, and dispositions.",
    note: "",
    needs: ["Lead Management", "Acquisitions", "Dispositions", "CRM Management", "Follow-Up"], industries: [] }
];

const P = (category, order, title, price, oldPrice, badge, featured, features) =>
  ({ category, order, title, price, period: "/mo", oldPrice, badge, featured, features });

// Draft prices from the client's brief; confirm before going live.
export const DEFAULT_PLANS = [
  // ---- Lead Generation & Appointment Setting ----
  P("lg", 1, "Launch", "$1,499", "", "", false, ["1 Cold Caller", "40 lead target / month"]),
  P("lg", 2, "Scale", "$2,799", "", "Popular", true, ["2 Cold Callers", "80 lead target / month"]),
  P("lg", 3, "Growth", "$5,299", "", "", false, ["4 Cold Callers", "160 lead target / month"]),

  // ---- Managed Acquisition (Real Estate) ----
  P("ma", 1, "Close", "$3,699", "$4,260", "", false, ["2 Cold Callers", "Full-Time Lead Manager"]),
  P("ma", 2, "Acquisition Plus", "$4,299", "$5,070", "Most Popular", true, ["2 Cold Callers", "Full-Time Lead Manager", "Part-Time Acquisition Manager"]),
  P("ma", 3, "Acquisition Pro", "$7,599", "$8,880", "", false, ["4 Cold Callers", "Full-Time Lead Manager", "Full-Time Acquisition Manager"]),
  P("ma", 4, "Full Cycle", "$8,899", "$10,500", "Complete Operation", false, ["4 Cold Callers", "Full-Time Lead Manager", "Full-Time Acquisition Manager", "Full-Time Disposition Manager"])
];
