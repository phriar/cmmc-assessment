import { useState } from "react";

const DOMAINS = [
  {
    id: "AC",
    name: "Access Control",
    icon: "🔐",
    desc: "Who can get in, and what can they touch?",
    questions: [
      { id: "AC1", text: "Do you limit system access to authorized users and devices only?" },
      { id: "AC2", text: "Do you control remote access sessions (VPN, RDP) with MFA?" },
      { id: "AC3", text: "Do you enforce least-privilege — users only get the access they need?" },
      { id: "AC4", text: "Do you have a formal process for revoking access when someone leaves?" },
      { id: "AC5", text: "Is CUI access restricted to users who need it for their job?" },
    ],
  },
  {
    id: "IA",
    name: "Identification & Authentication",
    icon: "🪪",
    desc: "Can you prove users are who they say they are?",
    questions: [
      { id: "IA1", text: "Do all accounts require unique usernames (no shared accounts)?" },
      { id: "IA2", text: "Is MFA enforced for all privileged accounts and remote access?" },
      { id: "IA3", text: "Are passwords subject to minimum complexity and rotation policies?" },
      { id: "IA4", text: "Are default credentials changed on all systems before deployment?" },
      { id: "IA5", text: "Is there a process to disable accounts after failed login attempts?" },
    ],
  },
  {
    id: "CM",
    name: "Configuration Management",
    icon: "⚙️",
    desc: "Are your systems built and maintained securely?",
    questions: [
      { id: "CM1", text: "Do you maintain a current inventory of all hardware and software?" },
      { id: "CM2", text: "Are security configuration baselines defined for all systems?" },
      { id: "CM3", text: "Is there a change control process before modifying production systems?" },
      { id: "CM4", text: "Is unnecessary software, ports, and services disabled by default?" },
      { id: "CM5", text: "Are system changes tracked and reviewed for security impact?" },
    ],
  },
  {
    id: "IR",
    name: "Incident Response",
    icon: "🚨",
    desc: "When something goes wrong, do you have a plan?",
    questions: [
      { id: "IR1", text: "Do you have a documented incident response plan?" },
      { id: "IR2", text: "Is the IR plan tested at least annually (tabletop or live drill)?" },
      { id: "IR3", text: "Do you have a defined process to report incidents to DCSA/DoD within 72 hours?" },
      { id: "IR4", text: "Are roles and responsibilities for incident response clearly defined?" },
      { id: "IR5", text: "Do you retain logs and evidence after a security incident?" },
    ],
  },
  {
    id: "RA",
    name: "Risk Assessment",
    icon: "📊",
    desc: "Do you know where you're exposed?",
    questions: [
      { id: "RA1", text: "Do you conduct formal risk assessments at least annually?" },
      { id: "RA2", text: "Are vulnerabilities scanned and remediated on a regular schedule?" },
      { id: "RA3", text: "Do you assess risk before deploying new technologies or systems?" },
      { id: "RA4", text: "Is there a documented risk register with remediation owners?" },
      { id: "RA5", text: "Are third-party/vendor risks evaluated before granting system access?" },
    ],
  },
  {
    id: "SI",
    name: "System & Info Integrity",
    icon: "🛡️",
    desc: "Are your systems protected from threats in real time?",
    questions: [
      { id: "SI1", text: "Is antivirus/EDR deployed and actively monitored on all endpoints?" },
      { id: "SI2", text: "Are security patches applied within 30 days of release (14 days for critical)?" },
      { id: "SI3", text: "Do you monitor systems for unauthorized changes or malicious code?" },
      { id: "SI4", text: "Are security alerts reviewed and acted on within a defined SLA?" },
      { id: "SI5", text: "Is there a process to receive and act on threat intelligence (CISA alerts, etc.)?" },
    ],
  },
  {
    id: "AU",
    name: "Audit & Accountability",
    icon: "📋",
    desc: "Can you prove what happened on your network?",
    questions: [
      { id: "AU1", text: "Are audit logs enabled on all systems handling CUI?" },
      { id: "AU2", text: "Are logs protected from tampering and retained for at least 90 days?" },
      { id: "AU3", text: "Is log review performed regularly (automated or manual)?" },
      { id: "AU4", text: "Are failed login attempts and privilege escalations logged and alerted?" },
      { id: "AU5", text: "Is log storage sufficient to avoid gaps in the audit trail?" },
    ],
  },
  {
    id: "SC",
    name: "System & Comms Protection",
    icon: "🌐",
    desc: "Is data protected in transit and at rest?",
    questions: [
      { id: "SC1", text: "Is CUI encrypted in transit using TLS 1.2+ or equivalent?" },
      { id: "SC2", text: "Is CUI encrypted at rest on laptops, servers, and removable media?" },
      { id: "SC3", text: "Are internal networks segmented to isolate CUI systems?" },
      { id: "SC4", text: "Is DNS/web filtering in place to block known malicious domains?" },
      { id: "SC5", text: "Are mobile devices managed with MDM and encrypted?" },
    ],
  },
];

