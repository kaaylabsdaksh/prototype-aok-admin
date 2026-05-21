import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/admin/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { tenants, userGroups, team } from "@/data/admin-tenants";
import { Plus, Building2, Users, ShieldCheck, Palette } from "lucide-react";
import type { NotificationItem } from "@/data/portfolio";

export default function Settings() {
  const noop = (_n: NotificationItem) => {};
  return (
    <AppShell onOpenNotification={noop}>
      <PageHeader title="Settings" subtitle="Tenants, user groups, team, audit and branding." />

      <Tabs defaultValue="tenants">
        <TabsList>
          <TabsTrigger value="tenants" className="gap-1.5"><Building2 className="h-4 w-4" />Tenants</TabsTrigger>
          <TabsTrigger value="groups" className="gap-1.5"><Users className="h-4 w-4" />User groups</TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5"><ShieldCheck className="h-4 w-4" />Team</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
          <TabsTrigger value="branding" className="gap-1.5"><Palette className="h-4 w-4" />Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="mt-4">
          <SectionCard title="Tenants" action={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Add tenant</Button>}>
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr><Th>Name</Th><Th>Plan</Th><Th>Contact</Th><Th className="text-right">Users</Th><Th>Status</Th></tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id} className="border-t border-border/60">
                    <Td className="font-medium">{t.name}</Td>
                    <Td>{t.plan}</Td>
                    <Td className="text-muted-foreground">{t.contact}</Td>
                    <Td className="text-right tabular-nums">{t.users}</Td>
                    <Td><span className={`text-xs capitalize ${t.status === "active" ? "text-success" : "text-destructive"}`}>{t.status}</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
        </TabsContent>

        <TabsContent value="groups" className="mt-4">
          <SectionCard title="User groups" action={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Create group</Button>}>
            <ul className="divide-y divide-border/60">
              {userGroups.map((g) => (
                <li key={g.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{g.name}</p>
                    <p className="text-[11px] capitalize text-muted-foreground">{g.kind} · {g.members} members</p>
                  </div>
                  <Button size="sm" variant="ghost">Manage</Button>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <SectionCard title="AOK team" action={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Invite</Button>}>
            <ul className="divide-y divide-border/60">
              {team.map((m) => (
                <li key={m.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">{m.initials}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-[11px] text-muted-foreground">{m.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{m.role}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <SectionCard title="Audit preferences">
            <div className="space-y-3">
              <Toggle label="Track inventory edits" defaultChecked />
              <Toggle label="Track enquiry status changes" defaultChecked />
              <Toggle label="Track visibility & tenant changes" defaultChecked />
              <Toggle label="Daily audit digest email" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Field label="Retention (days)" defaultValue="365" />
                <Field label="Export schedule" defaultValue="Weekly" />
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="branding" className="mt-4">
          <SectionCard title="Portal branding">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Portal name" defaultValue="AOK Admin" />
              <Field label="Support email" defaultValue="ops@aok.events" />
              <Field label="Primary color" defaultValue="#c4377f" />
              <Field label="Logo URL" defaultValue="/aok-logo.png" />
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card">
      <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </header>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}
function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2 text-left font-medium ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm">
      <span>{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </label>
  );
}
function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Input defaultValue={defaultValue} />
    </div>
  );
}
