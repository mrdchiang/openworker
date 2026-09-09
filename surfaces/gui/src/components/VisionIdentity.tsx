import { useEffect, useState } from "react";
import { visionRequest, type VisionIdentity as Config } from "../api";

const fields: [keyof Config, string, string][] = [
  ["issuer", "Okta issuer URL", "https://your-tenant.okta.com/oauth2/default"],
  ["client_id", "Application client ID", "Enter the ID from your Okta application"],
  ["redirect_uri", "Proposed redirect URI", "http://127.0.0.1:8765/oidc/callback"],
  ["groups_claim", "Groups claim", "groups"],
  ["employee_group", "Employee group", "vision-users"],
  ["administrator_group", "Administrator group", "vision-admins"],
  ["developer_group", "Developer group", "vision-developers"],
];

export function VisionIdentity() {
  const [config, setConfig] = useState<Config | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () => {
    setError("");
    visionRequest<{ config: Config }>("identity").then(r => setConfig(r.config)).catch(e => setError(e.message));
  };
  useEffect(load, []);
  return <section className="vision-identity">
    <div className="vision-eyebrow">ADMINISTRATION / IDENTITY</div>
    <h2>Connect your organization</h2>
    <p className="vision-lede">Prepare Okta OpenID Connect settings for Vision.</p>
    <div className="vision-notice"><strong>Configuration preview · Sign-in inactive</strong>
      <p>Settings are saved on this device. Authentication, callback handling, and group-based access are not implemented yet. These settings do not restrict access.</p>
    </div>
    {error && <div role="alert" className="vision-error">{error} {!config && <button onClick={load}>Retry</button>}</div>}
    {!config ? <p>Loading identity settings…</p> : <form onSubmit={async e => {
      e.preventDefault(); setBusy(true); setError(""); setMessage("");
      try {
        const result = await visionRequest<{ config: Config }>("identity", config, "PUT");
        setConfig(result.config); setMessage("Configuration saved. Sign-in remains inactive.");
      } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
    }}>
      <div className="vision-section-title">Application registration</div>
      <p className="vision-help">Planned flow: Authorization Code with PKCE for a public desktop client. No client secret is collected. The redirect below is a proposal, not an active endpoint.</p>
      <fieldset disabled={busy} className="vision-fields">
        {fields.map(([key, label, placeholder], index) => <label key={key}>
          {index === 3 && <div className="vision-section-title">Proposed group mappings</div>}
          <span>{label}</span>
          <input type={key === "issuer" || key === "redirect_uri" ? "url" : "text"} value={config[key]} placeholder={placeholder}
            maxLength={key === "issuer" || key === "redirect_uri" ? 512 : 128}
            required={key !== "issuer" && key !== "client_id"}
            onChange={e => { setConfig({ ...config, [key]: e.target.value }); setMessage(""); }} />
        </label>)}
      </fieldset>
      <div className="vision-notice subtle"><strong>Scopes</strong><p>openid · profile · email · groups</p>
        <p>Group mappings describe the intended employee, administrator, and developer roles. They are not enforced by this prototype.</p></div>
      <button className="vision-primary" disabled={busy} type="submit">{busy ? "Saving…" : "Save configuration"}</button>
      {message && <p role="status" className="vision-success">{message}</p>}
    </form>}
  </section>;
}