const ANSWER_OPTIONS = [
  { value: "yes", label: "Yes", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  { value: "partial", label: "Partial", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  { value: "no", label: "No", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
];

const SCORE_COLORS = { yes: "#22c55e", partial: "#f59e0b", no: "#ef4444" };
const SCORE_WEIGHTS = { yes: 1, partial: 0.5, no: 0 };

function getDomainScore(domainId, answers) {
  const domain = DOMAINS.find((d) => d.id === domainId);
  if (!domain) return 0;
  const total = domain.questions.length;
  const earned = domain.questions.reduce(
    (sum, q) => sum + (SCORE_WEIGHTS[answers[q.id]] ?? 0),
    0
  );
  return Math.round((earned / total) * 100);
}

function getOverallScore(answers) {
  const total = DOMAINS.reduce((sum, d) => sum + d.questions.length, 0);
  const earned = DOMAINS.reduce(
    (sum, d) =>
      sum +
      d.questions.reduce(
        (s, q) => s + (SCORE_WEIGHTS[answers[q.id]] ?? 0),
        0
      ),
    0
  );
  return Math.round((earned / total) * 100);
}

function getRiskLevel(score) {
  if (score >= 80) return { label: "LOW RISK", color: "#22c55e" };
  if (score >= 55) return { label: "MODERATE RISK", color: "#f59e0b" };
  if (score >= 30) return { label: "HIGH RISK", color: "#ef4444" };
  return { label: "CRITICAL RISK", color: "#dc2626" };
}

export default function CMMCAssessment() {
  const [step, setStep] = useState("intro"); // intro | profile | domains | loading | results
  const [profile, setProfile] = useState({
    company: "",
    size: "",
    contractType: "",
    cuiScope: "",
    timeline: "",
  });
  const [currentDomain, setCurrentDomain] = useState(0);
  const [answers, setAnswers] = useState({});
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  const totalQs = DOMAINS.reduce((s, d) => s + d.questions.length, 0);
  const answeredQs = Object.keys(answers).length;

  async function generateReport() {
    setStep("loading");
    setError("");

    const domainSummaries = DOMAINS.map((d) => {
      const score = getDomainScore(d.id, answers);
      const gaps = d.questions
        .filter((q) => answers[q.id] === "no")
        .map((q) => q.text);
      const partials = d.questions
        .filter((q) => answers[q.id] === "partial")
        .map((q) => q.text);
      return { domain: d.name, score, gaps, partials };
    });

    const prompt = `You are a CMMC 2.0 compliance expert preparing a readiness assessment report for a DoD contractor.

Company Profile:
- Name: ${profile.company || "Unnamed Company"}
- Size: ${profile.size}
- Contract Type: ${profile.contractType}
- CUI Scope: ${profile.cuiScope}
- Compliance Timeline: ${profile.timeline}

Domain Assessment Results:
${domainSummaries
  .map(
    (d) => `
${d.domain} — Score: ${d.score}%
Gaps (answered NO): ${d.gaps.length ? d.gaps.join("; ") : "None"}
Partials (in progress): ${d.partials.length ? d.partials.join("; ") : "None"}`
  )
  .join("\n")}

Generate a professional CMMC 2.0 Level 2 Gap Assessment Report with:

1. EXECUTIVE SUMMARY (3-4 sentences on overall posture, biggest risks, urgency)

2. CRITICAL GAPS (top 5 highest-priority items they MUST fix first, with a brief explanation of why each matters for CMMC certification)

3. DOMAIN-BY-DOMAIN ANALYSIS (for each domain with gaps, 2-3 sentences on what's missing and what the real-world risk is)

4. 30/60/90 DAY REMEDIATION ROADMAP (specific, actionable steps grouped by timeframe — not vague advice)

5. WHAT THIS MEANS FOR YOUR CONTRACT (1 paragraph on how their current posture affects contract eligibility, and what a C3PA assessor will focus on)

Keep the tone direct and frank — this is a defense contractor audience, not a general SMB. Use CMMC/NIST 800-171 terminology correctly. Be specific, not generic.`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map((c) => c.text || "").join("") || "";
      if (!text) throw new Error("Empty response");
      setReport(text);
      setStep("results");
    } catch (e) {
      setError("Failed to generate report. Please try again.");
      setStep("domains");
    }
  }

  const styles = {
    app: {
      minHeight: "100vh",
      background: "#070c18",
      color: "#e2e8f0",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      padding: "0",
    },
    header: {
      borderBottom: "1px solid rgba(96,165,250,0.2)",
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      background: "rgba(10,20,40,0.8)",
    },
    badge: {
      background: "rgba(59,130,246,0.15)",
      border: "1px solid rgba(59,130,246,0.3)",
      color: "#60a5fa",
      fontSize: "10px",
      padding: "3px 8px",
      letterSpacing: "0.15em",
      fontWeight: "700",
    },
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "32px 24px",
    },
    card: {
      background: "rgba(15,25,50,0.7)",
      border: "1px solid rgba(96,165,250,0.15)",
      padding: "28px",
      marginBottom: "16px",
    },
    sectionTitle: {
      fontSize: "11px",
      letterSpacing: "0.2em",
      color: "#60a5fa",
      fontWeight: "700",
      marginBottom: "20px",
      textTransform: "uppercase",
    },
    h1: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#f1f5f9",
      letterSpacing: "-0.02em",
      lineHeight: "1.2",
      marginBottom: "12px",
      fontFamily: "'IBM Plex Mono', monospace",
    },
    subtext: {
      color: "#94a3b8",
      fontSize: "14px",
      lineHeight: "1.6",
      marginBottom: "24px",
    },
    btn: {
      background: "#2563eb",
      color: "#fff",
      border: "none",
      padding: "12px 28px",
      fontSize: "13px",
      fontFamily: "'IBM Plex Mono', monospace",
      fontWeight: "700",
      letterSpacing: "0.08em",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
    },
    btnSecondary: {
      background: "transparent",
      color: "#94a3b8",
      border: "1px solid rgba(148,163,184,0.3)",
      padding: "10px 20px",
      fontSize: "12px",
      fontFamily: "'IBM Plex Mono', monospace",
      cursor: "pointer",
    },
    input: {
      background: "rgba(10,20,40,0.8)",
      border: "1px solid rgba(96,165,250,0.2)",
      color: "#e2e8f0",
      padding: "10px 14px",
      fontSize: "13px",
      fontFamily: "'IBM Plex Mono', monospace",
      width: "100%",
      boxSizing: "border-box",
      marginTop: "6px",
      outline: "none",
    },
    label: {
      fontSize: "11px",
      color: "#94a3b8",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      display: "block",
    },
    progressBar: {
      height: "3px",
      background: "rgba(96,165,250,0.15)",
      marginBottom: "28px",
    },
    progressFill: {
      height: "3px",
      background: "linear-gradient(90deg, #2563eb, #60a5fa)",
      transition: "width 0.3s ease",
    },
  };

  // INTRO
  if (step === "intro") {
    return (
      <div style={styles.app}>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <div style={styles.header}>
          <div style={styles.badge}>CMMC 2.0</div>
          <span style={{ fontSize: "12px", color: "#64748b", letterSpacing: "0.05em" }}>
            READINESS ASSESSMENT ENGINE
          </span>
        </div>
        <div style={styles.container}>
          <div style={{ marginBottom: "40px", paddingTop: "24px" }}>
            <div style={{ fontSize: "11px", color: "#3b82f6", letterSpacing: "0.2em", marginBottom: "16px" }}>
              ◈ DEFENSE INDUSTRIAL BASE · LEVEL 2 ASSESSMENT
            </div>
            <div style={styles.h1}>Know Where You Stand<br />Before the C3PA Does.</div>
            <p style={styles.subtext}>
              A self-assessment across the 8 highest-weight CMMC 2.0 Level 2 domains.
              40 questions. Straight answers. A gap report you can actually use.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "32px" }}>
              {[
                { n: "8", label: "Domains Assessed" },
                { n: "40", label: "Practice Controls" },
                { n: "~10", label: "Minutes to Complete" },
              ].map((s) => (
                <div key={s.label} style={{ ...styles.card, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: "#60a5fa", marginBottom: "4px" }}>{s.n}</div>
                  <div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "0.1em" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <button style={styles.btn} onClick={() => setStep("profile")}>
              BEGIN ASSESSMENT →
            </button>
          </div>
          <div style={{ borderTop: "1px solid rgba(96,165,250,0.1)", paddingTop: "20px" }}>
            <div style={{ fontSize: "11px", color: "#475569", lineHeight: "1.6" }}>
              This tool assesses readiness against NIST SP 800-171 Rev 2 practices required for CMMC 2.0 Level 2 certification.
              Results are for internal planning purposes only and do not constitute a formal C3PA assessment.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PROFILE
  if (step === "profile") {
    const fields = [
      { key: "company", label: "Company / Organization Name", type: "text", placeholder: "Acme Defense LLC" },
      { key: "size", label: "Company Size", type: "select", options: ["1-10 employees", "11-50 employees", "51-250 employees", "250+ employees"] },
      { key: "contractType", label: "Primary Contract Type", type: "select", options: ["Prime Contractor (DoD)", "Subcontractor (Tier 1)", "Subcontractor (Tier 2+)", "IDIQ / Task Order", "Multiple"] },
      { key: "cuiScope", label: "CUI Handling Scope", type: "select", options: ["Handles CUI daily (core to operations)", "Handles CUI occasionally", "CUI is in a defined enclave only", "Not currently handling CUI"] },
      { key: "timeline", label: "Compliance Timeline", type: "select", options: ["Need certification in < 6 months", "6-12 months", "12-24 months", "Exploring / no hard deadline"] },
    ];
    const complete = fields.every((f) => profile[f.key]);
    return (
      <div style={styles.app}>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <div style={styles.header}>
          <div style={styles.badge}>CMMC 2.0</div>
          <span style={{ fontSize: "12px", color: "#64748b", letterSpacing: "0.05em" }}>COMPANY PROFILE</span>
        </div>
        <div style={styles.container}>
          <div style={{ marginBottom: "28px" }}>
            <div style={styles.sectionTitle}>Step 1 of {DOMAINS.length + 1} — Company Profile</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#f1f5f9", marginBottom: "8px" }}>
              Tell us about your organization
            </div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>
              This context shapes the gap analysis and remediation priorities in your report.
            </div>
          </div>
          <div style={styles.card}>
            {fields.map((f) => (
              <div key={f.key} style={{ marginBottom: "20px" }}>
                <label style={styles.label}>{f.label}</label>
                {f.type === "select" ? (
                  <select
                    style={{ ...styles.input, appearance: "none" }}
                    value={profile[f.key]}
                    onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                  >
                    <option value="">— Select —</option>
                    {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    style={styles.input}
                    type="text"
                    placeholder={f.placeholder}
                    value={profile[f.key]}
                    onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button style={styles.btnSecondary} onClick={() => setStep("intro")}>← Back</button>
            <button
              style={{ ...styles.btn, opacity: complete ? 1 : 0.4, cursor: complete ? "pointer" : "not-allowed" }}
              onClick={() => complete && setStep("domains")}
            >
              START ASSESSMENT →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DOMAINS
  if (step === "domains") {
    const domain = DOMAINS[currentDomain];
    const domainAnswered = domain.questions.every((q) => answers[q.id]);
    const allAnswered = answeredQs === totalQs;
    const progress = ((currentDomain) / DOMAINS.length) * 100;

    return (
      <div style={styles.app}>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <div style={styles.header}>
          <div style={styles.badge}>CMMC 2.0</div>
          <span style={{ fontSize: "12px", color: "#64748b", letterSpacing: "0.05em" }}>
            DOMAIN {currentDomain + 1} / {DOMAINS.length} — {domain.id}
          </span>
          <div style={{ marginLeft: "auto", fontSize: "11px", color: "#475569" }}>
            {answeredQs}/{totalQs} answered
          </div>
        </div>
        <div style={{ ...styles.progressBar, borderRadius: "0" }}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
        <div style={styles.container}>
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", color: "#3b82f6", letterSpacing: "0.15em", marginBottom: "8px" }}>
              {domain.icon} {domain.id} · {domain.name.toUpperCase()}
            </div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#f1f5f9", marginBottom: "6px" }}>
              {domain.name}
            </div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>{domain.desc}</div>
          </div>

          {domain.questions.map((q, qi) => (
            <div key={q.id} style={{ ...styles.card, marginBottom: "12px", padding: "20px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ fontSize: "10px", color: "#475569", minWidth: "32px", paddingTop: "2px", letterSpacing: "0.05em" }}>
                  {q.id}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.5", marginBottom: "14px" }}>
                    {q.text}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {ANSWER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setAnswers({ ...answers, [q.id]: opt.value })}
                        style={{
                          padding: "7px 16px",
                          fontSize: "11px",
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontWeight: "700",
                          letterSpacing: "0.1em",
                          border: answers[q.id] === opt.value
                            ? `1px solid ${opt.color}`
                            : "1px solid rgba(100,116,139,0.3)",
                          background: answers[q.id] === opt.value ? opt.bg : "transparent",
                          color: answers[q.id] === opt.value ? opt.color : "#64748b",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {error && (
            <div style={{ color: "#ef4444", fontSize: "12px", marginBottom: "16px", padding: "12px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "space-between" }}>
            <button style={styles.btnSecondary} onClick={() => currentDomain > 0 ? setCurrentDomain(currentDomain - 1) : setStep("profile")}>
              ← Previous
            </button>
            <div style={{ display: "flex", gap: "8px" }}>
              {currentDomain < DOMAINS.length - 1 ? (
                <button
                  style={{ ...styles.btn, opacity: domainAnswered ? 1 : 0.4, cursor: domainAnswered ? "pointer" : "not-allowed" }}
                  onClick={() => domainAnswered && setCurrentDomain(currentDomain + 1)}
                >
                  NEXT DOMAIN →
                </button>
              ) : (
                <button
                  style={{ ...styles.btn, background: "#16a34a", opacity: allAnswered ? 1 : 0.4, cursor: allAnswered ? "pointer" : "not-allowed" }}
                  onClick={() => allAnswered && generateReport()}
                >
                  GENERATE REPORT →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LOADING
  if (step === "loading") {
    return (
      <div style={{ ...styles.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "16px", animation: "pulse 1.5s infinite" }}>⚙️</div>
          <div style={{ fontSize: "13px", color: "#60a5fa", letterSpacing: "0.15em", marginBottom: "8px" }}>
            ANALYZING ASSESSMENT DATA
          </div>
          <div style={{ fontSize: "12px", color: "#475569" }}>Generating gap analysis and remediation roadmap...</div>
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
      </div>
    );
  }

  // RESULTS
  if (step === "results") {
    const overall = getOverallScore(answers);
    const risk = getRiskLevel(overall);
    const sections = report.split(/\n(?=\d\. [A-Z])/);

    return (
      <div style={styles.app}>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <div style={styles.header}>
          <div style={styles.badge}>CMMC 2.0</div>
          <span style={{ fontSize: "12px", color: "#64748b", letterSpacing: "0.05em" }}>GAP ASSESSMENT REPORT</span>
          <div style={{ marginLeft: "auto", fontSize: "11px", color: "#475569" }}>
            {profile.company || "Company"} · {new Date().toLocaleDateString()}
          </div>
        </div>
        <div style={styles.container}>
          {/* Score Banner */}
          <div style={{ ...styles.card, background: "rgba(10,20,40,0.9)", padding: "24px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "52px", fontWeight: "700", color: risk.color, lineHeight: "1" }}>{overall}%</div>
              <div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "0.1em", marginTop: "4px" }}>OVERALL SCORE</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.15em", color: risk.color, marginBottom: "4px" }}>◈ {risk.label}</div>
              <div style={{ fontSize: "13px", color: "#94a3b8" }}>{profile.company || "Company"} · {profile.contractType}</div>
            </div>
            <button style={styles.btnSecondary} onClick={() => window.print()}>⬇ EXPORT</button>
          </div>

          {/* Domain Scores */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Domain Scores</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {DOMAINS.map((d) => {
                const score = getDomainScore(d.id, answers);
                const rk = getRiskLevel(score);
                return (
                  <div key={d.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ fontSize: "18px" }}>{d.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>{d.name}</span>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: rk.color }}>{score}%</span>
                      </div>
                      <div style={{ height: "4px", background: "rgba(100,116,139,0.2)", borderRadius: "2px" }}>
                        <div style={{ height: "4px", width: `${score}%`, background: rk.color, borderRadius: "2px", transition: "width 0.5s ease" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Report */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>AI-Generated Gap Analysis</div>
            <div style={{ whiteSpace: "pre-wrap", fontSize: "13px", color: "#cbd5e1", lineHeight: "1.7" }}>
              {report}
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button style={styles.btnSecondary} onClick={() => { setStep("domains"); setCurrentDomain(0); }}>
              ← Retake Assessment
            </button>
            <button style={styles.btn} onClick={() => { setAnswers({}); setReport(""); setProfile({ company: "", size: "", contractType: "", cuiScope: "", timeline: "" }); setStep("intro"); }}>
              NEW ASSESSMENT
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
