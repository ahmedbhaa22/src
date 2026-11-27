/* ============================================================
   SolidReach — pricing data helpers (SHARED by the site + dashboard)
   - GROUPS: the two solutions shown on the site (order = display order)
   - CATEGORIES: the team types inside each solution. A plan's
     `category` field must be one of these ids.
   - DEFAULT_PLANS: starter content used by the dashboard's
     "Load default plans" button. The public site also falls back
     to these if Firebase has no plans for the new team types yet.
   Editors change plans from the dashboard after that.
   ============================================================ */

export const GROUPS = [
  { id: "re", title: "Real Estate Solutions", short: "Real Estate", img: "assets/img/realestate.jpg",
    blurb: "From motivated seller prospecting to acquisition management, we help investors build and convert their pipeline." },
  { id: "as", title: "Appointment Setting Solutions", short: "Appointment Setting", img: "assets/img/callcenter.jpg",
    blurb: "Dedicated setters who handle prospecting, qualification, scheduling, and follow-up for Roofing, Solar and Insurance teams." }
];

// Team types render in this order inside their group.
export const CATEGORIES = [
  { id: "lg", groupId: "re", accent: "#1A5FD0",
    title: "Lead Generation Teams", label: "Real Estate · Lead Generation",
    desc: "Get more conversations with motivated sellers and build a consistent pipeline of off-market opportunities.",
    note: "All include prospect lists, dialer, caller management, performance monitoring, and a dedicated Client Success Manager.",
    needs: ["Cold Calling", "Lead Generation", "Lead Qualification", "Follow-Up"], industries: [] },
  { id: "ma", groupId: "re", accent: "#0F9D84",
    title: "Managed Acquisition Teams", label: "Real Estate · Managed Acquisition",
    desc: "Build a dedicated team to manage your leads, acquisitions, and dispositions.",
    note: "",
    needs: ["Lead Management", "Acquisitions", "Dispositions", "CRM Management", "Follow-Up"], industries: [] },
  { id: "as", groupId: "as", accent: "#8B6CFF",
    title: "Appointment Setting Teams", label: "Appointment Setting",
    desc: "Choose the team size that matches your sales goals. We’ll handle the outreach while you focus on closing.",
    note: "All plans include prospect lists, dialer, calendar and pipeline management, and a 24/7 Client Success Manager.",
    needs: ["Prospecting", "Outreach", "Lead Qualification", "Appointment Booking", "Follow-Up"],
    industries: ["Roofing", "Solar", "Insurance", "Other"] }
];

const P = (category, order, title, price, oldPrice, badge, featured, features) =>
  ({ category, order, title, price, period: "/mo", oldPrice, badge, featured, features });

// Draft prices from the client's brief; confirm before going live.
export const DEFAULT_PLANS = [
  // ---- Real Estate · Lead Generation ----
  P("lg", 1, "Launch", "$1,499", "", "", false, ["1 Cold Caller", "40 lead target / month"]),
  P("lg", 2, "Scale", "$2,799", "", "Popular", true, ["2 Cold Callers", "80 lead target / month"]),
  P("lg", 3, "Growth", "$5,299", "", "", false, ["4 Cold Callers", "160 lead target / month"]),

  // ---- Real Estate · Managed Acquisition ----
  P("ma", 1, "Close", "$3,699", "$4,260", "", false, ["2 Cold Callers", "Full-Time Lead Manager"]),
  P("ma", 2, "Acquisition Plus", "$4,299", "$5,070", "Most Popular", true, ["2 Cold Callers", "Full-Time Lead Manager", "Part-Time Acquisition Manager"]),
  P("ma", 3, "Acquisition Pro", "$7,599", "$8,880", "", false, ["4 Cold Callers", "Full-Time Lead Manager", "Full-Time Acquisition Manager"]),
  P("ma", 4, "Full Cycle", "$8,899", "$10,500", "Complete Operation", false, ["4 Cold Callers", "Full-Time Lead Manager", "Full-Time Acquisition Manager", "Full-Time Disposition Manager"]),

  // ---- Appointment Setting ----
  P("as", 1, "Starter", "$1,699", "", "", false, ["1 Dedicated Appointment Setter", "Prospect research and list building", "Outbound calling and outreach", "Lead qualification", "Appointment scheduling", "Follow-up with prospects"]),
  P("as", 2, "Growth", "$2,999", "$3,400", "Most Popular", true, ["2 Dedicated Appointment Setters", "Everything in Starter", "Greater prospecting capacity", "Consistent follow-up coverage"]),
  P("as", 3, "Scale", "$5,799", "$6,800", "Best Value", false, ["4 Dedicated Appointment Setters", "Everything in Growth", "Expanded prospecting capacity", "Structured follow-up processes"])
];
