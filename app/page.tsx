"use client";

import { FormEvent, useEffect, useState } from "react";

const AUTH_SESSION_KEY = "mcst-hosa-member-access-v1";
const PASSWORD_HASH =
  "9abe242e9d8ef9b21d55361c22bde044c9f69068c08ab2ae3008498cb275b994";

type Tab = "home" | "events" | "members" | "alumni" | "resources";

const tabs: { id: Tab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "events", label: "Events" },
  { id: "members", label: "Club Members" },
  { id: "alumni", label: "Alumni" },
  { id: "resources", label: "Resources" },
];

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(AUTH_SESSION_KEY) === "granted",
  );

  if (!isAuthenticated) {
    return <PasswordGate onUnlock={() => setIsAuthenticated(true)} />;
  }

  return <MemberSite />;
}

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsChecking(true);
    setError("");

    const passwordBytes = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest("SHA-256", passwordBytes);
    const submittedHash = Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    if (submittedHash === PASSWORD_HASH) {
      sessionStorage.setItem(AUTH_SESSION_KEY, "granted");
      onUnlock();
      return;
    }

    setError("That password is not correct. Please try again.");
    setPassword("");
    setIsChecking(false);
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="brand-mark" aria-hidden="true">H</span>
          <span><strong>MCST HOSA</strong><small>Future Health Professionals</small></span>
        </div>
        <p className="eyebrow">MEMBERS ONLY</p>
        <h1 id="login-title">Welcome back.</h1>
        <p className="login-copy">Enter the shared club password to access the MCST HOSA member site.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="member-password">Club password</label>
          <input
            id="member-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "password-error" : "session-note"}
          />
          {error && <p className="login-error" id="password-error" role="alert">{error}</p>}
          <button className="login-submit" type="submit" disabled={isChecking}>
            {isChecking ? "Checking…" : "Enter member site →"}
          </button>
        </form>
        <p className="session-note" id="session-note">You’ll stay signed in until this browser tab or window is closed.</p>
      </section>
      <div className="login-accent" aria-hidden="true"><span>+</span><div>⌁</div><span>+</span></div>
    </main>
  );
}

