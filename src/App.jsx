import { useState } from "react";

// ─── Profile-aware question engine ───────────────────────────────────────────

function getSizeCategory(size) {
  if (size === "1-10 employees") return "solo";
  if (size === "11-50 employees") return "small";
  return "enterprise";
}

function getCUILevel(cuiScope) {
  if (cuiScope === "Handles CUI daily (core to operations)") return "heavy";
  if (cuiScope === "Handles CUI occasionally") return "moderate";
  if (cuiScope === "CUI is in a defined enclave only") return "enclave";
  return "light";
}

function buildDomains(profile) {
  const size = getSizeCategory(profile.size);
  const cui = getCUILevel(profile.cuiScope);
  const isPrime = profile.contractType?.includes("Prime");

  return [
    {
      id: "AC",
      name: "Access Control",
      icon: "🔐",
      desc: size === "solo"
        ? "Who can get into your work machine and accounts?"
        : "Who can access your systems and CUI data?",
      questions: size === "solo" ? [
        { id: "AC1", text: "Is your work computer protected by a strong password or PIN (not shared with anyone)?" },
        { id: "AC2", text: "Do you use a VPN when accessing client systems or CUI from outside your home office?" },
        { id: "AC3", text: "Are your client portals and work accounts separate from your personal accounts?" },
        { id: "AC4", text: "If a client relationship ended today, could you immediately cut off all their access to shared resources?" },
        { id: "AC5", text: cui === "heavy" ? "Is access to CUI files restricted so only you (and authorized clients) can open them?" : "Do you limit who can view or download sensitive files you handle?" },
      ] : size === "small" ? [
        { id: "AC1", text: "Do you limit system access to authorized employees only — no shared logins?" },
        { id: "AC2", text: "Is VPN with MFA required for anyone accessing work systems remotely?" },
        { id: "AC3", text: "Do employees only get access to the systems and files their role requires (least privilege)?" },
        { id: "AC4", text: "Is there a formal offboarding checklist that revokes all system access when someone leaves?" },
        { id: "AC5", text: cui === "enclave" ? "Is CUI access physically or logically restricted to the defined enclave only?" : "Is CUI access restricted to staff with a documented need-to-know?" },
      ] : [
        { id: "AC1", text: "Is system access controlled via a formal provisioning process tied to HR records?" },
        { id: "AC2", text: "Are all remote access sessions (VPN, RDP, jump hosts) enforced with MFA?" },
        { id: "AC3", text: "Is least-privilege enforced with role-based access controls (RBAC) across all systems?" },
        { id: "AC4", text: "Is there an automated or audited process to revoke access within 24 hours of termination?" },
        { id: "AC5", text: "Is CUI access logged, audited, and restricted to cleared/authorized personnel only?" },
      ],
    },
    {
      id: "IA",
      name: "Identification & Authentication",
      icon: "🪪",
      desc: size === "solo"
        ? "Can you prove your identity to the systems you access?"
        : "Can you verify every user is who they say they are?",
      questions: size === "solo" ? [
        { id: "IA1", text: "Do all your work accounts use unique passwords (not reused across sites)?" },
        { id: "IA2", text: "Is MFA (authenticator app or hardware key) enabled on your email, VPN, and any client portals?" },
        { id: "IA3", text: "Are your passwords at least 12 characters and stored in a password manager (not a sticky note or spreadsheet)?" },
        { id: "IA4", text: "Have you changed all default passwords on your router and any work-related devices?" },
        { id: "IA5", text: "Do your accounts lock or require re-authentication after a period of inactivity?" },
      ] : size === "small" ? [
        { id: "IA1", text: "Does every user have a unique account — no shared credentials for any system?" },
        { id: "IA2", text: "Is MFA enforced for all privileged accounts and all remote access?" },
        { id: "IA3", text: "Is a password policy enforced (minimum length, complexity, rotation) across all systems?" },
        { id: "IA4", text: "Are default credentials changed on every device and system before deployment?" },
        { id: "IA5", text: "Are accounts automatically locked after repeated failed login attempts?" },
      ] : [
        { id: "IA1", text: "Is unique user identification enforced across all systems including privileged and service accounts?" },
        { id: "IA2", text: "Is MFA mandatory for all administrative access, remote access, and CUI system access?" },
        { id: "IA3", text: "Is password policy enforced via technical controls (GPO, IdP) — not just policy documents?" },
        { id: "IA4", text: "Is there a documented process to audit and rotate credentials for service accounts and shared systems?" },
        { id: "IA5", text: "Are account lockout thresholds, session timeouts, and re-auth requirements technically enforced?" },
      ],
    },
    {
      id: "CM",
      name: "Configuration Management",
      icon: "⚙️",
      desc: size === "solo"
        ? "Is your work computer set up securely and kept that way?"
        : "Are your systems built and maintained securely?",
      questions: size === "solo" ? [
        { id: "CM1", text: "Do you have a written or documented list of the hardware and software you use for work?" },
        { id: "CM2", text: "Is your laptop configured per a security baseline (firewall on, FileVault/BitLocker enabled, no unnecessary software)?" },
        { id: "CM3", text: "Do you avoid installing personal or untrusted software on your primary work machine?" },
        { id: "CM4", text: "Have you disabled any services or features on your machine that you don't need for work?" },
        { id: "CM5", text: "Do you review and remove unused software, accounts, or browser extensions periodically?" },
      ] : size === "small" ? [
        { id: "CM1", text: "Do you maintain a current inventory of all company-owned hardware and installed software?" },
        { id: "CM2", text: "Are there documented security baselines (hardening guides) for workstations and servers?" },
        { id: "CM3", text: "Is there a change approval process before modifying production systems or installing new software?" },
        { id: "CM4", text: "Is unnecessary software, open ports, and services disabled by default on all systems?" },
        { id: "CM5", text: "Are system changes tracked so you can audit what changed, when, and who approved it?" },
      ] : [
        { id: "CM1", text: "Is a CMDB or equivalent asset inventory maintained and reconciled at least quarterly?" },
        { id: "CM2", text: "Are security configuration baselines defined, applied, and audited for all system types?" },
        { id: "CM3", text: "Does a formal change management process (CAB or equivalent) govern all production changes?" },
        { id: "CM4", text: "Is application whitelisting or equivalent control in place to prevent unauthorized software execution?" },
        { id: "CM5", text: "Are configuration deviations automatically detected and alerted via a compliance tool?" },
      ],
    },
    {
      id: "IR",
      name: "Incident Response",
      icon: "🚨",
      desc: size === "solo"
        ? "If your system got hacked today, do you know exactly what to do?"
        : "When something goes wrong, does your team have a plan?",
      questions: size === "solo" ? [
        { id: "IR1", text: "Do you have a written plan for what to do if your work computer is compromised or stolen?" },
        { id: "IR2", text: "Do you know how to report a cybersecurity incident to DCSA within 72 hours if CUI is involved?" },
        { id: "IR3", text: isPrime ? "Have you briefed any subcontractors on incident reporting requirements?" : "Do you know your prime contractor's incident escalation contact and reporting process?" },
        { id: "IR4", text: "Do you have recent backups of all work data, tested and stored separately from your main machine?" },
        { id: "IR5", text: "Have you reviewed your IR plan in the last 12 months — even just re-reading and updating contacts?" },
      ] : size === "small" ? [
        { id: "IR1", text: "Is there a documented incident response plan covering detection, containment, and reporting?" },
        { id: "IR2", text: "Do you have a tested process to report incidents to DCSA within 72 hours when CUI is involved?" },
        { id: "IR3", text: "Are IR roles and responsibilities assigned to named individuals — not just job titles?" },
        { id: "IR4", text: "Has your IR plan been tested (tabletop or live drill) within the past 12 months?" },
        { id: "IR5", text: "Are incident artifacts (logs, screenshots, timelines) preserved and retained after a security event?" },
      ] : [
        { id: "IR1", text: "Is a formal IRP in place, approved by leadership, and accessible to all responders?" },
        { id: "IR2", text: "Is there a documented and tested 72-hour DCSA/DoD incident notification workflow?" },
        { id: "IR3", text: "Are IR roles defined with backup assignments, escalation paths, and 24/7 contact information?" },
        { id: "IR4", text: "Is IR testing conducted at least annually with documented results and remediation tracking?" },
        { id: "IR5", text: "Is a SIEM or equivalent tool used to preserve and correlate incident evidence automatically?" },
      ],
    },
    {
      id: "RA",
      name: "Risk Assessment",
      icon: "📊",
      desc: size === "solo"
        ? "Do you know where you're most exposed as a solo contractor?"
        : "Do you systematically find and fix your weakest points?",
      questions: size === "solo" ? [
        { id: "RA1", text: "Have you ever done a self-assessment of what would happen if your laptop was lost or stolen?" },
        { id: "RA2", text: "Do you run vulnerability scans or use a tool (e.g., Nessus Essentials, Qualys Free) to check your machine?" },
        { id: "RA3", text: "Before adopting a new tool or cloud service for work, do you evaluate its security and data handling practices?" },
        { id: "RA4", text: "Do you track known security weaknesses with a plan to fix them by a specific date?" },
        { id: "RA5", text: "Have you reviewed the security practices of any subcontractors or vendors who touch your CUI systems?" },
      ] : size === "small" ? [
        { id: "RA1", text: "Do you conduct formal risk assessments at least annually and document the results?" },
        { id: "RA2", text: "Are vulnerabilities scanned on a regular schedule and remediated with tracked timelines?" },
        { id: "RA3", text: "Is risk evaluated before deploying new technologies, tools, or services?" },
        { id: "RA4", text: "Is there a risk register with identified risks, owners, and remediation due dates?" },
        { id: "RA5", text: "Are vendor and third-party risks assessed before granting access to your systems?" },
      ] : [
        { id: "RA1", text: "Is a formal risk assessment process conducted at least annually with executive sponsorship?" },
        { id: "RA2", text: "Is vulnerability scanning automated and integrated into a remediation SLA tracking system?" },
        { id: "RA3", text: "Is a risk acceptance process in place for deviations from baseline, with documented approvals?" },
        { id: "RA4", text: "Is a formal risk register maintained with risk owners, treatment plans, and residual risk tracking?" },
        { id: "RA5", text: "Is a third-party risk management (TPRM) program in place covering all vendors with CUI access?" },
      ],
    },
    {
      id: "SI",
      name: "System & Info Integrity",
      icon: "🛡️",
      desc: size === "solo"
        ? "Is your machine protected against malware and threats right now?"
        : "Are your systems actively protected against threats?",
      questions: size === "solo" ? [
        { id: "SI1", text: "Do you have antivirus or endpoint protection (e.g., Malwarebytes, Defender, CrowdStrike Falcon Go) actively running?" },
        { id: "SI2", text: "Are OS and software updates installed promptly — within 2 weeks of release for critical patches?" },
        { id: "SI3", text: "Do you have any alerts set up to notify you of suspicious activity on your machine or accounts?" },
        { id: "SI4", text: "Do you review security alerts or AV detections when they occur — same day?" },
        { id: "SI5", text: "Do you subscribe to CISA alerts or similar threat intel feeds relevant to your work?" },
      ] : size === "small" ? [
        { id: "SI1", text: "Is antivirus or EDR deployed and actively monitored on all endpoints?" },
        { id: "SI2", text: "Are security patches applied within 30 days (14 days for critical) across all systems?" },
        { id: "SI3", text: "Is there monitoring in place to detect unauthorized changes or malicious code on systems?" },
        { id: "SI4", text: "Are security alerts reviewed and acted on within a defined response timeframe?" },
        { id: "SI5", text: "Does your team receive and act on threat intelligence (CISA advisories, vendor bulletins)?" },
      ] : [
        { id: "SI1", text: "Is EDR deployed enterprise-wide with centralized management and 24/7 alert monitoring?" },
        { id: "SI2", text: "Is patch management automated with enforced SLAs: 30 days standard, 14 days critical, 72 hours emergency?" },
        { id: "SI3", text: "Is file integrity monitoring (FIM) in place on all systems that process or store CUI?" },
        { id: "SI4", text: "Are security alerts triaged through a formal SOC process with documented response SLAs?" },
        { id: "SI5", text: "Is threat intelligence operationalized — feeding into detection rules, not just distributed via email?" },
      ],
    },
    {
      id: "AU",
      name: "Audit & Accountability",
      icon: "📋",
      desc: size === "solo"
        ? "Can you prove what happened on your systems if asked?"
        : "Can you reconstruct any security event from your logs?",
      questions: size === "solo" ? [
        { id: "AU1", text: "Are activity logs enabled on your work machine and any cloud services you use for CUI?" },
        { id: "AU2", text: "Are those logs stored somewhere separate from your main machine (cloud backup, external drive) for at least 90 days?" },
        { id: "AU3", text: "Do you review any access or activity logs periodically — even just checking for unexpected logins?" },
        { id: "AU4", text: "Do your accounts or services alert you on failed logins or access from unrecognized locations?" },
        { id: "AU5", text: "Do you have enough log storage so audit history isn't auto-deleted before 90 days?" },
      ] : size === "small" ? [
        { id: "AU1", text: "Are audit logs enabled on all systems that store, process, or transmit CUI?" },
        { id: "AU2", text: "Are logs protected from modification and retained for a minimum of 90 days?" },
        { id: "AU3", text: "Is log review performed on a regular schedule — automated alerting or manual review?" },
        { id: "AU4", text: "Are failed logins and privilege escalations automatically logged and alerted?" },
        { id: "AU5", text: "Is log storage sized to prevent gaps — no silent rotation or overwrite before retention period?" },
      ] : [
        { id: "AU1", text: "Are audit logs collected centrally (SIEM) from all endpoints, servers, network devices, and applications?" },
        { id: "AU2", text: "Are logs write-protected, integrity-verified, and retained per policy (90 days online, 1 year archive)?" },
        { id: "AU3", text: "Are automated correlation rules in place to detect anomalous patterns across log sources?" },
        { id: "AU4", text: "Are privileged user actions, account changes, and CUI access events logged and reviewed?" },
        { id: "AU5", text: "Is log capacity monitored with automated alerting before storage limits are reached?" },
      ],
    },
    {
      id: "SC",
      name: "System & Comms Protection",
      icon: "🌐",
      desc: size === "solo"
        ? "Is your data protected when it moves and when it sits still?"
        : "Is data protected in transit and at rest across your environment?",
      questions: size === "solo" ? [
        { id: "SC1", text: "Is all CUI sent over encrypted connections (HTTPS, encrypted email, secure file transfer — never plain FTP or HTTP)?" },
        { id: "SC2", text: "Is your laptop's hard drive encrypted (FileVault on Mac, BitLocker on Windows)?" },
        { id: "SC3", text: "Is your home/work network separated from personal or household devices when handling CUI?" },
        { id: "SC4", text: "Do you use DNS filtering or a security-focused DNS (e.g., Cloudflare 1.1.1.2, Cisco Umbrella) to block malicious domains?" },
        { id: "SC5", text: "If you access work systems from a mobile device, is that device encrypted and PIN/biometric protected?" },
      ] : size === "small" ? [
        { id: "SC1", text: "Is CUI encrypted in transit using TLS 1.2+ across all internal and external communications?" },
        { id: "SC2", text: "Is CUI encrypted at rest on all laptops, servers, and removable media?" },
        { id: "SC3", text: "Are internal networks segmented to isolate CUI systems from general business traffic?" },
        { id: "SC4", text: "Is DNS/web filtering deployed to block known malicious domains for all users?" },
        { id: "SC5", text: "Are mobile devices managed via MDM, encrypted, and required to use PINs or biometrics?" },
      ] : [
        { id: "SC1", text: "Is TLS 1.2+ enforced via policy — with TLS 1.0/1.1 and SSL disabled across all systems?" },
        { id: "SC2", text: "Is encryption at rest enforced via technical controls (not policy) for all CUI data stores and endpoints?" },
        { id: "SC3", text: "Is network segmentation enforced via firewall policy with CUI systems in dedicated VLANs or microsegments?" },
        { id: "SC4", text: "Is DNS filtering enforced at the network level — not just browser-based — for all endpoints?" },
        { id: "SC5", text: "Is a formal MDM solution enforcing encryption, remote wipe, and compliance posture on all mobile devices?" },
      ],
    },
  ];
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

const ANSWER_OPTIONS = [
  { value: "yes", label: "Yes", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  { value: "partial", label: "Partial / In Progress", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  { value: "no", label: "No", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
];
const WEIGHTS = { yes: 1, partial: 0.5, no: 0 };

function domainScore(d, answers) {
  return Math.round(d.questions.reduce((s, q) => s + (WEIGHTS[answers[q.id]] ?? 0), 0) / d.questions.length * 100);
}
function overallScore(domains, answers) {
  const total = domains.reduce((s, d) => s + d.questions.length, 0);
  const earned = domains.reduce((s, d) => s + d.questions.reduce((ss, q) => ss + (WEIGHTS[answers[q.id]] ?? 0), 0), 0);
  return Math.round((earned / total) * 100);
}
function risk(score) {
  if (score >= 80) return { label: "LOW RISK", color: "#22c55e" };
  if (score >= 55) return { label: "MODERATE RISK", color: "#f59e0b" };
  if (score >= 30) return { label: "HIGH RISK", color: "#ef4444" };
  return { label: "CRITICAL RISK", color: "#dc2626" };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  app: { minHeight: "100vh", background: "#060b16", color: "#e2e8f0", fontFamily: "'IBM Plex Mono', monospace" },
  hdr: { borderBottom: "1px solid rgba(96,165,250,0.12)", padding: "13px 22px", display: "flex", alignItems: "center", gap: "12px", background: "rgba(6,11,22,0.97)", position: "sticky", top: 0, zIndex: 10 },
  badge: { background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.28)", color: "#60a5fa", fontSize: "10px", padding: "3px 8px", letterSpacing: "0.15em", fontWeight: "700" },
  wrap: { maxWidth: "760px", margin: "0 auto", padding: "28px 18px" },
  card: { background: "rgba(13,22,45,0.8)", border: "1px solid rgba(96,165,250,0.1)", padding: "22px", marginBottom: "12px" },
  h1: { fontSize: "25px", fontWeight: "700", color: "#f1f5f9", letterSpacing: "-0.02em", lineHeight: "1.25", marginBottom: "10px" },
  sub: { color: "#64748b", fontSize: "13px", lineHeight: "1.6", marginBottom: "22px" },
  lbl: { fontSize: "10px", color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: "5px" },
  inp: { background: "rgba(6,11,22,0.9)", border: "1px solid rgba(96,165,250,0.16)", color: "#e2e8f0", padding: "9px 12px", fontSize: "12px", fontFamily: "'IBM Plex Mono',monospace", width: "100%", boxSizing: "border-box", outline: "none" },
  btn: { background: "#2563eb", color: "#fff", border: "none", padding: "10px 24px", fontSize: "12px", fontFamily: "'IBM Plex Mono',monospace", fontWeight: "700", letterSpacing: "0.1em", cursor: "pointer" },
  ghost: { background: "transparent", color: "#64748b", border: "1px solid rgba(100,116,139,0.22)", padding: "9px 18px", fontSize: "12px", fontFamily: "'IBM Plex Mono',monospace", cursor: "pointer" },
  tag: { display: "inline-block", fontSize: "9px", padding: "2px 8px", border: "1px solid rgba(96,165,250,0.18)", color: "#60a5fa", letterSpacing: "0.12em", marginBottom: "12px" },
};

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [step, setStep] = useState("intro");
  const [profile, setProfile] = useState({ company: "", size: "", contractType: "", cuiScope: "", timeline: "" });
  const [domains, setDomains] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  function startAssessment() {
    setDomains(buildDomains(profile));
    setIdx(0);
    setAnswers({});
    setStep("domains");
  }

  const totalQs = domains.reduce((s, d) => s + d.questions.length, 0);
  const answeredQs = Object.keys(answers).length;
  const domain = domains[idx];

  async function generate() {
    setStep("loading");
    setError("");
    const size = getSizeCategory(profile.size);
    const summaries = domains.map(d => ({
      domain: d.name,
      score: domainScore(d, answers),
      gaps: d.questions.filter(q => answers[q.id] === "no").map(q => q.text),
      partials: d.questions.filter(q => answers[q.id] === "partial").map(q => q.text),
    }));

    const prompt = `You are a CMMC 2.0 compliance expert preparing a tailored readiness assessment.

CRITICAL CONTEXT — tailor every recommendation to this profile:
- Company: ${profile.company || "Unnamed"}
- Size: ${profile.size} — this is a ${size === "solo" ? "SOLO OPERATOR / 1-PERSON SHOP. Do NOT suggest enterprise tools, IT teams, or SOCs. Keep all recommendations achievable by one person with limited budget." : size === "small" ? "SMALL TEAM (under 50 people)." : "MID TO LARGE ENTERPRISE."}
- Contract Type: ${profile.contractType}
- CUI Handling: ${profile.cuiScope}
- Certification Timeline: ${profile.timeline}

Domain Scores:
${summaries.map(d => `${d.domain}: ${d.score}%\n  Gaps: ${d.gaps.length ? d.gaps.join("; ") : "None"}\n  Partials: ${d.partials.length ? d.partials.join("; ") : "None"}`).join("\n\n")}

Generate a CMMC 2.0 Level 2 Gap Assessment Report:

1. EXECUTIVE SUMMARY
3-4 sentences. Be direct. State overall posture honestly, top 2 risks, and whether the ${profile.timeline} timeline is achievable given current gaps.

2. CRITICAL GAPS
Top 5 must-fix items. For each: name the gap, cite the NIST 800-171 practice ID, explain the real-world consequence. ${size === "solo" ? "Frame for a solo operator — no enterprise jargon." : ""}

3. DOMAIN-BY-DOMAIN ANALYSIS
For each domain with gaps, 2-3 sentences on what's missing and the concrete risk to their specific situation.

4. 30/60/90 DAY REMEDIATION ROADMAP
${size === "solo" ? "Recommend free or affordable tools: Malwarebytes, Bitwarden, Cloudflare 1.1.1.2, Windows Defender, iCloud/Backblaze backups, ProtonMail. No enterprise tools." : "Give actionable steps with realistic tools and timeframes for a team their size."}
Group by 30 / 60 / 90 day buckets. Be specific.

5. CONTRACT IMPLICATIONS
1 paragraph. How does this posture affect their ability to win or keep contracts as a ${profile.contractType}? What will a C3PA assessor focus on first?

Be frank. Use correct CMMC/NIST 800-171 terminology. Do not pad with generic advice.`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "";
      if (!text) throw new Error("empty");
      setReport(text);
      setStep("results");
    } catch {
      setError("Failed to generate report. Please try again.");
      setStep("domains");
    }
  }

  // INTRO
  if (step === "intro") return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      <div style={S.hdr}>
        <div style={S.badge}>CMMC 2.0</div>
        <span style={{ fontSize: "11px", color: "#1e293b", letterSpacing: "0.08em" }}>READINESS ASSESSMENT ENGINE</span>
      </div>
      <div style={S.wrap}>
        <div style={{ paddingTop: "28px", marginBottom: "40px" }}>
          <div style={{ fontSize: "10px", color: "#3b82f6", letterSpacing: "0.2em", marginBottom: "16px" }}>◈ DEFENSE INDUSTRIAL BASE · LEVEL 2</div>
          <div style={S.h1}>Know Where You Stand<br />Before the C3PA Does.</div>
          <p style={S.sub}>A tailored self-assessment across 8 CMMC 2.0 Level 2 domains. Questions adapt to your company size and CUI scope — a 1-person shop gets different questions than a 50-person contractor, because the controls that matter are different.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "28px" }}>
            {[["8", "Domains"], ["40", "Questions"], ["~10 min", "To Complete"]].map(([n, l]) => (
              <div key={l} style={{ ...S.card, padding: "16px", textAlign: "center", marginBottom: 0 }}>
                <div style={{ fontSize: "22px", fontWeight: "700", color: "#60a5fa" }}>{n}</div>
                <div style={{ fontSize: "9px", color: "#334155", letterSpacing: "0.1em", marginTop: "4px" }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ ...S.card, background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.12)", padding: "14px", marginBottom: "24px" }}>
            <div style={{ fontSize: "10px", color: "#60a5fa", letterSpacing: "0.1em", marginBottom: "6px" }}>◈ ADAPTIVE QUESTIONS</div>
            <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.6" }}>Solo operator? You'll be asked about FileVault, Bitwarden, and your home network — not MDM fleets or SIEM platforms. Questions match your reality.</div>
          </div>
          <button style={S.btn} onClick={() => setStep("profile")}>BEGIN ASSESSMENT →</button>
        </div>
        <div style={{ borderTop: "1px solid rgba(96,165,250,0.07)", paddingTop: "14px", fontSize: "11px", color: "#1e293b", lineHeight: "1.6" }}>
          Assesses against NIST SP 800-171 Rev 2 practices required for CMMC 2.0 Level 2. For internal planning only — not a formal C3PA assessment.
        </div>
      </div>
    </div>
  );

  // PROFILE
  if (step === "profile") {
    const fields = [
      { key: "company", label: "Company / Organization Name", type: "text", placeholder: "Acme Defense LLC" },
      { key: "size", label: "Company Size", type: "select", options: ["1-10 employees", "11-50 employees", "51-250 employees", "250+ employees"] },
      { key: "contractType", label: "Primary Contract Type", type: "select", options: ["Prime Contractor (DoD)", "Subcontractor (Tier 1)", "Subcontractor (Tier 2+)", "IDIQ / Task Order", "Multiple"] },
      { key: "cuiScope", label: "CUI Handling Scope", type: "select", options: ["Handles CUI daily (core to operations)", "Handles CUI occasionally", "CUI is in a defined enclave only", "Not currently handling CUI"] },
      { key: "timeline", label: "Compliance Timeline", type: "select", options: ["Need certification in < 6 months", "6-12 months", "12-24 months", "Exploring / no hard deadline"] },
    ];
    const complete = fields.every(f => profile[f.key]);
    const sizecat = profile.size ? getSizeCategory(profile.size) : null;

    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <div style={S.hdr}>
          <div style={S.badge}>CMMC 2.0</div>
          <span style={{ fontSize: "11px", color: "#1e293b" }}>COMPANY PROFILE</span>
        </div>
        <div style={S.wrap}>
          <div style={{ paddingTop: "14px", marginBottom: "20px" }}>
            <div style={S.tag}>STEP 1 — PROFILE</div>
            <div style={{ ...S.h1, fontSize: "19px" }}>Tell us about your organization</div>
            <div style={S.sub}>Your answers shape which questions you receive and what remediation advice appears in your report.</div>
          </div>

          {sizecat && (
            <div style={{ ...S.card, background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)", padding: "12px", marginBottom: "14px" }}>
              <div style={{ fontSize: "11px", color: "#60a5fa", letterSpacing: "0.08em" }}>
                {sizecat === "solo" && "◈ SOLO OPERATOR MODE — Questions tailored for a 1-person shop. No enterprise jargon."}
                {sizecat === "small" && "◈ SMALL TEAM MODE — Questions calibrated for a lean team environment."}
                {sizecat === "enterprise" && "◈ ENTERPRISE MODE — Full CMMC Level 2 control set with enterprise tooling context."}
              </div>
            </div>
          )}

          <div style={S.card}>
            {fields.map(f => (
              <div key={f.key} style={{ marginBottom: "18px" }}>
                <label style={S.lbl}>{f.label}</label>
                {f.type === "select" ? (
                  <select style={{ ...S.inp, appearance: "none" }} value={profile[f.key]} onChange={e => setProfile({ ...profile, [f.key]: e.target.value })}>
                    <option value="">— Select —</option>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input style={S.inp} type="text" placeholder={f.placeholder} value={profile[f.key]} onChange={e => setProfile({ ...profile, [f.key]: e.target.value })} />
                )}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
            <button style={S.ghost} onClick={() => setStep("intro")}>← Back</button>
            <button style={{ ...S.btn, opacity: complete ? 1 : 0.35, cursor: complete ? "pointer" : "not-allowed" }} onClick={() => complete && startAssessment()}>
              START ASSESSMENT →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DOMAINS
  if (step === "domains" && domain) {
    const domainDone = domain.questions.every(q => answers[q.id]);
    const allDone = answeredQs === totalQs;

    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <div style={S.hdr}>
          <div style={S.badge}>CMMC 2.0</div>
          <span style={{ fontSize: "11px", color: "#1e293b" }}>{domain.id} · {domain.name.toUpperCase()}</span>
          <div style={{ marginLeft: "auto", fontSize: "10px", color: "#1e293b" }}>{answeredQs}/{totalQs}</div>
        </div>
        <div style={{ height: "2px", background: "rgba(96,165,250,0.08)" }}>
          <div style={{ height: "2px", width: `${(idx / domains.length) * 100}%`, background: "linear-gradient(90deg,#1d4ed8,#60a5fa)", transition: "width 0.4s" }} />
        </div>
        <div style={S.wrap}>
          <div style={{ paddingTop: "14px", marginBottom: "20px" }}>
            <div style={S.tag}>DOMAIN {idx + 1} OF {domains.length}</div>
            <div style={{ fontSize: "21px", fontWeight: "700", color: "#f1f5f9", marginBottom: "4px" }}>{domain.icon} {domain.name}</div>
            <div style={{ fontSize: "12px", color: "#475569" }}>{domain.desc}</div>
          </div>

          {domain.questions.map(q => (
            <div key={q.id} style={{ ...S.card, padding: "16px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ fontSize: "9px", color: "#1e293b", minWidth: "28px", paddingTop: "2px", letterSpacing: "0.05em" }}>{q.id}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.5", marginBottom: "12px" }}>{q.text}</div>
                  <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                    {ANSWER_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => setAnswers({ ...answers, [q.id]: opt.value })} style={{
                        padding: "5px 13px", fontSize: "11px", fontFamily: "'IBM Plex Mono',monospace", fontWeight: "700",
                        letterSpacing: "0.07em", cursor: "pointer", transition: "all 0.12s",
                        border: answers[q.id] === opt.value ? `1px solid ${opt.color}` : "1px solid rgba(100,116,139,0.18)",
                        background: answers[q.id] === opt.value ? opt.bg : "transparent",
                        color: answers[q.id] === opt.value ? opt.color : "#334155",
                      }}>{opt.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {error && <div style={{ color: "#ef4444", fontSize: "12px", padding: "10px", border: "1px solid rgba(239,68,68,0.22)", background: "rgba(239,68,68,0.05)", marginBottom: "14px" }}>{error}</div>}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "18px" }}>
            <button style={S.ghost} onClick={() => idx > 0 ? setIdx(idx - 1) : setStep("profile")}>← Previous</button>
            {idx < domains.length - 1 ? (
              <button style={{ ...S.btn, opacity: domainDone ? 1 : 0.35, cursor: domainDone ? "pointer" : "not-allowed" }} onClick={() => domainDone && setIdx(idx + 1)}>
                NEXT DOMAIN →
              </button>
            ) : (
              <button style={{ ...S.btn, background: "#16a34a", opacity: allDone ? 1 : 0.35, cursor: allDone ? "pointer" : "not-allowed" }} onClick={() => allDone && generate()}>
                GENERATE REPORT →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // LOADING
  if (step === "loading") return (
    <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.25}}`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "16px", animation: "blink 1.4s infinite" }}>⚙️</div>
        <div style={{ fontSize: "11px", color: "#60a5fa", letterSpacing: "0.18em", marginBottom: "8px" }}>ANALYZING ASSESSMENT DATA</div>
        <div style={{ fontSize: "11px", color: "#1e293b" }}>Building your tailored gap report...</div>
      </div>
    </div>
  );

  // RESULTS
  if (step === "results") {
    const score = overallScore(domains, answers);
    const r = risk(score);

    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <div style={S.hdr}>
          <div style={S.badge}>CMMC 2.0</div>
          <span style={{ fontSize: "11px", color: "#1e293b" }}>GAP ASSESSMENT REPORT</span>
          <div style={{ marginLeft: "auto", fontSize: "10px", color: "#1e293b" }}>{profile.company} · {new Date().toLocaleDateString()}</div>
        </div>
        <div style={S.wrap}>
          <div style={{ ...S.card, display: "flex", alignItems: "center", gap: "22px", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center", minWidth: "75px" }}>
              <div style={{ fontSize: "46px", fontWeight: "700", color: r.color, lineHeight: "1" }}>{score}%</div>
              <div style={{ fontSize: "9px", color: "#334155", letterSpacing: "0.1em", marginTop: "3px" }}>OVERALL</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", color: r.color, letterSpacing: "0.15em", marginBottom: "3px" }}>◈ {r.label}</div>
              <div style={{ fontSize: "11px", color: "#475569" }}>{profile.company} · {profile.size} · {profile.contractType}</div>
            </div>
            <button style={S.ghost} onClick={() => window.print()}>⬇ EXPORT</button>
          </div>

          <div style={S.card}>
            <div style={{ fontSize: "9px", color: "#3b82f6", letterSpacing: "0.18em", marginBottom: "16px" }}>DOMAIN SCORES</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {domains.map(d => {
                const sc = domainScore(d, answers);
                const rk = risk(sc);
                return (
                  <div key={d.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ fontSize: "15px" }}>{d.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "10px", color: "#475569" }}>{d.name}</span>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: rk.color }}>{sc}%</span>
                      </div>
                      <div style={{ height: "3px", background: "rgba(100,116,139,0.12)" }}>
                        <div style={{ height: "3px", width: `${sc}%`, background: rk.color, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={S.card}>
            <div style={{ fontSize: "9px", color: "#3b82f6", letterSpacing: "0.18em", marginBottom: "16px" }}>AI-GENERATED GAP ANALYSIS</div>
            <div style={{ whiteSpace: "pre-wrap", fontSize: "12px", color: "#94a3b8", lineHeight: "1.75" }}>{report}</div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button style={S.ghost} onClick={() => { setIdx(0); setAnswers({}); setStep("domains"); }}>← Retake</button>
            <button style={S.btn} onClick={() => { setAnswers({}); setReport(""); setDomains([]); setProfile({ company: "", size: "", contractType: "", cuiScope: "", timeline: "" }); setStep("intro"); }}>
              NEW ASSESSMENT
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
