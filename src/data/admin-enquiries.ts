export type EnquiryStatus =
  | "received"
  | "in_progress"
  | "proposal_sent"
  | "confirmed"
  | "declined";

export const ENQUIRY_STATUS_LABEL: Record<EnquiryStatus, string> = {
  received: "Received",
  in_progress: "In Progress",
  proposal_sent: "Proposal Sent",
  confirmed: "Confirmed",
  declined: "Declined",
};

export const ENQUIRY_PIPELINE: EnquiryStatus[] = [
  "received",
  "in_progress",
  "proposal_sent",
  "confirmed",
];

export type EnquiryType =
  | "Corporate Hospitality"
  | "Tickets"
  | "Private Dining"
  | "Bespoke Events"
  | "Venue Find"
  | "Entertainment";

export interface EnquiryNote {
  id: string;
  author: string;
  initials: string;
  at: string;
  body: string;
  scope: "internal" | "client";
}

export interface EnquiryTimelineEntry {
  at: string;
  status: EnquiryStatus;
  by: string;
  note?: string;
}

export interface AdminEnquiry {
  id: string;
  ref: string;
  tenantId: string;
  tenantName: string;
  contactName: string;
  contactEmail: string;
  eventType: EnquiryType;
  preferredDate: string;
  guests: number;
  budget: number;
  location: string;
  brief: string;
  submittedAt: string;
  assignedTo: string | null; // team member id
  status: EnquiryStatus;
  notes: EnquiryNote[];
  timeline: EnquiryTimelineEntry[];
}

