import { useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import staffosLogo from "@/assets/staffos logo 2.png";
import { svgElementToPngDataUrl } from "@/lib/chart-export";

export type ClientMetricsReportMeta = {
  companyName: string;
  clientName: string;
  clientEmail?: string;
  userRole: string;
  department?: string | null;
  employeeId?: string | null;
  generatedAt: string;
  recordPeriod: string;
  periodType: string;
  roleFilter: string;
  chartBasisLabel: string;
};

export type ClientMetricsReportPrintFlags = {
  speed: boolean;
  quality: boolean;
  impact: boolean;
};

type ChartImages = {
  speed?: string;
  quality?: string;
};

type ClientMetricsReportDocumentProps = {
  active: boolean;
  onReadyToPrint: () => void;
  printMetrics: ClientMetricsReportPrintFlags;
  speedMetrics: Record<string, number>;
  qualityMetrics: Record<string, number>;
  impactMetrics: Record<string, number>;
  speedTrendData: Record<string, unknown>[];
  qualityTrendData: Record<string, unknown>[];
  meta: ClientMetricsReportMeta;
};

const REPORT_CHART_WIDTH = 700;
const REPORT_CHART_HEIGHT = 260;

function MetricCard({
  label,
  value,
  suffix,
  tone,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  tone: "blue" | "green" | "red" | "purple" | "yellow";
}) {
  return (
    <div className={`client-metrics-report__card client-metrics-report__card--${tone}`}>
      <div className="client-metrics-report__card-label">{label}</div>
      <div className="client-metrics-report__card-value">
        {value}
        {suffix ? <span className="client-metrics-report__card-suffix">{suffix}</span> : null}
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="client-metrics-report__meta-row">
      <span className="client-metrics-report__meta-label">{label}</span>
      <span className="client-metrics-report__meta-value">{value}</span>
    </div>
  );
}

export function ClientMetricsReportDocument({
  active,
  onReadyToPrint,
  printMetrics,
  speedMetrics,
  qualityMetrics,
  impactMetrics,
  speedTrendData,
  qualityTrendData,
  meta,
}: ClientMetricsReportDocumentProps) {
  const [chartImages, setChartImages] = useState<ChartImages>({});
  const speedChartRef = useRef<HTMLDivElement>(null);
  const qualityChartRef = useRef<HTMLDivElement>(null);
  const readyCalledRef = useRef(false);

  useEffect(() => {
    if (!active) {
      setChartImages({});
      readyCalledRef.current = false;
      return;
    }

    let cancelled = false;
    const needsSpeedChart = printMetrics.speed && speedTrendData.length > 0;
    const needsQualityChart = printMetrics.quality && qualityTrendData.length > 0;

    const finish = () => {
      if (cancelled || readyCalledRef.current) return;
      readyCalledRef.current = true;
      onReadyToPrint();
    };

    if (!needsSpeedChart && !needsQualityChart) {
      const timer = window.setTimeout(finish, 350);
      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }

    const timer = window.setTimeout(async () => {
      const images: ChartImages = {};
      try {
        if (needsSpeedChart && speedChartRef.current) {
          const svg = speedChartRef.current.querySelector("svg");
          if (svg) {
            images.speed = await svgElementToPngDataUrl(
              svg,
              REPORT_CHART_WIDTH,
              REPORT_CHART_HEIGHT,
            );
          }
        }
        if (needsQualityChart && qualityChartRef.current) {
          const svg = qualityChartRef.current.querySelector("svg");
          if (svg) {
            images.quality = await svgElementToPngDataUrl(
              svg,
              REPORT_CHART_WIDTH,
              REPORT_CHART_HEIGHT,
            );
          }
        }
      } catch {
        // Fall back to live SVG in print if capture fails
      }

      if (!cancelled) {
        setChartImages(images);
        window.setTimeout(finish, 450);
      }
    }, 900);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    active,
    onReadyToPrint,
    printMetrics.speed,
    printMetrics.quality,
    speedTrendData,
    qualityTrendData,
  ]);

  if (!active) return null;

  return (
    <div id="client-metrics-report-document" className="client-metrics-report" aria-hidden="true">
      <div className="client-metrics-report__watermark" aria-hidden="true">
        StaffOS
      </div>

      <header className="client-metrics-report__header">
        <div className="client-metrics-report__brand">
          <img src={staffosLogo} alt="StaffOS" className="client-metrics-report__logo" />
          <div>
            <div className="client-metrics-report__brand-name">StaffOS</div>
            <div className="client-metrics-report__brand-tagline">Recruitment Operations Platform</div>
          </div>
        </div>
        <div className="client-metrics-report__title-block">
          <h1 className="client-metrics-report__title">Client Metrics Report</h1>
          <p className="client-metrics-report__subtitle">Generated from Client Portal</p>
        </div>
      </header>

      <section className="client-metrics-report__meta-panel">
        <div className="client-metrics-report__meta-grid">
          <MetaRow label="Client / Company" value={meta.companyName} />
          <MetaRow label="Prepared by" value={meta.clientName} />
          <MetaRow label="Portal role" value={meta.userRole} />
          {meta.department ? <MetaRow label="Department" value={meta.department} /> : null}
          {meta.employeeId ? <MetaRow label="Employee ID" value={meta.employeeId} /> : null}
          {meta.clientEmail ? <MetaRow label="Email" value={meta.clientEmail} /> : null}
          <MetaRow label="Downloaded on" value={meta.generatedAt} />
          <MetaRow label="Record period" value={meta.recordPeriod} />
          <MetaRow label="Period type" value={meta.periodType} />
          <MetaRow label="Role filter" value={meta.roleFilter} />
        </div>
      </section>

      {printMetrics.speed ? (
        <section className="client-metrics-report__section">
          <h2 className="client-metrics-report__section-title">Speed Metrics</h2>
          <p className="client-metrics-report__section-note">
            Summary based on: {meta.recordPeriod} · {meta.roleFilter}
          </p>
          <div className="client-metrics-report__cards client-metrics-report__cards--4">
            <MetricCard label="Time to 1st Submission" value={speedMetrics.timeToFirstSubmission} suffix="days" tone="blue" />
            <MetricCard label="Time to Interview" value={speedMetrics.timeToInterview} suffix="days" tone="blue" />
            <MetricCard label="Time to Offer" value={speedMetrics.timeToOffer} suffix="days" tone="blue" />
            <MetricCard label="Time to Fill" value={speedMetrics.timeToFill} suffix="days" tone="blue" />
          </div>

          {speedTrendData.length > 0 ? (
            <div className="client-metrics-report__chart-block">
              <h3 className="client-metrics-report__chart-title">Speed Metrics Trend</h3>
              <p className="client-metrics-report__chart-note">{meta.chartBasisLabel}</p>
              <div
                ref={speedChartRef}
                className="client-metrics-report__chart-canvas client-metrics-report__chart-canvas--speed"
              >
                {chartImages.speed ? (
                  <img
                    src={chartImages.speed}
                    alt="Speed metrics trend chart"
                    width={REPORT_CHART_WIDTH}
                    height={REPORT_CHART_HEIGHT}
                    className="client-metrics-report__chart-image"
                  />
                ) : (
                  <LineChart width={REPORT_CHART_WIDTH} height={REPORT_CHART_HEIGHT} data={speedTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} stroke="#9CA3AF" />
                    <Legend wrapperStyle={{ fontSize: 10 }} iconType="line" />
                    <Line type="monotone" dataKey="timeToFirstSubmission" stroke="#06B6D4" strokeWidth={2} dot={false} name="1st Submission" />
                    <Line type="monotone" dataKey="timeToInterview" stroke="#EF4444" strokeWidth={2} dot={false} name="Interview" />
                    <Line type="monotone" dataKey="timeToOffer" stroke="#A855F7" strokeWidth={2} dot={false} name="Offer" />
                    <Line type="monotone" dataKey="timeToFill" stroke="#D97706" strokeWidth={2} dot={false} name="Fill" />
                  </LineChart>
                )}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {printMetrics.quality ? (
        <section className="client-metrics-report__section">
          <h2 className="client-metrics-report__section-title">Quality Metrics</h2>
          <p className="client-metrics-report__section-note">
            Summary based on: {meta.recordPeriod} · {meta.roleFilter}
          </p>
          <div className="client-metrics-report__cards client-metrics-report__cards--4">
            <MetricCard label="Submission to Short List %" value={qualityMetrics.submissionToShortList} suffix="%" tone="green" />
            <MetricCard label="Interview to Offer %" value={qualityMetrics.interviewToOffer} suffix="%" tone="green" />
            <MetricCard label="Offer Acceptance %" value={qualityMetrics.offerAcceptance} suffix="%" tone="green" />
            <MetricCard label="Early Attrition %" value={qualityMetrics.earlyAttrition} suffix="%" tone="green" />
          </div>

          {qualityTrendData.length > 0 ? (
            <div className="client-metrics-report__chart-block">
              <h3 className="client-metrics-report__chart-title">Quality Metrics Trend</h3>
              <p className="client-metrics-report__chart-note">{meta.chartBasisLabel}</p>
              <div
                ref={qualityChartRef}
                className="client-metrics-report__chart-canvas client-metrics-report__chart-canvas--quality"
              >
                {chartImages.quality ? (
                  <img
                    src={chartImages.quality}
                    alt="Quality metrics trend chart"
                    width={REPORT_CHART_WIDTH}
                    height={REPORT_CHART_HEIGHT}
                    className="client-metrics-report__chart-image"
                  />
                ) : (
                  <LineChart width={REPORT_CHART_WIDTH} height={REPORT_CHART_HEIGHT} data={qualityTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} stroke="#9CA3AF" />
                    <Legend wrapperStyle={{ fontSize: 10 }} iconType="line" />
                    <Line type="monotone" dataKey="submissionToShortList" stroke="#06B6D4" strokeWidth={2} dot={false} name="Submission Rate" />
                    <Line type="monotone" dataKey="interviewToOffer" stroke="#EF4444" strokeWidth={2} dot={false} name="Interview Rate" />
                    <Line type="monotone" dataKey="offerAcceptance" stroke="#A855F7" strokeWidth={2} dot={false} name="Offer Rate" />
                    <Line type="monotone" dataKey="earlyAttrition" stroke="#D97706" strokeWidth={2} dot={false} name="Attrition" />
                  </LineChart>
                )}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {printMetrics.impact ? (
        <section className="client-metrics-report__section">
          <h2 className="client-metrics-report__section-title">Impact Metrics</h2>
          <p className="client-metrics-report__section-note">
            Summary based on: {meta.recordPeriod} · {meta.roleFilter}
          </p>
          <div className="client-metrics-report__cards client-metrics-report__cards--4">
            <MetricCard label="Speed to Hire value" value={impactMetrics.speedToHire} suffix="days faster" tone="red" />
            <MetricCard label="Revenue Impact Of Delay" value={impactMetrics.revenueImpactOfDelay} suffix="lost/role" tone="red" />
            <MetricCard label="Client NPS" value={`+${impactMetrics.clientNps}`} tone="purple" />
            <MetricCard label="Candidate NPS" value={`+${impactMetrics.candidateNps}`} tone="purple" />
          </div>
          <div className="client-metrics-report__cards client-metrics-report__cards--4 client-metrics-report__cards--spaced">
            <MetricCard label="Feedback Turn Around" value={impactMetrics.feedbackTurnAround} suffix="days" tone="yellow" />
            <MetricCard label="First Year Retention Rate" value={impactMetrics.firstYearRetentionRate} suffix="%" tone="yellow" />
            <MetricCard label="Fulfillment Rate" value={impactMetrics.fulfillmentRate} suffix="%" tone="yellow" />
            <MetricCard label="Revenue Recovered" value={impactMetrics.revenueRecovered} suffix="L gained/hire" tone="yellow" />
          </div>
        </section>
      ) : null}

      <footer className="client-metrics-report__footer">
        <p>
          This report was generated by StaffOS on {meta.generatedAt}. Metrics reflect data available at the time of export.
        </p>
        <p className="client-metrics-report__footer-muted">
          © {new Date().getFullYear()} StaffOS · ScalingTheory
        </p>
      </footer>
    </div>
  );
}
