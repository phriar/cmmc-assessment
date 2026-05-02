import { useState } from "react";

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

const FIXES = {
  AC1: { solo: "Set a strong Mac login password: System Settings → Login Password. Enable auto-lock after 5 min of inactivity. Never share your login.", small: "Audit all accounts. Remove shared credentials. One unique account per employee, documented.", enterprise: "Implement IAM provisioning (Okta, Azure AD) tied to HR. Audit accounts quarterly." },
  AC2: { solo: "If you only work locally and never remote in, this may not apply. If you do remote in, use a commercial VPN (Mullvad, ProtonVPN) with MFA enabled on the VPN account.", small: "Deploy a business VPN (WireGuard, Cisco AnyConnect) with MFA enforced for all remote sessions.", enterprise: "Enforce VPN + MFA via conditional access. Implement ZTNA for privileged remote sessions. Log all remote access." },
  AC3: { solo: "Use a dedicated work browser profile or separate browser. Never use personal email for work file sharing. Keep all client portal credentials in a password manager, not mixed with personal accounts.", small: "Implement RBAC. Document which role gets which access. Review permissions quarterly.", enterprise: "Enforce RBAC via IdP groups. Automate access reviews with SailPoint or Okta Access Certifications." },
  AC4: { solo: "Write a one-paragraph offboarding checklist: revoke portal access, change any shared passwords, remove from shared drives. Run it the day any relationship ends.", small: "Create a formal offboarding SOP. Assign an owner. Tie it to HR. Test it on the next departure.", enterprise: "Automate offboarding via HR-to-IdP triggers. Enforce 24-hour revocation SLA. Audit monthly." },
  AC5: { solo: "Store CUI in an encrypted folder (VeraCrypt is free) or a password-protected encrypted container. Only share via auditable means — not personal Dropbox or Gmail.", small: "Implement need-to-know access controls on your CUI repository. Document who has access and why.", enterprise: "Implement DLP and access-controlled CUI repositories. Log all access. Enforce zero-trust model." },
  IA1: { solo: "Use Bitwarden (free) to generate and store unique passwords for every account. Never reuse a password across sites. Takes 20 minutes to set up and saves hours of breach cleanup.", small: "Mandate a company password manager (1Password Teams or Bitwarden Business). Audit for shared/reused credentials.", enterprise: "Enforce unique credentials via IdP. Audit service and shared accounts. Rotate all shared passwords to service accounts." },
  IA2: { solo: "Enable MFA on every work account — start with email, then any client portals. Use an authenticator app (Authy, Google Authenticator) — not SMS. Free and takes 5 minutes per account.", small: "Enforce MFA via your IdP (Okta, Azure AD, Duo) for all users. Prioritize admin accounts and remote access.", enterprise: "Enforce MFA via conditional access. Use hardware keys (YubiKey) for privileged accounts. Disable SMS MFA." },
  IA3: { solo: "Bitwarden generates strong 16+ character passwords automatically. Enable it in your browser. Your master password should be a strong passphrase you'll actually remember.", small: "Enforce password policy via GPO or IdP: 12+ chars, complexity, 90-day rotation for privileged accounts.", enterprise: "Enforce via technical controls (Azure AD Password Protection, GPO). Block common passwords. Implement privileged account rotation." },
  IA4: { solo: "Log into your home router admin page and change the default password if you haven't. Do the same for any NAS, printer, or smart device you use near your work setup.", small: "Build a device provisioning checklist with credential reset as step one. Audit existing devices for defaults.", enterprise: "Automate credential rotation on provisioning via Ansible or SCCM. Scan for default creds with Nessus or Shodan." },
  IA5: { solo: "Mac: System Settings → Lock Screen → set to lock after 5 minutes of inactivity. Require password immediately after sleep. Takes 30 seconds to configure.", small: "Enforce session timeouts and account lockout policies via GPO or MDM. Test that lockout triggers correctly.", enterprise: "Enforce via technical controls across all systems. Lockout after 5 attempts, 30-min lockout, admin unlock required." },
  CM1: { solo: "Create a simple spreadsheet listing your work laptop model/serial number, any external drives, and key software. One page is fine. Update it when things change.", small: "Use a free asset inventory tool (Snipe-IT, Lansweeper free tier) to track hardware and software. Assign an owner.", enterprise: "Deploy a CMDB (ServiceNow, Freshservice). Integrate with endpoint management for auto-discovery. Reconcile quarterly." },
  CM2: { solo: "On Mac: enable FileVault (System Settings → Privacy & Security), turn on the firewall, and remove software you don't use for work. That's a solid baseline.", small: "Document a hardening checklist for each system type. Start with CIS Benchmarks (free at cisecurity.org).", enterprise: "Automate baseline enforcement via DSC, Ansible, or SCCM. Use a compliance scanner (Nessus, Rapid7) to verify adherence." },
  CM3: { solo: "Simple rule: only install software from the Mac App Store or directly from a vendor's official website. When in doubt, don't install it on your work machine.", small: "Create a simple change request process — even a Slack channel where changes are proposed and approved before being made.", enterprise: "Implement a formal CAB process with documented change tickets, risk assessment, and rollback plans." },
  CM4: { solo: "Mac: System Settings → General → Login Items — remove anything unfamiliar. System Settings → Sharing — disable any services you don't actively use.", small: "Run nmap against your systems. Disable open ports not required for business. Document what's open and why.", enterprise: "Implement application whitelisting (Carbon Black, Airlock). Block USB ports on CUI endpoints. Enforce via MDM/GPO." },
  CM5: { solo: "Once a quarter, open your Applications folder and uninstall anything unused. Check browser extensions — remove anything you didn't intentionally install.", small: "Use your ticketing system or a simple log to track changes. Require a note with every change: what, when, who, why.", enterprise: "Deploy a configuration compliance tool (Tripwire, Chef Compliance). Alert on unauthorized changes. Review weekly." },
  IR1: { solo: "Write a one-page plan right now: (1) disconnect from internet, (2) call your prime/client, (3) report to DCSA at dibnet.dod.mil within 72 hours, (4) preserve logs — don't wipe the machine. Print it.", small: "Document an IRP with roles, contact list, and step-by-step procedures. Store it somewhere accessible even if systems are down.", enterprise: "Develop a full IRP aligned to NIST SP 800-61. Include runbooks per incident type. Store offline. Get legal review." },
  IR2: { solo: "Bookmark dibnet.dod.mil right now — that's the DCSA incident reporting portal. You have 72 hours. Also know who your prime contractor's security POC is before you need them.", small: "Document the DCSA reporting process. Assign a named person responsible for it. Do a dry run so you know how long it takes.", enterprise: "Build a 72-hour notification workflow with templates, escalation contacts, and a legal review step. Test annually." },
  IR3: { solo: "Save your prime contractor's security POC phone number in your phone contacts right now. Know who to call before something happens.", small: "Assign named IR roles to specific people. Create a contact card with personal cell numbers. Store it offline.", enterprise: "Define primary and backup IR roles with 24/7 contact info. Integrate with MSSP if applicable. Test escalation quarterly." },
  IR4: { solo: "Set up Backblaze ($9/month) or iCloud Drive for automatic off-machine backups. Test it today by actually restoring a file — a backup you haven't tested isn't a backup.", small: "Schedule an annual tabletop exercise. Scenario: ransomware hits your file server. Walk through your IRP and find the gaps.", enterprise: "Conduct annual tabletop and biennial live-fire exercises. Document results and track remediation to closure." },
  IR5: { solo: "If something happens, don't wipe your machine immediately. Take screenshots, export logs, write down a timeline of what you noticed and when — then report to DCSA.", small: "Define a log retention and evidence preservation policy. Train staff not to wipe affected systems before preservation.", enterprise: "Deploy SIEM for automatic log preservation. Define evidence collection runbooks. Train IR team on chain of custody." },
  RA1: { solo: "Spend 30 minutes asking: what's my worst case? Laptop stolen, email hacked, client portal breached? Write down the top 3 scenarios and what you'd do. That's your risk assessment.", small: "Use NIST's free risk assessment guide (SP 800-30). Document threats, likelihood, impact, and mitigations. Update annually.", enterprise: "Implement a formal GRC tool (ServiceNow GRC, RiskLens). Tie risk assessments to business objectives. Present to leadership annually." },
  RA2: { solo: "Download Nessus Essentials (free for up to 16 IPs) and scan your work machine. Or use Microsoft Defender Vulnerability Management if on Windows — it's built in.", small: "Schedule monthly vulnerability scans (Nessus, Qualys, Rapid7). Track findings in a spreadsheet. Remediate criticals within 14 days.", enterprise: "Automate scanning via enterprise scanner. Feed results into a vuln management platform. Enforce SLA-based remediation tracking." },
  RA3: { solo: "Before signing up for any new work tool: check if they have SOC 2 Type II certification, review their privacy policy, and ask yourself if your client would be comfortable knowing you use it.", small: "Build a vendor review checklist: SOC 2 cert? Data handling policy? Can they handle CUI? 15-minute review before any new tool.", enterprise: "Implement formal TPRM. Require SOC 2 or equivalent from all vendors. Review annually and before contract renewal." },
  RA4: { solo: "Keep a running list in Notes or a spreadsheet of security things you know you should fix. Put a target date next to each one. Review it monthly.", small: "Maintain a risk register in a shared doc or spreadsheet. Assign each item an owner and a due date. Review monthly.", enterprise: "Use a GRC platform for the risk register. Tie items to control frameworks. Escalate overdue items to leadership." },
  RA5: { solo: "If any vendor or subcontractor can see your CUI or access your systems, ask them: do you have a System Security Plan or CMMC certification? If they look confused, that's your answer.", small: "Add a vendor security questionnaire to your procurement process. Require evidence of security controls from anyone with system access.", enterprise: "Implement a formal TPRM program with annual vendor assessments, contractual security requirements, and right-to-audit clauses." },
  SI1: { solo: "On Mac: Malwarebytes Free is excellent. On Windows: Microsoft Defender is built-in and good to start. Check right now that it's on and up to date — open it and verify.", small: "Deploy centrally-managed EDR (CrowdStrike Falcon Go, SentinelOne, or Defender for Business at ~$3/user/mo). Ensure full endpoint coverage.", enterprise: "Deploy enterprise EDR with 24/7 SOC monitoring. Ensure 100% endpoint coverage. Alert on any unprotected endpoints." },
  SI2: { solo: "Mac: System Settings → General → Software Update → enable all automatic options. For third-party software like browsers and productivity tools, check for updates weekly.", small: "Implement patch management (WSUS, Intune, Jamf). Define SLAs: 30 days standard, 14 days critical. Track compliance monthly.", enterprise: "Automate patch deployment via SCCM/Intune. Enforce SLAs technically. Report patch compliance to leadership monthly." },
  SI3: { solo: "Your AV handles most of this. Also enable Mac's built-in tamper protection and periodically review your login items for anything you didn't install.", small: "Enable file integrity monitoring on critical systems (OSSEC is free). Alert on unexpected changes to system files or configs.", enterprise: "Deploy FIM (Tripwire, AIDE) on all CUI-handling systems. Integrate alerts into SIEM. Review daily." },
  SI4: { solo: "When Malwarebytes or Defender flags something, don't dismiss it — read it. Google the detection name if unfamiliar. Act the same day, not next week.", small: "Define an alert triage process. Assign someone to review security alerts daily. Document response actions taken.", enterprise: "Route all alerts to SIEM. Define triage SLAs by severity. Require documented response for every alert. Report metrics monthly." },
  SI5: { solo: "Subscribe to CISA's free email alerts at cisa.gov/news-events/cybersecurity-advisories. Takes 2 minutes. Read the advisories relevant to software you actually use.", small: "Subscribe your security lead to CISA advisories and relevant vendor security bulletins. Build a process to act on them within defined SLAs.", enterprise: "Operationalize threat intel feeds into SIEM detection rules. Subscribe to relevant ISACs. Review intel weekly." },
  AU1: { solo: "On Mac, Unified Logging is on by default. For cloud services (Microsoft 365, Google Workspace), go into security settings and enable audit logging — it's usually just a toggle.", small: "Audit your key systems and enable logging everywhere available. Prioritize systems that touch CUI. Document what's logging and what isn't.", enterprise: "Deploy a SIEM (Splunk, Microsoft Sentinel, Elastic). Ensure all systems ship logs centrally. Identify and remediate coverage gaps." },
  AU2: { solo: "For Microsoft 365, audit log retention is 90 days on E3+. For local logs, configure Time Machine to an external drive or a cloud backup. Verify the retention period in your settings.", small: "Configure log retention policies in your systems. Store logs to a write-protected location. Document your retention schedule.", enterprise: "Enforce log retention via SIEM policy. Use immutable storage (S3 Object Lock, Azure Immutable Blob). Archive after 90 days online." },
  AU3: { solo: "Once a month, check your email and cloud service sign-in history for logins from unexpected locations or times. Most services show this under account security settings.", small: "Set up automated alerts for failed logins and after-hours access. Assign someone to review alerts daily.", enterprise: "Implement automated log correlation in SIEM. Create detection rules for anomalous access patterns. Review daily." },
  AU4: { solo: "In Gmail or Outlook, enable alerts for sign-ins from new devices or locations. Takes 2 minutes in account security settings. Do it right now.", small: "Enable account lockout and alert on failed logins via your IdP or AD. Route alerts to your security lead.", enterprise: "Implement SIEM correlation rules for brute force, privilege escalation, and lateral movement. Alert in real time." },
  AU5: { solo: "Check your cloud service log retention settings periodically. For Microsoft 365, the audit log portal shows usage. Set a quarterly calendar reminder to verify nothing is being auto-deleted.", small: "Monitor log storage capacity monthly. Set alerts at 80% capacity. Size storage for 90+ days of retention.", enterprise: "Implement automated capacity monitoring with alerts. Automate log archiving before limits are hit. Review quarterly." },
  SC1: { solo: "Check that any file transfer or client communication uses HTTPS. Never send CUI over plain email. Use encrypted email (ProtonMail) or secure file sharing (OneDrive with encryption, ShareFile).", small: "Audit your communication channels. Enforce HTTPS everywhere. Use a secure file transfer solution for CUI (SFTP, ShareFile, or encrypted cloud storage).", enterprise: "Enforce TLS 1.2+ via web proxy and network policy. Disable legacy protocols via GPO. Scan for cleartext traffic quarterly." },
  SC2: { solo: "Enable FileVault right now if it's not on: System Settings → Privacy & Security → FileVault → Turn On. Takes a few hours to encrypt in the background. This is non-negotiable for any laptop handling CUI.", small: "Enforce full disk encryption on all laptops (FileVault, BitLocker) via MDM. Verify compliance monthly. Extend to external drives.", enterprise: "Enforce encryption at rest via MDM/GPO. Extend to servers and cloud storage. Scan for unencrypted data stores quarterly." },
  SC3: { solo: "On your home router, create a separate Guest WiFi and put personal devices (TVs, gaming consoles, phones) on it. Keep your work laptop on the main network by itself. Most routers have this built in.", small: "Implement VLANs to separate CUI systems from general office traffic. Use a firewall to enforce inter-VLAN rules.", enterprise: "Implement microsegmentation via SDN or VLAN policies. Enforce firewall rules between all segments. Document and review quarterly." },
  SC4: { solo: "Change your Mac DNS to Cloudflare's security DNS: System Settings → Network → your connection → DNS → add 1.1.1.2 and 1.0.0.2. Free, takes 2 minutes, blocks known malicious domains automatically.", small: "Deploy DNS filtering (Cisco Umbrella, Cloudflare Gateway, or Pi-hole) for all office traffic. Block known malicious and phishing domains.", enterprise: "Enforce DNS filtering at the network level. Integrate threat intel feeds. Monitor and review blocked queries weekly." },
  SC5: { solo: "Make sure your phone has a PIN or Face ID enabled and that full device encryption is on (default on modern iOS/Android). Don't access CUI from a device that's not PIN-protected.", small: "Deploy MDM (Microsoft Intune, Jamf) to enforce encryption, PIN, and remote wipe on all mobile devices used for work.", enterprise: "Enforce MDM compliance policies. Block email/CUI access from non-compliant devices via conditional access. Audit enrollment monthly." },
};