const today = new Date();
const iso = (offsetDays: number, hour = 10) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const adminEnquiries: AdminEnquiry[] = [
  {
    id: "ENQ-2041", ref: "ENQ-2041",
    tenantId: "t2", tenantName: "Northwind Live",
    contactName: "Elena Rossi", contactEmail: "elena@northwind.live",
    eventType: "Corporate Hospitality",
    preferredDate: iso(42, 18), guests: 180, budget: 45000, location: "London",
    brief: "Annual partner summit; hybrid streaming required. Need premium hospitality venue with breakout rooms.",
    submittedAt: iso(-2, 11),
    assignedTo: "u3", status: "in_progress",
    notes: [
      { id: "n1", author: "Yuki Tanaka", initials: "YT", at: iso(-1, 14), body: "Aurora Hall available on both dates. Pulling catering quote.", scope: "internal" },
      { id: "n2", author: "Yuki Tanaka", initials: "YT", at: iso(-1, 15), body: "Reviewing venue options — expect a proposal Friday.", scope: "client" },
    ],
    timeline: [
      { at: iso(-2, 11), status: "received", by: "System" },
      { at: iso(-2, 14), status: "in_progress", by: "Sofia Patel", note: "Assigned to Yuki Tanaka." },
    ],
  },
  {
    id: "ENQ-2042", ref: "ENQ-2042",
    tenantId: "t1", tenantName: "Atlas Bank",
    contactName: "Hugo Bernard", contactEmail: "hugo@atlas.bank",
    eventType: "Private Dining",
    preferredDate: iso(60, 19), guests: 220, budget: 120000, location: "New York",
    brief: "Investor gala, black-tie.",
    submittedAt: iso(0, 10),
    assignedTo: null, status: "received",
    notes: [],
    timeline: [{ at: iso(0, 10), status: "received", by: "System" }],
  },
  {
    id: "ENQ-2043", ref: "ENQ-2043",
    tenantId: "t3", tenantName: "Helix Conferences",
    contactName: "Marcus Chen", contactEmail: "marcus@helix.co",
    eventType: "Bespoke Events",
    preferredDate: iso(20, 14), guests: 35, budget: 8000, location: "Berlin",
    brief: "Design thinking workshop, full-day with facilitator.",
    submittedAt: iso(-4, 9),
    assignedTo: "u4", status: "proposal_sent",
    notes: [
      { id: "n3", author: "Hugo Bernard", initials: "HB", at: iso(-1, 12), body: "Sent two venue + facilitator options.", scope: "internal" },
      { id: "n4", author: "Hugo Bernard", initials: "HB", at: iso(-1, 12), body: "Proposal sent — please review by Wednesday.", scope: "client" },
    ],
    timeline: [
      { at: iso(-4, 9), status: "received", by: "System" },
      { at: iso(-3, 10), status: "in_progress", by: "Sofia Patel" },
      { at: iso(-1, 12), status: "proposal_sent", by: "Hugo Bernard" },
    ],
  },
  {
    id: "ENQ-2044", ref: "ENQ-2044",
    tenantId: "t4", tenantName: "Lumen Capital",
    contactName: "Tom Beckett", contactEmail: "tom@lumen.cap",
    eventType: "Entertainment",
    preferredDate: iso(15, 19), guests: 80, budget: 12000, location: "Lisbon",
    brief: "Founders mixer, rooftop preferred.",
    submittedAt: iso(-20, 12),
    assignedTo: "u2", status: "confirmed",
    notes: [
      { id: "n5", author: "Marco Rivera", initials: "MR", at: iso(-3, 11), body: "Rooftop 22 confirmed. Deposit received.", scope: "internal" },
    ],
    timeline: [
      { at: iso(-20, 12), status: "received", by: "System" },
      { at: iso(-18, 9), status: "in_progress", by: "Sofia Patel" },
      { at: iso(-10, 15), status: "proposal_sent", by: "Marco Rivera" },
      { at: iso(-3, 11), status: "confirmed", by: "Marco Rivera" },
    ],
  },
  {
    id: "ENQ-2045", ref: "ENQ-2045",
    tenantId: "t5", tenantName: "Quill Media",
    contactName: "Amelia Hart", contactEmail: "amelia@quill.media",
    eventType: "Venue Find",
    preferredDate: iso(8, 16), guests: 500, budget: 4000, location: "Online",
    brief: "Product launch webinar.",
    submittedAt: iso(-30, 9),
    assignedTo: "u3", status: "declined",
    notes: [
      { id: "n6", author: "Yuki Tanaka", initials: "YT", at: iso(-25, 10), body: "Declined — budget too low for scope.", scope: "internal" },
    ],
    timeline: [
      { at: iso(-30, 9), status: "received", by: "System" },
      { at: iso(-28, 10), status: "in_progress", by: "Sofia Patel" },
      { at: iso(-26, 9), status: "proposal_sent", by: "Yuki Tanaka" },
      { at: iso(-25, 10), status: "declined", by: "Yuki Tanaka", note: "Pricing out of budget." },
    ],
  },
  {
    id: "ENQ-2046", ref: "ENQ-2046",
    tenantId: "t1", tenantName: "Atlas Bank",
    contactName: "Priya Raman", contactEmail: "priya@atlas.bank",
    eventType: "Tickets",
    preferredDate: iso(9, 17), guests: 12, budget: 18000, location: "London",
    brief: "Tickets for North London Derby — Diamond Club preferred.",
    submittedAt: iso(-1, 9),
    assignedTo: "u4", status: "in_progress",
    notes: [],
    timeline: [
      { at: iso(-1, 9), status: "received", by: "System" },
      { at: iso(0, 9), status: "in_progress", by: "Sofia Patel" },
    ],
  },
  {
    id: "ENQ-2047", ref: "ENQ-2047",
    tenantId: "t3", tenantName: "Helix Conferences",
    contactName: "Nadia Okafor", contactEmail: "nadia@helix.co",
    eventType: "Corporate Hospitality",
    preferredDate: iso(50, 19), guests: 60, budget: 24000, location: "Manchester",
    brief: "Client thank-you evening, Premier League fixture preferred.",
    submittedAt: iso(-6, 14),
    assignedTo: "u3", status: "proposal_sent",
    notes: [
      { id: "n7", author: "Yuki Tanaka", initials: "YT", at: iso(-2, 10), body: "Old Trafford Evolution Suite quoted.", scope: "internal" },
    ],
    timeline: [
      { at: iso(-6, 14), status: "received", by: "System" },
      { at: iso(-5, 9), status: "in_progress", by: "Sofia Patel" },
      { at: iso(-2, 10), status: "proposal_sent", by: "Yuki Tanaka" },
    ],
  },
];