function MemberSite() {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const requestedTab = window.location.hash.slice(1) as Tab;
    return tabs.some((tab) => tab.id === requestedTab) ? requestedTab : "home";
  });
  const currentLabel = tabs.find((tab) => tab.id === activeTab)?.label ?? "Home";

  useEffect(() => {
    const syncTabFromUrl = () => {
      const requestedTab = window.location.hash.slice(1) as Tab;
      if (tabs.some((tab) => tab.id === requestedTab)) setActiveTab(requestedTab);
    };
    window.addEventListener("hashchange", syncTabFromUrl);
    return () => window.removeEventListener("hashchange", syncTabFromUrl);
  }, []);

  function selectTab(tab: Tab) {
    setActiveTab(tab);
    window.history.replaceState(null, "", `#${tab}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main>
      <header className="site-header">
        <button className="brand" onClick={() => selectTab("home")} aria-label="MCST HOSA home">
          <span className="brand-mark" aria-hidden="true">H</span>
          <span><strong>MCST HOSA</strong><small>Future Health Professionals</small></span>
        </button>
        <nav aria-label="Main navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => selectTab(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <button className="mobile-nav" aria-label={`Current page: ${currentLabel}`}>{currentLabel}</button>
      </header>

      {activeTab === "home" && <HomePanel onExplore={() => selectTab("resources")} />}
      {activeTab === "events" && <ComingSoon title="Events" copy="We’re preparing this year’s meeting, service, and competition calendar." />}
      {activeTab === "members" && <ComingSoon title="Club Members" copy="Our member and leadership directory is being thoughtfully assembled." />}
      {activeTab === "alumni" && <AlumniPanel />}
      {activeTab === "resources" && <ResourcesPanel />}

      <footer>
        <div className="footer-brand"><span className="brand-mark small">H</span><span><strong>MCST HOSA</strong><small>Morris County School of Technology</small></span></div>
        <p>Empowering the next generation of health professionals.</p>
        <p className="copyright">© {new Date().getFullYear()} MCST HOSA</p>
      </footer>
    </main>
  );
}

function HomePanel({ onExplore }: { onExplore: () => void }) {
  return <>
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Morris County School of Technology</p>
        <h1>Learn. Lead.<br /><em>Make an impact.</em></h1>
        <p className="hero-lede">A student-led community for future health professionals—building skills, serving others, and growing together.</p>
        <div className="hero-actions">
          <button className="primary" onClick={onExplore}>Explore resources <span>→</span></button>
          <a className="secondary" href="https://hosa.org" target="_blank" rel="noreferrer">Visit HOSA.org ↗</a>
        </div>
      </div>
      <div className="hero-art" aria-label="Abstract illustration representing healthcare, learning, and community">
        <div className="orb orb-one" /><div className="orb orb-two" />
        <div className="pulse-card"><span className="pulse-line">⌁</span><strong>Future<br />Health<br />Professionals</strong></div>
        <span className="plus plus-one">+</span><span className="plus plus-two">+</span>
      </div>
    </section>

    <section className="intro-grid">
      <div><p className="section-number">01 — WHO WE ARE</p><h2>More than a club.<br />A launchpad.</h2></div>
      <div className="intro-copy"><p>HOSA–Future Health Professionals is a global, student-led organization that empowers members to become leaders in the global health community through education, collaboration, and experience.</p><p>At MCST, we bring that mission to life with hands-on learning, competitive events, community service, and meaningful connections.</p></div>
    </section>

    <section className="missions">
      <article className="mission-card national"><span className="card-index">01</span><p className="card-kicker">HOSA MISSION</p><h3>Empower HOSA–Future Health Professionals to become leaders in the global health community through education, collaboration, and experience.</h3><a href="https://hosa.org/about/" target="_blank" rel="noreferrer">Learn about HOSA <span>↗</span></a></article>
      <article className="mission-card local"><span className="card-index">02</span><p className="card-kicker">OUR CHAPTER MISSION</p><h3>To inspire MCST students to explore health careers, develop leadership skills, serve our community, and support one another on the path to professional excellence.</h3><span className="local-tag">Denville, New Jersey</span></article>
    </section>

    <section className="pillars"><p className="section-number">WHAT DRIVES US</p><div className="pillar-grid"><div><span>01</span><h3>Knowledge</h3><p>Build real-world health science skills.</p></div><div><span>02</span><h3>Leadership</h3><p>Grow with confidence and purpose.</p></div><div><span>03</span><h3>Service</h3><p>Make a difference in our community.</p></div><div><span>04</span><h3>Connection</h3><p>Find mentors, teammates, and friends.</p></div></div></section>
  </>;
}

function ComingSoon({ title, copy }: { title: string; copy: string }) {
  return <section className="coming-page"><div className="coming-art"><span>+</span><div>⌁</div><span>+</span></div><p className="eyebrow">MCST HOSA</p><h1>{title}</h1><div className="status-chip"><i /> Under construction</div><p>{copy}<br />Check back soon for updates.</p></section>;
}

function AlumniPanel() {
  const [directory, setDirectory] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const callbackName = `mcstHosaAlumni_${Date.now()}`;
    const script = document.createElement("script");
    const callbacks = window as typeof window & Record<string, (response: GoogleSheetResponse) => void>;

    callbacks[callbackName] = (response) => {
      if (!active) return;
      if (response.status === "error" || !response.table) {
        setError(true);
      } else {
        const allHeaders = response.table.cols.map((column, index) => column.label?.trim() || `Column ${index + 1}`);
        const allRows = response.table.rows
          .map((row) => allHeaders.map((_, index) => {
            const cell = row.c[index];
            return cell?.f ?? (cell?.v == null ? "" : String(cell.v));
          }))
          .filter((row) => row.some(Boolean));
        const populatedColumns = allHeaders
          .map((_, index) => index)
          .filter((index) => allRows.some((row) => row[index]?.trim()));
        const headers = populatedColumns.map((index) => allHeaders[index]);
        const rows = allRows.map((row) => populatedColumns.map((index) => row[index]));
        setDirectory({ headers, rows });
      }
      script.remove();
      delete callbacks[callbackName];
    };

    script.src = `https://docs.google.com/spreadsheets/d/1QA51CrINL1XTkOrbYAnQBui0_c7AdjQxLwim8qlXzcs/gviz/tq?tqx=out:json;responseHandler:${callbackName}&headers=1`;
    script.async = true;
    script.onerror = () => { if (active) setError(true); };
    document.body.appendChild(script);

    return () => {
      active = false;
      script.remove();
      delete callbacks[callbackName];
    };
  }, []);

  return <section className="inner-page alumni-page">
    <div className="page-heading"><p className="eyebrow">STAY CONNECTED</p><h1>Our alumni network</h1><p>Connect with former MCST HOSA members, learn from their journeys, and keep our chapter community growing.</p></div>
    <div className="directory-wrap">
      {!directory && !error && <div className="directory-loading"><span /><p>Loading the latest alumni contacts…</p></div>}
      {error && <div className="directory-error"><strong>Directory temporarily unavailable</strong><p>The Google Sheet must be shared as “Anyone with the link — Viewer” before public contacts can appear here.</p></div>}
      {directory && directory.rows.length === 0 && <div className="directory-empty"><strong>No contacts yet</strong><p>New alumni contacts will appear here automatically when they are added to the sheet.</p></div>}
      {directory && directory.rows.length > 0 && <div className="directory-table-scroll"><table className="directory-table"><thead><tr>{directory.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{directory.rows.map((row, rowIndex) => <tr key={rowIndex}>{directory.headers.map((header, index) => <td key={`${header}-${index}`}>{formatContact(row[index] ?? "", header)}</td>)}</tr>)}</tbody></table></div>}
    </div>
    <div className="sync-note"><span>↻</span><div><strong>Always up to date</strong><p>Changes made in the linked Google Sheet are reflected here automatically when this page is refreshed.</p></div></div>
  </section>;
}