function buildDomains(profile) {
  const size = getSizeCategory(profile.size);
  const cui  = getCUILevel(profile.cuiScope);
  const isPrime = profile.contractType?.includes("Prime");

  return [
    {
      id: "AC", name: "Access Control", icon: "🔐",
      desc: size === "solo" ? "Who can get into your work machine and accounts?" : "Who can access your systems and CUI data?",
      questions: size === "solo" ? [
        { id: "AC1", text: "Is your work computer protected by a strong password or PIN (not shared with anyone)?" },
        { id: "AC2", text: "Do you ever remotely access client systems or CUI from outside your primary workspace?", naHint: "Mark N/A if you only work locally and never remote into client environments." },
        { id: "AC3", text: "Are your client portals and work accounts completely separate from your personal accounts?" },
        { id: "AC4", text: "If a client relationship ended today, could you immediately revoke all access to any shared resources?" },
        { id: "AC5", text: cui === "heavy" ? "Is access to CUI files restricted so only you (and authorized clients) can open them?" : "Do you limit who can view or download sensitive work files?" },
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
      id: "IA", name: "Identification & Authentication", icon: "🪪",
      desc: size === "solo" ? "Can you prove your identity to the systems you access?" : "Can you verify every user is who they say they are?",
      questions: size === "solo" ? [
        { id: "IA1", text: "Do all your work accounts use unique passwords (not reused across sites)?" },
        { id: "IA2", text: "Is MFA enabled on your email, and any client portals you access?" },
        { id: "IA3", text: "Are your passwords at least 12 characters and stored in a password manager?" },
        { id: "IA4", text: "Have you changed all default passwords on your router and work-related devices?" },
        { id: "IA5", text: "Does your computer lock automatically after a period of inactivity?" },
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
        { id: "IA4", text: "Is there a documented process to audit and rotate credentials for service accounts?" },
        { id: "IA5", text: "Are account lockout thresholds, session timeouts, and re-auth requirements technically enforced?" },
      ],
    },
    {
      id: "CM", name: "Configuration Management", icon: "⚙️",
      desc: size === "solo" ? "Is your work computer set up securely and kept that way?" : "Are your systems built and maintained securely?",
      questions: size === "solo" ? [
        { id: "CM1", text: "Do you have a documented list of the hardware and software you use for work?" },
        { id: "CM2", text: "Is your laptop configured per a security baseline (firewall on, disk encryption enabled, no unnecessary software)?" },
        { id: "CM3", text: "Do you avoid installing personal or untrusted software on your primary work machine?" },
        { id: "CM4", text: "Have you disabled services or features on your machine that you don't need for work?" },
        { id: "CM5", text: "Do you periodically review and remove unused software, accounts, or browser extensions?" },
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
      id: "IR", name: "Incident Response", icon: "🚨",
      desc: size === "solo" ? "If your system got hacked today, do you know exactly what to do?" : "When something goes wrong, does your team have a plan?",
      questions: size === "solo" ? [
        { id: "IR1", text: "Do you have a written plan for what to do if your work computer is compromised or stolen?" },
        { id: "IR2", text: "Do you know how to report a cybersecurity incident to DCSA within 72 hours if CUI is involved?" },
        { id: "IR3", text: isPrime ? "Have you briefed any subcontractors on incident reporting requirements?" : "Do you know your prime contractor's incident escalation contact and reporting process?" },
        { id: "IR4", text: "Do you have recent, tested backups of all work data stored separately from your main machine?" },
        { id: "IR5", text: "Have you reviewed your IR plan in the last 12 months?" },
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
      id: "RA", name: "Risk Assessment", icon: "📊",
      desc: size === "solo" ? "Do you know where you're most exposed?" : "Do you systematically find and fix your weakest points?",
      questions: size === "solo" ? [
        { id: "RA1", text: "Have you ever assessed what would happen if your laptop was lost, stolen, or hacked?" },
        { id: "RA2", text: "Do you run any tool to check your machine for known vulnerabilities or misconfigurations?" },
        { id: "RA3", text: "Before adopting a new tool or cloud service for work, do you evaluate its security and data handling practices?" },
        { id: "RA4", text: "Do you track known security weaknesses with a plan and deadline to fix them?" },
        { id: "RA5", text: "Have you reviewed the security practices of any vendors or subcontractors who can access your CUI?", naHint: "Mark N/A if you have no vendors or subcontractors with access to your systems." },
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
        { id: "RA5", text: "Is a TPRM program in place covering all vendors with CUI access?" },
      ],
    },
    {
      id: "SI", name: "System & Info Integrity", icon: "🛡️",
      desc: size === "solo" ? "Is your machine protected against malware and threats right now?" : "Are your systems actively protected against threats?",
      questions: size === "solo" ? [
        { id: "SI1", text: "Do you have antivirus or endpoint protection actively running on your work machine?" },
        { id: "SI2", text: "Are OS and software updates installed promptly — within 2 weeks for critical patches?" },
        { id: "SI3", text: "Do you have any alerts set up to notify you of suspicious activity on your accounts or machine?" },
        { id: "SI4", text: "Do you review and act on security alerts the same day they occur?" },
        { id: "SI5", text: "Do you subscribe to CISA alerts or similar threat intel relevant to your work?" },
      ] : size === "small" ? [
        { id: "SI1", text: "Is antivirus or EDR deployed and actively monitored on all endpoints?" },
        { id: "SI2", text: "Are security patches applied within 30 days (14 days for critical) across all systems?" },
        { id: "SI3", text: "Is there monitoring in place to detect unauthorized changes or malicious code on systems?" },
        { id: "SI4", text: "Are security alerts reviewed and acted on within a defined response timeframe?" },
        { id: "SI5", text: "Does your team receive and act on threat intelligence (CISA advisories, vendor bulletins)?" },
      ] : [
        { id: "SI1", text: "Is EDR deployed enterprise-wide with centralized management and 24/7 alert monitoring?" },
        { id: "SI2", text: "Is patch management automated with enforced SLAs: 30 days standard, 14 days critical?" },
        { id: "SI3", text: "Is file integrity monitoring (FIM) in place on all systems that process or store CUI?" },
        { id: "SI4", text: "Are security alerts triaged through a formal SOC process with documented response SLAs?" },
        { id: "SI5", text: "Is threat intelligence operationalized — feeding into detection rules, not just distributed via email?" },
      ],
    },
    {
      id: "AU", name: "Audit & Accountability", icon: "📋",
      desc: size === "solo" ? "Can you prove what happened on your systems if asked?" : "Can you reconstruct any security event from your logs?",
      questions: size === "solo" ? [
        { id: "AU1", text: "Are activity/audit logs enabled on your work machine and cloud services you use for CUI?" },
        { id: "AU2", text: "Are logs stored somewhere separate from your main machine for at least 90 days?" },
        { id: "AU3", text: "Do you periodically review account activity or access logs for unexpected events?" },
        { id: "AU4", text: "Do your accounts alert you on failed logins or access from unrecognized locations?" },
        { id: "AU5", text: "Is your log storage sufficient that audit history isn't auto-deleted before 90 days?" },
      ] : size === "small" ? [
        { id: "AU1", text: "Are audit logs enabled on all systems that store, process, or transmit CUI?" },
        { id: "AU2", text: "Are logs protected from modification and retained for a minimum of 90 days?" },
        { id: "AU3", text: "Is log review performed on a regular schedule — automated alerting or manual review?" },
        { id: "AU4", text: "Are failed logins and privilege escalations automatically logged and alerted?" },
        { id: "AU5", text: "Is log storage sized to prevent gaps — no silent rotation or overwrite before retention period?" },
      ] : [
        { id: "AU1", text: "Are audit logs collected centrally (SIEM) from all endpoints, servers, network devices, and apps?" },
        { id: "AU2", text: "Are logs write-protected, integrity-verified, and retained per policy (90 days online, 1 year archive)?" },
        { id: "AU3", text: "Are automated correlation rules in place to detect anomalous patterns across log sources?" },
        { id: "AU4", text: "Are privileged user actions, account changes, and CUI access events logged and reviewed?" },
        { id: "AU5", text: "Is log capacity monitored with automated alerting before storage limits are reached?" },
      ],
    },
    {
      id: "SC", name: "System & Comms Protection", icon: "🌐",
      desc: size === "solo" ? "Is your data protected when it moves and when it sits still?" : "Is data protected in transit and at rest?",
      questions: size === "solo" ? [
        { id: "SC1", text: "Is all CUI sent over encrypted connections (HTTPS, encrypted email, secure file transfer — never plain FTP or unencrypted email)?" },
        { id: "SC2", text: "Is your laptop's hard drive encrypted (FileVault on Mac, BitLocker on Windows)?" },
        { id: "SC3", text: "Is your work network separated from personal or household devices when handling CUI?", naHint: "Mark N/A if you work in a dedicated office space with no personal devices on the same network." },
        { id: "SC4", text: "Do you use a security-focused DNS server to block malicious domains (e.g. Cloudflare 1.1.1.2)?" },
        { id: "SC5", text: "If you access work systems from a mobile device, is it encrypted and PIN/biometric protected?", naHint: "Mark N/A if you never access work systems or CUI from a mobile device." },
      ] : size === "small" ? [
        { id: "SC1", text: "Is CUI encrypted in transit using TLS 1.2+ across all internal and external communications?" },
        { id: "SC2", text: "Is CUI encrypted at rest on all laptops, servers, and removable media?" },
        { id: "SC3", text: "Are internal networks segmented to isolate CUI systems from general business traffic?" },
        { id: "SC4", text: "Is DNS/web filtering deployed to block known malicious domains for all users?" },
        { id: "SC5", text: "Are mobile devices managed via MDM, encrypted, and required to use PINs or biometrics?" },
      ] : [
        { id: "SC1", text: "Is TLS 1.2+ enforced via policy — with TLS 1.0/1.1 and SSL disabled across all systems?" },
        { id: "SC2", text: "Is encryption at rest enforced via technical controls for all CUI data stores and endpoints?" },
        { id: "SC3", text: "Is network segmentation enforced via firewall policy with CUI systems in dedicated VLANs?" },
        { id: "SC4", text: "Is DNS filtering enforced at the network level — not just browser-based — for all endpoints?" },
        { id: "SC5", text: "Is a formal MDM solution enforcing encryption, remote wipe, and compliance on all mobile devices?" },
      ],
    },
  ];
}

const ANSWER_OPTIONS = [
  { value: "yes",     label: "Yes",     color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
  { value: "partial", label: "Partial", color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  { value: "no",      label: "No",      color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
  { value: "na",      label: "N/A",     color: "#64748b", bg: "rgba(100,116,139,0.1)" },
];
const WEIGHTS = { yes: 1, partial: 0.5, no: 0, na: null };

function domainScore(d, answers) {
  const applicable = d.questions.filter(q => answers[q.id] !== "na");
  if (!applicable.length) return 100;
  return Math.round(applicable.reduce((s, q) => s + (WEIGHTS[answers[q.id]] ?? 0), 0) / applicable.length * 100);
}
function overallScore(domains, answers) {
  const applicable = domains.flatMap(d => d.questions).filter(q => answers[q.id] !== "na");
  if (!applicable.length) return 100;
  return Math.round(applicable.reduce((s, q) => s + (WEIGHTS[answers[q.id]] ?? 0), 0) / applicable.length * 100);
}
function risk(score) {
  if (score >= 80) return { label: "LOW RISK",      color: "#22c55e" };
  if (score >= 55) return { label: "MODERATE RISK", color: "#f59e0b" };
  if (score >= 30) return { label: "HIGH RISK",     color: "#ef4444" };
  return             { label: "CRITICAL RISK",  color: "#dc2626" };
}

const S = {
  app:   { minHeight: "100vh", background: "#060b16", color: "#e2e8f0", fontFamily: "'IBM Plex Mono', monospace" },
  hdr:   { borderBottom: "1px solid rgba(96,165,250,0.12)", padding: "13px 22px", display: "flex", alignItems: "center", gap: "12px", background: "rgba(6,11,22,0.97)", position: "sticky", top: 0, zIndex: 10 },
  badge: { background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.28)", color: "#60a5fa", fontSize: "10px", padding: "3px 8px", letterSpacing: "0.15em", fontWeight: "700" },
  wrap:  { maxWidth: "760px", margin: "0 auto", padding: "28px 18px" },
  card:  { background: "rgba(13,22,45,0.8)", border: "1px solid rgba(96,165,250,0.1)", padding: "22px", marginBottom: "12px" },
  h1:    { fontSize: "25px", fontWeight: "700", color: "#f1f5f9", letterSpacing: "-0.02em", lineHeight: "1.25", marginBottom: "10px" },
  sub:   { color: "#64748b", fontSize: "13px", lineHeight: "1.6", marginBottom: "22px" },
  lbl:   { fontSize: "10px", color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: "5px" },
  inp:   { background: "rgba(6,11,22,0.9)", border: "1px solid rgba(96,165,250,0.16)", color: "#e2e8f0", padding: "9px 12px", fontSize: "12px", fontFamily: "'IBM Plex Mono',monospace", width: "100%", boxSizing: "border-box", outline: "none" },
  btn:   { background: "#2563eb", color: "#fff", border: "none", padding: "10px 24px", fontSize: "12px", fontFamily: "'IBM Plex Mono',monospace", fontWeight: "700", letterSpacing: "0.1em", cursor: "pointer" },
  ghost: { background: "transparent", color: "#64748b", border: "1px solid rgba(100,116,139,0.22)", padding: "9px 18px", fontSize: "12px", fontFamily: "'IBM Plex Mono',monospace", cursor: "pointer" },
  tag:   { display: "inline-block", fontSize: "9px", padding: "2px 8px", border: "1px solid rgba(96,165,250,0.18)", color: "#60a5fa", letterSpacing: "0.12em", marginBottom: "12px" },
};

function FixTip({ qid, answer, sizecat }) {
  if (answer !== "no" && answer !== "partial") return null;
  const key = sizecat === "solo" ? "solo" : sizecat === "small" ? "small" : "enterprise";
  const tip = FIXES[qid]?.[key];
  if (!tip) return null;
  const color = answer === "no" ? "#ef4444" : "#f59e0b";
  const bg    = answer === "no" ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)";
  return (
    <div style={{ marginTop: "10px", padding: "10px 12px", background: bg, borderLeft: `3px solid ${color}`, border: `1px solid ${color}22` }}>
      <div style={{ fontSize: "9px", color, letterSpacing: "0.12em", marginBottom: "5px", fontWeight: "700" }}>
        {answer === "no" ? "◈ RECOMMENDED FIX" : "◈ COMPLETE THIS"}
      </div>
      <div style={{ fontSize: "11px", color: "#94a3b8", lineHeight: "1.65" }}>{tip}</div>
    </div>
  );
}

function NAHint({ hint }) {
  if (!hint) return null;
  return <div style={{ fontSize: "10px", color: "#334155", marginTop: "6px" }}>{hint}</div>;
}

export default function App() {
  const [step, setStep]       = useState("intro");
  const [profile, setProfile] = useState({ company: "", size: "", contractType: "", cuiScope: "", timeline: "" });
  const [domains, setDomains] = useState([]);
  const [idx, setIdx]         = useState(0);
  const [answers, setAnswers] = useState({});
  const [report, setReport]   = useState("");
  const [error, setError]     = useState("");

  function startAssessment() { setDomains(buildDomains(profile)); setIdx(0); setAnswers({}); setStep("domains"); }

  const totalQs    = domains.reduce((s, d) => s + d.questions.length, 0);
  const answeredQs = Object.keys(answers).length;
  const domain     = domains[idx];
  const sizecat    = getSizeCategory(profile.size || "1-10 employees");

  async function generate() {
    setStep("loading"); setError("");
    const size = getSizeCategory(profile.size);
    const summaries = domains.map(d => ({
      domain: d.name, score: domainScore(d, answers),
      gaps:     d.questions.filter(q => answers[q.id] === "no").map(q => q.text),
      partials: d.questions.filter(q => answers[q.id] === "partial").map(q => q.text),
      na:       d.questions.filter(q => answers[q.id] === "na").map(q => q.text),
    }));
    const prompt = `You are a CMMC 2.0 compliance expert preparing a tailored readiness assessment.

CRITICAL — tailor every recommendation to this profile:
- Company: ${profile.company || "Unnamed"}
- Size: ${profile.size} — ${size === "solo" ? "SOLO OPERATOR. Only recommend free or low-cost tools. No enterprise jargon. No IT teams or SOCs." : size === "small" ? "SMALL TEAM under 50 people." : "MID TO LARGE ENTERPRISE."}
- Contract: ${profile.contractType} | CUI: ${profile.cuiScope} | Timeline: ${profile.timeline}

Domain Results (N/A excluded from scoring):
${summaries.map(d => `${d.domain}: ${d.score}%\n  Gaps: ${d.gaps.length ? d.gaps.join("; ") : "None"}\n  Partials: ${d.partials.length ? d.partials.join("; ") : "None"}\n  N/A: ${d.na.length ? d.na.join("; ") : "None"}`).join("\n\n")}

Generate a CMMC 2.0 Level 2 Gap Assessment Report:

1. EXECUTIVE SUMMARY — 3-4 sentences. Direct and frank. Overall posture, top 2 risks, whether ${profile.timeline} timeline is achievable.

2. CRITICAL GAPS — Top 5 must-fix items. Cite NIST 800-171 practice ID for each. Plain-language consequence. ${size === "solo" ? "Frame for a solo operator." : ""}

3. DOMAIN-BY-DOMAIN ANALYSIS — For each domain with gaps or partials: 2-3 sentences on what's missing and the concrete risk.

4. 30/60/90 DAY REMEDIATION ROADMAP — ${size === "solo" ? "Solo tools only: Bitwarden, Malwarebytes, Cloudflare 1.1.1.2, FileVault, Backblaze, CISA alerts, dibnet.dod.mil. Free or under $15/month." : "Realistic tools and timeframes for a team their size."} Group clearly by 30 / 60 / 90 days.

5. CONTRACT IMPLICATIONS — 1 paragraph. Impact on contract eligibility as a ${profile.contractType}. What a C3PA assessor will focus on first.

Be direct. Correct NIST 800-171 terminology. No padding.`;

    try {
      const res  = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }) });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "";
      if (!text) throw new Error("empty");
      setReport(text); setStep("results");
    } catch { setError("Failed to generate report. Please try again."); setStep("domains"); }
  }

  if (step === "intro") return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      <div style={S.hdr}><div style={S.badge}>CMMC 2.0</div><span style={{ fontSize: "11px", color: "#1e293b" }}>READINESS ASSESSMENT ENGINE</span></div>
      <div style={S.wrap}>
        <div style={{ paddingTop: "28px", marginBottom: "40px" }}>
          <div style={{ fontSize: "10px", color: "#3b82f6", letterSpacing: "0.2em", marginBottom: "16px" }}>◈ DEFENSE INDUSTRIAL BASE · LEVEL 2</div>
          <div style={S.h1}>Know Where You Stand<br />Before the C3PA Does.</div>
          <p style={S.sub}>A tailored self-assessment across 8 CMMC 2.0 Level 2 domains. Questions adapt to your size and CUI scope. Every gap gets a specific, actionable fix. N/A answers don't tank your score.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "20px" }}>
            {[["8","Domains"],["40","Questions"],["~10 min","To Complete"]].map(([n,l]) => (
              <div key={l} style={{ ...S.card, padding: "16px", textAlign: "center", marginBottom: 0 }}>
                <div style={{ fontSize: "22px", fontWeight: "700", color: "#60a5fa" }}>{n}</div>
                <div style={{ fontSize: "9px", color: "#334155", letterSpacing: "0.1em", marginTop: "4px" }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
            {[["◈ ADAPTIVE","Solo operator? You get FileVault and Bitwarden questions — not SIEM and RBAC."],["◈ INLINE FIXES","Every No or Partial shows a specific, sized recommendation right below the question."]].map(([t,d]) => (
              <div key={t} style={{ ...S.card, background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.1)", padding: "14px", marginBottom: 0 }}>
                <div style={{ fontSize: "10px", color: "#60a5fa", letterSpacing: "0.1em", marginBottom: "5px" }}>{t}</div>
                <div style={{ fontSize: "11px", color: "#475569", lineHeight: "1.6" }}>{d}</div>
              </div>
            ))}
          </div>
          <button style={S.btn} onClick={() => setStep("profile")}>BEGIN ASSESSMENT →</button>
        </div>
        <div style={{ borderTop: "1px solid rgba(96,165,250,0.07)", paddingTop: "14px", fontSize: "11px", color: "#1e293b" }}>Assesses against NIST SP 800-171 Rev 2. For internal planning only — not a formal C3PA assessment.</div>
      </div>
    </div>
  );

  if (step === "profile") {
    const fields = [
      { key: "company",      label: "Company / Organization Name", type: "text",   placeholder: "Acme Defense LLC" },
      { key: "size",         label: "Company Size",                type: "select", options: ["1-10 employees","11-50 employees","51-250 employees","250+ employees"] },
      { key: "contractType", label: "Primary Contract Type",       type: "select", options: ["Prime Contractor (DoD)","Subcontractor (Tier 1)","Subcontractor (Tier 2+)","IDIQ / Task Order","Multiple"] },
      { key: "cuiScope",     label: "CUI Handling Scope",          type: "select", options: ["Handles CUI daily (core to operations)","Handles CUI occasionally","CUI is in a defined enclave only","Not currently handling CUI"] },
      { key: "timeline",     label: "Compliance Timeline",         type: "select", options: ["Need certification in < 6 months","6-12 months","12-24 months","Exploring / no hard deadline"] },
    ];
    const complete = fields.every(f => profile[f.key]);
    const sl = profile.size ? getSizeCategory(profile.size) : null;
    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        <div style={S.hdr}><div style={S.badge}>CMMC 2.0</div><span style={{ fontSize: "11px", color: "#1e293b" }}>COMPANY PROFILE</span></div>
        <div style={S.wrap}>
          <div style={{ paddingTop: "14px", marginBottom: "20px" }}>
            <div style={S.tag}>STEP 1 — PROFILE</div>
            <div style={{ ...S.h1, fontSize: "19px" }}>Tell us about your organization</div>
            <div style={S.sub}>Your answers shape which questions you receive and the remediation advice in your report.</div>
          </div>
          {sl && (
            <div style={{ ...S.card, background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.12)", padding: "12px", marginBottom: "14px" }}>
              <div style={{ fontSize: "11px", color: "#60a5fa" }}>
                {sl === "solo" && "◈ SOLO OPERATOR MODE — Questions tailored for a 1-person shop. N/A available where controls don't apply."}
                {sl === "small" && "◈ SMALL TEAM MODE — Questions calibrated for a lean team environment."}
                {sl === "enterprise" && "◈ ENTERPRISE MODE — Full CMMC Level 2 control set."}
              </div>
            </div>
          )}
          <div style={S.card}>
            {fields.map(f => (
              <div key={f.key} style={{ marginBottom: "18px" }}>
                <label style={S.lbl}>{f.label}</label>
                {f.type === "select"
                  ? <select style={{ ...S.inp, appearance: "none" }} value={profile[f.key]} onChange={e => setProfile({ ...profile, [f.key]: e.target.value })}><option value="">— Select —</option>{f.options.map(o => <option key={o} value={o}>{o}</option>)}</select>
                  : <input style={S.inp} type="text" placeholder={f.placeholder} value={profile[f.key]} onChange={e => setProfile({ ...profile, [f.key]: e.target.value })} />}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
            <button style={S.ghost} onClick={() => setStep("intro")}>← Back</button>
            <button style={{ ...S.btn, opacity: complete ? 1 : 0.35, cursor: complete ? "pointer" : "not-allowed" }} onClick={() => complete && startAssessment()}>START ASSESSMENT →</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "domains" && domain) {
    const domainDone = domain.questions.every(q => answers[q.id]);
    const allDone    = answeredQs === totalQs;
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
                <div style={{ fontSize: "9px", color: "#1e293b", minWidth: "28px", paddingTop: "2px" }}>{q.id}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.5", marginBottom: "12px" }}>{q.text}</div>
                  <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                    {ANSWER_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => setAnswers({ ...answers, [q.id]: opt.value })} style={{
                        padding: "5px 13px", fontSize: "11px", fontFamily: "'IBM Plex Mono',monospace", fontWeight: "700", letterSpacing: "0.07em", cursor: "pointer", transition: "all 0.12s",
                        border: answers[q.id] === opt.value ? `1px solid ${opt.color}` : "1px solid rgba(100,116,139,0.18)",
                        background: answers[q.id] === opt.value ? opt.bg : "transparent",
                        color: answers[q.id] === opt.value ? opt.color : "#334155",
                      }}>{opt.label}</button>
                    ))}
                  </div>
                  <NAHint hint={q.naHint} />
                  <FixTip qid={q.id} answer={answers[q.id]} sizecat={sizecat} />
                </div>
              </div>
            </div>
          ))}
          {error && <div style={{ color: "#ef4444", fontSize: "12px", padding: "10px", border: "1px solid rgba(239,68,68,0.22)", background: "rgba(239,68,68,0.05)", marginBottom: "14px" }}>{error}</div>}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "18px" }}>
            <button style={S.ghost} onClick={() => idx > 0 ? setIdx(idx - 1) : setStep("profile")}>← Previous</button>
            {idx < domains.length - 1
              ? <button style={{ ...S.btn, opacity: domainDone ? 1 : 0.35, cursor: domainDone ? "pointer" : "not-allowed" }} onClick={() => domainDone && setIdx(idx + 1)}>NEXT DOMAIN →</button>
              : <button style={{ ...S.btn, background: "#16a34a", opacity: allDone ? 1 : 0.35, cursor: allDone ? "pointer" : "not-allowed" }} onClick={() => allDone && generate()}>GENERATE REPORT →</button>}
          </div>
        </div>
      </div>
    );
  }

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

  if (step === "results") {
    const score   = overallScore(domains, answers);
    const r       = risk(score);
    const naCount = Object.values(answers).filter(v => v === "na").length;
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
              <div style={{ fontSize: "9px", color: "#334155", letterSpacing: "0.1em", marginTop: "3px" }}>APPLICABLE CONTROLS</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", color: r.color, letterSpacing: "0.15em", marginBottom: "3px" }}>◈ {r.label}</div>
              <div style={{ fontSize: "11px", color: "#475569", marginBottom: "3px" }}>{profile.company} · {profile.size} · {profile.contractType}</div>
              {naCount > 0 && <div style={{ fontSize: "10px", color: "#334155" }}>{naCount} question{naCount > 1 ? "s" : ""} marked N/A — excluded from score</div>}
            </div>
            <button style={S.ghost} onClick={() => window.print()}>⬇ EXPORT</button>
          </div>
          <div style={S.card}>
            <div style={{ fontSize: "9px", color: "#3b82f6", letterSpacing: "0.18em", marginBottom: "16px" }}>DOMAIN SCORES</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {domains.map(d => {
                const sc = domainScore(d, answers); const rk = risk(sc);
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
            <button style={S.btn} onClick={() => { setAnswers({}); setReport(""); setDomains([]); setProfile({ company: "", size: "", contractType: "", cuiScope: "", timeline: "" }); setStep("intro"); }}>NEW ASSESSMENT</button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
