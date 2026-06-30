import staffosLogo from "@/assets/staffos logo 2.png";
import {
  cashOutflowMatchesPeriod,
  getReportPeriodRange,
  isDateInReportPeriod,
  type ReportPeriodSelection,
} from "@/lib/report-period";

export type AdminReportMeta = {
  preparedBy: string;
  role: string;
  department?: string | null;
  email?: string | null;
  employeeId?: string | null;
  generatedAt: string;
  recordPeriod: string;
  reportSection: string;
  reportType: string;
};

const QUARTER_CODE_BY_Q: Record<string, string> = {
  Q1: "JFM",
  Q2: "AMJ",
  Q3: "JAS",
  Q4: "OND",
};

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resolveLogoUrl(): string {
  if (typeof window === "undefined") return staffosLogo;
  if (staffosLogo.startsWith("http")) return staffosLogo;
  return new URL(staffosLogo, window.location.origin).href;
}

export function formatReportPeriodLabel(selection: ReportPeriodSelection): string {
  if (!selection.period) return "All periods";
  const range = getReportPeriodRange(selection);
  if (!range) return "Selected period";
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  if (selection.period === "monthly" && selection.month && selection.year) {
    return `${selection.month} ${selection.year}`;
  }
  if (selection.period === "quarterly" && selection.quarter && selection.year) {
    return `${selection.quarter} ${selection.year}`;
  }
  if (selection.period === "yearly" && selection.year) {
    return `Year ${selection.year}`;
  }
  if (selection.period === "weekly" && selection.weekStart) {
    return `Week of ${fmt(range.start)} – ${fmt(range.end)}`;
  }
  if (selection.period === "custom" && selection.customDate) {
    return fmt(range.start);
  }
  return `${fmt(range.start)} – ${fmt(range.end)}`;
}

function filterTargetMappingsByPeriod(mappings: any[], selection: ReportPeriodSelection): any[] {
  if (!selection.period) return mappings;
  const year = parseInt(selection.year || String(new Date().getFullYear()), 10);
  if (selection.period === "yearly") {
    return mappings.filter((m) => Number(m.year) === year);
  }
  if (selection.period === "quarterly" && selection.quarter) {
    const code = QUARTER_CODE_BY_Q[selection.quarter] || selection.quarter;
    return mappings.filter((m) => Number(m.year) === year && String(m.quarter) === code);
  }
  if (selection.period === "monthly") {
    return mappings.filter((m) => Number(m.year) === year);
  }
  return mappings;
}

function filterRequirementsForReport(
  requirements: any[],
  options: {
    team?: string;
    priority?: string;
    type?: string;
    period: ReportPeriodSelection;
  },
): any[] {
  let filtered = [...requirements];
  if (options.team && options.team !== "all") {
    filtered = filtered.filter(
      (req) => (req.teamLead || "").trim().toLowerCase() === options.team!.toLowerCase(),
    );
  }
  if (options.priority && options.priority !== "all") {
    filtered = filtered.filter(
      (req) => (req.priority || req.criticality || "").trim().toLowerCase() === options.priority!.toLowerCase(),
    );
  }
  if (options.type && options.type !== "all") {
    if (options.type === "opened") {
      filtered = filtered.filter((req) => req.status !== "Closed" && req.status !== "Archived");
    } else if (options.type === "closed") {
      filtered = filtered.filter((req) => req.status === "Closed");
    } else if (options.type === "archived") {
      filtered = filtered.filter((req) => req.status === "Archived");
    }
  }
  return filtered.filter((req) => isDateInReportPeriod(req.createdAt, options.period));
}

function filterPipelineForReport(pipeline: any[], period: ReportPeriodSelection): any[] {
  return pipeline.filter((app) =>
    isDateInReportPeriod(app.appliedDate || app.appliedOn, period),
  );
}

function filterClosuresForReport(closures: any[], period: ReportPeriodSelection): any[] {
  return closures.filter((report) =>
    isDateInReportPeriod(
      report.offeredDateRaw || report.joinedDateRaw || report.offeredDate || report.joinedDate,
      period,
    ),
  );
}

function filterTeamPerformanceForReport(items: any[], _period: ReportPeriodSelection): any[] {
  // Team performance is a live snapshot from the API (not join-date scoped).
  return items;
}

