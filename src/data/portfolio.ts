// Lightweight notification feed shared by the TopBar in the AOK Admin Portal.

export type NotificationKind =
  | "enquiry"
  | "inventory"
  | "booking"
  | "system"
  | "audit";

export interface NotificationItem {
  id: string;
  type: NotificationKind;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  refId?: string; // enquiry or event reference
}

export const notifications: NotificationItem[] = [
  { id: "n1", type: "enquiry", title: "New enquiry assigned", body: "ENQ-2041 (Northwind Live) routed to you.", time: "3m ago", unread: true, refId: "ENQ-2041" },
  { id: "n2", type: "inventory", title: "Capacity alert", body: "Aurora Gala — 92% booked, 4 days to deadline.", time: "22m ago", unread: true, refId: "EVT-118" },
  { id: "n3", type: "booking", title: "Waitlist surged", body: "Chelsea vs Arsenal: 24 new waitlist requests.", time: "1h ago", unread: true, refId: "EVT-101" },
  { id: "n4", type: "system", title: "Tenant added", body: "Helix Conferences provisioned by S. Patel.", time: "2h ago", unread: false },
  { id: "n5", type: "audit", title: "Event unpublished", body: "Spring Summit hidden by M. Rivera.", time: "Yesterday", unread: false, refId: "EVT-203" },
  { id: "n6", type: "enquiry", title: "Proposal accepted", body: "ENQ-2033 (Atlas Bank) confirmed.", time: "Yesterday", unread: false, refId: "ENQ-2033" },
];
