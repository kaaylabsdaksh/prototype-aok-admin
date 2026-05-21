export type PublishStatus = "draft" | "published" | "cancelled";
export type VisibilityScope = "all" | "tenant" | "vip";
export type BookingStatus = "available" | "filling" | "almost_full" | "full" | "waitlist";

export interface AdminEvent {
  id: string;
  ref: string;
  name: string;
  venue: string;
  city: string;
  date: string; // ISO
  type: "Premier League" | "BBC Proms" | "Classical Concert" | "Conference" | "Workshop" | "Networking" | "Webinar" | "Gala";
  capacity: number;
  booked: number;
  waitlist: number;
  visibility: VisibilityScope;
  tenants: string[]; // tenant ids
  groups: string[]; // user group ids
  publish: PublishStatus;
  description: string;
  dressCode: string;
  bookingDeadline: string;
  images: number;
  audit: { at: string; actor: string; action: string }[];
}

const today = new Date();
const iso = (offsetDays: number, hour = 18) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const adminEvents: AdminEvent[] = [
  {
    id: "EVT-101", ref: "EVT-101",
    name: "Chelsea vs Arsenal — Hospitality Suite",
    venue: "Stamford Bridge", city: "London",
    date: iso(4, 15), type: "Premier League",
    capacity: 320, booked: 286, waitlist: 24,
    visibility: "tenant", tenants: ["t1", "t2", "t4"], groups: ["g2"],
    publish: "published",
    description: "Premium matchday hospitality with pre-match dining and padded seating.",
    dressCode: "Smart casual", bookingDeadline: iso(1, 17), images: 4,
    audit: [
      { at: iso(-12), actor: "Sofia Patel", action: "Event created" },
      { at: iso(-10), actor: "Marco Rivera", action: "Published" },
      { at: iso(-2), actor: "Yuki Tanaka", action: "Capacity raised 280 → 320" },
    ],
  },
  {
    id: "EVT-102", ref: "EVT-102",
    name: "Arsenal vs Tottenham — Diamond Club",
    venue: "Emirates Stadium", city: "London",
    date: iso(9, 17), type: "Premier League",
    capacity: 500, booked: 500, waitlist: 87,
    visibility: "tenant", tenants: ["t1", "t2", "t3", "t4"], groups: [],
    publish: "published",
    description: "Iconic North London Derby with full Diamond Club hospitality.",
    dressCode: "Smart casual", bookingDeadline: iso(7, 17), images: 6,
    audit: [{ at: iso(-20), actor: "Sofia Patel", action: "Event created" }],
  },
  {
    id: "EVT-103", ref: "EVT-103",
    name: "Last Night of the Proms",
    venue: "Royal Albert Hall", city: "London",
    date: iso(20, 19), type: "BBC Proms",
    capacity: 220, booked: 198, waitlist: 12,
    visibility: "vip", tenants: ["t1", "t4"], groups: ["g1", "g5"],
    publish: "published",
    description: "Grand Tier box experience with private interval refreshments.",
    dressCode: "Formal / black tie optional", bookingDeadline: iso(17, 17), images: 5,
    audit: [{ at: iso(-30), actor: "Sofia Patel", action: "Event created" }],
  },
  {
    id: "EVT-104", ref: "EVT-104",
    name: "Aurora Investor Gala",
    venue: "The Savoy", city: "London",
    date: iso(45, 19), type: "Gala",
    capacity: 220, booked: 0, waitlist: 0,
    visibility: "vip", tenants: ["t4"], groups: ["g1", "g5"],
    publish: "draft",
    description: "Black-tie investor gala with entertainment and silent auction.",
    dressCode: "Black tie", bookingDeadline: iso(40, 17), images: 2,
    audit: [{ at: iso(-1), actor: "Marco Rivera", action: "Draft saved" }],
  },
  {
    id: "EVT-105", ref: "EVT-105",
    name: "AI in Finance Summit",
    venue: "ExCeL", city: "London",
    date: iso(11, 9), type: "Conference",
    capacity: 800, booked: 612, waitlist: 0,
    visibility: "all", tenants: [], groups: [],
    publish: "published",
    description: "Full-day conference on AI applications in capital markets.",
    dressCode: "Business attire", bookingDeadline: iso(9, 17), images: 3,
    audit: [{ at: iso(-25), actor: "Yuki Tanaka", action: "Published" }],
  },
  {
    id: "EVT-106", ref: "EVT-106",
    name: "Founders Networking Night",
    venue: "Rooftop 22", city: "Lisbon",
    date: iso(15, 19), type: "Networking",
    capacity: 80, booked: 26, waitlist: 0,
    visibility: "tenant", tenants: ["t3", "t5"], groups: ["g3", "g4"],
    publish: "published",
    description: "Curated founders mixer with rooftop drinks and canapés.",
    dressCode: "Business casual", bookingDeadline: iso(12, 17), images: 2,
    audit: [{ at: iso(-7), actor: "Hugo Bernard", action: "Published" }],
  },
  {
    id: "EVT-107", ref: "EVT-107",
    name: "Design Thinking Workshop",
    venue: "Loft Studio", city: "Berlin",
    date: iso(28, 9), type: "Workshop",
    capacity: 35, booked: 8, waitlist: 0,
    visibility: "tenant", tenants: ["t2"], groups: ["g3"],
    publish: "published",
    description: "Hands-on facilitated workshop with materials and lunch.",
    dressCode: "Smart casual", bookingDeadline: iso(25, 17), images: 1,
    audit: [{ at: iso(-3), actor: "Yuki Tanaka", action: "Created" }],
  },
  {
    id: "EVT-108", ref: "EVT-108",
    name: "Product Launch Webinar",
    venue: "Online", city: "Virtual",
    date: iso(6, 16), type: "Webinar",
    capacity: 2000, booked: 1342, waitlist: 0,
    visibility: "all", tenants: [], groups: [],
    publish: "published",
    description: "Live product launch with interactive Q&A.",
    dressCode: "—", bookingDeadline: iso(6, 14), images: 1,
    audit: [{ at: iso(-14), actor: "Sofia Patel", action: "Published" }],
  },
  {
    id: "EVT-109", ref: "EVT-109",
    name: "Cancelled — Spring Classical",
    venue: "Barbican Hall", city: "London",
    date: iso(38, 19), type: "Classical Concert",
    capacity: 250, booked: 0, waitlist: 0,
    visibility: "all", tenants: [], groups: [],
    publish: "cancelled",
    description: "Cancelled due to venue maintenance.",
    dressCode: "Cocktail", bookingDeadline: iso(35, 17), images: 0,
    audit: [
      { at: iso(-40), actor: "Sofia Patel", action: "Created" },
      { at: iso(-2), actor: "Marco Rivera", action: "Cancelled" },
    ],
  },
  {
    id: "EVT-110", ref: "EVT-110",
    name: "Atlas Bank Strategy Offsite",
    venue: "Cliveden House", city: "Berkshire",
    date: iso(33, 9), type: "Conference",
    capacity: 120, booked: 0, waitlist: 0,
    visibility: "vip", tenants: ["t1"], groups: ["g1", "g2"],
    publish: "draft",
    description: "Two-day senior leadership offsite.",
    dressCode: "Smart business", bookingDeadline: iso(30, 17), images: 3,
    audit: [{ at: iso(-1), actor: "Hugo Bernard", action: "Draft saved" }],
  },
  {
    id: "EVT-111", ref: "EVT-111",
    name: "Helix Marketing Awards",
    venue: "The Ned", city: "London",
    date: iso(50, 19), type: "Gala",
    capacity: 180, booked: 64, waitlist: 0,
    visibility: "tenant", tenants: ["t3"], groups: ["g4"],
    publish: "published",
    description: "Annual marketing awards ceremony and dinner.",
    dressCode: "Black tie", bookingDeadline: iso(45, 17), images: 5,
    audit: [{ at: iso(-10), actor: "Yuki Tanaka", action: "Published" }],
  },
  {
    id: "EVT-112", ref: "EVT-112",
    name: "Manchester United vs Arsenal — Evolution Suite",
    venue: "Old Trafford", city: "Manchester",
    date: iso(18, 15), type: "Premier League",
    capacity: 1000, booked: 720, waitlist: 0,
    visibility: "tenant", tenants: ["t1", "t2", "t4"], groups: [],
    publish: "published",
    description: "1000-seat hospitality suite with full pre-match dining.",
    dressCode: "Smart casual", bookingDeadline: iso(15, 17), images: 4,
    audit: [{ at: iso(-22), actor: "Sofia Patel", action: "Published" }],
  },
];

export const venues = Array.from(new Set(adminEvents.map((e) => e.venue)));
export const eventTypes = Array.from(new Set(adminEvents.map((e) => e.type)));

export const utilisation = (e: AdminEvent) =>
  e.capacity ? Math.round((e.booked / e.capacity) * 100) : 0;

export const availableSeats = (e: AdminEvent) => Math.max(0, e.capacity - e.booked);

export function bookingState(e: AdminEvent): BookingStatus {
  if (e.booked >= e.capacity) return e.waitlist > 0 ? "waitlist" : "full";
  const pct = utilisation(e);
  if (pct >= 90) return "almost_full";
  if (pct >= 40) return "filling";
  return "available";
}
