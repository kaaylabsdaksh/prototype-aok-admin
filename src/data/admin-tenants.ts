export interface Tenant {
  id: string;
  name: string;
  plan: "Enterprise" | "Growth" | "Pilot";
  status: "active" | "suspended";
  contact: string;
  users: number;
}

export interface UserGroup {
  id: string;
  name: string;
  kind: "vip" | "executive" | "department";
  members: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Operations" | "Account Manager" | "Viewer";
  initials: string;
}

export const tenants: Tenant[] = [
  { id: "t1", name: "Atlas Bank", plan: "Enterprise", status: "active", contact: "Elena Rossi", users: 412 },
  { id: "t2", name: "Northwind Live", plan: "Enterprise", status: "active", contact: "Marcus Chen", users: 188 },
  { id: "t3", name: "Helix Conferences", plan: "Growth", status: "active", contact: "Priya Raman", users: 64 },
  { id: "t4", name: "Lumen Capital", plan: "Enterprise", status: "active", contact: "Tom Beckett", users: 233 },
  { id: "t5", name: "Quill Media", plan: "Pilot", status: "suspended", contact: "Amelia Hart", users: 12 },
];

export const userGroups: UserGroup[] = [
  { id: "g1", name: "Board & C-Suite (VIP)", kind: "vip", members: 18 },
  { id: "g2", name: "Atlas Bank — Executives", kind: "executive", members: 42 },
  { id: "g3", name: "Northwind — Sales", kind: "department", members: 86 },
  { id: "g4", name: "Helix — Marketing", kind: "department", members: 27 },
  { id: "g5", name: "Lumen — Partners (VIP)", kind: "vip", members: 9 },
];

export const team: TeamMember[] = [
  { id: "u1", name: "Sofia Patel", email: "sofia@aok.events", role: "Admin", initials: "SP" },
  { id: "u2", name: "Marco Rivera", email: "marco@aok.events", role: "Operations", initials: "MR" },
  { id: "u3", name: "Yuki Tanaka", email: "yuki@aok.events", role: "Account Manager", initials: "YT" },
  { id: "u4", name: "Hugo Bernard", email: "hugo@aok.events", role: "Account Manager", initials: "HB" },
  { id: "u5", name: "Nadia Okafor", email: "nadia@aok.events", role: "Viewer", initials: "NO" },
];
