import { useEffect, useState } from "react";
import { getMcpTools, visionRequest, type VisionRecord } from "../api";
import { MacomLogo } from "./VisionBrand";

const entries = [
  { name: "Jira", mark: "J", category: "Work management", description: "Bring issue context, blockers, and project progress into your work.", capabilities: ["Search issues", "Read issue details", "Summarize project status"], setup: "An approved Jira connection and organization authorization. Drafting tickets does not submit them.", color: "#1868db" },
  { name: "Microsoft 365", mark: "M", category: "Knowledge", description: "Find the documents and project context your team works with.", capabilities: ["Search SharePoint and OneDrive", "Retrieve documents", "Summarize source material"], setup: "An approved Microsoft tenant application and scoped document access. Outlook and Teams are future additions.", color: "#a33b16" },
  { name: "Engineering knowledge", mark: "EK", category: "Engineering", description: "Compare datasheet revisions and retrieve engineering references.", capabilities: ["Search references", "Read datasheets", "Compare revisions with citations"], setup: "A reviewed document collection and an approved search service.", color: "#005a84" },
  { name: "GitHub", mark: "GH", category: "Engineering", description: "Understand repository activity, pull requests, and engineering changes.", capabilities: ["Read repository content", "Inspect pull requests", "Summarize changes"], setup: "An approved GitHub connection with access restricted to selected repositories.", color: "#334155" },
  { name: "Internal inventory", mark: "IN", category: "Operations", description: "Look up lab assets, ownership, and calibration records.", capabilities: ["Find assets", "Read calibration status", "Link assets to open issues"], setup: "An approved internal inventory endpoint and read permissions.", color: "#427444" },
];
type Demo = { installed: boolean; notice: string; records: VisionRecord[] };

export function VisionCatalog({ onAdministration }: { onAdministration: () => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All tools");
  const [selected, setSelected] = useState<string | null>(null);
  const [demo, setDemo] = useState<Demo | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tested, setTested] = useState(false);
  const [message, setMessage] = useState("");
  const load = async () => { setError(""); try { setDemo(await visionRequest<Demo>("demo")); } catch(e) { setError((e as Error).message); } };
  useEffect(() => { void load(); }, []);
  const current = entries.find(e => e.name === selected);
  const filtered = entries.filter(e => (category === "All tools" || category === e.category) && `${e.name} ${e.description} ${e.capabilities.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="vision-catalog">
    <header className="vision-catalog-hero">
      <div className="vision-eyebrow">VISION BETA / MACOM</div>
      <MacomLogo />
      <h1>Your tools. One workspace.</h1>
      <p>Discover the integrations selected for the MACOM pilot. Bring the right context to any model you choose.</p>
      <div className="vision-hero-tags"><span>Curated catalog</span><span>Visible tool activity</span><span>Model choice</span></div>
    </header>
    <div className="vision-catalog-toolbar"><div><h2>Tool Catalog</h2><p className="vision-help">Five proposed integrations · Fictional data for this pitch</p></div>
      <button className="vision-secondary" onClick={onAdministration}>Connection administration</button></div>
    <div className="vision-notice subtle"><strong>Pilot catalog preview</strong><p>These are proposed MACOM integrations, not an assertion of company approval. Live systems are not connected by this catalog. Administrator roles and catalog restrictions are not yet enforced.</p></div>
    <div className="vision-search"><input aria-label="Search tool catalog" placeholder="Search tools or capabilities…" value={query} onChange={e => setQuery(e.target.value)} />
      <select aria-label="Filter catalog category" value={category} onChange={e => setCategory(e.target.value)}>{["All tools", "Work management", "Knowledge", "Engineering", "Operations"].map(c => <option key={c}>{c}</option>)}</select></div>
    <div className="vision-catalog-grid">{filtered.map(e => <button key={e.name} className={"vision-tool-card" + (selected === e.name ? " selected" : "")} onClick={() => setSelected(e.name)} aria-pressed={selected === e.name}>
      <div className="vision-card-top"><span className="vision-tool-mark" style={{ background: e.color }}>{e.mark}</span><span className="vision-status">Setup required</span></div>
      <h3>{e.name}</h3><p>{e.description}</p><div className="vision-card-footer"><span>{e.category}</span><span>View capabilities →</span></div>
    </button>)}</div>
    {filtered.length === 0 && <p role="status" className="vision-empty">No tools match your search. Try a different name or category.</p>}
    {current && <section className="vision-tool-detail" aria-label={`${current.name} capabilities`}>
      <div className="vision-catalog-toolbar"><h2>{current.name}</h2><button className="vision-secondary" onClick={() => setSelected(null)}>Close details</button></div>
      <div className="vision-detail-columns"><div><h3>Proposed capabilities</h3><ul>{current.capabilities.map(c => <li key={c}>{c}</li>)}</ul></div><div><h3>Access and setup</h3><p>{current.setup}</p><p>Read access for the first pilot. Source-system permissions still apply. No live connection is created here.</p></div></div>
      <h3>Fictional sample records</h3>{demo?.records.filter(r => r.source === current.name).map(r => <details key={r.id}><summary>{r.id} · {r.title}</summary><p>{r.body}</p></details>)}
    </section>}
    <section className="vision-demo-card">
      <div className="vision-eyebrow">WORKING LOCAL MCP DEMO</div><h2>Meet Project Aurora</h2>
      <p>A fictional engineering project connects issues, documents, datasheet revisions, a pull request, and a lab asset. Search and retrieve seven sample records through two read-only MCP tools.</p>
      <div className="vision-hero-tags"><span>Fictional data only</span><span>No external account</span><span>Read-only tools</span></div>
      <div className="vision-demo-actions"><button className="vision-primary" disabled={busy || !demo} onClick={async () => {
        setBusy(true); setError(""); setMessage(""); setTested(false);
        try {
          await visionRequest("demo/install", {});
          await load();
          const result = await getMcpTools("vision-demo");
          if (!result.ok) throw new Error(result.error || "MCP connection test failed");
          setTested(true); setMessage(`Connection verified: ${result.tools.length} tools available. Start a new chat to use the demo; tool calls follow the harness approval settings.`);
        } catch(e) { setError((e as Error).message); } finally { setBusy(false); }
      }}>{busy ? "Connecting…" : demo?.installed ? "Test demo connection" : "Enable demo tools"}</button>
        <span className="vision-help">{tested ? "Connection verified this visit" : demo?.installed ? "Demo configured · Test to verify" : "Demo not enabled"}</span></div>
      <div className="vision-demo-prompt"><strong>Try in a new chat</strong><p>Use the Vision demo tools to prepare an Aurora readiness brief. Identify the blocker, next review date, and supporting record IDs. Clearly label the report as fictional demo data.</p></div>
      {message && <p role="status" className="vision-success">{message}</p>}
    </section>
    {error && <div className="vision-error" role="alert">{error} <button className="vision-secondary" onClick={() => void load()}>Reload catalog data</button></div>}
  </section>;
}