type GoogleSheetResponse = {
  status: string;
  table?: {
    cols: { label?: string }[];
    rows: { c: ({ v?: unknown; f?: string } | null)[] }[];
  };
};

function formatContact(value: string, header: string) {
  if (!value) return <span className="empty-value">—</span>;
  const normalizedHeader = header.toLowerCase();
  if (normalizedHeader.includes("email") || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return <a href={`mailto:${value}`}>{value}</a>;
  if (normalizedHeader.includes("phone")) return <a href={`tel:${value.replace(/[^+\d]/g, "")}`}>{value}</a>;
  if (/^https?:\/\//i.test(value)) return <a href={value} target="_blank" rel="noreferrer">View profile ↗</a>;
  return value;
}

const links = [
  ["HOSA–Future Health Professionals", "Official organization website", "https://hosa.org"],
  ["Competitive Event Guidelines", "Current event rules, rubrics, and resources", "https://hosa.org/guidelines/"],
  ["Competition Overview", "How HOSA competitive events work", "https://hosa.org/competition/"],
  ["Competitive Event FAQ", "Answers about tests, resources, and preparation", "https://hosa.org/faq/"],
  ["New Jersey HOSA", "State conferences, announcements, and opportunities", "https://www.njhosa.org/"],
  ["MCST Website", "School news, programs, and student resources", "https://www.mcvts.org/"],
];

function ResourcesPanel() {
  return <section className="inner-page resources-page"><div className="page-heading"><p className="eyebrow">TOOLS FOR SUCCESS</p><h1>Resources</h1><p>Official guidance and useful starting points for learning, preparing, and competing.</p></div><div className="resource-grid">{links.map(([name, desc, url], index) => <a className="resource-card" href={url} target="_blank" rel="noreferrer" key={name}><span className="resource-num">{String(index + 1).padStart(2, "0")}</span><div><h2>{name}</h2><p>{desc}</p></div><span className="resource-arrow">↗</span></a>)}</div><div className="tip"><strong>Competition tip</strong><p>Always use the current year’s official event guideline. Requirements and test plans may change from year to year.</p></div></section>;
}