export function renderReportTable(headers: string[], rows: string[][]): string {
  if (rows.length === 0) {
    return `<p class="empty-note">No records found for the selected filters.</p>`;
  }
  const head = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const body = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function section(title: string, note: string | undefined, tableHtml: string, count: number): string {
  return `
    <section class="report-section">
      <h2>${escapeHtml(title)} <span class="count-badge">${count} record${count === 1 ? "" : "s"}</span></h2>
      ${note ? `<p class="section-note">${escapeHtml(note)}</p>` : ""}
      ${tableHtml}
    </section>
  `;
}

export function buildAdminReportShell(options: {
  title: string;
  subtitle: string;
  meta: AdminReportMeta;
  bodyHtml: string;
}): string {
  const logoUrl = resolveLogoUrl();
  const metaRows: Array<[string, string]> = [
    ["Prepared by", options.meta.preparedBy],
    ["Role", options.meta.role],
    ...(options.meta.department ? [["Department", options.meta.department] as [string, string]] : []),
    ...(options.meta.employeeId ? [["Employee ID", options.meta.employeeId] as [string, string]] : []),
    ...(options.meta.email ? [["Email", options.meta.email] as [string, string]] : []),
    ["Downloaded on", options.meta.generatedAt],
    ["Record period", options.meta.recordPeriod],
    ["Report section", options.meta.reportSection],
    ["Report type", options.meta.reportType],
  ];

  const metaGrid = metaRows
    .map(
      ([label, value]) => `
        <div class="meta-row">
          <span class="meta-label">${escapeHtml(label)}</span>
          <span class="meta-value">${escapeHtml(value)}</span>
        </div>
      `,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(options.title)}</title>
  <style>
    @page { margin: 12mm 10mm; size: A4; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11px;
      color: #0f172a;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .watermark {
      position: fixed;
      top: 42%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-32deg);
      font-size: 72px;
      font-weight: 800;
      color: rgba(6, 182, 212, 0.05);
      pointer-events: none;
      z-index: 0;
      user-select: none;
    }
    .page { position: relative; z-index: 1; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      padding-bottom: 12px;
      margin-bottom: 12px;
      border-bottom: 2px solid #0891b2;
    }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand img {
      width: 42px;
      height: 42px;
      border-radius: 999px;
      object-fit: cover;
      border: 1px solid #e2e8f0;
    }
    .brand-name { font-size: 16px; font-weight: 700; }
    .brand-tagline { font-size: 10px; color: #64748b; margin-top: 2px; }
    .title-block { text-align: right; }
    .title { margin: 0; font-size: 20px; font-weight: 700; }
    .subtitle { margin: 4px 0 0; font-size: 11px; color: #64748b; }
    .meta-panel {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px 18px;
      padding: 10px 12px;
      margin-bottom: 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #f8fafc;
    }
    .meta-row { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .meta-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #64748b;
    }
    .meta-value { font-size: 11px; font-weight: 600; color: #0f172a; word-break: break-word; }
    .report-section { margin-top: 18px; break-inside: avoid; page-break-inside: avoid; }
    .report-section h2 {
      margin: 0 0 6px;
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }
    .count-badge {
      display: inline-block;
      margin-left: 6px;
      padding: 2px 8px;
      border-radius: 999px;
      background: #e0f2fe;
      color: #0369a1;
      font-size: 10px;
      font-weight: 600;
      vertical-align: middle;
    }
    .section-note { margin: 0 0 8px; font-size: 10px; color: #64748b; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
      font-size: 10px;
    }
    th, td {
      border: 1px solid #dbe3ee;
      padding: 6px 7px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f1f5f9;
      font-weight: 700;
      color: #334155;
    }
    tr:nth-child(even) td { background: #fafbfd; }
    .empty-note {
      margin: 0;
      padding: 10px 12px;
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
      color: #64748b;
      background: #f8fafc;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
      margin-top: 8px;
    }
    .metric-card {
      border: 1px solid #dbe3ee;
      border-radius: 6px;
      padding: 8px;
      background: #f8fafc;
    }
    .metric-label { font-size: 9px; color: #64748b; font-weight: 600; min-height: 28px; }
    .metric-value { margin-top: 4px; font-size: 16px; font-weight: 700; color: #0f172a; }
    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      font-size: 9px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="watermark">StaffOS</div>
  <div class="page">
    <header class="header">
      <div class="brand">
        <img src="${logoUrl}" alt="StaffOS" />
        <div>
          <div class="brand-name">StaffOS</div>
          <div class="brand-tagline">Recruitment Operations Platform</div>
        </div>
      </div>
      <div class="title-block">
        <h1 class="title">${escapeHtml(options.title)}</h1>
        <p class="subtitle">${escapeHtml(options.subtitle)}</p>
      </div>
    </header>
    <section class="meta-panel">${metaGrid}</section>
    ${options.bodyHtml}
    <footer class="footer">
      <p>Generated by StaffOS Admin Portal on ${escapeHtml(options.meta.generatedAt)}.</p>
      <p>© ${new Date().getFullYear()} StaffOS · ScalingTheory</p>
    </footer>
  </div>
</body>
</html>`;
}

export function openAdminReportPrintWindow(html: string): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    setTimeout(() => printWindow.close(), 1200);
  }, 500);
}

export type AdminTeamsReportInput = {
  reportType: string;
  period: ReportPeriodSelection;
  cashoutData: any[];
  targetMappings: any[];
  dailyMetrics: any;
  keyAspects: any;
  candidates: any[];
  masterTotals: any;
  users: any[];
};

export function buildTeamsReportBody(input: AdminTeamsReportInput): string {
  const { reportType, period } = input;
  const periodLabel = formatReportPeriodLabel(period);
  let html = "";

  if (reportType === "cash-outflows") {
    const rows = input.cashoutData
      .filter((item) => cashOutflowMatchesPeriod(item, period))
      .map((item) => {
        const total =
          (parseInt(item.salary, 10) || 0) +
          (parseInt(item.incentive, 10) || 0) +
          (parseInt(item.tools, 10) || 0) +
          (parseInt(item.rent, 10) || 0) +
          (parseInt(item.others, 10) || 0);
        return [
          item.month || "-",
          String(item.year || "-"),
          String(item.employees || "-"),
          `₹${(parseInt(item.salary, 10) || 0).toLocaleString("en-IN")}`,
          `₹${(parseInt(item.incentive, 10) || 0).toLocaleString("en-IN")}`,
          `₹${(parseInt(item.tools, 10) || 0).toLocaleString("en-IN")}`,
          `₹${(parseInt(item.rent, 10) || 0).toLocaleString("en-IN")}`,
          `₹${(parseInt(item.others, 10) || 0).toLocaleString("en-IN")}`,
          `₹${total.toLocaleString("en-IN")}`,
        ];
      });
    html += section(
      "Cash Outflows",
      `Period: ${periodLabel}`,
      renderReportTable(
        ["Month", "Year", "Employees", "Salary", "Incentive", "Tools", "Rent", "Other", "Total"],
        rows,
      ),
      rows.length,
    );
  }

  if (reportType === "target-incentives") {
    const rows = filterTargetMappingsByPeriod(input.targetMappings, period).map((m) => [
      m.teamLeadName || "-",
      m.teamMemberName || "-",
      m.teamMemberRole || "-",
      m.quarter || "-",
      String(m.year || "-"),
      String(m.minimumTarget ?? "-"),
      String(m.revenueAchieved ?? m.achievedRevenue ?? "-"),
      String(m.incentiveEarned ?? m.incentive ?? "-"),
    ]);
    html += section(
      "Target & Incentives",
      `Period: ${periodLabel}`,
      renderReportTable(
        ["Team Lead", "Team Member", "Role", "Quarter", "Year", "Min Target", "Achieved", "Incentive"],
        rows,
      ),
      rows.length,
    );
  }

  if (reportType === "productive-metrics") {
    const dm = input.dailyMetrics || {};
    const members = dm.performanceChart?.members || [];
    const rows = members.map((m: any) => [
      m.fullName || m.member || "-",
      String(m.delivered ?? "-"),
      String(m.required ?? "-"),
    ]);
    html += `
      <section class="report-section">
        <h2>Productive Metrics <span class="count-badge">Summary</span></h2>
        <p class="section-note">Operational snapshot for ${periodLabel}</p>
        <div class="metrics-grid">
          <div class="metric-card"><div class="metric-label">Total Requirements</div><div class="metric-value">${dm.totalRequirements ?? 0}</div></div>
          <div class="metric-card"><div class="metric-label">Completed Requirements</div><div class="metric-value">${dm.completedRequirements ?? 0}</div></div>
          <div class="metric-card"><div class="metric-label">Avg Resumes / Req</div><div class="metric-value">${dm.avgResumesPerRequirement ?? 0}</div></div>
          <div class="metric-card"><div class="metric-label">Overall Performance</div><div class="metric-value">${dm.overallPerformance ?? "-"}</div></div>
        </div>
      </section>
    `;
    html += section(
      "Delivery by Team Member",
      undefined,
      renderReportTable(["Member", "Delivered", "Required"], rows),
      rows.length,
    );
  }

  if (reportType === "key-aspects") {
    const ka = input.keyAspects || {};
    html += `
      <section class="report-section">
        <h2>Key Aspects <span class="count-badge">Summary</span></h2>
        <p class="section-note">Period: ${escapeHtml(periodLabel)}</p>
        <div class="metrics-grid">
          <div class="metric-card"><div class="metric-label">Growth MoM</div><div class="metric-value">${ka.growthMoM ?? 0}%</div></div>
          <div class="metric-card"><div class="metric-label">Growth YoY</div><div class="metric-value">${ka.growthYoY ?? 0}%</div></div>
          <div class="metric-card"><div class="metric-label">Burn Rate</div><div class="metric-value">${ka.burnRate ?? 0}%</div></div>
          <div class="metric-card"><div class="metric-label">Churn Rate</div><div class="metric-value">${ka.churnRate ?? 0}%</div></div>
          <div class="metric-card"><div class="metric-label">Attrition</div><div class="metric-value">${ka.attrition ?? 0}%</div></div>
          <div class="metric-card"><div class="metric-label">Net Profit</div><div class="metric-value">${Number(ka.netProfit ?? 0).toLocaleString("en-IN")}</div></div>
          <div class="metric-card"><div class="metric-label">Revenue / Employee</div><div class="metric-value">${Number(ka.revenuePerEmployee ?? 0).toLocaleString("en-IN")}</div></div>
          <div class="metric-card"><div class="metric-label">Client Acq. Cost</div><div class="metric-value">${Number(ka.clientAcquisitionCost ?? 0).toLocaleString("en-IN")}</div></div>
        </div>
      </section>
    `;
    const chartRows = (ka.chartData || []).map((row: any) => [
      row.name || "-",
      String(row.growthMoM ?? "-"),
      String(row.burnRate ?? "-"),
      String(row.churnRate ?? "-"),
      String(row.attrition ?? "-"),
    ]);
    html += section(
      "Key Aspects Trend",
      undefined,
      renderReportTable(["Period", "Growth MoM", "Burn Rate", "Churn Rate", "Attrition"], chartRows),
      chartRows.length,
    );
  }

  if (reportType === "resume-database") {
    const rows = input.candidates.map((c) => [
      c.candidateId || "-",
      c.fullName || c.name || "-",
      c.currentRole || c.role || "-",
      c.email || "-",
      c.location || "-",
      c.experience || "-",
    ]);
    html += section(
      "Resume Database",
      `All candidates in database · Period filter: ${periodLabel}`,
      renderReportTable(["Candidate ID", "Name", "Role", "Email", "Location", "Experience"], rows),
      rows.length,
    );
  }

  if (reportType === "key-totals") {
    const mt = input.masterTotals || {};
    html += `
      <section class="report-section">
        <h2>Key Totals <span class="count-badge">Summary</span></h2>
        <p class="section-note">Master data totals · ${escapeHtml(periodLabel)}</p>
        <div class="metrics-grid">
          <div class="metric-card"><div class="metric-label">Direct Uploads</div><div class="metric-value">${mt.directUploads ?? 0}</div></div>
          <div class="metric-card"><div class="metric-label">Recruiter Uploads</div><div class="metric-value">${mt.recruiterUploads ?? 0}</div></div>
          <div class="metric-card"><div class="metric-label">Resumes</div><div class="metric-value">${mt.resumes ?? 0}</div></div>
          <div class="metric-card"><div class="metric-label">Head Count</div><div class="metric-value">${mt.headCount ?? 0}</div></div>
          <div class="metric-card"><div class="metric-label">Salary Paid</div><div class="metric-value">₹${Number(mt.salaryPaid ?? 0).toLocaleString("en-IN")}</div></div>
          <div class="metric-card"><div class="metric-label">Other Expenses</div><div class="metric-value">₹${Number(mt.otherExpenses ?? 0).toLocaleString("en-IN")}</div></div>
          <div class="metric-card"><div class="metric-label">Tools & Databases</div><div class="metric-value">₹${Number(mt.toolsAndDatabases ?? 0).toLocaleString("en-IN")}</div></div>
          <div class="metric-card"><div class="metric-label">Rent Paid</div><div class="metric-value">₹${Number(mt.rentPaid ?? 0).toLocaleString("en-IN")}</div></div>
        </div>
      </section>
    `;
  }

  if (reportType === "list-of-users") {
    const rows = input.users.map((u) => [
      u.employeeId || "-",
      u.name || "-",
      u.email || "-",
      u.role || "-",
      u.phone || "-",
      u.isActive === false ? "Inactive" : "Active",
    ]);
    html += section(
      "List of Users",
      "Team leaders, talent advisors, and client portal users",
      renderReportTable(["Employee ID", "Name", "Email", "Role", "Phone", "Status"], rows),
      rows.length,
    );
  }

  return html || `<p class="empty-note">No report content available for the selected type.</p>`;
}

export type AdminCustomReportsInput = {
  selected: string[];
  period: ReportPeriodSelection;
  team?: string;
  priority?: string;
  type?: string;
  requirements: any[];
  pipeline: any[];
  closures: any[];
  teamPerformance: any[];
};

export function buildCustomReportsBody(input: AdminCustomReportsInput): string {
  const periodLabel = formatReportPeriodLabel(input.period);
  let html = "";

  if (input.selected.includes("requirements")) {
    const filtered = filterRequirementsForReport(input.requirements, {
      team: input.team,
      priority: input.priority,
      type: input.type,
      period: input.period,
    });
    const rows = filtered.map((req) => [
      req.position || "-",
      req.company || "-",
      req.teamLead || "-",
      req.priority || req.criticality || "-",
      req.status || "-",
      req.criticality || "-",
      req.createdAt ? new Date(req.createdAt).toLocaleDateString("en-IN") : "-",
    ]);
    html += section(
      "Requirements",
      `Team: ${input.team || "All"} · Priority: ${input.priority || "All"} · Type: ${input.type || "All"} · Period: ${periodLabel}`,
      renderReportTable(
        ["Position", "Company", "Team Lead", "Priority", "Status", "Criticality", "Created At"],
        rows,
      ),
      rows.length,
    );
  }

  if (input.selected.includes("pipeline")) {
    const filtered = filterPipelineForReport(input.pipeline, input.period);
    const rows = filtered.map((app) => [
      app.appliedOn || "-",
      app.candidateName || "-",
      app.company || "-",
      app.roleApplied || "-",
      app.currentStatus || "-",
      app.location || "-",
      app.experience || "-",
    ]);
    html += section(
      "Pipeline",
      `Period: ${periodLabel}`,
      renderReportTable(
        ["Applied On", "Candidate", "Company", "Role", "Status", "Location", "Experience"],
        rows,
      ),
      rows.length,
    );
  }

  if (input.selected.includes("closureReports")) {
    const filtered = filterClosuresForReport(input.closures, input.period);
    const rows = filtered.map((report) => [
      report.candidate || "-",
      report.position || "-",
      report.client || "-",
      report.talentAdvisor || "-",
      report.fixedCTC || report.ctc || "-",
      report.offeredDate || "-",
      report.joinedDate || "-",
      report.status || "-",
    ]);
    html += section(
      "Closure Reports",
      `Period: ${periodLabel}`,
      renderReportTable(
        ["Candidate", "Position", "Client", "Talent Advisor", "Fixed CTC", "Offered Date", "Joined Date", "Status"],
        rows,
      ),
      rows.length,
    );
  }

  if (input.selected.includes("teamPerformance")) {
    const filtered = filterTeamPerformanceForReport(input.teamPerformance, input.period);
    const rows = filtered.map((item) => [
      item.talentAdvisor || "-",
      item.joiningDate || "-",
      item.tenure || "-",
      String(item.closures ?? "-"),
      item.lastClosure || "-",
      String(item.qtrsAchieved ?? "-"),
    ]);
    html += section(
      "Team Performance",
      `Current team snapshot · report period ${periodLabel} applies to other sections`,
      renderReportTable(
        ["Talent Advisor", "Joining Date", "Tenure", "Closures", "Last Closure", "Quarters Achieved"],
        rows,
      ),
      rows.length,
    );
  }

  return html || `<p class="empty-note">No report sections selected.</p>`;
}

function formatReportRoleLabel(role?: string | null): string {
  const normalized = (role || "").trim().toLowerCase();
  const map: Record<string, string> = {
    client_member: "Client Member",
    client_admin: "Client Admin",
    team_leader: "Team Leader",
    recruiter: "Talent Advisor",
    client: "Client",
    admin: "Administrator",
  };
  if (map[normalized]) return map[normalized];
  if (!normalized) return "-";
  return normalized
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function buildGeneralReportBody(
  reportType: string,
  staffEmployees: any[],
  clientCompanies: any[],
  clientPortalUsers: any[],
): string {
  if (reportType === "employee-master") {
    const rows = staffEmployees.map((emp) => [
      emp.employeeId || "-",
      emp.name || "-",
      emp.email || "-",
      emp.phone || "-",
      formatReportRoleLabel(emp.role),
      emp.department || "-",
      emp.joiningDate || "-",
      emp.employmentType || emp.employmentStatus || (emp.isActive === false ? "Inactive" : "Active"),
    ]);
    return section(
      "Employee Master",
      "Team Leaders and Talent Advisors",
      renderReportTable(
        ["Employee ID", "Name", "Email", "Phone", "Role", "Department", "Joining Date", "Status"],
        rows,
      ),
      rows.length,
    );
  }

  if (reportType === "client-master") {
    const companyRows = clientCompanies.map((client) => [
      "Company",
      client.clientCode || client.id || "-",
      client.brandName || client.incorporatedName || "-",
      client.email || "-",
      client.phone || "-",
      "",
      client.location || "-",
      client.currentStatus || "-",
    ]);
    const userRows = clientPortalUsers.map((user) => {
      const company = clientCompanies.find((client) => client.id === user.clientCompanyId);
      const companyLabel = company
        ? [company.brandName || company.incorporatedName, company.location].filter(Boolean).join(" · ")
        : "-";
      return [
        "Portal User",
        user.employeeId || user.id || "-",
        user.name || "-",
        user.email || "-",
        user.phone || "-",
        formatReportRoleLabel(user.role),
        companyLabel,
        user.isActive === false ? "Inactive" : "Active",
      ];
    });
    const rows = [...companyRows, ...userRows];
    let html = section(
      "Client Companies",
      "All client company records from Master Data",
      renderReportTable(
        ["Record Type", "ID / Code", "Name", "Email", "Phone", "Role", "Company / Location", "Status"],
        companyRows,
      ),
      companyRows.length,
    );
    html += section(
      "Client Portal Users",
      "Client Admin and Client Member login accounts",
      renderReportTable(
        ["Record Type", "ID / Code", "Name", "Email", "Phone", "Role", "Company / Location", "Status"],
        userRows,
      ),
      userRows.length,
    );
    if (rows.length === 0) {
      return `<p class="empty-note">No client records found.</p>`;
    }
    return html;
  }

  return `<p class="empty-note">Unknown general report type.</p>`;
}

export function buildAdminReportMeta(options: {
  preparedBy: string;
  role: string;
  department?: string | null;
  email?: string | null;
  employeeId?: string | null;
  period?: ReportPeriodSelection | null;
  reportSection: string;
  reportType: string;
}): AdminReportMeta {
  return {
    preparedBy: options.preparedBy,
    role: options.role,
    department: options.department ?? null,
    email: options.email ?? null,
    employeeId: options.employeeId ?? null,
    generatedAt: new Date().toLocaleString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    recordPeriod: options.period ? formatReportPeriodLabel(options.period) : "All records",
    reportSection: options.reportSection,
    reportType: options.reportType,
  };
}
