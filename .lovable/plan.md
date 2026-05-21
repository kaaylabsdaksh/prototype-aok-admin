# AOK Admin Portal — Build Plan

Rebuild this project as a standalone **AOK Admin Portal** focused on operational inventory and enquiry management. Current project has CEM-style dashboard/approvals/guest-list pages — most of that gets removed.

## Scope

Exactly six modules, nothing else:

1. Dashboard
2. Inventory Management
3. Enquiry Management
4. Reports
5. Notifications
6. Settings

Sidebar contains only these six items (plus footer: Support, Log out).

## Files to remove

- `src/pages/IndexV2.tsx`, `src/pages/Approvals.tsx`
- `src/components/DesignToggle.tsx` (no Classic/Soft toggle in production portal)
- `src/components/ApprovalsView.tsx`, `EventCard.tsx`, `EventTable.tsx`, `EventDrawer.tsx`, `GuestList.tsx`, `GuestFormDialog.tsx`, `WaitlistDialog.tsx`, `CircularUtilisation.tsx`, `SegmentedBar.tsx`, `TickBar.tsx`, `NavLink.tsx`
- `src/data/guests.ts`, `src/data/approvals.ts`
- Old content of `src/pages/Index.tsx`, `Enquiries.tsx`, `Reports.tsx` — rewritten for admin persona

Keep: `Login.tsx`, `NotFound.tsx`, all `components/ui/*`, `TopBar`, `AppShell`, `AppSidebar` (items rewritten), `AuditTrail`, `StatCard`.

## Files to add

### Pages (`src/pages/`)
- `Dashboard.tsx` — KPI strip, today's events, enquiry queue snapshot, recent activity, system alerts
- `Inventory.tsx` — summary cards + filters + dense events table + detail drawer
- `Enquiries.tsx` — queue metrics + filters + queue table + detail drawer (notes/assignment/status)
- `Reports.tsx` — utilisation, enquiry funnel, response times, tenant breakdown
- `Notifications.tsx` — full notification center with filters and read/unread state
- `Settings.tsx` — tenants, user groups, team members, audit preferences, branding

### Components (`src/components/admin/`)
- `InventoryTable.tsx` — sticky-header dense table, sort, pagination, row selection
- `InventoryFilters.tsx` — event type, venue, date range, publish status, tenant visibility, booking status
- `EventDetailDrawer.tsx` — details, tenant rules, booking analytics, waitlist, audit, guest counts
- `CreateEventDrawer.tsx` — multi-step (details → imagery → visibility → review) with drag-drop image upload
- `EnquiryQueueTable.tsx`, `EnquiryFilters.tsx`, `EnquiryDetailDrawer.tsx`
- `StatusPipeline.tsx` — Received → In Progress → Proposal Sent → Confirmed/Declined inline updater
- `NotesPanel.tsx` — tabbed internal vs client-facing, visually distinct
- `AssignmentPicker.tsx`, `VisibilitySelector.tsx` (tenants + VIP/Executive/Department groups)
- `KpiStrip.tsx` — denser StatCard variant
- `ImageUploader.tsx` — multi-image drag-drop with cover selection (mock)

### Data (`src/data/`)
- `admin-inventory.ts`, `admin-enquiries.ts`, `admin-tenants.ts`
- Rework `portfolio.ts` notifications for admin events

## Design system

Reuse current tokens in `index.css` and `tailwind.config.ts` — rounded cards, soft shadows, Plus Jakarta Sans. Adjustments:

- Denser table rows, smaller meta text
- Semantic status tokens for the 5 enquiry statuses and 3 publish statuses
- `--surface-elevated` / `--surface-sunken` for layering
- Sidebar tightened to a single "Workspace" group
- TopBar rebranded "AOK Admin" with a cross-tenant filter (admin sees all tenants)

All colors via HSL tokens — nothing hardcoded in components.

## Routes (`App.tsx`)

```text
/              → Dashboard
/inventory     → Inventory
/enquiries     → Enquiries
/reports       → Reports
/notifications → Notifications
/settings      → Settings
/login         → Login
*              → NotFound
```

Remove `/v2`, `/approvals`, and the `<DesignToggle />`.

## Behavior (frontend-only, mock data)

- Filters update instantly via local state
- Drawers are shadcn `Sheet` from the right
- Status/assignment/notes mutate local mock state optimistically
- Bulk row selection on both tables with bulk actions (publish/unpublish/cancel, reassign, status change)
- "Notifications sent" actions surface as Sonner toasts since there's no backend yet

No Lovable Cloud in this pass — this is the UI shell. Wiring real data, auth, audit persistence, and cross-portal SSO is a follow-up.

## Out of scope (this pass)

- Real auth/role enforcement
- Real email or in-app notification delivery
- Persistent audit trail
- SSO with CEM / Requester / RSVP portals

## Deliverable

A clean six-page admin portal that compiles, navigates, and demonstrates every workflow described — ready to wire to Lovable Cloud next.
