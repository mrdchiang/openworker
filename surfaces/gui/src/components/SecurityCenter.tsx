import { useEffect, useState } from "react";
import { getAudit, getDemoIdentity, getHealth, setDemoIdentity, updateVisionPolicy, type AuditEvent, type DemoIdentity } from "../api";
import { Icon } from "./Icon";

const controls = [
  ["Tool approvals", "Active", "Every demo MCP call requires an explicit approval."],
  ["Curated catalog", "Preview", "MACOM catalog entries are separated from custom servers."],
  ["Audit trail", "Active", "Tool activity is recorded locally with sanitized arguments."],
  ["Okta identity", "Config only", "Issuer and client ID are stored; sign-in is not enforced yet."],
  ["Signed updates", "Blocked", "Upstream updates are disabled until MACOM signs a manifest."],
];

export function SecurityCenter({ onOpenAudit }: { onOpenAudit: () => void }) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [identity, setIdentity] = useState<DemoIdentity | null>(null);
  const [policyMessage, setPolicyMessage] = useState("");
  const [health, setHealth] = useState<{ model: string; status: string } | null>(null);
  useEffect(() => { getAudit({ limit: 5 }).then(setEvents).catch(() => {}); getDemoIdentity().then(setIdentity).catch(() => {}); getHealth().then(setHealth).catch(() => {}); }, []);
  return <main className="flex-1 min-w-0 overflow-y-auto bg-paper hairline-scroll"><div className="max-w-4xl mx-auto px-7 py-6">
    <div className="mb-6"><h2 className="text-[20px] font-semibold tracking-tight flex items-center gap-2"><Icon name="shield" size={19} /> Security Center</h2><p className="text-[13px] text-muted mt-1">Vision Beta control posture for the local pitch environment.</p></div>
    <div className="vision-notice mb-5"><strong>Prototype posture</strong><p>Controls are visible and approval-gated where implemented. Okta enforcement, signed installers, and server-side catalog policy remain pilot prerequisites.</p></div>
    <div className="rounded-xl2 border border-line bg-panel p-4 mb-5"><div className="flex items-center justify-between gap-3"><div><strong className="text-[13px]">Demo identity</strong><p className="text-[12px] text-muted mt-1">Local preview only · Okta is not connected · Role: <b>{identity?.role || "loading"}</b></p></div><select className="vision-input" value={identity?.email || ""} onChange={e => setDemoIdentity(e.target.value).then(setIdentity)}><option value="alex.chen@macom-demo.local">Alex Chen · User</option><option value="priya.shah@macom-demo.local">Priya Shah · Developer</option><option value="sam.rivera@macom-demo.local">Sam Rivera · Security</option><option value="morgan.lee@macom-demo.local">Morgan Lee · Administrator</option></select></div></div>
    <div className="grid gap-3 sm:grid-cols-2">{controls.map(([name,status,detail]) => <div key={name} className="rounded-xl2 border border-line bg-panel p-4"><div className="flex justify-between gap-3"><strong className="text-[13px]">{name}</strong><span className="text-[11px] text-accent">{status}</span></div><p className="text-[12px] text-muted mt-2">{detail}</p></div>)}</div>
    <div className="rounded-xl2 border border-line bg-panel p-4 mt-5"><strong className="text-[13px]">Standard user readiness</strong><div className="grid gap-2 sm:grid-cols-3 mt-3">{[["Elevation", "No elevation required"], ["Workspace", "User-writable workspace"], ["Model runtime", health ? `${health.status} · ${health.model}` : "Checking local sidecar…"]].map(([n,v]) => <div key={n} className="border-t border-line pt-2"><div className="text-[11px] text-muted">{n}</div><div className="text-[12px] text-ink mt-1">{v}</div></div>)}</div><p className="text-[11px] text-muted mt-3">Enterprise connectors, drivers, and machine-wide installs may still require IT provisioning.</p></div>
    <div className="rounded-xl2 border border-line bg-panel p-4 mt-5"><div className="flex items-center justify-between mb-3"><strong className="text-[13px]">Administrator policy test</strong><button className="vision-secondary" onClick={() => updateVisionPolicy().then(() => setPolicyMessage("Policy accepted for the Administrator role.")).catch(e => setPolicyMessage(e.message))}>Test policy update</button></div>{policyMessage && <p className="text-[12px] text-muted mb-2">{policyMessage}</p>}<p className="text-[12px] text-muted">This action is intentionally backend-gated and demonstrates the User/Developer denial path.</p></div>
    <div className="rounded-xl2 border border-line bg-panel p-4 mt-5"><div className="flex items-center justify-between mb-3"><strong className="text-[13px]">Recent security activity</strong><button className="vision-secondary" onClick={onOpenAudit}>Open full audit log</button></div>{events.length ? events.map(e => <div key={e.id} className="text-[12px] text-muted py-1.5 border-t border-line"><span className="font-mono text-ink">{e.tool}</span> · {e.status || e.stage || "event"} · {e.approval || "recorded"}</div>) : <p className="text-[12px] text-muted">No tool activity recorded yet.</p>}</div>
  </div></main>;
}
