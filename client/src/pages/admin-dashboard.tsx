import { useState, useEffect, useMemo, useRef } from 'react';
import { type Employee, type TargetMappings } from '@shared/schema';
import { EMPTY_IMPACT_METRICS } from '@shared/impact-metrics-defaults';
import AdminSidebar from '@/components/dashboard/admin-sidebar';
import AdminProfileHeader from '@/components/dashboard/admin-profile-header';
import AdminTopHeader from '@/components/dashboard/admin-top-header';
import TeamBoxes from '@/components/dashboard/team-boxes';
import TeamMembersSidebar from '@/components/dashboard/team-members-sidebar';
import AddRequirementModal from '@/components/dashboard/modals/add-requirement-modal';
import JobDescriptionDetailsModal from '@/components/dashboard/modals/job-description-details-modal';
import TargetMappingModal from '@/components/dashboard/modals/target-mapping-modal';
import RevenueMappingModal from '@/components/dashboard/modals/revenue-mapping-modal';
import IncentiveMappingModal from '@/components/dashboard/modals/incentive-mapping-modal';
import TeamPerformanceTableModal from '@/components/dashboard/modals/team-performance-modal';
import PerformanceChartModal from '@/components/dashboard/modals/performance-chart-modal';
import ClosureModal from '@/components/dashboard/modals/closure-modal';
import AddTeamLeaderModal from '@/components/dashboard/modals/add-team-leader-modal';
import AddTalentAdvisorModal from '@/components/dashboard/modals/add-talent-advisor-modal';
import AddRecruiterModal from '@/components/dashboard/modals/add-recruiter-modal';
import AddTeamLeaderModalNew from '@/components/dashboard/modals/add-team-leader-modal-new';
import AddClientCredentialsModal from '@/components/dashboard/modals/add-client-credentials-modal';
import AddUserModal from '@/components/dashboard/modals/add-user-modal';
import HoldUserModal, { type HoldUserPayload } from '@/components/dashboard/modals/hold-user-modal';
import { UserHoldRowTooltip } from '@/components/dashboard/user-hold-row-tooltip';
import { runAdminHoldCountdown } from '@/lib/admin-hold-countdown';
import DailyDeliveryModal from '@/components/dashboard/modals/daily-delivery-modal';
import BulkResumeUpload from '@/components/dashboard/bulk-resume-upload';
import ActiveNudgesTable from "@/components/dashboard/active-nudges-table";
import NudgeLogsTab from "@/components/dashboard/tabs/nudges-tab";
import { invalidateIncentiveMappingQueries, invalidateRevenueMappingQueries } from "@/lib/admin-performance-queries";
import {
  formatRevenuePaymentStatus,
  sortRevenueMappingsByRecency,
  ADMIN_FILTER_SELECT_CLASS,
  ADMIN_FILTER_DATE_CLASS,
} from "@/lib/revenue-mapping-utils";
import { SearchBar } from '@/components/ui/search-bar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StandardDatePicker } from "@/components/ui/standard-date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  CalendarIcon,
  EditIcon,
  Mail,
  Phone,
  Send,
  FilePlus,
  CalendarCheck,
  Search,
  UserPlus,
  Users,
  ExternalLink,
  MoreVertical,
  Download,
  Edit2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Trash2,
  RotateCcw,
  PauseCircle,
  Eye,
  FileText,
  Folder,
  AlertTriangle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ComposedChart, BarChart, Bar, Cell, AreaChart, Area } from 'recharts';
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  buildStreqDisplayMap,
  getRequirementLookupId,
  getRequirementTaSplitMeta,
  getRequirementSplitBadgeLabel,
  resolveRequirementDisplayId,
} from "@shared/requirement-jd-extras";
import {
  REPORT_MONTHS,
  REPORT_QUARTERS,
  cashOutflowMatchesPeriod,
  isDateInReportPeriod,
  getReportPeriodValidationError,
  parseMonthName,
  type ReportPeriodSelection,
} from "@/lib/report-period";
import {
  buildAdminReportMeta,
  buildAdminReportShell,
  buildCustomReportsBody,
  buildGeneralReportBody,
  buildTeamsReportBody,
  openAdminReportPrintWindow,
} from "@/lib/admin-report-document";
import { hasNewAdminNudges, markAdminNudgesAsSeen } from "@/lib/admin-nudge-indicator";
import {
  CandidateCommentsSession,
  type CandidateCommentsSessionApplicant,
} from "@/components/dashboard/candidate-comments-session";
import {
  ADMIN_PIPELINE_STAGE_ORDER,
  buildPipelineSessionList,
  groupApplicantsByPipelineStage,
  mapAdminPipelineCandidate,
} from "@/lib/pipeline-session-utils";
import { AdminPipelineTab } from "@/components/dashboard/admin-pipeline-tab";
import { ClosureReportsCardList } from "@/components/dashboard/closure-reports-card-list";
import { useEmployeeAuth } from "@/contexts/auth-context";
import GaugeComponent from 'react-gauge-component';
import PerformanceGauge from '@/components/dashboard/performance-gauge';
import { ChatDock } from '@/components/chat/chat-dock';
import { ChatModal } from '@/components/chat/admin-chat-modal';
// TypeScript interfaces
interface Requirement {
  id: string;
  position: string;
  noOfPositions?: number;
  splitRequirement?: boolean;
  criticality: string;
  toughness?: string;
  company: string;
  spoc: string;
  talentAdvisor: string | null;
  teamLead: string | null;
  status?: string;
  managementStatus?: string;
  managementReason?: string | null;
  managedAt?: string | null;
  sourceType?: string | null;
  sourceDetails?: string | null;
  jdFile?: string;
  jdText?: string;
  talentAdvisorId?: string | null;
  assignmentStatus?: string;
  needsTalentAdvisorReassignment?: boolean;
}

const getStoredAdminSetting = (key: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback;
  const stored = window.localStorage.getItem(key);
  return stored ?? fallback;
};

// Requirements data for pagination
const requirementsData = [
  { id: 1, position: "Mobile App Developer", criticality: "HIGH", company: "Tesco", spoc: "Mel Gibson", talentAdvisor: "Mel Gibson", teamLead: "Arun" },
  { id: 2, position: "Backend Developer", criticality: "LOW", company: "CodeLabs", spoc: "Robert Kim", talentAdvisor: "Robert Kim", teamLead: "Arun" },
  { id: 3, position: "Frontend Developer", criticality: "MEDIUM", company: "TechCorp", spoc: "David Wilson", talentAdvisor: "Unassigned", teamLead: "Arun" },
  { id: 4, position: "QA Tester", criticality: "HIGH", company: "AppLogic", spoc: "Kevin Brown", talentAdvisor: "Unassigned", teamLead: "Unassigned" },
  { id: 5, position: "Mobile App Developer", criticality: "MEDIUM", company: "Tesco", spoc: "Mel Gibson", talentAdvisor: "Mel Gibson", teamLead: "Arun" },
  { id: 6, position: "Backend Developer", criticality: "LOW", company: "CodeLabs", spoc: "Robert Kim", talentAdvisor: "Robert Kim", teamLead: "Arun" },
  { id: 7, position: "UI/UX Designer", criticality: "MEDIUM", company: "Designify", spoc: "Tom Anderson", talentAdvisor: "Unassigned", teamLead: "Anusha" },
  { id: 8, position: "Frontend Developer", criticality: "HIGH", company: "TechCorp", spoc: "David Wilson", talentAdvisor: "Unassigned", teamLead: "Arun" },
  { id: 9, position: "UI/UX Designer", criticality: "MEDIUM", company: "Designify", spoc: "Tom Anderson", talentAdvisor: "Unassigned", teamLead: "Anusha" },
  { id: 10, position: "QA Tester", criticality: "MEDIUM", company: "AppLogic", spoc: "Kevin Brown", talentAdvisor: "Unassigned", teamLead: "Unassigned" },
  { id: 11, position: "Mobile App Developer", criticality: "HIGH", company: "Designify", spoc: "Mel Gibson", talentAdvisor: "Mel Gibson", teamLead: "Arun" },
  { id: 12, position: "Backend Developer", criticality: "LOW", company: "Tesco", spoc: "Robert Kim", talentAdvisor: "Robert Kim", teamLead: "Unassigned" },
  { id: 13, position: "Frontend Developer", criticality: "HIGH", company: "CodeLabs", spoc: "David Wilson", talentAdvisor: "Unassigned", teamLead: "Anusha" },
  { id: 14, position: "QA Tester", criticality: "LOW", company: "TechCorp", spoc: "Kevin Brown", talentAdvisor: "Unassigned", teamLead: "Arun" },
  { id: 15, position: "DevOps Engineer", criticality: "HIGH", company: "Netflix", spoc: "Sarah Connor", talentAdvisor: "John Smith", teamLead: "Arun" }
];

const teamsData = [
  {
    name: "Arun KS",
    teamName: "Arun's Team",
    teamMembers: 4,
    tenure: "4y3m",
    quartersAchieved: 6,
    nextMilestone: "+3",
    members: [
      {
        name: "Sudharshan",
        salary: "3,50,000 INR",
        year: "2024-2025",
        count: 10,
        id: "STTA001",
        role: "Recruitment Executive",
        email: "sudharshan@scaling.com",
        mobile: "9876543210",
        joined: "1/4/2023",
        closures: "3 this month"
      },
      {
        name: "Deepika",
        salary: "4,50,000 INR",
        year: "2024-2025",
        count: 5,
        id: "STTA002",
        role: "Senior Recruiter",
        email: "deepika@scaling.com",
        mobile: "9876543211",
        joined: "15/2/2023",
        closures: "2 this month"
      },
      {
        name: "Dharshan",
        salary: "1,00,000 INR",
        year: "2024-2025",
        count: 4,
        id: "STTA003",
        role: "Junior Recruiter",
        email: "dharshan@scaling.com",
        mobile: "9876543212",
        joined: "10/3/2023",
        closures: "1 this month"
      },
      {
        name: "Kavya",
        salary: "2,20,000 INR",
        year: "2024-2025",
        count: 2,
        id: "STTA004",
        role: "Recruitment Executive",
        email: "kavya@scaling.com",
        mobile: "9876543213",
        joined: "5/1/2023",
        closures: "4 this month"
      },
      {
        name: "Thamarai Selvi",
        salary: "7,50,000 INR",
        year: "2024-2025",
        count: 3,
        id: "STTA005",
        role: "Lead Recruiter",
        email: "thamarai@scaling.com",
        mobile: "9876543214",
        joined: "20/6/2022",
        closures: "5 this month"
      },
      {
        name: "Karthikayan",
        salary: "2,90,000 INR",
        year: "2024-2025",
        count: 2,
        id: "STTA006",
        role: "Recruitment Executive",
        email: "karthik@scaling.com",
        mobile: "9876543215",
        joined: "12/5/2023",
        closures: "2 this month"
      }
    ]
  },
  {
    name: "Anusha",
    teamName: "Anusha's Team",
    teamMembers: 4,
    tenure: "4y3m",
    quartersAchieved: 6,
    nextMilestone: "+3",
    members: [
      {
        name: "Sudharshan",
        salary: "3,50,000 INR",
        year: "2024-2025",
        count: 10,
        id: "STTA007",
        role: "Recruitment Executive",
        email: "sudharshan2@scaling.com",
        mobile: "9876543216",
        joined: "1/4/2023",
        closures: "3 this month"
      },
      {
        name: "Deepika",
        salary: "4,50,000 INR",
        year: "2024-2025",
        count: 5,
        id: "STTA008",
        role: "Senior Recruiter",
        email: "deepika2@scaling.com",
        mobile: "9876543217",
        joined: "15/2/2023",
        closures: "2 this month"
      },
      {
        name: "Dharshan",
        salary: "1,00,000 INR",
        year: "2024-2025",
        count: 4,
        id: "STTA009",
        role: "Junior Recruiter",
        email: "dharshan2@scaling.com",
        mobile: "9876543218",
        joined: "10/3/2023",
        closures: "1 this month"
      },
      {
        name: "Kavya",
        salary: "2,20,000 INR",
        year: "2024-2025",
        count: 2,
        id: "STTA010",
        role: "Recruitment Executive",
        email: "kavya2@scaling.com",
        mobile: "9876543219",
        joined: "5/1/2023",
        closures: "4 this month"
      },
      {
        name: "Thamarai Selvi",
        salary: "7,50,000 INR",
        year: "2024-2025",
        count: 3,
        id: "STTA011",
        role: "Lead Recruiter",
        email: "thamarai2@scaling.com",
        mobile: "9876543220",
        joined: "20/6/2022",
        closures: "5 this month"
      },
      {
        name: "Karthikayan",
        salary: "2,90,000 INR",
        year: "2024-2025",
        count: 2,
        id: "STTA012",
        role: "Recruitment Executive",
        email: "karthik2@scaling.com",
        mobile: "9876543221",
        joined: "12/5/2023",
        closures: "2 this month"
      }
    ]
  }
];

// Removed sample pipeline data - now using real data from API

// All employees list from teams data
const allEmployees = [
  ...teamsData[0].members.map(member => ({ name: member.name, role: member.role, id: member.id })),
  ...teamsData[1].members.map(member => ({ name: member.name, role: member.role, id: member.id })),
  { name: "Arun KS", role: "TL", id: "TL001" },
  { name: "Anusha", role: "TL", id: "TL002" }
];

const tlList = allEmployees.filter(emp => emp.role === 'TL' || emp.role === 'Lead Recruiter').map(emp => ({ ...emp, displayRole: emp.role === 'TL' ? 'TL - Team Leader' : 'TL' }));
const taList = allEmployees.filter(emp => emp.role === 'Senior Recruiter' || emp.role === 'Recruitment Executive' || emp.role === 'Junior Recruiter').map(emp => ({ ...emp, displayRole: 'TA' }));

// Removed sample data for modal - now using real data from API

const initialMessagesData: Array<{ name: string; message: string; date: string; status: string; timestamp: Date }> = [];

const deliveredData: Array<{ requirement: string; candidate: string; client: string; deliveredDate: string; status: string }> = [];

const defaultedData: Array<{ requirement: string; candidate: string; client: string; expectedDate: string; status: string }> = [];

const initialTlMeetingsData = [
  { meetingType: "Performance Review", date: "05-Sep-2025", time: "10:00 AM", person: "Arun KS", agenda: "Quarterly performance discussion", status: "Scheduled" },
  { meetingType: "Team Planning", date: "06-Sep-2025", time: "02:30 PM", person: "Anusha", agenda: "Q4 strategy and targets", status: "Scheduled" },
  { meetingType: "One-on-One", date: "07-Sep-2025", time: "11:15 AM", person: "Umar", agenda: "Career development discussion", status: "Pending" }
];

const initialCeoMeetingsData = [
  { meetingType: "Board Review", date: "10-Sep-2025", time: "09:00 AM", person: "John Mathew", agenda: "Company strategy and vision", status: "Scheduled" }
];

// Performance Chart Component
interface PerformanceChartProps {
  data: Array<{
    member: string;
    delivered?: number;
    required?: number;
    requirements?: number;
    resumesA?: number;
    resumesB?: number;
    memberIndex?: number;
  }>;
  height?: string;
  benchmarkValue?: number;
  showDualLines?: boolean;
}

function PerformanceChart({ data, height = "100%", benchmarkValue = 10, showDualLines = false }: PerformanceChartProps) {
  const chartData = (data || []).map((point) => ({
    ...point,
    delivered: point.delivered ?? point.resumesB ?? 0,
    required: point.required ?? point.resumesA ?? point.requirements ?? 0,
  }));

  const isDual =
    showDualLines ||
    chartData.some((point) => point.delivered > 0 || point.required > 0);

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-50 dark:bg-gray-800 rounded-md border border-dashed border-gray-300 dark:border-gray-600">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">No performance data available</p>
          <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Data will appear once teams are assigned</p>
        </div>
      </div>
    );
  }

  const maxResumes = isDual
    ? Math.max(
        benchmarkValue,
        ...chartData.map((d) => Math.max(d.delivered, d.required)),
      )
    : 15;
  const roundedMax = Math.max(4, Math.ceil(maxResumes / 3) * 3);
  const tickStep = roundedMax <= 12 ? 3 : Math.ceil(roundedMax / 5);
  const ticks = isDual
    ? Array.from({ length: Math.floor(roundedMax / tickStep) + 1 }, (_, i) => i * tickStep)
    : [3, 6, 9, 12, 15];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorDeliveredMain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorRequiredMain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
        <XAxis
          dataKey="member"
          stroke="#6b7280"
          style={{ fontSize: '11px' }}
          tick={{ fill: '#6b7280' }}
          tickFormatter={(value, index) => {
            if (isDual && chartData[index]?.memberIndex !== undefined) {
              return `${chartData[index].memberIndex}. ${value}`;
            }
            return value;
          }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#6b7280' }}
          ticks={ticks}
          domain={[0, isDual ? roundedMax : 15]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        {isDual && (
          <ReferenceLine
            y={benchmarkValue}
            stroke="#6b7280"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: `Benchmark (${benchmarkValue})`,
              position: 'insideTopRight',
              fill: '#6b7280',
              fontSize: 11,
            }}
          />
        )}
        {isDual ? (
          <>
            <Area
              type="monotone"
              dataKey="delivered"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#colorDeliveredMain)"
              dot={{ fill: '#22c55e', r: 4 }}
              activeDot={{ r: 6 }}
              name="Delivered"
            />
            <Area
              type="monotone"
              dataKey="required"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#colorRequiredMain)"
              fillOpacity={0.5}
              dot={{ fill: '#ef4444', r: 4 }}
              activeDot={{ r: 6 }}
              name="Required"
            />
            <Legend />
          </>
        ) : (
          <>
            <ReferenceLine
              y={benchmarkValue}
              stroke="#6b7280"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ value: `Benchmark (${benchmarkValue})`, position: 'right', fill: '#6b7280', fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="requirements"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#colorDeliveredMain)"
              dot={{ fill: '#22c55e', r: 4 }}
              activeDot={{ r: 6 }}
              name="Requirements"
            />
            <Legend />
          </>
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Performance trend chart (time-series) — matches Daily Metrics colors
interface PerformanceTrendChartProps {
  data: Array<{ period: string; delivered: number; required: number }>;
  height?: string;
  chartId?: string;
}

function PerformanceTrendChart({
  data,
  height = "100%",
  chartId = "main",
}: PerformanceTrendChartProps) {
  const chartData = data || [];
  const hasValues = chartData.some(
    (point) => point.delivered > 0 || point.required > 0,
  );

  if (!chartData.length || !hasValues) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-50 dark:bg-gray-800 rounded-md border border-dashed border-gray-300 dark:border-gray-600">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">No performance data available</p>
          <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
            Delivered and required totals will appear once resume activity is recorded
          </p>
        </div>
      </div>
    );
  }

  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.delivered, d.required)),
    4,
  );
  const roundedMax = Math.max(6, Math.ceil(maxVal / 3) * 3);
  const tickStep = roundedMax <= 12 ? 3 : Math.ceil(roundedMax / 5);
  const ticks = Array.from(
    { length: Math.floor(roundedMax / tickStep) + 1 },
    (_, i) => i * tickStep,
  );

  const deliveredGradientId = `colorDeliveredTrend-${chartId}`;
  const requiredGradientId = `colorRequiredTrend-${chartId}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={deliveredGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id={requiredGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
        <XAxis
          dataKey="period"
          stroke="#6b7280"
          interval={0}
          angle={-35}
          textAnchor="end"
          height={56}
          tick={{ fill: "#6b7280", fontSize: 10 }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
          tick={{ fill: "#6b7280" }}
          ticks={ticks}
          domain={[0, roundedMax]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="delivered"
          stroke="#22c55e"
          strokeWidth={2}
          fill={`url(#${deliveredGradientId})`}
          dot={{ fill: "#22c55e", r: 4 }}
          activeDot={{ r: 6 }}
          name="Delivered"
        />
        <Area
          type="monotone"
          dataKey="required"
          stroke="#ef4444"
          strokeWidth={2}
          fill={`url(#${requiredGradientId})`}
          fillOpacity={0.6}
          dot={{ fill: "#ef4444", r: 4 }}
          activeDot={{ r: 6 }}
          name="Required"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Revenue Chart Component
interface RevenueChartProps {
  data: Array<{ member: string; revenue: number }>;
  height?: string;
  benchmarkValue?: number;
}

function RevenueChart({ data, height = "100%", benchmarkValue = 230000 }: RevenueChartProps) {
  // Use all data, including zero values, to show the graph structure
  const chartData = data && data.length > 0 ? data : [];

  // Show empty state only if absolutely no data
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-50 dark:bg-gray-800 rounded-md border border-dashed border-gray-300 dark:border-gray-600">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">No revenue data available</p>
          <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Revenue data will appear once closures are recorded</p>
        </div>
      </div>
    );
  }

  // Use all data for display - show graph structure even with zero values
  // Filter out zero values only if we have non-zero data, otherwise show all to maintain structure
  const hasNonZeroData = chartData.some(item => item.revenue > 0);
  const displayData = hasNonZeroData
    ? chartData.filter(item => item.revenue > 0)
    : chartData.length > 0
      ? chartData
      : [];

  // Calculate min and max revenue values for Y-axis domain
  const revenueValues = displayData.map(item => item.revenue);
  const minRevenue = revenueValues.length > 0 ? Math.min(...revenueValues) : 0;
  const maxRevenue = revenueValues.length > 0 ? Math.max(...revenueValues) : benchmarkValue || 0;
  const benchmark = benchmarkValue || 0;

  // Set Y-axis domain to start from zero or minimum value with some padding
  const yAxisMin = 0;
  const yAxisMax =
    maxRevenue > 0
      ? Math.max(maxRevenue, benchmark) * 1.15
      : benchmark > 0
        ? benchmark * 1.15
        : 1000;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={displayData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="member"
          stroke="#6b7280"
          style={{ fontSize: '11px' }}
          tick={{ fill: '#6b7280' }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#6b7280' }}
          tickFormatter={(value) => value != null ? `${value / 1000}K` : '0K'}
          domain={[yAxisMin, yAxisMax]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
          formatter={(value: any) => {
            const numValue = value != null ? Number(value) : 0;
            return `₹${numValue.toLocaleString()}`;
          }}
        />
        <ReferenceLine
          y={benchmarkValue}
          stroke="#10b981"
          strokeWidth={2}
          strokeDasharray="5 5"
          label={{
            value: benchmarkValue != null ? `Avg: ₹${(benchmarkValue / 1000).toFixed(0)}K` : 'Avg: ₹0K',
            position: 'right',
            fill: '#10b981',
            fontSize: 12
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#8b5cf6"
          strokeWidth={3}
          dot={{ fill: '#8b5cf6', r: 5 }}
          activeDot={{ r: 7 }}
          name="Revenue"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// Impact Metrics Editor Component
function ImpactMetricsEditor() {
  const queryClient = useQueryClient();
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Fetch impact metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/admin/impact-metrics'],
  });

  // Create mutation for initial metrics
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/admin/impact-metrics', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/impact-metrics'] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: number }) => {
      const response = await apiRequest('PUT', `/api/admin/impact-metrics/${id}`, { [field]: value });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/impact-metrics'] });
      toast({ title: "Success", description: "Metric updated successfully" });
      setEditingMetric(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update metric", variant: "destructive" });
    },
  });

  const handleEdit = (metricKey: string, currentValue: number) => {
    setEditingMetric(metricKey);
    setEditValue(currentValue.toString());
  };

  const handleSave = async (field: string) => {
    const value = parseFloat(editValue);
    if (isNaN(value)) {
      toast({ title: "Error", description: "Please enter a valid number", variant: "destructive" });
      return;
    }

    // If no metrics exist, create one first
    if (!metrics || metrics.length === 0) {
      const defaultMetrics = {
        ...EMPTY_IMPACT_METRICS,
        [field]: value,
      };
      await createMutation.mutateAsync(defaultMetrics);
      setEditingMetric(null);
      return;
    }

    updateMutation.mutate({ id: metrics[0].id, field, value });
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter') {
      handleSave(field);
    } else if (e.key === 'Escape') {
      setEditingMetric(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading metrics...</div>;
  }

  const currentMetrics = metrics?.[0] || { ...EMPTY_IMPACT_METRICS };

  const MetricCard = ({ title, value, unit, subtitle, bgColor, borderColor, textColor, field, testId }: any) => {
    const isEditing = editingMetric === field;

    return (
      <div className={`${bgColor} rounded-lg p-4 border ${borderColor} cursor-pointer hover:shadow-md transition-shadow overflow-hidden`} data-testid={testId}>
        <h3 className={`text-sm font-medium ${textColor} mb-2`}>{title}</h3>
        {isEditing ? (
          <div className="flex flex-col space-y-2">
            <Input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, field)}
              className="text-2xl font-bold w-full h-12"
              autoFocus
              data-testid={`input-${field}`}
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={() => handleSave(field)} className="flex-1" data-testid={`button-save-${field}`}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditingMetric(null)} className="flex-1" data-testid={`button-cancel-${field}`}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div onClick={() => handleEdit(field, value)} data-testid={`value-${field}`}>
            <div className={`text-3xl font-bold ${textColor.replace('700', '600')}`}>{value}{unit}</div>
            <div className="text-sm text-gray-600 mt-1">{subtitle}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <MetricCard
          title="Speed to Hire value"
          value={currentMetrics.speedToHire}
          unit=""
          subtitle="Days faster*"
          bgColor="bg-red-50"
          borderColor="border-red-200"
          textColor="text-red-700"
          field="speedToHire"
          testId="card-speedToHire"
        />
        <MetricCard
          title="Revenue Impact Of Delay"
          value={currentMetrics.revenueImpactOfDelay}
          unit=""
          subtitle="Lost per Role*"
          bgColor="bg-red-50"
          borderColor="border-red-200"
          textColor="text-red-700"
          field="revenueImpactOfDelay"
          testId="card-revenueImpactOfDelay"
        />
        <MetricCard
          title="Client NPS"
          value={currentMetrics.clientNps}
          unit=""
          subtitle="Net Promoter Score*"
          bgColor="bg-purple-50"
          borderColor="border-purple-200"
          textColor="text-purple-700"
          field="clientNps"
          testId="card-clientNps"
        />
        <MetricCard
          title="Candidate NPS"
          value={currentMetrics.candidateNps}
          unit=""
          subtitle="Net Promoter Score*"
          bgColor="bg-purple-50"
          borderColor="border-purple-200"
          textColor="text-purple-700"
          field="candidateNps"
          testId="card-candidateNps"
        />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Feedback Turn Around"
          value={currentMetrics.feedbackTurnAround}
          unit=""
          subtitle="days (Avg. 5 days)*"
          bgColor="bg-yellow-50"
          borderColor="border-yellow-200"
          textColor="text-yellow-700"
          field="feedbackTurnAround"
          testId="card-feedbackTurnAround"
        />
        <MetricCard
          title="First Year Retention Rate"
          value={currentMetrics.firstYearRetentionRate}
          unit="%"
          subtitle=""
          bgColor="bg-yellow-50"
          borderColor="border-yellow-200"
          textColor="text-yellow-700"
          field="firstYearRetentionRate"
          testId="card-firstYearRetentionRate"
        />
        <MetricCard
          title="Fulfillment Rate"
          value={currentMetrics.fulfillmentRate}
          unit="%"
          subtitle=""
          bgColor="bg-yellow-50"
          borderColor="border-yellow-200"
          textColor="text-yellow-700"
          field="fulfillmentRate"
          testId="card-fulfillmentRate"
        />
        <MetricCard
          title="Revenue Recovered"
          value={currentMetrics.revenueRecovered}
          unit=" L"
          subtitle="Gained per hire*"
          bgColor="bg-yellow-50"
          borderColor="border-yellow-200"
          textColor="text-yellow-700"
          field="revenueRecovered"
          testId="card-revenueRecovered"
        />
      </div>
    </>
  );
}

function formatEmployeeStatusLabel(role?: string | null): string {
  const normalized = (role || "").trim().toLowerCase();
  if (!normalized) return "N/A";
  const map: Record<string, string> = {
    client_member: "Client Member",
    client_admin: "Client Admin",
    team_leader: "Team Leader",
    recruiter: "Talent Advisor",
    talent_advisor: "Talent Advisor",
    client: "Client",
    admin: "Administrator",
  };
  if (map[normalized]) return map[normalized];
  return normalized
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isClientPortalEmployeeRole(role?: string | null): boolean {
  const normalized = (role || "").trim().toLowerCase();
  return normalized === "client" || normalized === "client_admin" || normalized === "client_member";
}
export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const employee = useEmployeeAuth();
  const [, navigate] = useLocation();
  const [profileData, setProfileData] = useState<any>(null);

  // Load profile data for chat
  useEffect(() => {
    const loadProfileData = async () => {
      if (!employee?.role) return;

      try {
        let endpoint = '';
        switch (employee.role) {
          case 'recruiter':
            endpoint = '/api/recruiter/profile';
            break;
          case 'team_leader':
            endpoint = '/api/team-leader/profile';
            break;
          case 'admin':
            endpoint = '/api/admin/profile';
            break;
          case 'client':
            endpoint = '/api/client/profile';
            break;
        }

        if (endpoint) {
          try {
            const response = await apiRequest('GET', endpoint);
            const data = await response.json();
            setProfileData(data);
          } catch (error) {
            // Silently fail - profile data is optional
          }
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    };

    loadProfileData();
  }, [employee?.role]);

  const userName = profileData?.name || employee?.name || "Admin User";
  const userRole = employee?.role || 'admin';

  // Restore sidebarTab from sessionStorage for proper back navigation
  const initialSidebarTab = () => {
    const saved = sessionStorage.getItem('adminDashboardSidebarTab');
    sessionStorage.removeItem('adminDashboardSidebarTab');
    const allowedTabs = new Set(['dashboard', 'requirements', 'pipeline', 'metrics', 'master-data', 'performance', 'report', 'nudges', 'user-management']);
    return saved && allowedTabs.has(saved) ? saved : 'dashboard';
  };

  const [sidebarTab, setSidebarTab] = useState(initialSidebarTab());
  const [pipelineView, setPipelineView] = useState<"board" | "candidate-session">("board");
  const [sessionApplicationId, setSessionApplicationId] = useState<string | null>(null);
  const [sessionApplicantSnapshot, setSessionApplicantSnapshot] =
    useState<CandidateCommentsSessionApplicant | null>(null);

  // Restore activeTab from sessionStorage for proper back navigation
  const initialActiveTab = () => {
    const saved = sessionStorage.getItem('adminDashboardActiveTab');
    sessionStorage.removeItem('adminDashboardActiveTab');
    return saved ? saved : 'team';
  };

  const [activeTab, setActiveTab] = useState(initialActiveTab());
  const [requirementsVisible, setRequirementsVisible] = useState(10);
  const [isAddRequirementModalOpen, setIsAddRequirementModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isReassignConfirmOpen, setIsReassignConfirmOpen] = useState(false);
  const [isManageRequirementModalOpen, setIsManageRequirementModalOpen] = useState(false);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [isClientMetricsModalOpen, setIsClientMetricsModalOpen] = useState(false);
  const [selectedKeyMetricsClient, setSelectedKeyMetricsClient] = useState<string>("all");
  const [selectedKeyMetricsPeriod, setSelectedKeyMetricsPeriod] = useState<string>("monthly");
  const [clientMetricsPeriod, setClientMetricsPeriod] = useState<string>("monthly");
  const [clientMetricsDate, setClientMetricsDate] = useState<Date | undefined>(new Date());
  const [clientMetricsWeekStart, setClientMetricsWeekStart] = useState<Date | undefined>(new Date());
  const [clientMetricsMonth, setClientMetricsMonth] = useState<string>(format(new Date(), "MMMM"));
  const [clientMetricsYear, setClientMetricsYear] = useState<string>(format(new Date(), "yyyy"));
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);
  const [isCashoutModalOpen, setIsCashoutModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [isClientMasterModalOpen, setIsClientMasterModalOpen] = useState(false);
  const [isEmployeeMasterModalOpen, setIsEmployeeMasterModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  // Fetch cash outflow data from API
  const { data: cashoutDataRaw = [], isLoading: isLoadingCashout, refetch: refetchCashout } = useQuery<any[]>({
    queryKey: ['/api/admin/cash-outflows']
  });

  // Transform API data to match frontend format
  const cashoutData = useMemo(() => {
    return cashoutDataRaw.map((item: any) => ({
      id: item.id,
      month: item.month,
      year: String(item.year),
      employees: item.employeesCount,
      salary: item.totalSalary,
      incentive: item.incentive,
      tools: item.toolsCost,
      rent: item.rent,
      others: item.otherExpenses
    }));
  }, [cashoutDataRaw]);
  const [cashoutForm, setCashoutForm] = useState({
    month: '', year: '', employees: '', salary: '', incentive: '', tools: '', rent: '', others: ''
  });
  const [selectedRequirement, setSelectedRequirement] = useState<any>(null);
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null);
  const [manageRequirementAction, setManageRequirementAction] = useState<'hold' | 'closed' | 'resume' | ''>('');
  const [manageRequirementReason, setManageRequirementReason] = useState('');

  // Check if all cashout form fields are filled
  const isCashoutFormComplete = useMemo(() => {
    return !!(
      cashoutForm.month &&
      cashoutForm.year &&
      cashoutForm.employees &&
      cashoutForm.salary &&
      cashoutForm.incentive &&
      cashoutForm.tools &&
      cashoutForm.rent &&
      cashoutForm.others
    );
  }, [cashoutForm]);

  // Fetch target mappings from API (enriched with teamLeadName, teamMemberName, teamMemberRole)
  const { data: targetMappings = [], isLoading: isLoadingTargets } = useQuery<any[]>({
    queryKey: ["/api/admin/target-mappings"],
  });

  // Fetch revenue mappings from API
  const { data: revenueMappings = [], isLoading: isLoadingRevenue } = useQuery<any[]>({
    queryKey: ["/api/admin/revenue-mappings"],
  });

  const { data: incentiveMappings = [], isLoading: isLoadingIncentiveMappings } = useQuery<any[]>({
    queryKey: ["/api/admin/incentive-mappings"],
  });

  const recentRevenueMappings = useMemo(
    () => sortRevenueMappingsByRecency(revenueMappings).slice(0, 5),
    [revenueMappings],
  );

  // Fetch pipeline data from API (all applications from all recruiters)
  // Supports filtering by TL (team leader) and TA (team member)
  const [selectedPipelineTL, setSelectedPipelineTL] = useState<string>("all");
  const [selectedPipelineTeamMember, setSelectedPipelineTeamMember] = useState<string>("all");
  const [pipelineAutoRefreshEnabled, setPipelineAutoRefreshEnabled] = useState<boolean>(() => getStoredAdminSetting('adminPipelineAutoRefreshEnabled', 'true') === 'true');
  const [pipelineRefreshSeconds, setPipelineRefreshSeconds] = useState<string>(() => getStoredAdminSetting('adminPipelineRefreshSeconds', '10'));
  const [adminDefaultPerformancePeriod, setAdminDefaultPerformancePeriod] = useState<string>(() => getStoredAdminSetting('adminDefaultPerformancePeriod', 'monthly'));
  const { data: pipelineApplications = [], isLoading: isLoadingPipeline, refetch: refetchPipeline } = useQuery<any[]>({
    queryKey: ["/api/admin/pipeline", selectedPipelineTL, selectedPipelineTeamMember],
    queryFn: async () => {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      const createApiUrl = (path: string) => `${API_BASE_URL}${path}`;
      const params = new URLSearchParams();
      if (selectedPipelineTL && selectedPipelineTL !== 'all') {
        params.append('tl', selectedPipelineTL);
      }
      if (selectedPipelineTeamMember && selectedPipelineTeamMember !== 'all') {
        params.append('ta', selectedPipelineTeamMember);
      }
      const url = `/api/admin/pipeline${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(createApiUrl(url), {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch pipeline data');
      return response.json();
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: pipelineAutoRefreshEnabled ? Number(pipelineRefreshSeconds) * 1000 : false,
  });
  // Refetch interval is handled by useQuery's refetchInterval: 10000 above

  useEffect(() => {
    window.localStorage.setItem('adminPipelineAutoRefreshEnabled', String(pipelineAutoRefreshEnabled));
  }, [pipelineAutoRefreshEnabled]);

  useEffect(() => {
    window.localStorage.setItem('adminPipelineRefreshSeconds', pipelineRefreshSeconds);
  }, [pipelineRefreshSeconds]);

  useEffect(() => {
    window.localStorage.setItem('adminDefaultPerformancePeriod', adminDefaultPerformancePeriod);
  }, [adminDefaultPerformancePeriod]);

  useEffect(() => {
    const syncAdminSettings = () => {
      setPipelineAutoRefreshEnabled(getStoredAdminSetting('adminPipelineAutoRefreshEnabled', 'true') === 'true');
      setPipelineRefreshSeconds(getStoredAdminSetting('adminPipelineRefreshSeconds', '10'));
      setAdminDefaultPerformancePeriod(getStoredAdminSetting('adminDefaultPerformancePeriod', 'monthly'));
    };

    window.addEventListener('admin-settings-updated', syncAdminSettings as EventListener);
    return () => window.removeEventListener('admin-settings-updated', syncAdminSettings as EventListener);
  }, []);

  useEffect(() => {
    setSelectedPerformancePeriod(adminDefaultPerformancePeriod);
  }, [adminDefaultPerformancePeriod]);

  // Fetch team leads for reassign dropdown
  const { data: teamLeads = [], isLoading: isLoadingTeamLeads } = useQuery<any[]>({
    queryKey: ["/api/admin/team-leads"],
  });

  const [selectedTeamLeadId, setSelectedTeamLeadId] = useState<string>("");

  // Transform pipeline applications to candidate data with status stages
  const pipelineApplicantData = useMemo(() => {
    // Process real data from API
    if (pipelineApplications && pipelineApplications.length > 0) {
      return pipelineApplications.map((app: any, index: number) => {
        let parsedSkills: string[] = [];
        if (app.skills) {
          try {
            parsedSkills = typeof app.skills === 'string' ? JSON.parse(app.skills) : app.skills;
          } catch {
            parsedSkills = [];
          }
        }

        const statusMap: Record<string, string> = {
          'In Process': 'Resume Review',
          'In-Process': 'Resume Review',
          'Evaluating': 'Resume Review',
          'Resume Review': 'Resume Review',
          'Screening': 'Screening',
          'Shortlisted': 'Shortlisted',
          'Rejected': 'Rejected',
          'Reviewed': 'Reviewed',
          'Screened Out': 'Screened Out',
          'L1': 'L1',
          'L2': 'L2',
          'L3': 'L3',
          'Final Round': 'Final Round',
          'HR Round': 'HR Round',
          'Selected': 'Selected',
          'Interview Scheduled': 'L1',
          'Applied': 'Resume Review',
          'Intro Call': 'Intro Call',
          'Assignment': 'Assignment',
          'Offer Stage': 'Offer Stage',
          'Closure': 'Closure',
          'Joined': 'Joined',
          'Offer Drop': 'Offer Drop',
          'Declined': 'Declined'
        };

        return {
          id: app.id || `app-${index + 1}`,
          appliedOn: app.appliedDate ? new Date(app.appliedDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : 'N/A',
          appliedDate: app.appliedDate || null,
          candidateName: app.candidateName || 'Unknown Candidate',
          company: app.company || 'N/A',
          roleApplied: app.roleApplied || app.jobTitle || 'N/A',
          jobTitle: app.jobTitle || app.roleApplied || 'N/A',
          currentStatus: statusMap[app.currentStatus || app.status] || app.currentStatus || app.status || 'Resume Review',
          email: app.candidateEmail || 'N/A',
          phone: app.candidatePhone || 'N/A',
          location: app.location || 'N/A',
          experience: app.experience || 'N/A',
          skills: parsedSkills,
          resumeUrl: app.resumeUrl || null,
          rating: 4.0,
          recruiter: app.recruiter || 'Unknown',
          teamLeader: app.teamLeader || null,
          profilePicture: app.profilePicture || app.profile_picture || null,
          profileId: app.profileId || null,
        };
      });
    }

    // Return empty array (shouldn't reach here if sample data was added above)
    return [];
  }, [pipelineApplications]);

  // Pipeline filter period state (must be declared before useMemo that uses them)
  const [selectedPipelineTeam, setSelectedPipelineTeam] = useState<string>("all");
  const [pipelineDate, setPipelineDate] = useState<Date | null>(null);
  // Note: selectedPipelineTeamMember is declared earlier (before useQuery hook)
  const [pipelineMonth, setPipelineMonth] = useState<string>(format(new Date(), "MMMM"));
  const [pipelineYear, setPipelineYear] = useState<string>(new Date().getFullYear().toString());
  const [pipelineWeekStart, setPipelineWeekStart] = useState<Date | undefined>(new Date());
  const [pipelineQuarter, setPipelineQuarter] = useState<string>("Q1");

  // Filter pipeline applicants based on date (null = show all)
  const filteredPipelineApplicants = useMemo(() => {
    let filtered = [...pipelineApplicantData];

    // Apply date filtering (null means show all)
    if (pipelineDate !== null) {
      const filterDate = format(pipelineDate, 'yyyy-MM-dd');
      filtered = filtered.filter((a: any) => {
        // Parse appliedOn date (format: DD-MM-YYYY) or appliedDate (ISO)
        let dateToCheck: string | null = null;
        if (a.appliedDate) {
          try {
            const parsedDate = new Date(a.appliedDate);
            dateToCheck = format(parsedDate, 'yyyy-MM-dd');
          } catch {
            // Try appliedOn format
            if (a.appliedOn && a.appliedOn !== 'N/A') {
              try {
                const [day, month, year] = a.appliedOn.split('-');
                const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                dateToCheck = format(parsedDate, 'yyyy-MM-dd');
              } catch {
                return false;
              }
            }
          }
        } else if (a.appliedOn && a.appliedOn !== 'N/A') {
          try {
            const [day, month, year] = a.appliedOn.split('-');
            const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            dateToCheck = format(parsedDate, 'yyyy-MM-dd');
          } catch {
            return false;
          }
        }
        if (!dateToCheck) return false;
        return dateToCheck === filterDate;
      });
    }

    // Filter by TL/TA is now handled at API level via selectedPipelineTL and selectedPipelineTeamMember
    // No need for client-side filtering here

    return filtered;
  }, [pipelineApplicantData, pipelineDate, selectedPipelineTL, selectedPipelineTeamMember]);

  // Map applicant statuses to pipeline stages (each status maps to exactly one stage)
  const getPipelineCandidatesByStage = useMemo(
    () => groupApplicantsByPipelineStage(filteredPipelineApplicants),
    [filteredPipelineApplicants],
  );

  const adminPipelineSessionList = useMemo(
    () =>
      buildPipelineSessionList(
        getPipelineCandidatesByStage,
        ADMIN_PIPELINE_STAGE_ORDER,
        (c) => mapAdminPipelineCandidate(c),
      ),
    [getPipelineCandidatesByStage],
  );

  const handlePipelineCandidateClick = (candidate: any) => {
    if (!candidate?.id) return;
    const snapshot = mapAdminPipelineCandidate(candidate);
    setSessionApplicationId(snapshot.id);
    setSessionApplicantSnapshot(snapshot);
    setPipelineView("candidate-session");
  };

  const handleSelectSessionApplicant = (applicant: CandidateCommentsSessionApplicant) => {
    setSessionApplicationId(applicant.id);
    setSessionApplicantSnapshot(applicant);
  };

  const handleCloseCandidateSession = () => {
    setPipelineView("board");
    setSessionApplicationId(null);
    setSessionApplicantSnapshot(null);
  };

  // Revenue mapping state for editing
  const [editingRevenueMapping, setEditingRevenueMapping] = useState<any>(null);
  const [isIncentiveMappingModalOpen, setIsIncentiveMappingModalOpen] = useState(false);
  const [editingIncentiveMapping, setEditingIncentiveMapping] = useState<any>(null);

  const deleteIncentiveMappingMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/incentive-mappings/${id}`);
    },
    onSuccess: () => {
      invalidateIncentiveMappingQueries(queryClient);
      toast({
        title: "Success",
        description: "Incentive mapping deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete incentive mapping",
        variant: "destructive",
      });
    },
  });

  const handleDeleteIncentiveMapping = (id: string, label: string) => {
    if (!window.confirm(`Delete incentive mapping for "${label}"?`)) return;
    deleteIncentiveMappingMutation.mutate(id);
  };

  const formatIncentiveInr = (value: number) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const renderIncentiveDataSection = () => (
    <Card className="bg-gray-50 dark:bg-gray-800 mt-6">
      <CardHeader className="pb-2 pt-3 flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle className="text-lg text-gray-900 dark:text-white">Incentive Data</CardTitle>
        <Button
          className="bg-cyan-400 hover:bg-cyan-500 text-black px-6 py-2 rounded font-medium text-sm"
          onClick={() => {
            setEditingIncentiveMapping(null);
            setIsIncentiveMappingModalOpen(true);
          }}
          data-testid="button-add-incentive-mapping"
        >
          + Add Incentive
        </Button>
      </CardHeader>
      <CardContent className="p-3">
        <div className="overflow-x-auto admin-scrollbar">
          {isLoadingIncentiveMappings ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              Loading incentive data...
            </div>
          ) : incentiveMappings.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No incentive mappings yet. Map incentives for revenue-mapped candidates.
            </div>
          ) : (
            <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded min-w-[1100px]">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">Candidate</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">TL</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">TA</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">Quarter</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">Year</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">TL Target</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">TA Target</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">TL Revenue</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">TA Revenue</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">TL Incentive</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">TA Incentive</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">BD Incentive</th>
                  <th className="text-left py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incentiveMappings.map((row: any) => (
                  <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700" data-testid={`row-incentive-${row.id}`}>
                    <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">{row.candidateName || "N/A"}</td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.teamLeadName || "N/A"}</td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.talentAdvisorName || "N/A"}</td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.quarter || "N/A"}</td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.year || "N/A"}</td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{formatIncentiveInr(row.tlTargetAmount)}</td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{formatIncentiveInr(row.taTargetAmount)}</td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{formatIncentiveInr(row.tlRevenueAmount)}</td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{formatIncentiveInr(row.taRevenueAmount)}</td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{formatIncentiveInr(row.tlIncentiveAmount)}</td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{formatIncentiveInr(row.taIncentiveAmount)}</td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{formatIncentiveInr(row.bdIncentiveAmount)}</td>
                    <td className="py-3 px-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingIncentiveMapping(row);
                              setIsIncentiveMappingModalOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <EditIcon className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteIncentiveMapping(row.id, row.candidateName || "candidate");
                            }}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Delete revenue mapping mutation
  const deleteRevenueMappingMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/revenue-mappings/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      invalidateRevenueMappingQueries(queryClient);
      toast({
        title: "Success",
        description: "Revenue mapping deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete revenue mapping",
        variant: "destructive",
      });
    },
  });

  // Pipeline modal state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDailyMetricsTeam, setSelectedDailyMetricsTeam] = useState<string>('overall');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isDeliveredModalOpen, setIsDeliveredModalOpen] = useState(false);
  const [isDefaultedModalOpen, setIsDefaultedModalOpen] = useState(false);
  const [isTlMeetingsModalOpen, setIsTlMeetingsModalOpen] = useState(false);
  const [isCeoMeetingsModalOpen, setIsCeoMeetingsModalOpen] = useState(false);
  const [isCreateMessageModalOpen, setIsCreateMessageModalOpen] = useState(false);
  const [isCreateMeetingModalOpen, setIsCreateMeetingModalOpen] = useState(false);
  const [isPendingMeetingsCollapsed, setIsPendingMeetingsCollapsed] = useState(true);
  const [isMessageStatusCollapsed, setIsMessageStatusCollapsed] = useState(true);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [meetingFor, setMeetingFor] = useState('');
  const [meetingWith, setMeetingWith] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedClientMetricsClientId, setSelectedClientMetricsClientId] = useState<string>("all");
  const [meetingType, setMeetingType] = useState('');
  const [meetingDate, setMeetingDate] = useState<Date | undefined>();
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [memberSuggestions, setMemberSuggestions] = useState<Employee[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isEditingMeeting, setIsEditingMeeting] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [isAllRequirementsModalOpen, setIsAllRequirementsModalOpen] = useState(false);
  const [allRequirementsModalSearch, setAllRequirementsModalSearch] = useState('');
  const [isRefreshingRoles, setIsRefreshingRoles] = useState(false);
  const [isTargetMappingModalOpen, setIsTargetMappingModalOpen] = useState(false);
  const [isRevenueMappingModalOpen, setIsRevenueMappingModalOpen] = useState(false);
  const [isPerformanceChartModalOpen, setIsPerformanceChartModalOpen] = useState(false);
  const [isTeamPerformanceTableModalOpen, setIsTeamPerformanceTableModalOpen] = useState(false);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [isClosureReportsModalOpen, setIsClosureReportsModalOpen] = useState(false);
  const [isAddTeamLeaderModalOpen, setIsAddTeamLeaderModalOpen] = useState(false);
  const [isAddTalentAdvisorModalOpen, setIsAddTalentAdvisorModalOpen] = useState(false);
  const [isAddRecruiterModalOpen, setIsAddRecruiterModalOpen] = useState(false);
  const [isAddTeamLeaderModalNewOpen, setIsAddTeamLeaderModalNewOpen] = useState(false);
  const [isAddClientCredentialsModalOpen, setIsAddClientCredentialsModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isPerformanceGraphModalOpen, setIsPerformanceGraphModalOpen] = useState(false);
  const [isRevenueGraphModalOpen, setIsRevenueGraphModalOpen] = useState(false);
  const [isIncrementModalOpen, setIsIncrementModalOpen] = useState(false);
  const [isIncrementEmployeePickerOpen, setIsIncrementEmployeePickerOpen] = useState(false);
  const [revenueTeam, setRevenueTeam] = useState<string>("all");
  const [revenueDateFrom, setRevenueDateFrom] = useState<Date | undefined>(undefined);
  const [revenueDateTo, setRevenueDateTo] = useState<Date | undefined>(undefined);
  const [revenuePeriod, setRevenuePeriod] = useState<string>("monthly");
  const [masterDbConfirmationOpen, setMasterDbConfirmationOpen] = useState(false);
  const [masterDbConfirmationTab, setMasterDbConfirmationTab] = useState<string>('resume');
  const [userList, setUserList] = useState<any[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [messagesData, setMessagesData] = useState(initialMessagesData);
  const [tlMeetingsData, setTlMeetingsData] = useState(initialTlMeetingsData);
  const [ceoMeetingsData, setCeoMeetingsData] = useState(initialCeoMeetingsData);
  const [isAllMessagesModalOpen, setIsAllMessagesModalOpen] = useState(false);
  const [selectedPerformanceTeam, setSelectedPerformanceTeam] = useState<string>("all");
  const [selectedPerformancePeriod, setSelectedPerformancePeriod] = useState<string>(() => getStoredAdminSetting('adminDefaultPerformancePeriod', 'monthly'));

  useEffect(() => {
    if (isRevenueGraphModalOpen && sidebarTab === "performance") {
      setRevenueTeam(selectedPerformanceTeam);
      setRevenuePeriod(selectedPerformancePeriod);
    }
  }, [
    isRevenueGraphModalOpen,
    sidebarTab,
    selectedPerformanceTeam,
    selectedPerformancePeriod,
  ]);

  const [isResumeDatabaseModalOpen, setIsResumeDatabaseModalOpen] = useState(false);
  const [isPerformanceDataModalOpen, setIsPerformanceDataModalOpen] = useState(false);
  const [isEditingFeedbackModal, setIsEditingFeedbackModal] = useState(false);
  const [avgDaysValueModal, setAvgDaysValueModal] = useState<string>("");
  const [isResetPerformanceConfirmOpen, setIsResetPerformanceConfirmOpen] = useState(false);
  const [isResetMasterDataConfirmOpen, setIsResetMasterDataConfirmOpen] = useState(false);
  const [expandedMeetings, setExpandedMeetings] = useState<Set<string>>(new Set());
  const [meetingMembers, setMeetingMembers] = useState<string[]>([]);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [isMeetingsMenuModalOpen, setIsMeetingsMenuModalOpen] = useState(false);
  const [editingCalendarEventId, setEditingCalendarEventId] = useState<string | null>(null);
  const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Search term states for modals and tables
  const [targetSearch, setTargetSearch] = useState('');
  const [messagesSearch, setMessagesSearch] = useState('');
  const [closureReportsSearch, setClosureReportsSearch] = useState('');
  const [selectedClosureReportAction, setSelectedClosureReportAction] = useState<any>(null);
  const [closureReportActionType, setClosureReportActionType] = useState<'offer-drop' | 'early-exit' | null>(null);
  const [isClosureReportActionModalOpen, setIsClosureReportActionModalOpen] = useState(false);
  const [closureReportActionReason, setClosureReportActionReason] = useState('');
  const [closureReportActionDate, setClosureReportActionDate] = useState('');
  const [closureReportReRequirementRequested, setClosureReportReRequirementRequested] = useState(false);
  const [cashoutSearch, setCashoutSearch] = useState('');
  const [resumeDatabaseSearch, setResumeDatabaseSearch] = useState('');
  const [employeeMasterSearch, setEmployeeMasterSearch] = useState('');
  const [incrementEmployeeSearch, setIncrementEmployeeSearch] = useState('');
  const [clientMasterSearch, setClientMasterSearch] = useState('');
  const [teamPerformanceSearch, setTeamPerformanceSearch] = useState('');
  const [closureListSearch, setClosureListSearch] = useState('');
  const [requirementsSearch, setRequirementsSearch] = useState('');
  const [rolesToAssignSearch, setRolesToAssignSearch] = useState('');
  const [incrementEffectiveDate, setIncrementEffectiveDate] = useState<Date | undefined>();
  const [incrementForm, setIncrementForm] = useState({
    selectedEmployeeId: '',
    incrementType: '',
    incrementValueType: 'percentage',
    incrementValue: '',
    revisedCtc: '',
  });
  const [userManagementTab, setUserManagementTab] = useState<'all' | 'clients' | 'team_leaders' | 'talent_advisors'>('all');
  const [userManagementSearch, setUserManagementSearch] = useState('');

  // Password confirmation dialog state for user deletion
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string, name: string } | null>(null);
  const [userToHold, setUserToHold] = useState<{ id: string; name: string; email: string } | null>(null);
  const [isHoldUserModalOpen, setIsHoldUserModalOpen] = useState(false);
  // Password confirmation dialog state for target deletion
  const [targetToDelete, setTargetToDelete] = useState<{ id: string, description: string } | null>(null);
  const [isTargetPasswordDialogOpen, setIsTargetPasswordDialogOpen] = useState(false);
  // Password confirmation dialog state for cash outflow deletion
  const [cashoutToDelete, setCashoutToDelete] = useState<{ id: string, description: string } | null>(null);
  const [isCashoutPasswordDialogOpen, setIsCashoutPasswordDialogOpen] = useState(false);
  // Password confirmation dialog state for revenue mapping deletion
  const [revenueMappingToDelete, setRevenueMappingToDelete] = useState<{ id: string, description: string } | null>(null);
  const [isRevenueMappingPasswordDialogOpen, setIsRevenueMappingPasswordDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [editingTarget, setEditingTarget] = useState<any>(null);
  const [editingCashout, setEditingCashout] = useState<any>(null);

  const [clientForm, setClientForm] = useState({
    brandName: '',
    incorporatedName: '',
    gstin: '',
    address: '',
    location: '',
    spoc: '',
    email: '',
    password: '',
    website: '',
    linkedin: '',
    agreement: '',
    percentage: '',
    category: '',
    paymentTerms: '',
    source: '',
    startDate: '',
    currentStatus: 'active',
    logo: '',
    clientType: 'direct' as 'direct' | 'partnership',
    partnerId: '',
  });
  const [clientLogoFile, setClientLogoFile] = useState<File | null>(null);
  const [clientLogoPreview, setClientLogoPreview] = useState<string | null>(null);
  const [clientStartDate, setClientStartDate] = useState<Date | undefined>();
  const [employeeForm, setEmployeeForm] = useState({
    employeeId: '',
    name: '',
    address: '',
    designation: '',
    email: '',
    phone: '',
    joiningDate: '',
    employmentStatus: '',
    esic: '',
    epfo: '',
    esicNo: '',
    epfoNo: '',
    fatherName: '',
    motherName: '',
    fatherNumber: '',
    motherNumber: '',
    offeredCtc: '',
    currentStatus: '',
    incrementCount: '',
    appraisedQuarter: '',
    appraisedAmount: '',
    appraisedYear: '',
    yearlyCTC: '',
    currentMonthlyCTC: '',
    department: '',
    role: '',
    nameAsPerBank: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branch: '',
    city: ''
  });

  // Report tab state
  const [teamsReportType, setTeamsReportType] = useState('');
  const [teamsPeriod, setTeamsPeriod] = useState('');
  const [teamsReportMonth, setTeamsReportMonth] = useState('January');
  const [teamsReportQuarter, setTeamsReportQuarter] = useState('Q1');
  const [teamsReportYear, setTeamsReportYear] = useState(String(new Date().getFullYear()));
  const [teamsWeekStart, setTeamsWeekStart] = useState<Date | undefined>();
  const [teamsCustomDate, setTeamsCustomDate] = useState<Date | undefined>();
  const [teamsFileFormat, setTeamsFileFormat] = useState('pdf');

  const [reportsCheckboxes, setReportsCheckboxes] = useState({
    requirements: true,
    pipeline: true,
    closureReports: true,
    teamPerformance: true
  });
  const [reportsPeriod, setReportsPeriod] = useState('');
  const [reportsReportMonth, setReportsReportMonth] = useState('January');
  const [reportsReportQuarter, setReportsReportQuarter] = useState('Q1');
  const [reportsReportYear, setReportsReportYear] = useState(String(new Date().getFullYear()));
  const [reportsWeekStart, setReportsWeekStart] = useState<Date | undefined>();
  const [reportsCustomDate, setReportsCustomDate] = useState<Date | undefined>();
  const [reportsTeam, setReportsTeam] = useState('');
  const [reportsPriority, setReportsPriority] = useState('');
  const [reportsType, setReportsType] = useState('');
  const [reportsFileFormat, setReportsFileFormat] = useState('pdf');

  const [generalReportType, setGeneralReportType] = useState('');
  const [generalFileFormat, setGeneralFileFormat] = useState('pdf');

  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [downloadSection, setDownloadSection] = useState<'teams' | 'reports' | 'general'>('teams');
  const [reportGenerating, setReportGenerating] = useState<{
    active: boolean;
    message: string;
    progress: number;
    done?: boolean;
  } | null>(null);
  const [nudgeSeenVersion, setNudgeSeenVersion] = useState(0);

  // Requirements API queries
  const { data: requirements = [], isLoading: isLoadingRequirements } = useQuery({
    queryKey: ['/api/admin/requirements']
  });

  // Fetch archived requirements to check if there are any
  const { data: archivedRequirements = [], isLoading: isLoadingArchivedRequirements } = useQuery({
    queryKey: ['/api/admin/archived-requirements'],
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Client JDs API query
  const { data: clientJDs = [], isLoading: isLoadingClientJDs, refetch: refetchClientJDs } = useQuery({
    queryKey: ['/api/admin/client-jds'],
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });


  // State for JD preview modal
  const [selectedJD, setSelectedJD] = useState<any>(null);
  const [isJDPreviewModalOpen, setIsJDPreviewModalOpen] = useState(false);
  const [jdToAdd, setJdToAdd] = useState<any>(null);
  const [isAddToRequirementAlertOpen, setIsAddToRequirementAlertOpen] = useState(false);
  const [initialRequirementData, setInitialRequirementData] = useState<any>(null);
  const [isViewMoreJDModalOpen, setIsViewMoreJDModalOpen] = useState(false);


  // Fetch employees from database
  const { data: employees = [], isLoading: isLoadingEmployees, refetch: refetchEmployees } = useQuery<Employee[]>({
    queryKey: ['/api/admin/employees']
  });

  // Fetch chat rooms for admin (direct messages with TL/TA)
  const { data: chatRoomsData, isLoading: isLoadingChatRooms, refetch: refetchChatRooms } = useQuery<{ rooms: any[] }>({
    queryKey: ['/api/chat/rooms'],
    enabled: !!employee, // Only fetch if logged in
    refetchInterval: 15000, // Refresh every 15 seconds for real-time updates
  });

  // Filter chat rooms to show only direct messages (Admin-TL/TA conversations)
  const adminChatRooms = useMemo(() => {
    if (!chatRoomsData?.rooms) return [];
    return chatRoomsData.rooms.filter((room: any) => {
      // Only show direct messages with TL or TA
      if (room.type !== 'direct') return false;
      // Check if room has participants who are TL or TA
      const participants = room.participants || [];
      return participants.some((p: any) =>
        p.participantId !== employee?.id &&
        (p.participantRole === 'team_leader' || p.participantRole === 'recruiter')
      );
    });
  }, [chatRoomsData, employee?.id]);

  // Fetch active sessions to determine login status
  // Fetch active employee sessions for real-time online/offline status
  const { data: activeSessionsData } = useQuery<{ activeEmployeeIds: string[] }>({
    queryKey: ['/api/admin/active-sessions'],
    refetchInterval: 10000, // Refresh every 10 seconds for more real-time updates
    refetchOnWindowFocus: true, // Refresh when user returns to the tab
    enabled: sidebarTab === 'user-management' || activeTab === 'user-management', // Only fetch when on User Management page
  });
  const activeEmployeeIds = new Set(activeSessionsData?.activeEmployeeIds || []);

  // Filter employees for HR-related tables (Employees Master)
  // Only include employee_record role, exclude TL/TA (they belong in User Management), admin, and clients
  const hrEmployees = useMemo(() => {
    return employees.filter((emp: any) =>
      !emp.employeeId?.startsWith('STAFFOS') &&
      emp.role !== 'client' &&
      emp.role !== 'admin' &&
      emp.role !== 'team_leader' &&
      emp.role !== 'recruiter'
    );
  }, [employees]);

  const incrementEligibleEmployees = useMemo(() => {
    return employees.filter((emp: any) => emp.role === 'team_leader' || emp.role === 'recruiter');
  }, [employees]);

  const operationsEmployeesForReport = useMemo(
    () => employees.filter((emp: any) => emp.role === "team_leader" || emp.role === "recruiter"),
    [employees],
  );

  const clientPortalUsersForReport = useMemo(
    () => employees.filter((emp: any) => isClientPortalEmployeeRole(emp.role)),
    [employees],
  );

  const filteredIncrementEmployees = useMemo(() => {
    if (!incrementEmployeeSearch.trim()) return incrementEligibleEmployees;
    const search = incrementEmployeeSearch.toLowerCase();
    return incrementEligibleEmployees.filter((emp: any) =>
      emp.name?.toLowerCase().includes(search) ||
      emp.email?.toLowerCase().includes(search) ||
      emp.employeeId?.toLowerCase().includes(search) ||
      emp.role?.toLowerCase().includes(search)
    );
  }, [incrementEligibleEmployees, incrementEmployeeSearch]);

  const selectedIncrementEmployee = useMemo(() => {
    return incrementEligibleEmployees.find((emp: any) => emp.id === incrementForm.selectedEmployeeId) || null;
  }, [incrementEligibleEmployees, incrementForm.selectedEmployeeId]);

  const selectedEmployeeCurrentCtc = useMemo(() => {
    if (!selectedIncrementEmployee) return '';
    return (
      selectedIncrementEmployee.currentMonthlyCTC ||
      selectedIncrementEmployee.yearlyCTC ||
      selectedIncrementEmployee.offeredCtc ||
      ''
    );
  }, [selectedIncrementEmployee]);

  // Filter employees for User Management based on selected tab and search
  const userManagementEmployees = useMemo(() => {
    let filtered = employees.filter((emp: any) => {
      const role = (emp.role || "").toLowerCase();
      return (
        role === "team_leader" ||
        role === "recruiter" ||
        role === "client" ||
        role === "client_admin" ||
        role === "client_member"
      );
    });

    // Filter by selected tab
    if (userManagementTab === 'team_leaders') {
      filtered = filtered.filter((emp: any) => emp.role === 'team_leader');
    } else if (userManagementTab === 'talent_advisors') {
      filtered = filtered.filter((emp: any) => emp.role === 'recruiter');
    } else if (userManagementTab === 'clients') {
      filtered = filtered.filter((emp: any) => {
        const role = (emp.role || "").toLowerCase();
        return role === "client" || role === "client_admin" || role === "client_member";
      });
    }
    // 'all' shows everything

    // Apply search filter
    if (userManagementSearch.trim()) {
      const search = userManagementSearch.toLowerCase();
      filtered = filtered.filter((emp: any) =>
        emp.employeeId?.toLowerCase().includes(search) ||
        emp.name?.toLowerCase().includes(search) ||
        emp.email?.toLowerCase().includes(search) ||
        emp.role?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [employees, userManagementTab, userManagementSearch]);

  // Calculate online count based on active sessions (real-time)
  const onlineCount = useMemo(() => {
    // Count only employees in userManagementEmployees who have active sessions
    return userManagementEmployees.filter((emp: any) =>
      activeEmployeeIds.has(emp.id)
    ).length;
  }, [userManagementEmployees, activeEmployeeIds]);

  // Fetch candidates from database
  const { data: candidates = [], isLoading: isLoadingCandidates } = useQuery<any[]>({
    queryKey: ['/api/admin/candidates']
  });

  // Fetch clients from database
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['/api/admin/clients']
  });

  const clientCompaniesForReport = useMemo(() => clients, [clients]);

  // Fetch impact metrics for Client Metrics modal
  const impactMetricsQuery = useQuery<any[]>({
    queryKey: ['/api/admin/impact-metrics', selectedClientMetricsClientId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedClientMetricsClientId !== "all") {
        params.append("clientId", selectedClientMetricsClientId);
      }
      const suffix = params.toString() ? `?${params.toString()}` : "";
      const response = await apiRequest("GET", `/api/admin/impact-metrics${suffix}`);
      return response.json();
    }
  });

  const adminClientMetricsDateStr = useMemo(() => {
    if (clientMetricsPeriod === "daily" && clientMetricsDate) {
      return format(clientMetricsDate, "yyyy-MM-dd");
    }
    if (clientMetricsPeriod === "weekly" && clientMetricsWeekStart) {
      return format(clientMetricsWeekStart, "yyyy-MM-dd");
    }
    if (clientMetricsPeriod === "monthly") {
      const monthNum = parseMonthName(clientMetricsMonth);
      if (monthNum > 0) {
        return format(
          new Date(parseInt(clientMetricsYear, 10), monthNum - 1, 1),
          "yyyy-MM-dd",
        );
      }
    }
    return format(new Date(), "yyyy-MM-dd");
  }, [
    clientMetricsPeriod,
    clientMetricsDate,
    clientMetricsWeekStart,
    clientMetricsMonth,
    clientMetricsYear,
  ]);

  const adminClientMetricsEnabled =
    sidebarTab === "metrics" || isClientMetricsModalOpen;

  const { data: adminClientMetricsData } = useQuery<{
    speed: {
      timeToFirstSubmission: number;
      timeToInterview: number;
      timeToOffer: number;
      timeToFill: number;
    };
    quality: {
      submissionToShortList: number;
      interviewToOffer: number;
      offerAcceptance: number;
      earlyAttrition: number;
    };
  }>({
    queryKey: [
      "/api/admin/client-metrics",
      selectedClientMetricsClientId,
      clientMetricsPeriod,
      adminClientMetricsDateStr,
    ],
    enabled: adminClientMetricsEnabled,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("period", clientMetricsPeriod);
      params.append("date", adminClientMetricsDateStr);
      if (selectedClientMetricsClientId !== "all") {
        params.append("clientId", selectedClientMetricsClientId);
      }
      const response = await apiRequest("GET", `/api/admin/client-metrics?${params.toString()}`);
      return response.json();
    },
  });

  const adminSpeedMetrics = useMemo(
    () => ({
      timeToFirstSubmission: 0,
      timeToInterview: 0,
      timeToOffer: 0,
      timeToFill: 0,
      ...(adminClientMetricsData?.speed || {}),
    }),
    [adminClientMetricsData],
  );

  const adminQualityMetrics = useMemo(
    () => ({
      submissionToShortList: 0,
      interviewToOffer: 0,
      offerAcceptance: 0,
      earlyAttrition: 0,
      ...(adminClientMetricsData?.quality || {}),
    }),
    [adminClientMetricsData],
  );

  const adminImpactMetrics = useMemo(() => {
    const records = impactMetricsQuery.data || [];
    if (!records.length) return { ...EMPTY_IMPACT_METRICS };
    if (records.length === 1) return { ...EMPTY_IMPACT_METRICS, ...records[0] };

    const average = (key: keyof typeof EMPTY_IMPACT_METRICS) => {
      const values = records
        .map((row) => Number(row?.[key]))
        .filter((value) => Number.isFinite(value));
      if (!values.length) return 0;
      return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
    };

    return {
      speedToHire: average("speedToHire"),
      revenueImpactOfDelay: average("revenueImpactOfDelay"),
      clientNps: average("clientNps"),
      candidateNps: average("candidateNps"),
      feedbackTurnAround: average("feedbackTurnAround"),
      feedbackTurnAroundAvgDays: average("feedbackTurnAroundAvgDays"),
      firstYearRetentionRate: average("firstYearRetentionRate"),
      fulfillmentRate: average("fulfillmentRate"),
      revenueRecovered: average("revenueRecovered"),
    };
  }, [impactMetricsQuery.data]);
  const { data: activeNudgesForIndicator = [] } = useQuery<any[]>({
    queryKey: ['/api/nudges'],
    refetchInterval: 30_000,
  });
  const hasUnreadNudges = useMemo(
    () => hasNewAdminNudges(activeNudgesForIndicator),
    [activeNudgesForIndicator, nudgeSeenVersion],
  );

  const teamsPeriodSelection = useMemo<ReportPeriodSelection>(() => ({
    period: teamsPeriod as ReportPeriodSelection['period'],
    month: teamsReportMonth,
    quarter: teamsReportQuarter,
    year: teamsReportYear,
    weekStart: teamsWeekStart,
    customDate: teamsCustomDate,
  }), [teamsPeriod, teamsReportMonth, teamsReportQuarter, teamsReportYear, teamsWeekStart, teamsCustomDate]);

  const reportsPeriodSelection = useMemo<ReportPeriodSelection>(() => ({
    period: reportsPeriod as ReportPeriodSelection['period'],
    month: reportsReportMonth,
    quarter: reportsReportQuarter,
    year: reportsReportYear,
    weekStart: reportsWeekStart,
    customDate: reportsCustomDate,
  }), [reportsPeriod, reportsReportMonth, reportsReportQuarter, reportsReportYear, reportsWeekStart, reportsCustomDate]);

  // Filtered data using useMemo for search functionality
  const filteredTargetMappings = useMemo(() => {
    if (!targetSearch.trim()) return targetMappings;
    const search = targetSearch.toLowerCase();
    return targetMappings.filter((mapping: any) =>
      mapping.teamLeadName?.toLowerCase().includes(search) ||
      mapping.teamMemberName?.toLowerCase().includes(search) ||
      mapping.teamMemberRole?.toLowerCase().includes(search) ||
      mapping.quarter?.toLowerCase().includes(search) ||
      mapping.year?.toString().includes(search)
    );
  }, [targetMappings, targetSearch]);

  const filteredMessages = useMemo(() => {
    if (!messagesSearch.trim()) return messagesData;
    const search = messagesSearch.toLowerCase();
    return messagesData.filter(msg =>
      msg.name?.toLowerCase().includes(search) ||
      msg.message?.toLowerCase().includes(search) ||
      msg.date?.toLowerCase().includes(search) ||
      msg.status?.toLowerCase().includes(search)
    );
  }, [messagesData, messagesSearch]);

  const filteredCashoutData = useMemo(() => {
    if (!cashoutSearch.trim()) return cashoutData;
    const search = cashoutSearch.toLowerCase();
    return cashoutData.filter(row =>
      row.month?.toLowerCase().includes(search) ||
      row.year?.toString().includes(search)
    );
  }, [cashoutData, cashoutSearch]);

  // Filter clients for Master Data - exclude login-only clients (those belong in User Management)
  const masterDataClients = useMemo(() => {
    return clients.filter((client: any) => !client.isLoginOnly);
  }, [clients]);

  const filteredClients = useMemo(() => {
    if (!clientMasterSearch.trim()) return masterDataClients;
    const search = clientMasterSearch.toLowerCase();
    return masterDataClients.filter((client: any) =>
      client.brandName?.toLowerCase().includes(search) ||
      client.location?.toLowerCase().includes(search) ||
      client.spoc?.toLowerCase().includes(search) ||
      client.website?.toLowerCase().includes(search) ||
      client.currentStatus?.toLowerCase().includes(search)
    );
  }, [masterDataClients, clientMasterSearch]);

  const filteredHrEmployees = useMemo(() => {
    if (!employeeMasterSearch.trim()) return hrEmployees;
    const search = employeeMasterSearch.toLowerCase();
    return hrEmployees.filter((emp: any) =>
      emp.name?.toLowerCase().includes(search) ||
      emp.email?.toLowerCase().includes(search) ||
      emp.designation?.toLowerCase().includes(search) ||
      emp.employmentStatus?.toLowerCase().includes(search)
    );
  }, [hrEmployees, employeeMasterSearch]);

  const resetIncrementForm = () => {
    setIncrementForm({
      selectedEmployeeId: '',
      incrementType: '',
      incrementValueType: 'percentage',
      incrementValue: '',
      revisedCtc: '',
    });
    setIncrementEmployeeSearch('');
    setIncrementEffectiveDate(undefined);
    setIsIncrementEmployeePickerOpen(false);
  };

  // Filter candidates for Resume Database table
  const filteredCandidates = useMemo(() => {
    const candidatesList = (candidates as any[]) || [];
    if (!resumeDatabaseSearch.trim()) return candidatesList;
    const search = resumeDatabaseSearch.toLowerCase();
    return candidatesList.filter((candidate: any) =>
      candidate.candidateId?.toLowerCase().includes(search) ||
      candidate.fullName?.toLowerCase().includes(search) ||
      candidate.currentRole?.toLowerCase().includes(search) ||
      candidate.email?.toLowerCase().includes(search) ||
      candidate.location?.toLowerCase().includes(search)
    );
  }, [candidates, resumeDatabaseSearch]);

  const filteredRequirements = useMemo(() => {
    if (!requirementsSearch.trim()) return requirements;
    const search = requirementsSearch.toLowerCase();
    return requirements.filter((req: any) =>
      req.position?.toLowerCase().includes(search) ||
      req.criticality?.toLowerCase().includes(search) ||
      req.company?.toLowerCase().includes(search) ||
      req.spoc?.toLowerCase().includes(search) ||
      req.talentAdvisor?.toLowerCase().includes(search) ||
      req.teamLead?.toLowerCase().includes(search)
    );
  }, [requirements, requirementsSearch]);

  const streqDisplayMap = useMemo(() => {
    const byRealId = new Map<string, { id: string; createdAt?: string; sourceDetails?: string | null }>();
    for (const req of requirements as any[]) {
      const realId = getRequirementLookupId(req);
      if (!realId || byRealId.has(realId)) continue;
      byRealId.set(realId, {
        id: realId,
        createdAt: req.createdAt,
        sourceDetails: req.sourceDetails,
      });
    }
    return buildStreqDisplayMap(Array.from(byRealId.values()));
  }, [requirements]);

  const getRequirementDisplayId = (requirement: any) => {
    const fromApi = requirement.displayRequirementId?.trim();
    if (fromApi && /^STREQ\d+$/i.test(fromApi)) return fromApi.toUpperCase();
    return resolveRequirementDisplayId(
      requirement,
      streqDisplayMap.get(getRequirementLookupId(requirement)),
    );
  };

  // Fetch daily metrics from API with date filter
  const { data: dailyMetricsData = {
    totalRequirements: 0,
    completedRequirements: 0,
    avgResumesPerRequirement: "0.00",
    requirementsPerRecruiter: "0.00",
    totalResumes: 0,
    dailyDeliveryDelivered: 0,
    dailyDeliveryDefaulted: 0,
    overallPerformance: "G",
    performanceChart: { benchmarkValue: 10, members: [] as Array<{ member: string; fullName?: string; delivered: number; required: number }> },
  }, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['/api/admin/daily-metrics', format(selectedDate, 'yyyy-MM-dd'), selectedDailyMetricsTeam],
    queryFn: async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const API_BASE_URL = import.meta.env.VITE_API_URL || '';
      const createApiUrl = (path: string) => `${API_BASE_URL}${path}`;
      const response = await fetch(createApiUrl(`/api/admin/daily-metrics?date=${dateStr}&team=${selectedDailyMetricsTeam}`), {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch daily metrics');
      return response.json();
    }
  });

  // Fetch key aspects data from API for metrics chart
  const { data: keyAspectsApiData } = useQuery<{
    growthMoM: number;
    growthYoY: number;
    burnRate: number;
    churnRate: number;
    attrition: number;
    netProfit: number;
    revenuePerEmployee: number;
    clientAcquisitionCost: number;
    chartData: Array<{ name: string; growthMoM: number; burnRate: number; churnRate: number; attrition: number }>;
  }>({
    queryKey: ['/api/admin/key-aspects', selectedKeyMetricsClient, selectedKeyMetricsPeriod],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('clientId', selectedKeyMetricsClient);
      params.append('period', selectedKeyMetricsPeriod);
      const response = await apiRequest('GET', `/api/admin/key-aspects?${params.toString()}`);
      return await response.json();
    },
  });

  // Key Aspects data with defaults (connected to Key Metrics chart)
  const keyAspectsData = useMemo(() => ({
    growthMoM: keyAspectsApiData?.growthMoM ?? 0,
    growthYoY: keyAspectsApiData?.growthYoY ?? 0,
    burnRate: keyAspectsApiData?.burnRate ?? 0,
    churnRate: keyAspectsApiData?.churnRate ?? 0,
    attrition: keyAspectsApiData?.attrition ?? 0,
    netProfit: keyAspectsApiData?.netProfit ?? 0,
    revenuePerEmployee: keyAspectsApiData?.revenuePerEmployee ?? 0,
    clientAcquisitionCost: keyAspectsApiData?.clientAcquisitionCost ?? 0,
    chartData: keyAspectsApiData?.chartData ?? []
  }), [keyAspectsApiData]);

  // Fetch master data totals from API
  const { data: masterDataTotals } = useQuery<{
    directUploads: number;
    recruiterUploads: number;
    resumes: number;
    headCount: number;
    salaryPaid: number;
    otherExpenses: number;
    toolsAndDatabases: number;
    rentPaid: number;
  }>({
    queryKey: ['/api/admin/master-data-totals'],
  });

  // Master Data totals with defaults
  const masterTotals = useMemo(() => ({
    directUploads: masterDataTotals?.directUploads ?? 0,
    recruiterUploads: masterDataTotals?.recruiterUploads ?? 0,
    resumes: masterDataTotals?.resumes ?? 0,
    headCount: masterDataTotals?.headCount ?? 0,
    salaryPaid: masterDataTotals?.salaryPaid ?? 0,
    otherExpenses: masterDataTotals?.otherExpenses ?? 0,
    toolsAndDatabases: masterDataTotals?.toolsAndDatabases ?? 0,
    rentPaid: masterDataTotals?.rentPaid ?? 0
  }), [masterDataTotals]);

  // State for right sidebar period filter (dashboard view)
  const [dashboardPerformancePeriod, setDashboardPerformancePeriod] = useState<string>("quarterly");
  const currentYear = new Date().getFullYear();
  const [performanceSummaryScope, setPerformanceSummaryScope] = useState<'overall' | 'quarterly' | 'yearly'>('overall');
  const [performanceSummaryQuarter, setPerformanceSummaryQuarter] = useState<string>(`Q${Math.floor(new Date().getMonth() / 3) + 1}`);
  const [performanceSummaryYear, setPerformanceSummaryYear] = useState<string>(String(currentYear));
  const performanceSummaryYearOptions = useMemo(
    () => Array.from({ length: 6 }, (_, index) => String(currentYear - index)),
    [currentYear]
  );

  // Fetch performance metrics from API (with period support for dashboard view)
  const { data: performanceMetrics = {
    currentQuarter: "Q4 2025",
    minimumTarget: 0,
    targetAchieved: 0,
    incentiveEarned: 0,
    totalRevenue: 0,
    closuresCount: 0,
    performancePercentage: 0
  } } = useQuery<{
    currentQuarter: string;
    minimumTarget: number;
    targetAchieved: number;
    incentiveEarned: number;
    totalRevenue: number;
    closuresCount: number;
    performancePercentage: number;
  }>({
    queryKey: ['/api/admin/performance-metrics', dashboardPerformancePeriod],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dashboardPerformancePeriod) {
        params.append('period', dashboardPerformancePeriod);
      }
      const url = `/api/admin/performance-metrics${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiRequest('GET', url);
      return await response.json();
    },
  });

  // Fetch performance metrics from API (with period support for Performance page)
  const { data: performancePageMetrics = {
    currentQuarter: "Q4 2025",
    minimumTarget: 0,
    targetAchieved: 0,
    incentiveEarned: 0,
    totalRevenue: 0,
    closuresCount: 0,
    performancePercentage: 0
  }, isLoading: isLoadingPerformancePageMetrics } = useQuery<{
    currentQuarter: string;
    minimumTarget: number;
    targetAchieved: number;
    incentiveEarned: number;
    totalRevenue: number;
    closuresCount: number;
    performancePercentage: number;
  }>({
    queryKey: ['/api/admin/performance-metrics', 'performance-page', performanceSummaryScope, performanceSummaryQuarter, performanceSummaryYear],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('summaryScope', performanceSummaryScope);
      params.append('summaryYear', performanceSummaryYear);
      if (performanceSummaryScope === 'quarterly') {
        params.append('summaryQuarter', performanceSummaryQuarter);
      }
      const url = `/api/admin/performance-metrics${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiRequest('GET', url);
      return await response.json();
    },
    enabled: true,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const displayPerformanceMetrics =
    sidebarTab === "performance" ? performancePageMetrics : performanceMetrics;

  // Fetch team performance data from API
  const { data: teamPerformanceData = [], isLoading: isLoadingTeamPerformance } = useQuery<Array<{
    id: string;
    talentAdvisor: string;
    joiningDate: string;
    tenure: string;
    closures: number;
    lastClosure: string;
    qtrsAchieved: number;
  }>>({
    queryKey: ['/api/admin/team-performance', selectedPerformanceTeam],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedPerformanceTeam && selectedPerformanceTeam !== 'all') {
        params.append('teamId', selectedPerformanceTeam);
      }
      const url = `/api/admin/team-performance${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
  });

  // Fetch closures list from API for Closure Modal
  const { data: closuresListData = [], isLoading: isLoadingClosures } = useQuery<Array<{
    id: string;
    candidate: string;
    position: string;
    client: string;
    quarter: string;
    talentAdvisor: string;
    ctc: string;
    revenue: string;
  }>>({
    queryKey: ['/api/admin/closures-list'],
  });

  // Fetch closure reports for "All Closure Reports" modal (pipeline page)
  const { data: closureReportsData = [], isLoading: isLoadingClosureReports } = useQuery<Array<{
    id: string;
    candidate: string;
    position: string;
    client: string;
    talentAdvisor: string;
    fixedCTC: string;
    offeredDate: string;
    joinedDate: string;
    offeredDateRaw?: string | null;
    joinedDateRaw?: string | null;
    status: string;
    sourceRequirement?: any | null;
    closureAction?: {
      type?: string | null;
      date?: string | null;
      reason?: string | null;
      dayBucket?: string | null;
      updatedAt?: string | null;
    } | null;
  }>>({
    queryKey: ['/api/admin/closures-list'],
  });

  // Filter closure reports based on search
  const filteredClosureReports = useMemo(() => {
    if (!closureReportsSearch) return closureReportsData;
    const searchLower = closureReportsSearch.toLowerCase();
    return closureReportsData.filter(report =>
      report.candidate?.toLowerCase().includes(searchLower) ||
      report.position?.toLowerCase().includes(searchLower) ||
      report.client?.toLowerCase().includes(searchLower) ||
      report.talentAdvisor?.toLowerCase().includes(searchLower)
    );
  }, [closureReportsData, closureReportsSearch]);

  const parseClosureReportDate = (value?: string | null) => {
    if (!value) return null;

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }

    const parts = value.split(/[/-]/).map((part) => Number(part));
    if (parts.length === 3 && parts.every((part) => Number.isFinite(part))) {
      const [day, month, year] = parts;
      const fallbackDate = new Date(year, month - 1, day);
      return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
    }

    return null;
  };

  const resetClosureReportActionState = () => {
    setSelectedClosureReportAction(null);
    setClosureReportActionType(null);
    setClosureReportActionReason('');
    setClosureReportActionDate('');
    setClosureReportReRequirementRequested(false);
  };

  const closureReportActionMutation = useMutation({
    mutationFn: async ({
      id,
      actionType,
      actionDate,
      reason,
    }: {
      id: string;
      actionType: 'offer-drop' | 'early-exit';
      actionDate: string;
      reason: string;
    }) => {
      const response = await apiRequest('POST', `/api/admin/closures-list/${id}/action`, {
        actionType,
        actionDate,
        reason,
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      invalidateRevenueMappingQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pipeline'] });
      toast({
        title: variables.actionType === 'early-exit' ? 'Early Exit captured' : 'Offer Drop captured',
        description: 'The admin dashboard has been refreshed with the latest status.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save the closure action. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const earlyExitDayCount = useMemo(() => {
    if (closureReportActionType !== 'early-exit' || !selectedClosureReportAction?.joinedDate || !closureReportActionDate) {
      return null;
    }

    const joinedOn = parseClosureReportDate(selectedClosureReportAction.joinedDate);
    const selectedDate = parseClosureReportDate(closureReportActionDate);
    if (!joinedOn || !selectedDate) {
      return null;
    }

    const diffInMs = selectedDate.getTime() - joinedOn.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;
    return diffInDays > 0 ? diffInDays : 0;
  }, [closureReportActionDate, closureReportActionType, selectedClosureReportAction]);

  const handleOpenClosureReportActionModal = (report: any, actionType: 'offer-drop' | 'early-exit') => {
    setSelectedClosureReportAction(report);
    setClosureReportActionType(actionType);
    setClosureReportActionReason('');
    setClosureReportActionDate('');
    setClosureReportReRequirementRequested(false);
    setIsClosureReportActionModalOpen(true);
  };

  const handleConfirmClosureReportAction = () => {
    if (!selectedClosureReportAction?.id || !closureReportActionType) {
      return;
    }

    closureReportActionMutation.mutate({
      id: selectedClosureReportAction.id,
      actionType: closureReportActionType,
      actionDate: closureReportActionDate,
      reason: closureReportActionReason,
    });

    const sourceRequirement = selectedClosureReportAction?.sourceRequirement;
    if (!closureReportReRequirementRequested) {
      setIsClosureReportActionModalOpen(false);
      resetClosureReportActionState();
      return;
    }

    const prefilledRequirement = {
      position: sourceRequirement?.position || selectedClosureReportAction?.position || '',
      noOfPositions: sourceRequirement?.noOfPositions || 1,
      splitRequirement: sourceRequirement?.splitRequirement || false,
      criticality: sourceRequirement?.criticality || 'MEDIUM',
      toughness: sourceRequirement?.toughness || 'Medium',
      company: sourceRequirement?.company || selectedClosureReportAction?.client || '',
      spoc: sourceRequirement?.spoc || '',
      talentAdvisor: sourceRequirement?.talentAdvisor || selectedClosureReportAction?.talentAdvisor || '',
      teamLead: sourceRequirement?.teamLead || '',
      jdFile: sourceRequirement?.jdFile || null,
      jdText: sourceRequirement?.jdText || null,
      sourceType: 're_require',
      sourceDetails: JSON.stringify({
        actionType: closureReportActionType,
        candidate: selectedClosureReportAction?.candidate || '',
        assignedTL: sourceRequirement?.teamLead || '',
        assignedTA: sourceRequirement?.talentAdvisor || selectedClosureReportAction?.talentAdvisor || '',
        offeredDate: selectedClosureReportAction?.offeredDate || '',
        joinedDate: selectedClosureReportAction?.joinedDate || '',
        selectedDate: closureReportActionDate || '',
        sourceRequirementId: sourceRequirement?.originalId || sourceRequirement?.id || '',
        reason: closureReportActionReason || '',
        reRequireRequested: closureReportReRequirementRequested,
      }),
      reRequirementContext: {
        actionType: closureReportActionType === 'early-exit' ? 'Early Exit' : 'Offer Drop',
        candidate: selectedClosureReportAction?.candidate || '',
        assignedTL: sourceRequirement?.teamLead || '',
        assignedTA: sourceRequirement?.talentAdvisor || selectedClosureReportAction?.talentAdvisor || '',
        offeredDate: selectedClosureReportAction?.offeredDate || '',
        joinedDate: selectedClosureReportAction?.joinedDate || '',
        selectedDate: closureReportActionDate || '',
        sourceRequirementId: sourceRequirement?.originalId || sourceRequirement?.id || '',
      },
    };

    setEditingRequirement(null);
    setInitialRequirementData(prefilledRequirement);
    setIsClosureReportActionModalOpen(false);
    setIsAddRequirementModalOpen(true);
    resetClosureReportActionState();
  };

  const renderClosureReportActions = (report: any) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="mx-auto h-8 w-8 rounded-full border border-gray-200 bg-white p-0 text-gray-600 hover:bg-gray-50"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-64 rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.14)] dark:border-slate-700 dark:bg-slate-900">
        <DropdownMenuItem
          onClick={() => handleOpenClosureReportActionModal(report, 'offer-drop')}
          className="flex flex-col items-start rounded-2xl px-4 py-3 focus:bg-slate-50 dark:focus:bg-slate-800"
        >
          <span className="text-base font-semibold text-slate-900 dark:text-white">Offer Drop</span>
          <span className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">Candidate declined the offer after closure.</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleOpenClosureReportActionModal(report, 'early-exit')}
          className="mt-1 flex flex-col items-start rounded-2xl px-4 py-3 focus:bg-slate-50 dark:focus:bg-slate-800"
        >
          <span className="text-base font-semibold text-slate-900 dark:text-white">Early Exit</span>
          <span className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">Candidate exited after joining. Day bucket is captured on confirm.</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const getClosureQuarterLabel = (report: any) => {
    if (!report?.quarter) return 'N/A';
    return String(report.quarter).replace(', ', ',');
  };

  const getClosureActionHoverText = (report: any) => {
    const closureAction = report?.closureAction;
    if (!closureAction?.type) return '';

    if (closureAction.type === 'offer-drop') {
      return 'Offer Drop';
    }

    if (closureAction.dayBucket === '<90') {
      return 'Early Exit (<90 days)';
    }

    if (closureAction.dayBucket === '>90') {
      return 'Early Exit (>90 days)';
    }

    return 'Early Exit';
  };

  // Revenue analysis — detailed modal uses its own filters; Performance tab chart follows performance filters
  const useRevenueModalFilters = isRevenueGraphModalOpen;
  const revenueAnalysisTeam = useRevenueModalFilters
    ? revenueTeam
    : sidebarTab === "performance"
      ? selectedPerformanceTeam
      : revenueTeam;
  const revenueAnalysisPeriod = useRevenueModalFilters
    ? revenuePeriod
    : sidebarTab === "performance"
      ? selectedPerformancePeriod
      : revenuePeriod;
  const revenueAnalysisDateFrom = useRevenueModalFilters
    ? revenueDateFrom
    : sidebarTab === "performance"
      ? undefined
      : revenueDateFrom;
  const revenueAnalysisDateTo = useRevenueModalFilters
    ? revenueDateTo
    : sidebarTab === "performance"
      ? undefined
      : revenueDateTo;

  const { data: revenueAnalysis } = useQuery<{
    data: Array<{ member: string; revenue: number; fullName?: string }>;
    benchmark: number;
    totalRevenue?: number;
  }>({
    queryKey: [
      "/api/admin/revenue-analysis",
      revenueAnalysisTeam,
      revenueAnalysisDateFrom?.toISOString(),
      revenueAnalysisDateTo?.toISOString(),
      revenueAnalysisPeriod,
      useRevenueModalFilters,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (revenueAnalysisTeam && revenueAnalysisTeam !== "all") {
        params.append("teamId", revenueAnalysisTeam);
      }
      if (revenueAnalysisDateFrom) {
        params.append("dateFrom", revenueAnalysisDateFrom.toISOString());
      }
      if (revenueAnalysisDateTo) {
        params.append("dateTo", revenueAnalysisDateTo.toISOString());
      }
      if (revenueAnalysisPeriod) {
        params.append("period", revenueAnalysisPeriod);
      }
      const url = `/api/admin/revenue-analysis${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await apiRequest("GET", url);
      return await response.json();
    },
  });

  // Fetch monthly performance data from API for the Performance LineChart
  const { data: monthlyPerformanceData } = useQuery<{
    data: Array<Record<string, any>>;
    teams: string[];
    members: Array<{ key: string; name: string; teamLeader: string }>;
  }>({
    queryKey: ['/api/admin/monthly-performance'],
  });

  // Fetch performance graph data for outer Performance graph (with period support)
  const { data: outerPerformanceGraphData = [] } = useQuery<Array<{
    period: string;
    resumesA: number;
    resumesB: number;
  }>>({
    queryKey: ['/api/admin/performance-graph', selectedPerformanceTeam, undefined, undefined, selectedPerformancePeriod],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedPerformanceTeam && selectedPerformanceTeam !== 'all') {
        params.append('teamId', selectedPerformanceTeam);
      }
      if (selectedPerformancePeriod) {
        params.append('period', selectedPerformancePeriod);
      }
      const url = `/api/admin/performance-graph${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiRequest('GET', url);
      return await response.json();
    },
  });

  // Monthly Performance chart data - uses backend data only
  const monthlyChartData = useMemo(() => {
    return monthlyPerformanceData?.data ?? [];
  }, [monthlyPerformanceData]);

  // Outer Performance graph data - uses performance-graph endpoint with period support
  const outerPerformanceChartData = useMemo(() => {
    return outerPerformanceGraphData.map(item => ({
      period: item.period,
      delivered: item.resumesA,
      required: item.resumesB
    }));
  }, [outerPerformanceGraphData]);

  const performanceBenchmark = dailyMetricsData?.performanceChart?.benchmarkValue ?? 10;

  const performanceTeamLeaders = useMemo(
    () =>
      employees
        .filter((emp: Employee) => emp.role === 'team_leader' && emp.isActive)
        .map((emp: Employee) => ({ id: emp.id, name: emp.name })),
    [employees],
  );

  const performanceData = useMemo(() => {
    const members = dailyMetricsData?.performanceChart?.members ?? [];
    return members.map((entry: { member: string; delivered: number; required: number }) => ({
      member: entry.member,
      delivered: entry.delivered,
      required: entry.required,
    }));
  }, [dailyMetricsData?.performanceChart?.members]);

  // Revenue chart data - uses backend data
  const revenueData = useMemo(() => {
    if (revenueAnalysis?.data && revenueAnalysis.data.length > 0) {
      return revenueAnalysis.data;
    }
    return [];
  }, [revenueAnalysis]);

  // Calculate average benchmark from actual data
  const revenueBenchmark = useMemo(() => {
    if (revenueAnalysis?.benchmark && revenueAnalysis.benchmark > 0) {
      return revenueAnalysis.benchmark;
    }
    // Calculate from data if benchmark not provided
    if (revenueData.length > 0) {
      const total = revenueData.reduce((sum, d) => sum + d.revenue, 0);
      return total / revenueData.length;
    }
    return 0;
  }, [revenueAnalysis, revenueData]);

  // Reset Performance Data mutation
  const resetPerformanceDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/admin/reset-performance-data');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all performance-related queries to refresh the UI
      invalidateRevenueMappingQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/target-mappings'] });
      toast({
        title: "Success",
        description: "Performance data has been reset. All charts and tables have been refreshed.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset performance data. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Reset Master Data mutation
  const resetMasterDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/admin/reset-master-data');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all master data-related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/admin/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/daily-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/master-data-totals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/requirements'] });
      toast({
        title: "Success",
        description: "Master data has been reset. All resume and candidate records have been cleared.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset master data. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Archive requirement mutation
  const archiveRequirementMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates?: any }) => {
      const response = await apiRequest('POST', `/api/admin/requirements/${id}/archive`, updates ?? {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/requirements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/archived-requirements'] });
      toast({
        title: "Success",
        description: "Requirement archived successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to archive requirement. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update requirement mutation
  const updateRequirementMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest('PATCH', `/api/admin/requirements/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/requirements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/archived-requirements'] });
      toast({
        title: "Success",
        description: "Requirement updated successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      setIsReassignModalOpen(false);
      setSelectedRequirement(null);
      setEditingRequirement(null);
      setIsManageRequirementModalOpen(false);
      setManageRequirementAction('');
      setManageRequirementReason('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update requirement. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Create client credentials (simplified) mutation
  const createClientCredentialsMutation = useMutation({
    mutationFn: async (clientData: any) => {
      // Send simplified client credentials to the API
      // Note: role is always set to "client" on the server-side for security
      const response = await apiRequest('POST', '/api/admin/clients/credentials', {
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        name: clientData.name,
        phoneNumber: clientData.phoneNumber,
        email: clientData.email,
        password: clientData.password,
        joiningDate: clientData.joiningDate,
        clientId: clientData.clientId, // Company ID from Master Data
      });
      return response.json();
    },
    onSuccess: (data: { welcomeEmailSent?: boolean }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/employees'] });
      toast({
        title: "Success",
        description: data?.welcomeEmailSent === false
          ? "Client Admin created. Welcome email could not be sent — share login details manually."
          : "Client Admin created. A welcome email with login credentials has been sent.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create client credentials. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Create client mutation (comprehensive - for Master Data page)
  const createClientMutation = useMutation({
    mutationFn: async (clientData: any) => {
      const response = await apiRequest('POST', '/api/admin/clients', clientData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/employees'] });
      toast({
        title: "Success",
        description: "Client profile created successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      setIsClientModalOpen(false);
      setClientForm({
        brandName: '',
        incorporatedName: '',
        gstin: '',
        address: '',
        location: '',
        spoc: '',
        email: '',
        password: '',
        website: '',
        linkedin: '',
        agreement: '',
        percentage: '',
        category: '',
        paymentTerms: '',
        source: '',
        startDate: '',
        currentStatus: 'active',
        logo: '',
        clientType: 'direct',
        partnerId: '',
      });
      setClientStartDate(undefined);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create client. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData: any) => {
      const response = await apiRequest('POST', '/api/admin/employees', employeeData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/employees'] });
      toast({
        title: "Success",
        description: "Employee created successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      setIsEmployeeModalOpen(false);
      setEmployeeForm({
        employeeId: '',
        name: '',
        address: '',
        designation: '',
        email: '',
        phone: '',
        joiningDate: '',
        employmentStatus: '',
        esic: '',
        epfo: '',
        esicNo: '',
        epfoNo: '',
        fatherName: '',
        motherName: '',
        fatherNumber: '',
        motherNumber: '',
        offeredCtc: '',
        currentStatus: '',
        incrementCount: '',
        appraisedQuarter: '',
        appraisedAmount: '',
        appraisedYear: '',
        yearlyCTC: '',
        currentMonthlyCTC: '',
        department: '',
        role: '',
        nameAsPerBank: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branch: '',
        city: ''
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create employee. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PUT', `/api/admin/employees/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/employees'] });
      toast({
        title: "Success",
        description: "Employee updated successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      setIsAddRecruiterModalOpen(false);
      setIsAddTeamLeaderModalNewOpen(false);
      setIsAddUserModalOpen(false);
      setIsAddClientCredentialsModalOpen(false);
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee.",
        variant: "destructive",
      });
    }
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/employees/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/employees'] });
      toast({
        title: "Success",
        description: "Employee deleted successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee.",
        variant: "destructive",
      });
    }
  });

  const holdEmployeeMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: HoldUserPayload }) => {
      const response = await apiRequest('PATCH', `/api/admin/employees/${id}/hold`, payload);
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/employees'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/active-sessions'] });
      setIsHoldUserModalOpen(false);
      const heldName = userToHold?.name || 'User';
      setUserToHold(null);
      runAdminHoldCountdown(heldName);
    },
    onError: (error: Error) => {
      toast({
        title: "Hold failed",
        description: error.message || "Could not place user on hold.",
        variant: "destructive",
      });
    },
  });

  const resumeEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('PATCH', `/api/admin/employees/${id}/resume`, {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/employees'] });
      toast({
        title: "User resumed",
        description: `${data?.employee?.name || 'User'} can access StaffOS again.`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Resume failed",
        description: error.message || "Could not resume user.",
        variant: "destructive",
      });
    },
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/clients/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
      toast({
        title: "Success",
        description: "Client deleted successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete client.",
        variant: "destructive",
      });
    }
  });

  // Meetings mutations
  const createMeetingMutation = useMutation({
    mutationFn: async (meetingData: any) => {
      const response = await apiRequest('POST', '/api/admin/meetings', meetingData);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to create meeting' }));
        throw new Error(error.message || 'Failed to create meeting');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/meetings'] });
      toast({
        title: "Success",
        description: "Meeting created successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      resetForm();
      setIsCreateMeetingModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create meeting.",
        variant: "destructive",
      });
    }
  });

  const updateMeetingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PATCH', `/api/admin/meetings/${id}`, data);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to update meeting' }));
        throw new Error(error.message || 'Failed to update meeting');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/meetings'] });
      toast({
        title: "Success",
        description: "Meeting updated successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      resetForm();
      setIsCreateMeetingModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update meeting.",
        variant: "destructive",
      });
    }
  });

  const deleteMeetingMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/meetings/${id}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to delete meeting' }));
        throw new Error(error.message || 'Failed to delete meeting');
      }
      return response.json().catch(() => ({}));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/meetings'] });
      toast({
        title: "Success",
        description: "Meeting deleted successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete meeting.",
        variant: "destructive",
      });
    }
  });

  // Fetch meetings from API
  const { data: allMeetings = [], isLoading: meetingsLoading } = useQuery({
    queryKey: ['/api/admin/meetings'],
    staleTime: 1000 * 60,
  });

  // Derive TL and CEO meetings from query data
  const tlMeetings = useMemo(() => {
    return (allMeetings as any[]).filter((m: any) => m.meetingCategory === 'tl' && m.status === 'pending');
  }, [allMeetings]);

  const ceoMeetings = useMemo(() => {
    return (allMeetings as any[]).filter((m: any) => m.meetingCategory === 'ceo_ta' && m.status === 'pending');
  }, [allMeetings]);

  // Combined pending meetings for the new card-based UI
  const pendingMeetings = useMemo(() => {
    return [...tlMeetings, ...ceoMeetings].sort((a: any, b: any) => {
      const dateA = new Date(`${a.meetingDate} ${a.meetingTime}`);
      const dateB = new Date(`${b.meetingDate} ${b.meetingTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [tlMeetings, ceoMeetings]);

  // Get only the nearest 3 meetings for dashboard display
  const nearestMeetings = useMemo(() => {
    const now = new Date();
    const upcoming = pendingMeetings.filter((m: any) => {
      try {
        const meetingDateTime = new Date(`${m.meetingDate} ${m.meetingTime}`);
        return meetingDateTime >= now;
      } catch {
        return true;
      }
    });
    return upcoming.slice(0, 3);
  }, [pendingMeetings]);

  // Get all meetings from past 7 days (newest to oldest)
  const meetingsLast7Days = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const allMeetings = [...tlMeetings, ...ceoMeetings].filter((m: any) => {
      try {
        const meetingDateTime = new Date(`${m.meetingDate} ${m.meetingTime}`);
        return meetingDateTime >= sevenDaysAgo;
      } catch {
        return false;
      }
    });

    return allMeetings.sort((a: any, b: any) => {
      const dateA = new Date(`${a.meetingDate} ${a.meetingTime}`);
      const dateB = new Date(`${b.meetingDate} ${b.meetingTime}`);
      return dateB.getTime() - dateA.getTime(); // Newest first
    });
  }, [tlMeetings, ceoMeetings]);

  // Toggle meeting expansion
  const toggleMeetingExpansion = (meetingId: string) => {
    setExpandedMeetings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(meetingId)) {
        newSet.delete(meetingId);
      } else {
        newSet.add(meetingId);
      }
      return newSet;
    });
  };

  // Meeting action handlers
  const handleRescheduleMeeting = (meeting: any) => {
    // Find the person for "Meeting For"
    const meetingForPerson = employees.find((e: Employee) => e.id === meeting.personId);
    if (meetingForPerson) {
      setMeetingFor(meetingForPerson.id);
    } else if (meeting.meetingCategory === 'tl') {
      // For TL meetings, try to find by person name
      const person = employees.find((e: Employee) => e.name === meeting.person);
      if (person) {
        setMeetingFor(person.id);
      }
    }
    setMeetingWith(meeting.personId || (meeting.person && meeting.person.includes('CEO') ? 'admin' : ''));
    setMeetingTitle(meeting.meetingType || '');
    setMeetingType(meeting.meetingType);
    setMeetingDate(new Date(meeting.meetingDate));
    setMeetingTime(meeting.meetingTime);
    setMeetingDescription(meeting.agenda || '');
    setMeetingMembers(meeting.members && Array.isArray(meeting.members) ? meeting.members : []);
    setShowAddMembers(meeting.members && Array.isArray(meeting.members) && meeting.members.length > 0);
    setEditingMeetingId(meeting.id);
    setEditingCalendarEventId(meeting.calendarEventId || null);
    setIsCreateMeetingModalOpen(true);
  };

  const handleDeleteMeeting = (meetingId: string, personName: string) => {
    if (window.confirm(`Are you sure you want to delete the meeting with ${personName}?`)) {
      deleteMeetingMutation.mutate(meetingId);
    }
  };

  // Calculate priority counts and breakdowns from requirements data
  const priorityCounts = useMemo(() => {
    const counts = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      TOTAL: 0
    };

    const breakdowns = {
      HIGH: { Easy: 0, Medium: 0, Tough: 0 },
      MEDIUM: { Easy: 0, Medium: 0, Tough: 0 },
      LOW: { Easy: 0, Medium: 0, Tough: 0 }
    };

    requirements.forEach((req: any) => {
      const criticality = req.criticality?.toUpperCase();
      const toughness = req.toughness?.toUpperCase() || 'MEDIUM';

      if (criticality === 'HIGH') {
        counts.HIGH++;
        if (toughness === 'EASY') breakdowns.HIGH.Easy++;
        else if (toughness === 'TOUGH') breakdowns.HIGH.Tough++;
        else breakdowns.HIGH.Medium++;
      } else if (criticality === 'MEDIUM' || criticality === 'MED') {
        counts.MEDIUM++;
        if (toughness === 'EASY') breakdowns.MEDIUM.Easy++;
        else if (toughness === 'TOUGH') breakdowns.MEDIUM.Tough++;
        else breakdowns.MEDIUM.Medium++;
      } else if (criticality === 'LOW') {
        counts.LOW++;
        if (toughness === 'EASY') breakdowns.LOW.Easy++;
        else if (toughness === 'TOUGH') breakdowns.LOW.Tough++;
        else breakdowns.LOW.Medium++;
      }
      counts.TOTAL++;
    });

    return { counts, breakdowns };
  }, [requirements]);

  // Calculate pending and closed distribution counts
  const distributionCounts = useMemo(() => {
    // For now, using placeholder logic - can be updated based on actual requirement status
    const pending = requirements.filter((req: any) => {
      // Consider unassigned or in-progress as pending
      return req.talentAdvisor === "Unassigned" || !req.talentAdvisor;
    }).length;

    const closed = requirements.filter((req: any) => {
      // Consider assigned and completed as closed
      return req.talentAdvisor !== "Unassigned" && req.talentAdvisor;
    }).length;

    return { pending, closed };
  }, [requirements]);

  // Static priority distribution - fixed counts that never change
  // These represent the expected number of resumes to be delivered based on priority/criticality
  const priorityDistribution = {
    HIGH: { Easy: 6, Medium: 4, Tough: 2 },
    MEDIUM: { Easy: 5, Medium: 3, Tough: 2 },
    LOW: { Easy: 4, Medium: 3, Tough: 2 },
  };

  const handleMemberClick = (member: any) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleEmailClick = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handleCallClick = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  const resetForm = () => {
    setSelectedRecipient('');
    setMessageContent('');
    setMeetingFor('');
    setMeetingWith('');
    setSelectedClientId('');
    setMeetingType('');
    setMeetingDate(undefined);
    setMeetingTime('');
    setMeetingTitle('');
    setMeetingDescription('');
    setMeetingMembers([]);
    setShowAddMembers(false);
    setMemberSearchTerm('');
    setMemberSuggestions([]);
    setEditingMeetingId(null);
    setEditingCalendarEventId(null);
    setShowPreviewModal(false);
  };

  // Handle final meeting creation with Google Calendar
  const handleScheduleMeeting = () => {
    if (!meetingTitle || !meetingFor || !meetingWith || !meetingDate || !meetingTime) {
      return;
    }

    // Validate client selection if meetingWith is client
    if (meetingWith === 'client' && !selectedClientId) {
      toast({
        title: "Validation Error",
        description: "Please select a client",
        variant: "destructive",
      });
      return;
    }

    // Determine person name and category based on meetingWith (Admin or Client)
    let personName = '';
    let personId = '';
    let meetingCategory: 'tl' | 'ceo_ta' = 'ceo_ta';

    if (meetingWith === 'admin') {
      const admin = employees.find((e: Employee) => e.role === 'admin');
      if (admin) {
        personName = admin.name;
        personId = admin.id;
        meetingCategory = 'ceo_ta';
      }
    } else if (meetingWith === 'client') {
      const selectedClient = (clients as any[]).find((c: any) => c.id === selectedClientId);
      if (selectedClient) {
        personName = `${selectedClient.spoc || 'N/A'} - ${selectedClient.brandName || selectedClient.incorporatedName || 'Unknown Company'}`;
        personId = selectedClientId;
        meetingCategory = 'ceo_ta';
      }
    }

    // Get attendee names from meetingFor (who needs to attend)
    const attendeeNames: string[] = [];
    if (meetingFor === 'all_tl') {
      attendeeNames.push('All Team Leaders');
    } else if (meetingFor === 'all_ta') {
      attendeeNames.push('All Talent Advisors');
    } else if (meetingFor.startsWith('team_')) {
      const tlId = meetingFor.replace('team_', '');
      const tl = employees.find((e: Employee) => e.id === tlId);
      if (tl) {
        attendeeNames.push(`${tl.name}'s Team`);
      }
    } else {
      const attendee = employees.find((e: Employee) => e.id === meetingFor);
      if (attendee) {
        attendeeNames.push(attendee.name);
      }
    }

    // Add additional members
    const additionalMemberNames = meetingMembers
      .map(id => employees.find((e: Employee) => e.id === id)?.name)
      .filter(Boolean) as string[];

    const allParticipantNames = [...attendeeNames, ...additionalMemberNames];

    // Only generate and open Google Calendar URL for new meetings, not edits
    // For edits, the calendar event needs to be manually updated (Google Calendar URL template doesn't support updating existing events)
    if (!editingMeetingId) {
      const calendarUrl = generateMeetingCalendarUrl({
        title: meetingTitle,
        date: meetingDate,
        time: meetingTime,
        regarding: meetingDescription || 'General Discussion',
        participants: allParticipantNames,
      });

      if (calendarUrl) {
        window.open(calendarUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      // For edits, show a message that the calendar event needs to be updated manually
      toast({
        title: "Meeting Updated",
        description: "Meeting details updated. Please update the calendar event manually if needed.",
        className: "bg-blue-50 border-blue-200 text-blue-800",
      });
    }

    // Prepare meeting data for backend
    const meetingData = {
      meetingType: meetingTitle,
      meetingDate: format(meetingDate, 'yyyy-MM-dd'),
      meetingTime,
      person: personName,
      personId,
      agenda: meetingDescription || 'General Discussion',
      status: 'pending' as const,
      meetingCategory,
      members: meetingMembers,
    };

    if (editingMeetingId) {
      updateMeetingMutation.mutate({ id: editingMeetingId, data: meetingData });
      setEditingMeetingId(null);
      setEditingCalendarEventId(null);
    } else {
      createMeetingMutation.mutate(meetingData);
    }

    setShowPreviewModal(false);
  };

  const showSuccessAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };

  const handleSendMessage = async () => {
    if (!selectedRecipient || !messageContent.trim() || !employee?.id) {
      return;
    }

    const recipient = employees.find((e: Employee) => e.id === selectedRecipient);
    if (!recipient) {
      showSuccessAlert('Recipient not found');
      return;
    }

    try {
      // Step 1: Get or create a direct chat room with the recipient
      const roomResponse = await apiRequest('POST', '/api/chat/rooms/direct', {
        participantId: selectedRecipient
      });

      if (!roomResponse.ok) {
        throw new Error('Failed to create/get chat room');
      }

      const roomData = await roomResponse.json();
      const roomId = roomData.room.id;

      // Step 2: Send the message in the room
      const messageResponse = await apiRequest('POST', `/api/chat/rooms/${roomId}/messages`, {
        content: messageContent.trim(),
        messageType: 'text'
      });

      if (!messageResponse.ok) {
        throw new Error('Failed to send message');
      }

      // Refresh chat rooms to show updated message
      await refetchChatRooms();

      showSuccessAlert(`Message sent to ${recipient.name} successfully`);
      resetForm();
      setIsCreateMessageModalOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
      showSuccessAlert('Failed to send message. Please try again.');
    }
  };

  // Helper function to generate Google Calendar URL for meetings
  const generateMeetingCalendarUrl = (meetingData: {
    title: string;
    date: Date;
    time: string;
    regarding: string;
    participants: string[];
  }): string | null => {
    try {
      const { title, date, time, regarding, participants } = meetingData;

      // Convert date to YYYYMMDD format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}${month}${day}`;

      // Parse time (HH:mm format)
      const [hours, minutes] = time.split(':');
      if (!hours || !minutes) {
        return null;
      }

      // Create start datetime in Google Calendar format (YYYYMMDDTHHMMSS)
      const startDateTime = `${dateStr}T${hours.padStart(2, '0')}${minutes.padStart(2, '0')}00`;

      // Calculate end time (60 minutes later by default)
      const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
      const endMinutes = startMinutes + 60;
      const endHours = Math.floor(endMinutes / 60) % 24;
      const endMins = endMinutes % 60;
      const endDateTime = `${dateStr}T${String(endHours).padStart(2, '0')}${String(endMins).padStart(2, '0')}00`;

      // Build event details
      const eventText = title;
      let eventDetails = `Meeting Regarding: ${regarding}\n\n`;
      if (participants.length > 0) {
        eventDetails += `Participants:\n${participants.join('\n')}\n\n`;
      }
      eventDetails += 'Scheduled via StaffOS';

      // Construct Google Calendar URL
      const baseUrl = 'https://calendar.google.com/calendar/render';
      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: eventText,
        dates: `${startDateTime}/${endDateTime}`,
        details: eventDetails,
      });

      return `${baseUrl}?${params.toString()}`;
    } catch (error) {
      console.error('Error generating Google Calendar URL:', error);
      return null;
    }
  };

  const handleSetMeeting = () => {
    if (!meetingTitle || !meetingFor || !meetingWith || !meetingDate || !meetingTime) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Show preview modal instead of directly creating
    setShowPreviewModal(true);
  };

  // Requirements handlers
  const handleReassign = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    const currentTeamLead = getTeamLeadMatchForRequirement(requirement);
    setSelectedTeamLeadId(currentTeamLead ? String(currentTeamLead.id) : "");
    setIsReassignModalOpen(true);
  };

  const handleEditRequirement = (requirement: Requirement) => {
    setEditingRequirement(requirement);
    setIsAddRequirementModalOpen(true);
  };

  const handleManageRequirement = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setManageRequirementAction(requirement.managementStatus === 'hold' ? 'resume' : '');
    setManageRequirementReason('');
    setIsManageRequirementModalOpen(true);
  };

  useEffect(() => {
    if (!isReassignModalOpen || selectedTeamLeadId || !selectedRequirement || teamLeads.length === 0) {
      return;
    }

    const currentTeamLead = getTeamLeadMatchForRequirement(selectedRequirement);
    if (currentTeamLead) {
      setSelectedTeamLeadId(String(currentTeamLead.id));
    }
  }, [isReassignModalOpen, selectedRequirement, selectedTeamLeadId, teamLeads]);

  const submitReassignment = () => {
    if (!selectedRequirement || !selectedTeamLeadId) {
      toast({ title: "Error", description: "Please select a Team Lead", variant: "destructive" });
      return;
    }

    const selectedTL = teamLeads.find((tl: any) => String(tl.id) === String(selectedTeamLeadId));

    updateRequirementMutation.mutate({
      id: selectedRequirement.id,
      updates: {
        teamLead: selectedTL?.name || selectedTeamLeadId
      }
    }, {
      onSuccess: () => {
        setIsReassignConfirmOpen(false);
        setIsReassignModalOpen(false);
        setSelectedTeamLeadId("");
        toast({ title: "Success", description: "Requirement reassigned successfully" });
      }
    });
  };

  const handleSubmitManageRequirement = () => {
    if (!selectedRequirement || !manageRequirementAction || !manageRequirementReason.trim()) {
      toast({
        title: "Missing Details",
        description: "Please choose an action and enter a reason.",
        variant: "destructive",
      });
      return;
    }

    const actionLabel = manageRequirementAction === 'closed'
      ? 'Internally Closed'
      : manageRequirementAction === 'resume'
        ? 'Resume Sourcing'
        : 'Hold/ Frozen';
    const confirmed = window.confirm(`This requirement will be marked as ${actionLabel}. Do you want to continue?`);
    if (!confirmed) return;

    const updates = {
      status: manageRequirementAction === 'closed' ? 'closed' : manageRequirementAction === 'resume' ? 'open' : 'paused',
      managementStatus: manageRequirementAction === 'resume' ? 'active' : manageRequirementAction,
      managementReason: manageRequirementReason.trim(),
      managedAt: new Date().toISOString(),
    };

    if (manageRequirementAction === 'closed') {
      archiveRequirementMutation.mutate(
        { id: String(selectedRequirement.id), updates },
        {
          onSuccess: () => {
            setIsManageRequirementModalOpen(false);
            setSelectedRequirement(null);
            setManageRequirementAction('');
            setManageRequirementReason('');
          },
        }
      );
      return;
    }

    updateRequirementMutation.mutate(
      { id: String(selectedRequirement.id), updates },
      {
        onSuccess: () => {
          setIsManageRequirementModalOpen(false);
          setSelectedRequirement(null);
          setManageRequirementAction('');
          setManageRequirementReason('');
        },
      }
    );
  };

  const getRequirementRowClassName = (requirement: Requirement, index: number) => {
    if (requirement.managementStatus === 'hold') {
      return 'bg-yellow-100/80 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30';
    }

    return index % 2 === 0
      ? 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800';
  };

  const getRequirementRowTitle = (requirement: Requirement) => {
    if (requirement.managementStatus === 'hold') {
      return 'Requirement is on Hold';
    }
    return undefined;
  };

  const getRequirementStateBadge = (requirement: Requirement) => {
    if (requirement.managementStatus === 'hold') {
      return (
        <span className="inline-flex w-fit rounded-full bg-yellow-100 px-2.5 py-1 text-[11px] font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          On Hold
        </span>
      );
    }

    if (requirement.sourceType === 're_require') {
      return (
        <span className="inline-flex w-fit rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
          Re-Require
        </span>
      );
    }

    return null;
  };

  const getRequirementSplitMeta = (requirement: Requirement) => {
    if (!requirement.sourceDetails) return null;
    try {
      const parsed = JSON.parse(requirement.sourceDetails) as {
        splitRequirementGroup?: {
          roleId?: string;
          splitIndex?: number;
          totalSplits?: number;
        };
      };
      return parsed.splitRequirementGroup ?? null;
    } catch {
      return null;
    }
  };

  const getManageActionLabels = () => {
    if (selectedRequirement?.managementStatus === 'hold') {
      return {
        primary: 'Resume Sourcing',
        primaryValue: 'resume' as const,
        secondary: 'Internally Closed',
        secondaryValue: 'closed' as const,
      };
    }

    return {
      primary: 'Hold/ Frozen',
      primaryValue: 'hold' as const,
      secondary: 'Internally Closed',
      secondaryValue: 'closed' as const,
    };
  };

  const getTeamLeadMatchForRequirement = (requirement: Requirement | null) => {
    if (!requirement) return null;

    return teamLeads.find((teamLead: any) =>
      String(teamLead.id) === String((requirement as any).teamLeadId ?? '') ||
      teamLead.name === requirement.teamLead
    ) ?? null;
  };

  const requirementNeedsTalentAdvisorReassignment = (requirement: Requirement) => {
    if (typeof requirement.needsTalentAdvisorReassignment === 'boolean') {
      return requirement.needsTalentAdvisorReassignment;
    }

    if (!requirement.talentAdvisor || !requirement.teamLead) {
      return false;
    }

    const currentTeamLead = getTeamLeadMatchForRequirement(requirement);
    const assignedTalentAdvisor = employees.find((employee: any) =>
      employee.role === 'recruiter' &&
      (
        employee.id === requirement.talentAdvisorId ||
        employee.name === requirement.talentAdvisor
      )
    );

    if (!currentTeamLead || !assignedTalentAdvisor) {
      return false;
    }

    return assignedTalentAdvisor.reportingTo !== currentTeamLead.employeeId;
  };

  const handleRequirementsViewMore = () => {
    if (requirements.length > 10) {
      setIsAllRequirementsModalOpen(true);
    }
  };

  // User management functions
  const handleAddUser = (userData: any) => {
    // Convert modal data to employee form format
    const employeeData = {
      employeeId: userData.id || `STU${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role === 'Team Leader' ? 'team_leader' : 'recruiter',
      phone: userData.phoneNumber || '',
      department: '',
      joiningDate: userData.joiningDate || '',
      age: '',
      reportingTo: userData.reportingTo || ''
    };

    // Save to database using the employee mutation
    createEmployeeMutation.mutate(employeeData);
    setUserList(prev => [...prev, userData]);
  };

  const handleAddClientCredentials = (userData: any) => {
    // Use the dedicated client credentials mutation
    // clientId is the company ID from Master Data
    createClientCredentialsMutation.mutate({
      firstName: userData.firstName,
      lastName: userData.lastName,
      name: userData.name,
      phoneNumber: userData.phoneNumber || '',
      email: userData.email,
      password: userData.password,
      joiningDate: userData.joiningDate || '',
      clientId: userData.clientId, // Company ID from Master Data
    });
    setUserList(prev => [...prev, userData]);
    setIsAddClientCredentialsModalOpen(false);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsAddUserModalOpen(true);
  };

  const handleUnifiedUserSubmit = (userData: any) => {
    const role = userData.role?.toLowerCase() || '';
    if (isClientPortalEmployeeRole(role)) {
      if (editingUser) {
        handleUpdateUser(userData);
      } else {
        handleAddClientCredentials(userData);
      }
    } else if (role === 'team leader' || role === 'team_leader') {
      if (editingUser) {
        handleUpdateUser(userData);
      } else {
        handleAddUser(userData);
      }
    } else if (role === 'recruiter' || role === 'talent advisor') {
      if (editingUser) {
        handleUpdateUser(userData);
      } else {
        handleAddUser(userData);
      }
    }
  };

  const handleUpdateUser = (userData: any) => {
    const employeeRecordId = userData.dbId || editingUser?.id;
    if (!employeeRecordId) {
      toast({
        title: "Update failed",
        description: "Could not resolve the user record to update.",
        variant: "destructive",
      });
      return;
    }

    const roleValue = String(userData.role || editingUser?.role || "").toLowerCase();
    let normalizedRole = editingUser?.role || userData.role;
    if (roleValue === "team leader" || roleValue === "team_leader") {
      normalizedRole = "team_leader";
    } else if (roleValue === "recruiter" || roleValue === "talent advisor") {
      normalizedRole = "recruiter";
    } else if (isClientPortalEmployeeRole(roleValue)) {
      normalizedRole = roleValue === "client" ? "client_admin" : roleValue;
    }

    const employeeData: Record<string, unknown> = {
      employeeId: userData.employeeId || userData.id || editingUser?.employeeId,
      name: userData.name,
      email: userData.email,
      role: normalizedRole,
      phone: userData.phoneNumber || userData.phone || editingUser?.phone || "",
      department: editingUser?.department || "",
      joiningDate: userData.joiningDate || editingUser?.joiningDate || "",
      reportingTo: userData.reportingTo || editingUser?.reportingTo || "",
    };

    if (userData.password) {
      employeeData.password = userData.password;
    }
    if (userData.clientId || editingUser?.clientCompanyId) {
      employeeData.clientCompanyId = userData.clientId || editingUser?.clientCompanyId;
    }

    updateEmployeeMutation.mutate({
      id: employeeRecordId,
      data: employeeData,
    });
    setIsAddUserModalOpen(false);
    setEditingUser(null);
  };

  const handleArchivesClick = () => {
    sessionStorage.setItem('adminDashboardSidebarTab', sidebarTab);
    navigate('/archives');
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setPasswordAttempts(0);
    setPasswordInput("");
    setIsPasswordDialogOpen(true);
  };

  // Handle password verification for delete
  const handleVerifyPassword = async () => {
    if (!passwordInput) {
      toast({
        title: "Error",
        description: "Please enter your password",
        variant: "destructive"
      });
      return;
    }

    setIsVerifyingPassword(true);
    try {
      const response = await apiRequest('POST', '/api/admin/verify-password', {
        password: passwordInput
      });

      // Parse the response JSON
      const responseData = await response.json() as any;

      if (responseData && responseData.success) {
        // Password verified - proceed with actual deletion from database
        if (userToDelete) {
          try {
            // Call the actual delete API endpoint
            const deleteResponse = await apiRequest('DELETE', `/api/admin/employees/${userToDelete.id}`, {});

            // Parse the response
            const deleteResult = await deleteResponse.json();

            if (!deleteResponse.ok) {
              throw new Error(deleteResult.message || 'Failed to delete user');
            }

            // Optimistically update the cache - remove deleted user immediately
            queryClient.setQueryData<Employee[]>(['/api/admin/employees'], (oldData = []) => {
              return oldData.filter(emp => emp.id !== userToDelete.id);
            });

            // Then refetch in the background to ensure data is in sync
            queryClient.invalidateQueries({ queryKey: ['/api/admin/employees'] });
            refetchEmployees(); // Don't await - let it happen in background

            toast({
              title: "Success",
              description: `${userToDelete.name} has been permanently deleted from the database. Email and password have been completely removed.`,
              className: "bg-green-50 border-green-200 text-green-800",
            });

            // Close dialog after successful deletion
            setIsPasswordDialogOpen(false);
            setPasswordInput("");
            setPasswordAttempts(0);
            setUserToDelete(null);
          } catch (deleteError: any) {
            console.error('Deletion failed:', deleteError);
            toast({
              title: "Error",
              description: deleteError.message || "Failed to delete the user. Please try again.",
              variant: "destructive"
            });
            // Don't close dialog on error - let user try again
          }
        }
      } else {
        // Wrong password
        const newAttempts = passwordAttempts + 1;
        setPasswordAttempts(newAttempts);
        setPasswordInput("");

        if (newAttempts >= 3) {
          toast({
            title: "Security Alert",
            description: "Maximum password attempts exceeded. Logging out for security.",
            variant: "destructive"
          });
          setIsPasswordDialogOpen(false);
          setUserToDelete(null);
          // Auto logout
          await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
          window.location.href = '/admin-login';
        } else {
          toast({
            title: "Incorrect Password",
            description: `${3 - newAttempts} attempt(s) remaining`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete the user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setIsPasswordDialogOpen(false);
    setPasswordInput("");
    setPasswordAttempts(0);
    setUserToDelete(null);
  };

  // Handle delete target
  const handleDeleteTarget = (targetId: string, targetDescription: string) => {
    setTargetToDelete({ id: targetId, description: targetDescription });
    setPasswordAttempts(0);
    setPasswordInput("");
    setIsTargetPasswordDialogOpen(true);
  };

  // Handle password verification for target delete
  const handleVerifyTargetPassword = async () => {
    if (!passwordInput) {
      toast({
        title: "Error",
        description: "Please enter your password",
        variant: "destructive"
      });
      return;
    }

    setIsVerifyingPassword(true);
    try {
      const response = await apiRequest('POST', '/api/admin/verify-password', {
        password: passwordInput
      });

      const responseData = await response.json() as any;

      if (responseData && responseData.success) {
        // Password verified - proceed with actual deletion
        if (targetToDelete) {
          try {
            const deleteResponse = await apiRequest('DELETE', `/api/admin/target-mappings/${targetToDelete.id}`, {});
            const deleteResult = await deleteResponse.json();

            if (!deleteResponse.ok) {
              throw new Error(deleteResult.message || 'Failed to delete target mapping');
            }

            queryClient.invalidateQueries({ queryKey: ['/api/admin/target-mappings'] });

            toast({
              title: "Success",
              description: "Target mapping deleted successfully",
              className: "bg-green-50 border-green-200 text-green-800",
            });

            setIsTargetPasswordDialogOpen(false);
            setPasswordInput("");
            setPasswordAttempts(0);
            setTargetToDelete(null);
          } catch (deleteError: any) {
            console.error('Deletion failed:', deleteError);
            toast({
              title: "Error",
              description: deleteError.message || "Failed to delete the target mapping. Please try again.",
              variant: "destructive"
            });
          }
        }
      } else {
        const newAttempts = passwordAttempts + 1;
        setPasswordAttempts(newAttempts);
        setPasswordInput("");

        if (newAttempts >= 3) {
          toast({
            title: "Security Alert",
            description: "Too many incorrect attempts. Please try again later.",
            variant: "destructive"
          });
          setIsTargetPasswordDialogOpen(false);
          setPasswordInput("");
          setPasswordAttempts(0);
          setTargetToDelete(null);
        } else {
          toast({
            title: "Incorrect Password",
            description: `${3 - newAttempts} attempt(s) remaining`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete the target mapping. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  // Handle cancel target delete
  const handleCancelTargetDelete = () => {
    setIsTargetPasswordDialogOpen(false);
    setPasswordInput("");
    setPasswordAttempts(0);
    setTargetToDelete(null);
  };

  // Handle edit target
  const handleEditTarget = (target: any) => {
    setEditingTarget(target);
    setIsTargetMappingModalOpen(true);
  };

  // Handle dialog close via backdrop or ESC
  const handlePasswordDialogOpenChange = (open: boolean) => {
    setIsPasswordDialogOpen(open);
    if (!open) {
      handleCancelDelete();
    }
  };

  const handleTargetPasswordDialogOpenChange = (open: boolean) => {
    setIsTargetPasswordDialogOpen(open);
    if (!open) {
      handleCancelTargetDelete();
    }
  };

  // Handle delete cash outflow
  const handleDeleteCashout = (cashoutId: string, cashoutDescription: string) => {
    setCashoutToDelete({ id: cashoutId, description: cashoutDescription });
    setPasswordAttempts(0);
    setPasswordInput("");
    setIsCashoutPasswordDialogOpen(true);
  };

  // Handle password verification for cash outflow delete
  const handleVerifyCashoutPassword = async () => {
    if (!passwordInput) {
      toast({
        title: "Error",
        description: "Please enter your password",
        variant: "destructive"
      });
      return;
    }

    setIsVerifyingPassword(true);
    try {
      const response = await apiRequest('POST', '/api/admin/verify-password', {
        password: passwordInput
      });

      const responseData = await response.json() as any;

      if (responseData && responseData.success) {
        if (cashoutToDelete) {
          try {
            const deleteResponse = await apiRequest('DELETE', `/api/admin/cash-outflows/${cashoutToDelete.id}`, {});
            const deleteResult = await deleteResponse.json();

            if (!deleteResponse.ok) {
              throw new Error(deleteResult.message || 'Failed to delete cash outflow');
            }

            queryClient.invalidateQueries({ queryKey: ['/api/admin/cash-outflows'] });

            toast({
              title: "Success",
              description: "Cash outflow deleted successfully",
              className: "bg-green-50 border-green-200 text-green-800",
            });

            setIsCashoutPasswordDialogOpen(false);
            setPasswordInput("");
            setPasswordAttempts(0);
            setCashoutToDelete(null);
          } catch (deleteError: any) {
            console.error('Deletion failed:', deleteError);
            toast({
              title: "Error",
              description: deleteError.message || "Failed to delete the cash outflow. Please try again.",
              variant: "destructive"
            });
          }
        }
      } else {
        const newAttempts = passwordAttempts + 1;
        setPasswordAttempts(newAttempts);
        setPasswordInput("");

        if (newAttempts >= 3) {
          toast({
            title: "Security Alert",
            description: "Too many incorrect attempts. Please try again later.",
            variant: "destructive"
          });
          setIsCashoutPasswordDialogOpen(false);
          setPasswordInput("");
          setPasswordAttempts(0);
          setCashoutToDelete(null);
        } else {
          toast({
            title: "Incorrect Password",
            description: `${3 - newAttempts} attempt(s) remaining`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete the cash outflow. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  // Handle cancel cash outflow delete
  const handleCancelCashoutDelete = () => {
    setIsCashoutPasswordDialogOpen(false);
    setPasswordInput("");
    setPasswordAttempts(0);
    setCashoutToDelete(null);
  };

  const handleCashoutPasswordDialogOpenChange = (open: boolean) => {
    setIsCashoutPasswordDialogOpen(open);
    if (!open) {
      handleCancelCashoutDelete();
    }
  };

  // Handle edit cash outflow
  const handleEditCashout = (cashout: any) => {
    setEditingCashout(cashout);
    setCashoutForm({
      month: cashout.month || '',
      year: cashout.year || '',
      employees: cashout.employees?.toString() || '',
      salary: cashout.salary?.toString() || '',
      incentive: cashout.incentive?.toString() || '',
      tools: cashout.tools?.toString() || '',
      rent: cashout.rent?.toString() || '',
      others: cashout.others?.toString() || ''
    });

    // If editing from modal, close modal and scroll to form on main page
    if (isCashoutModalOpen) {
      setIsCashoutModalOpen(false);
      // Wait for modal to close, then scroll to form
      setTimeout(() => {
        const formElement = document.querySelector('[data-testid="button-add-cashout"]');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight the form section briefly
          const formCard = formElement.closest('.bg-white, .dark\\:bg-gray-900');
          if (formCard) {
            (formCard as HTMLElement).style.transition = 'box-shadow 0.3s';
            (formCard as HTMLElement).style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
            setTimeout(() => {
              (formCard as HTMLElement).style.boxShadow = '';
            }, 2000);
          }
        }
      }, 300);
    }
  };

  // Handle delete revenue mapping
  const handleDeleteRevenueMapping = (revenueMappingId: string, revenueMappingDescription: string) => {
    setRevenueMappingToDelete({ id: revenueMappingId, description: revenueMappingDescription });
    setPasswordAttempts(0);
    setPasswordInput("");
    setIsRevenueMappingPasswordDialogOpen(true);
  };

  // Handle password verification for revenue mapping delete
  const handleVerifyRevenueMappingPassword = async () => {
    if (!passwordInput) {
      toast({
        title: "Error",
        description: "Please enter your password",
        variant: "destructive"
      });
      return;
    }

    setIsVerifyingPassword(true);
    try {
      const response = await apiRequest('POST', '/api/admin/verify-password', {
        password: passwordInput
      });

      const responseData = await response.json() as any;

      if (responseData && responseData.success) {
        if (revenueMappingToDelete) {
          try {
            const deleteResponse = await apiRequest('DELETE', `/api/admin/revenue-mappings/${revenueMappingToDelete.id}`, {});
            const deleteResult = await deleteResponse.json();

            if (!deleteResponse.ok) {
              throw new Error(deleteResult.message || 'Failed to delete revenue mapping');
            }

            invalidateRevenueMappingQueries(queryClient);

            toast({
              title: "Success",
              description: "Revenue mapping deleted successfully",
              className: "bg-green-50 border-green-200 text-green-800",
            });

            setIsRevenueMappingPasswordDialogOpen(false);
            setPasswordInput("");
            setPasswordAttempts(0);
            setRevenueMappingToDelete(null);
          } catch (deleteError: any) {
            console.error('Deletion failed:', deleteError);
            toast({
              title: "Error",
              description: deleteError.message || "Failed to delete the revenue mapping. Please try again.",
              variant: "destructive"
            });
          }
        }
      } else {
        const newAttempts = passwordAttempts + 1;
        setPasswordAttempts(newAttempts);
        setPasswordInput("");

        if (newAttempts >= 3) {
          toast({
            title: "Security Alert",
            description: "Too many incorrect attempts. Please try again later.",
            variant: "destructive"
          });
          setIsRevenueMappingPasswordDialogOpen(false);
          setPasswordInput("");
          setPasswordAttempts(0);
          setRevenueMappingToDelete(null);
        } else {
          toast({
            title: "Incorrect Password",
            description: `${3 - newAttempts} attempt(s) remaining`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete the revenue mapping. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  // Handle cancel revenue mapping delete
  const handleCancelRevenueMappingDelete = () => {
    setIsRevenueMappingPasswordDialogOpen(false);
    setPasswordInput("");
    setPasswordAttempts(0);
    setRevenueMappingToDelete(null);
  };

  const handleRevenueMappingPasswordDialogOpenChange = (open: boolean) => {
    setIsRevenueMappingPasswordDialogOpen(open);
    if (!open) {
      handleCancelRevenueMappingDelete();
    }
  };

  const displayedRequirements = filteredRequirements.slice(0, Math.min(requirementsVisible, 10));
  const isShowingAllRequirements = requirementsVisible >= filteredRequirements.length;

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800';
      case 'LOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceBadgeColor = (grade: string) => {
    switch (grade) {
      case 'G':
        return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400';
      case 'A':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400';
      case 'B':
        return 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const handleDateChange = (value: string) => {
    setMeetingDate(value);
    setIsCustomDate(value === 'custom');
  };

  // Create cash outflow mutation
  const createCashOutflowMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/admin/cash-outflows', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cash-outflows'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/key-aspects'] }); // Refresh Key Metrics
      queryClient.invalidateQueries({ queryKey: ['/api/admin/master-data-totals'] }); // Refresh Master Data Totals
      setCashoutForm({
        month: '', year: '', employees: '', salary: '', incentive: '', tools: '', rent: '', others: ''
      });
      setEditingCashout(null);
      toast({
        title: "Success",
        description: "Cash outflow added successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add cash outflow",
        variant: "destructive",
      });
    }
  });

  // Update cash outflow mutation
  const updateCashOutflowMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PUT', `/api/admin/cash-outflows/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cash-outflows'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/key-aspects'] }); // Refresh Key Metrics
      queryClient.invalidateQueries({ queryKey: ['/api/admin/master-data-totals'] }); // Refresh Master Data Totals
      setCashoutForm({
        month: '', year: '', employees: '', salary: '', incentive: '', tools: '', rent: '', others: ''
      });
      setEditingCashout(null);
      toast({
        title: "Success",
        description: "Cash outflow updated successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update cash outflow",
        variant: "destructive",
      });
    }
  });

  const handleAddCashoutData = () => {
    if (cashoutForm.month && cashoutForm.year && cashoutForm.employees && cashoutForm.salary) {
      const cashoutData = {
        month: cashoutForm.month,
        year: parseInt(cashoutForm.year, 10),
        employeesCount: parseInt(cashoutForm.employees, 10),
        totalSalary: parseInt(cashoutForm.salary, 10),
        incentive: parseInt(cashoutForm.incentive, 10) || 0,
        toolsCost: parseInt(cashoutForm.tools, 10) || 0,
        rent: parseInt(cashoutForm.rent, 10) || 0,
        otherExpenses: parseInt(cashoutForm.others, 10) || 0,
      };

      // Check if we're editing an existing record
      if (editingCashout && editingCashout.id) {
        updateCashOutflowMutation.mutate({ id: editingCashout.id, data: cashoutData });
      } else {
        createCashOutflowMutation.mutate(cashoutData);
      }
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Month, Year, Employees, Salary)",
        variant: "destructive",
      });
    }
  };

  const getMeetingWithOptions = () => {
    return meetingFor === 'TL' ? tlList : meetingFor === 'TA' ? taList : [];
  };

  // Feedback Turn Around editing handlers for Client Metrics Modal
  const handleEditClickModal = () => {
    setAvgDaysValueModal(String(adminImpactMetrics.feedbackTurnAroundAvgDays ?? 0));
    setIsEditingFeedbackModal(true);
  };

  const handleSaveModal = async () => {
    const value = parseFloat(avgDaysValueModal);
    if (isNaN(value)) {
      toast({ title: "Error", description: "Please enter a valid number", variant: "destructive" });
      return;
    }

    const metrics = impactMetricsQuery.data;

    // If no metrics exist, create one first
    if (!metrics || metrics.length === 0) {
      const defaultMetrics = {
        ...EMPTY_IMPACT_METRICS,
        feedbackTurnAroundAvgDays: value,
      };

      try {
        const response = await apiRequest('POST', '/api/admin/impact-metrics', defaultMetrics);
        await response.json();
        impactMetricsQuery.refetch();
        toast({ title: "Success", description: "Feedback Turn Around Avg Days updated successfully" });
        setIsEditingFeedbackModal(false);
      } catch (error) {
        toast({ title: "Error", description: "Failed to create impact metrics", variant: "destructive" });
      }
      return;
    }

    // Otherwise, update existing metrics
    if (metrics[0]) {
      try {
        const response = await apiRequest('PUT', `/api/admin/impact-metrics/${metrics[0].id}`, { feedbackTurnAroundAvgDays: value });
        await response.json();
        impactMetricsQuery.refetch();
        toast({ title: "Success", description: "Feedback Turn Around Avg Days updated successfully" });
        setIsEditingFeedbackModal(false);
      } catch (error) {
        toast({ title: "Error", description: "Failed to update Feedback Turn Around Avg Days", variant: "destructive" });
      }
    }
  };

  const handleCancelModal = () => {
    setIsEditingFeedbackModal(false);
    setAvgDaysValueModal("");
  };

  // Download report handlers
  const handleDownloadClick = (section: 'teams' | 'reports' | 'general') => {
    setDownloadSection(section);
    setShowDownloadConfirm(true);
  };

  const handleConfirmDownload = async () => {
    let fileFormat = '';
    let reportDetails = '';

    if (downloadSection === 'teams') {
      fileFormat = teamsFileFormat;
      reportDetails = `Teams Report - ${teamsReportType || 'N/A'} - ${teamsPeriod || 'N/A'}`;
      if (!teamsReportType || !teamsPeriod) {
        toast({ title: "Missing fields", description: "Select report type and period.", variant: "destructive" });
        setShowDownloadConfirm(false);
        return;
      }
    } else if (downloadSection === 'reports') {
      fileFormat = reportsFileFormat;
      const selectedReports = Object.entries(reportsCheckboxes)
        .filter(([_, checked]) => checked)
        .map(([key, _]) => key)
        .join(', ');
      reportDetails = `Reports - ${selectedReports} - Team: ${reportsTeam || 'All'} - Priority: ${reportsPriority || 'All'}`;
      if (!reportsPeriod) {
        toast({ title: "Missing fields", description: "Select a period for custom reports.", variant: "destructive" });
        setShowDownloadConfirm(false);
        return;
      }
    } else {
      fileFormat = generalFileFormat;
      reportDetails = `General Report - ${generalReportType || 'N/A'}`;
      if (!generalReportType) {
        toast({ title: "Missing fields", description: "Select a general report type.", variant: "destructive" });
        setShowDownloadConfirm(false);
        return;
      }
    }

    if (!fileFormat) {
      toast({
        title: "Error",
        description: "Please select a file format before downloading.",
        variant: "destructive",
      });
      setShowDownloadConfirm(false);
      return;
    }

    setShowDownloadConfirm(false);

    const periodSelection =
      downloadSection === 'teams'
        ? teamsPeriodSelection
        : downloadSection === 'reports'
          ? reportsPeriodSelection
          : null;
    if (periodSelection) {
      const periodErr = getReportPeriodValidationError(periodSelection);
      if (periodErr) {
        toast({ title: "Missing period details", description: periodErr, variant: "destructive" });
        return;
      }
    }

    setReportGenerating({ active: true, message: "Generating report…", progress: 12 });
    await new Promise((r) => setTimeout(r, 60));
    setReportGenerating({ active: true, message: "Collecting records…", progress: 45 });

    // For PDF, generate a branded StaffOS report document
    if (fileFormat === 'pdf') {
      setReportGenerating({ active: true, message: "Building document…", progress: 78 });
      await new Promise((r) => setTimeout(r, 40));

      const reportTypeLabel =
        downloadSection === 'teams'
          ? teamsReportType
          : downloadSection === 'reports'
            ? Object.entries(reportsCheckboxes)
                .filter(([, checked]) => checked)
                .map(([key]) => key)
                .join(', ') || 'custom'
            : generalReportType;

      const reportMeta = buildAdminReportMeta({
        preparedBy: userName,
        role: userRole === 'admin' ? 'Administrator' : formatEmployeeStatusLabel(userRole),
        department: profileData?.department ?? employee?.department ?? null,
        email: profileData?.email || employee?.email || null,
        employeeId: profileData?.employeeId || employee?.employeeId || null,
        period: periodSelection,
        reportSection:
          downloadSection === 'teams'
            ? 'Teams Reports'
            : downloadSection === 'reports'
              ? 'Custom Reports'
              : 'General Reports',
        reportType: reportTypeLabel || 'N/A',
      });

      let bodyHtml = '';
      if (downloadSection === 'teams') {
        bodyHtml = buildTeamsReportBody({
          reportType: teamsReportType,
          period: teamsPeriodSelection,
          cashoutData,
          targetMappings,
          dailyMetrics: dailyMetricsData,
          keyAspects: keyAspectsData,
          candidates: filteredCandidates,
          masterTotals,
          users: userManagementEmployees,
        });
      } else if (downloadSection === 'reports') {
        bodyHtml = buildCustomReportsBody({
          selected: Object.entries(reportsCheckboxes)
            .filter(([, checked]) => checked)
            .map(([key]) => key),
          period: reportsPeriodSelection,
          team: reportsTeam,
          priority: reportsPriority,
          type: reportsType,
          requirements,
          pipeline: pipelineApplicantData,
          closures: closureReportsData,
          teamPerformance: teamPerformanceData,
        });
      } else {
        bodyHtml = buildGeneralReportBody(
          generalReportType,
          operationsEmployeesForReport,
          clientCompaniesForReport,
          clientPortalUsersForReport,
        );
      }

      const htmlContent = buildAdminReportShell({
        title:
          downloadSection === 'teams'
            ? 'Teams Report'
            : downloadSection === 'reports'
              ? 'Custom Operations Report'
              : 'General Master Report',
        subtitle: 'Generated from StaffOS Admin Portal',
        meta: reportMeta,
        bodyHtml,
      });

      openAdminReportPrintWindow(htmlContent);
      toast({
        title: "PDF Download",
        description: "Use your browser's print dialog to save as PDF.",
        className: "bg-blue-50 border-blue-200 text-blue-800",
      });
      setReportGenerating({ active: true, message: "Ready to print", progress: 100, done: true });
      setTimeout(() => setReportGenerating(null), 1200);
    } else {
      // For CSV format
      let csvContent = '';

      if (downloadSection === 'teams') {
        if (teamsReportType === 'cash-outflows') {
          const filteredCashOutflows = cashoutData.filter((item: any) =>
            cashOutflowMatchesPeriod(item, teamsPeriodSelection),
          );

          csvContent = 'Month,Year,Employees,Salary,Incentive,Tools Cost,Rent,Other Expenses,Total\n';
          filteredCashOutflows.forEach((item: any) => {
            const total = (parseInt(item.salary) || 0) + (parseInt(item.incentive) || 0) + 
                         (parseInt(item.tools) || 0) + (parseInt(item.rent) || 0) + 
                         (parseInt(item.others) || 0);
            csvContent += `"${item.month || ''}","${item.year || ''}","${item.employees || ''}","${item.salary || 0}","${item.incentive || 0}","${item.tools || 0}","${item.rent || 0}","${item.others || 0}","${total}"\n`;
          });
        }
      } else if (downloadSection === 'reports') {
        const selectedReports = Object.entries(reportsCheckboxes)
          .filter(([_, checked]) => checked)
          .map(([key, _]) => key);

        const lines: string[] = [];

        // Requirements section
        if (selectedReports.includes('requirements')) {
          let filteredRequirements = requirements;
          if (reportsTeam && reportsTeam !== 'all') {
            filteredRequirements = filteredRequirements.filter((req: any) => 
              req.teamLead?.toLowerCase() === reportsTeam.toLowerCase()
            );
          }
          if (reportsPriority && reportsPriority !== 'all') {
            filteredRequirements = filteredRequirements.filter((req: any) => 
              req.priority?.toLowerCase() === reportsPriority.toLowerCase()
            );
          }
          if (reportsType && reportsType !== 'all') {
            if (reportsType === 'opened') {
              filteredRequirements = filteredRequirements.filter((req: any) => req.status !== 'Closed' && req.status !== 'Archived');
            } else if (reportsType === 'closed') {
              filteredRequirements = filteredRequirements.filter((req: any) => req.status === 'Closed');
            } else if (reportsType === 'archived') {
              filteredRequirements = filteredRequirements.filter((req: any) => req.status === 'Archived');
            }
          }
          filteredRequirements = filteredRequirements.filter((req: any) =>
            isDateInReportPeriod(req.createdAt, reportsPeriodSelection),
          );

          lines.push('Section,Position,Company,Team Lead,Priority,Status,Criticality,Created At');
          filteredRequirements.forEach((req: any) => {
            lines.push(`"Requirements","${req.position || ''}","${req.company || ''}","${req.teamLead || ''}","${req.priority || ''}","${req.status || ''}","${req.criticality || ''}","${req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ''}"`);
          });
        }

        // Pipeline section
        if (selectedReports.includes('pipeline')) {
          const filteredPipelineCsv = pipelineApplicantData.filter((app: any) =>
            isDateInReportPeriod(app.appliedDate || app.appliedOn, reportsPeriodSelection),
          );
          if (filteredPipelineCsv.length > 0) {
            if (lines.length > 0) lines.push('');
            lines.push('Section,Applied On,Candidate,Company,Role,Status,Location,Experience');
            filteredPipelineCsv.forEach((app: any) => {
              lines.push(`"Pipeline","${app.appliedOn || ''}","${app.candidateName || ''}","${app.company || ''}","${app.roleApplied || ''}","${app.currentStatus || ''}","${app.location || ''}","${app.experience || ''}"`);
            });
          }
        }

        // Closure reports section
        if (selectedReports.includes('closureReports')) {
          const filteredClosuresCsv = closureReportsData.filter((report: any) =>
            isDateInReportPeriod(
              report.offeredDateRaw || report.joinedDateRaw || report.offeredDate || report.joinedDate,
              reportsPeriodSelection,
            ),
          );
          if (filteredClosuresCsv.length > 0) {
            if (lines.length > 0) lines.push('');
            lines.push('Section,Candidate,Position,Client,Talent Advisor,Fixed CTC,Offered Date,Joined Date,Status');
            filteredClosuresCsv.forEach((report: any) => {
              lines.push(`"Closure Reports","${report.candidate || ''}","${report.position || ''}","${report.client || ''}","${report.talentAdvisor || ''}","${report.fixedCTC || ''}","${report.offeredDate || ''}","${report.joinedDate || ''}","${report.status || ''}"`);
            });
          }
        }

        // Team performance section (live snapshot — not period-filtered by join date)
        if (selectedReports.includes('teamPerformance') && teamPerformanceData.length > 0) {
          if (lines.length > 0) lines.push('');
          lines.push('Section,Talent Advisor,Joining Date,Tenure,Closures,Last Closure,Quarters Achieved');
          teamPerformanceData.forEach((item: any) => {
            lines.push(`"Team Performance","${item.talentAdvisor || ''}","${item.joiningDate || ''}","${item.tenure || ''}","${item.closures ?? ''}","${item.lastClosure || ''}","${item.qtrsAchieved ?? ''}"`);
          });
        }

        if (lines.length === 0) {
          lines.push('Selected Reports,Team,Priority,Type,File Format');
          lines.push(`${selectedReports.join('; ') || 'None'},${reportsTeam || 'All'},${reportsPriority || 'All'},${reportsType || 'All'},${fileFormat}`);
        }

        csvContent = lines.join('\n');
      } else {
        if (generalReportType === 'employee-master') {
          csvContent = 'Employee ID,Name,Email,Phone,Role,Department,Joining Date,Status\n';
          operationsEmployeesForReport.forEach((emp: any) => {
            csvContent += `"${emp.employeeId || ''}","${emp.name || ''}","${emp.email || ''}","${emp.phone || ''}","${formatEmployeeStatusLabel(emp.role)}","${emp.department || ''}","${emp.joiningDate || ''}","${emp.employmentStatus || (emp.isActive === false ? 'Inactive' : 'Active')}"\n`;
          });
        } else if (generalReportType === 'client-master') {
          csvContent = 'Record Type,ID,Name,Email,Phone,Role,Company,Location,Status\n';
          clientCompaniesForReport.forEach((client: any) => {
            csvContent += `"Company","${client.clientCode || client.id || ''}","${client.brandName || client.incorporatedName || ''}","${client.email || ''}","${client.phone || ''}","","${client.location || ''}","${client.currentStatus || ''}"\n`;
          });
          clientPortalUsersForReport.forEach((user: any) => {
            const company = clientCompaniesForReport.find(
              (client: any) => client.id === user.clientCompanyId,
            );
            const companyLabel = company
              ? [company.brandName || company.incorporatedName, company.location].filter(Boolean).join(" · ")
              : "";
            csvContent += `"Portal User","${user.employeeId || user.id || ''}","${user.name || ''}","${user.email || ''}","${user.phone || ''}","${formatEmployeeStatusLabel(user.role)}","${companyLabel}","${user.isActive === false ? 'Inactive' : 'Active'}"\n`;
          });
        }
      }

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportDetails.replace(/[^a-z0-9]/gi, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Started",
        description: `Downloading ${reportDetails} as CSV`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    }

    setShowDownloadConfirm(false);
  };

  const toggleReportCheckbox = (key: keyof typeof reportsCheckboxes) => {
    setReportsCheckboxes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderTeamSection = () => (
    <div className="px-3 py-2 space-y-2 flex-1 overflow-y-auto admin-scrollbar">
      {/* Use the new TeamBoxes component - this replaces all the old team display logic */}
      <TeamBoxes />

      {/* Target & Incentives Section */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <CardHeader className="pb-3 pt-4 px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Target & Incentives</CardTitle>
            <Button
              variant="outline"
              className="h-7 rounded-[6px] border-blue-600 px-3 text-xs font-medium text-blue-600 shadow-none hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={() => setIsTargetModalOpen(true)}
              data-testid="button-view-all-targets"
            >
              View More
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="overflow-x-auto admin-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Resource</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Quarter</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Target</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Target Achieved</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Closures</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Incentives</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingTargets ? (
                  <tr>
                    <td colSpan={8} className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : targetMappings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                      No target mappings found
                    </td>
                  </tr>
                ) : (
                  targetMappings.slice(0, 5).map((target, index) => {
                    // Determine resource name - prefer team member name, fallback to team lead name
                    const resourceName = target.teamMemberName || target.teamLeadName || "-";
                    // Determine role - if teamMemberName exists, it's TA, otherwise TL
                    const role = target.teamMemberName ? "TA" : "TL";
                    // Format quarter (e.g., "ASO 2025")
                    const quarterDisplay = target.quarter ? `${target.quarter} ${target.year || new Date().getFullYear()}` : "-";

                    return (
                      <tr key={target.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{resourceName}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{role}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{quarterDisplay}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{target.minimumTarget ? target.minimumTarget.toLocaleString('en-IN') : "-"}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{target.targetAchieved ? target.targetAchieved.toLocaleString('en-IN') : "-"}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{target.closures || "-"}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{target.incentives ? target.incentives.toLocaleString('en-IN') : "-"}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                                data-testid={`button-actions-target-${target.id}`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTarget(target);
                                }}
                                className="cursor-pointer"
                                data-testid={`button-edit-target-${target.id}`}
                              >
                                <EditIcon className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTarget(target.id, `${resourceName} - ${quarterDisplay}`);
                                }}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                                data-testid={`button-delete-target-${target.id}`}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Daily Metrics Section */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Left side - Overall Performance */}
            <div className="bg-white dark:bg-gray-900 rounded p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Performance</h3>
                  <div className={`text-lg font-bold ${getPerformanceBadgeColor(dailyMetricsData.overallPerformance || 'G')} w-8 h-8 rounded flex items-center justify-center`} data-testid="indicator-performance">
                    {dailyMetricsData.overallPerformance || 'G'}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0"
                  onClick={() => setIsPerformanceGraphModalOpen(true)}
                  data-testid="button-expand-overall-performance"
                  title="Open detailed view"
                >
                  <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </Button>
              </div>
              <div className="flex flex-wrap justify-start gap-x-3 gap-y-1 mb-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Delivered</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Required</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-0.5 border-t-2 border-dashed border-gray-500"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Benchmark ({performanceBenchmark})</span>
                </div>
              </div>
              <div className="h-48 mt-2">
                <PerformanceChart
                  data={performanceData}
                  height="100%"
                  benchmarkValue={performanceBenchmark}
                  showDualLines
                />
              </div>
            </div>

            {/* Center - Daily Metrics */}
            <div className="bg-white dark:bg-gray-900 rounded p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Requirements</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dailyMetricsData.totalRequirements}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg. Resumes per Requirement</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{String(Number(dailyMetricsData.avgResumesPerRequirement).toFixed(0)).padStart(2, '0')}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Requirements per Recruiter</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{String(Number(dailyMetricsData.requirementsPerRecruiter).toFixed(0)).padStart(2, '0')}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed Requirements</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dailyMetricsData.completedRequirements}</span>
                </div>
              </div>
            </div>

            {/* Right side - Daily Delivery */}
            <div className="bg-white dark:bg-gray-900 rounded p-4 border border-gray-200 dark:border-gray-700">
              {/* Top Controls */}
              <div className="flex items-center justify-between mb-4 gap-2">
                <Select value={selectedDailyMetricsTeam} onValueChange={(value) => setSelectedDailyMetricsTeam(value)}>
                  <SelectTrigger
                    className="h-8 w-24 border-slate-200 bg-slate-100 text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-700/80 dark:text-slate-100"
                    data-testid="select-daily-metrics-team"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overall">Overall</SelectItem>
                    {employees
                      .filter((emp: Employee) => emp.role === 'team_leader' && emp.isActive)
                      .map((teamLeader: Employee) => (
                        <SelectItem key={teamLeader.id} value={teamLeader.id}>
                          {teamLeader.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <StandardDatePicker
                    value={selectedDate}
                    onChange={(date) => date && setSelectedDate(date)}
                    placeholder="Select date"
                    className="w-auto h-8 text-xs"
                  />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Delivery</h3>
              <div className="space-y-3">
                {/* Delivered Box */}
                <div className="border-2 border-green-500 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Delivered</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {String(dailyMetricsData.dailyDeliveryDelivered).padStart(2, '0')}
                  </p>
                </div>
                {/* Defaulted Box */}
                <div className="border-2 border-red-500 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Defaulted</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {String(dailyMetricsData.dailyDeliveryDefaulted).padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Messages and Meetings Section */}
      <div className="grid grid-cols-2 gap-6 h-fit">
        {/* Pending Meetings */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <CardHeader className="pb-3 pt-4 px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Pending Meetings</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsPendingMeetingsCollapsed((prev) => !prev)}
                  data-testid="button-toggle-pending-meetings"
                >
                  {isPendingMeetingsCollapsed ? (
                    <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsCreateMeetingModalOpen(true)}
                  data-testid="button-add-meeting"
                >
                  <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  data-testid="button-meeting-options"
                  onClick={() => setIsMeetingsMenuModalOpen(true)}
                >
                  <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </Button>
              </div>
            </div>
          </CardHeader>
          {!isPendingMeetingsCollapsed && (
          <CardContent className="px-6 pb-6">
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {nearestMeetings.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                  No pending meetings
                </div>
              ) : (
                nearestMeetings.map((meeting: any) => {
                  const isExpanded = expandedMeetings.has(meeting.id);
                  const meetingTime = meeting.meetingTime || '8:30 am';
                  const meetingDate = meeting.meetingDate ? new Date(meeting.meetingDate) : new Date();
                  const formattedTime = meetingTime.includes('am') || meetingTime.includes('pm')
                    ? meetingTime
                    : `${meetingTime} am`;

                  return (
                    <div
                      key={meeting.id}
                      className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all"
                    >
                      {!isExpanded ? (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {meeting.meetingType || meeting.agenda || 'Meeting'}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMeetingExpansion(meeting.id);
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            data-testid={`button-expand-meeting-${meeting.id}`}
                          >
                            <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {/* Title and Status on same row */}
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {meeting.meetingType || meeting.agenda || 'Meeting'}
                            </div>
                            <div className="flex items-center gap-2">
                              {(() => {
                                // Determine if meeting is completed based on date/time
                                try {
                                  const meetingDateStr = meeting.meetingDate;
                                  const meetingTimeStr = meeting.meetingTime || '00:00';
                                  // Parse time - handle both "HH:MM" and "HH:MM am/pm" formats
                                  let timeStr = meetingTimeStr;
                                  if (!timeStr.includes('am') && !timeStr.includes('pm')) {
                                    // Convert 24h format to 12h if needed
                                    const [hours, minutes] = timeStr.split(':');
                                    const hour24 = parseInt(hours);
                                    if (hour24 >= 12) {
                                      timeStr = `${hour24 === 12 ? 12 : hour24 - 12}:${minutes} pm`;
                                    } else {
                                      timeStr = `${hour24 === 0 ? 12 : hour24}:${minutes} am`;
                                    }
                                  }
                                  const meetingDateTime = new Date(`${meetingDateStr} ${timeStr}`);
                                  const now = new Date();
                                  const isCompleted = meetingDateTime < now || meeting.status === 'completed';
                                  return (
                                    <span className={`text-xs font-medium ${isCompleted
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-yellow-600 dark:text-yellow-400'
                                      }`}>
                                      {isCompleted ? 'Completed' : 'Scheduled'}
                                    </span>
                                  );
                                } catch (e) {
                                  // Fallback to status if date parsing fails
                                  return (
                                    <span className={`text-xs font-medium ${meeting.status === 'completed'
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-yellow-600 dark:text-yellow-400'
                                      }`}>
                                      {meeting.status === 'completed' ? 'Completed' : 'Scheduled'}
                                    </span>
                                  );
                                }
                              })()}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRescheduleMeeting(meeting);
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                data-testid={`button-edit-meeting-${meeting.id}`}
                                title="Edit meeting"
                              >
                                <EditIcon className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMeetingExpansion(meeting.id);
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                data-testid={`button-collapse-meeting-${meeting.id}`}
                              >
                                <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              </button>
                            </div>
                          </div>

                          {/* Date */}
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Date:</span>
                            <span>{format(new Date(meeting.meetingDate), 'dd-MMM-yyyy')}</span>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Time:</span>
                            <span>{formattedTime}</span>
                          </div>

                          {/* Meeting With */}
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Meeting With:</span>
                            <span>{meeting.person || 'N/A'}</span>
                          </div>

                          {/* Description if available */}
                          {meeting.agenda && meeting.agenda !== 'General Discussion' && (
                            <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Description:</span>
                              <span className="flex-1">{meeting.agenda}</span>
                            </div>
                          )}

                          {/* Participants */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Members:</span>
                            <div className="flex -space-x-2">
                              {(() => {
                                // Get actual participants
                                const participants: string[] = [];
                                if (meeting.personId) {
                                  participants.push(meeting.personId);
                                }
                                if (meeting.members && Array.isArray(meeting.members)) {
                                  participants.push(...meeting.members);
                                }
                                // Remove duplicates
                                const uniqueParticipants = Array.from(new Set(participants));
                                const participantCount = uniqueParticipants.length;

                                // Get participant names
                                const participantNames = uniqueParticipants
                                  .map(id => employees.find((e: Employee) => e.id === id))
                                  .filter(Boolean)
                                  .slice(0, 5);

                                const remainingCount = Math.max(0, participantCount - 5);

                                if (participantCount === 0) {
                                  return <span className="text-xs text-gray-500">No members added</span>;
                                }

                                return (
                                  <>
                                    {participantNames.map((emp: Employee | undefined, idx: number) => {
                                      if (!emp) return null;
                                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'];
                                      return (
                                        <div
                                          key={emp.id}
                                          className={`w-8 h-8 rounded-full ${colors[idx % colors.length]} border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-medium`}
                                          title={emp.name}
                                        >
                                          {emp.name.charAt(0).toUpperCase()}
                                        </div>
                                      );
                                    })}
                                    {remainingCount > 0 && (
                                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                                        +{remainingCount}
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
          )}
        </Card>

        {/* Message Status */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <CardHeader className="pb-3 pt-4 px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Message Status</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsMessageStatusCollapsed((prev) => !prev)}
                  data-testid="button-toggle-message-status"
                >
                  {isMessageStatusCollapsed ? (
                    <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setIsCreateMessageModalOpen(true);
                  }}
                  data-testid="button-add-message"
                >
                  <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </Button>
              </div>
            </div>
          </CardHeader>
          {!isMessageStatusCollapsed && (
          <CardContent className="px-6 pb-6">
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {isLoadingChatRooms ? (
                <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                  Loading messages...
                </div>
              ) : adminChatRooms.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                  No messages yet. Start a conversation by clicking the + button.
                </div>
              ) : (
                adminChatRooms.slice(0, 5).map((room: any) => {
                  // Get the other participant (not admin)
                  const otherParticipant = room.participants?.find((p: any) => p.participantId !== employee?.id);
                  const participantName = otherParticipant?.participantName || 'Unknown';
                  const participantRole = otherParticipant?.participantRole || '';
                  const roleLabel = participantRole === 'team_leader' ? 'TL' : participantRole === 'recruiter' ? 'TA' : '';
                  const timeStr = room.lastMessageAt
                    ? new Date(room.lastMessageAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                    : new Date(room.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                  const unreadCount = room.unreadCount || 0;

                  return (
                    <div
                      key={room.id}
                      className={`bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all cursor-pointer ${unreadCount > 0 ? 'border-l-4 border-l-green-500' : ''
                        }`}
                      onClick={() => {
                        setSelectedChatRoom(room.id);
                        setIsChatModalOpen(true);
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {participantName}
                            </span>
                            {roleLabel && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">({roleLabel})</span>
                            )}
                            {unreadCount > 0 && (
                              <span className="bg-green-500 text-white text-xs font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                            {unreadCount > 0 ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}` : 'Click to view messages'}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {timeStr}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
          )}
        </Card>
      </div>
    </div>
  );

  const renderAdminPipelineView = () => (
    <AdminPipelineTab
      isLoading={isLoadingPipeline}
      isEmpty={!isLoadingPipeline && pipelineApplicantData.length === 0}
      groupedByStage={getPipelineCandidatesByStage}
      pipelineView={pipelineView}
      candidateSession={
        sessionApplicationId ? (
          <CandidateCommentsSession
            applicationId={sessionApplicationId}
            fallbackApplicant={sessionApplicantSnapshot}
            pipelineApplicants={adminPipelineSessionList}
            onSelectApplicant={handleSelectSessionApplicant}
            onBack={handleCloseCandidateSession}
          />
        ) : null
      }
      onCandidateClick={handlePipelineCandidateClick}
      selectedPipelineTL={selectedPipelineTL}
      selectedPipelineTeamMember={selectedPipelineTeamMember}
      onFilterChange={(value) => {
        if (value === 'all') {
          setSelectedPipelineTL('all');
          setSelectedPipelineTeamMember('all');
        } else if (value.startsWith('tl-')) {
          setSelectedPipelineTL(value.replace('tl-', ''));
          setSelectedPipelineTeamMember('all');
        } else if (value.startsWith('ta-')) {
          setSelectedPipelineTL('all');
          setSelectedPipelineTeamMember(value.replace('ta-', ''));
        }
      }}
      pipelineDate={pipelineDate}
      onPipelineDateChange={setPipelineDate}
      teamLeads={teamLeads}
      employees={employees}
      closureReportsFooter={
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Closure Reports</h3>
            {closureReportsData.length > 5 && (
              <Button
                variant="outline"
                className="border-blue-600 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                style={{ borderRadius: 6 }}
                onClick={() => setIsClosureReportsModalOpen(true)}
              >
                View More
              </Button>
            )}
          </div>
          <ClosureReportsCardList
            reports={closureReportsData}
            isLoading={isLoadingClosureReports}
            emptyMessage="No closures yet."
            maxRows={5}
            showActions
            renderActions={renderClosureReportActions}
            getRowClassName={(report) =>
              report.closureAction?.type ? "bg-rose-50/90" : undefined
            }
          />
        </div>
      }
    />
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'team':
        return renderTeamSection();
      case 'requirements':
        return (
          <div className="px-6 py-6 space-y-6 h-full overflow-y-auto admin-scrollbar">
            {/* Header with Requirements title and Add button */}
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Requirements</h2>
              <div className="flex items-center gap-4">
                <SearchBar
                  value={requirementsSearch}
                  onChange={setRequirementsSearch}
                  placeholder="Search here"
                  testId="input-search-requirements"
                />
                <Button
                  className="bg-cyan-400 hover:bg-cyan-500 text-black font-medium px-4 py-2 rounded text-sm whitespace-nowrap"
                  onClick={() => {
                    setEditingRequirement(null);
                    setInitialRequirementData(null);
                    setIsAddRequirementModalOpen(true);
                  }}
                  data-testid="button-add-requirements"
                >
                  + Add Requirements
                </Button>
              </div>
            </div>

            <div className="flex gap-6 h-full">
              {/* Left Section - Requirements Table */}
              <div className="flex-1 overflow-y-auto admin-scrollbar">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="overflow-x-auto admin-scrollbar">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm w-[88px]">Req ID</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm w-[200px] max-w-[200px]">Positions</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Company</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">SPOC</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Talent Advisor</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Team Lead</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Criticality</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Resume Count</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequirements.map((requirement: Requirement, index: number) => (
                          <tr key={requirement.id} className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
                            <td className="py-3 px-3 w-[88px] text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                              {getRequirementDisplayId(requirement)}
                            </td>
                            <td className="py-3 px-3 w-[200px] max-w-[200px] text-gray-900 dark:text-white font-medium text-sm">
                              <span className="block truncate" title={requirement.position}>{requirement.position}</span>
                            </td>
                            <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">{requirement.company}</td>
                            <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">{requirement.spoc}</td>
                            <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">
                              {requirement.talentAdvisor === "Unassigned" ? (
                                <span className="text-cyan-500 dark:text-cyan-400">{requirement.talentAdvisor}</span>
                              ) : (
                                requirement.talentAdvisor
                              )}
                            </td>
                            <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">
                              {requirement.teamLead === "Unassigned" ? (
                                <span className="text-cyan-500 dark:text-cyan-400">{requirement.teamLead}</span>
                              ) : (
                                requirement.teamLead
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${requirement.criticality === 'HIGH' ? 'bg-red-500' :
                                  requirement.criticality === 'MEDIUM' || requirement.criticality === 'MED' ? 'bg-blue-500' :
                                    'bg-gray-400'
                                  }`}></div>
                                <span className={`text-sm font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300`}>
                                  {requirement.criticality}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                              {(requirement as Requirement & { resumeCount?: string }).resumeCount || "00/00"}
                            </td>
                            <td className="py-3 px-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-32">
                                  <DropdownMenuItem onClick={() => handleReassign(requirement)}>
                                    Reassign
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}









                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      className="h-10 rounded-[6px] bg-cyan-400 px-7 text-sm font-medium text-slate-900 hover:bg-cyan-500 disabled:bg-cyan-200 disabled:text-slate-500"
                      onClick={handleRequirementsViewMore}
                      disabled={requirements.length <= 10}
                    >
                      View More
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Section - Priority Distribution with Tabs */}
              <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 px-6 py-6 flex flex-col">
                <Tabs defaultValue="guideline" className="w-full flex flex-col flex-1">
                  <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <TabsTrigger value="guideline" className="text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white rounded">Guideline</TabsTrigger>
                    <TabsTrigger value="priority" className="text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white rounded">Priority Recruitments</TabsTrigger>
                  </TabsList>

                  {/* Guideline Tab - Image 2 Design (Static Values) */}
                  <TabsContent value="guideline" className="space-y-2 mt-0 flex-1 overflow-y-auto">
                    {/* HIGH Priority Group */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">HIGH</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Easy</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityDistribution.HIGH.Easy).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Med</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityDistribution.HIGH.Medium).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Tough</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityDistribution.HIGH.Tough).padStart(2, '0')}</span>
                        </div>
                      </div>
                    </div>

                    {/* MED Priority Group */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">MED</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Easy</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityDistribution.MEDIUM.Easy).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Med</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityDistribution.MEDIUM.Medium).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Tough</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityDistribution.MEDIUM.Tough).padStart(2, '0')}</span>
                        </div>
                      </div>
                    </div>

                    {/* LOW Priority Group */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">LOW</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Easy</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityDistribution.LOW.Easy).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Med</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityDistribution.LOW.Medium).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Tough</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityDistribution.LOW.Tough).padStart(2, '0')}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Priority Recruitments Tab - Image 3 Design (Calculated Values) */}
                  <TabsContent value="priority" className="space-y-3 mt-4">
                    {/* High Priority Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <ChevronUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">High priority</span>
                        </div>
                        <span className="text-2xl font-bold text-red-600 dark:text-red-400">{String(priorityCounts.counts.HIGH).padStart(2, '0')}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Easy</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityCounts.breakdowns.HIGH.Easy).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Medium</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityCounts.breakdowns.HIGH.Medium).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Tough</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityCounts.breakdowns.HIGH.Tough).padStart(2, '0')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Medium Priority Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <div className="flex gap-0.5">
                              <ChevronLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Medium priority</span>
                        </div>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{String(priorityCounts.counts.MEDIUM).padStart(2, '0')}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Easy</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityCounts.breakdowns.MEDIUM.Easy).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Medium</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityCounts.breakdowns.MEDIUM.Medium).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Tough</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityCounts.breakdowns.MEDIUM.Tough).padStart(2, '0')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Low Priority Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Low priority</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">{String(priorityCounts.counts.LOW).padStart(2, '0')}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Easy</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityCounts.breakdowns.LOW.Easy).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Medium</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityCounts.breakdowns.LOW.Medium).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Tough</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityCounts.breakdowns.LOW.Tough).padStart(2, '0')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Total Distribution Card with Pending/Closed */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Distribution</span>
                        </div>
                        <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{String(priorityCounts.counts.TOTAL).padStart(2, '0')}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Pending Distribution</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(distributionCounts.pending).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Closed Distribution</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(distributionCounts.closed).padStart(2, '0')}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        );
      case 'pipeline':
        return (
          <div className="flex h-full min-h-0 overflow-hidden">
            {renderAdminPipelineView()}
          </div>
        );
      case 'metrics':
        return (
          <div className="flex items-center justify-center h-full min-h-[500px]">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Metrics</h1>
          </div>
        );
      case 'master-data':
        return (
          <div className="px-6 py-6 space-y-8 h-full overflow-y-auto admin-scrollbar">
            {/* Resume Database */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Resume Database</CardTitle>
                <Button
                  className="btn-rounded bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    sessionStorage.setItem('adminDashboardSidebarTab', sidebarTab);
                    sessionStorage.setItem('masterDatabaseTab', 'resume');
                    navigate('/master-database');
                  }}
                >
                  View Full Database
                </Button>
              </CardHeader>
              <CardContent>
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card className="text-center p-4">
                    <CardContent className="p-0">
                      <div className="text-sm text-red-600 dark:text-red-400 mb-2 font-semibold">TOTAL RESUMES</div>
                      <div className="text-3xl font-bold text-red-600 dark:text-red-400">{masterTotals.resumes.toLocaleString('en-IN')}</div>
                    </CardContent>
                  </Card>

                  <Card className="text-center p-4">
                    <CardContent className="p-0">
                      <div className="text-sm text-blue-600 dark:text-blue-400 mb-2 font-semibold">DIRECT UPLOADS</div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{masterTotals.directUploads.toLocaleString('en-IN')}</div>
                    </CardContent>
                  </Card>

                  <Card className="text-center p-4">
                    <CardContent className="p-0">
                      <div className="text-sm text-blue-600 dark:text-blue-400 mb-2 font-semibold">RECRUITER UPLOADS</div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{masterTotals.recruiterUploads.toLocaleString('en-IN')}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Resume Database Table */}
                <div className="overflow-x-auto admin-scrollbar">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Resume ID</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Candidate Name</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Position</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Experience</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Skills</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Upload Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">RES001</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Rajesh Kumar</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Software Engineer</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">5 Years</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">React, Node.js, Python</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">15-01-2025</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">RES002</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Priya Sharma</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Data Analyst</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">3 Years</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">SQL, Excel, Power BI</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">18-01-2025</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">RES003</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Arun Patel</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">DevOps Engineer</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">7 Years</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">AWS, Docker, Kubernetes</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">20-01-2025</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">RES004</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Sneha Reddy</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">UI/UX Designer</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">4 Years</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Figma, Adobe XD, HTML/CSS</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">22-01-2025</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">RES005</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Vikram Singh</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Project Manager</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">8 Years</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Agile, Scrum, JIRA</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">25-01-2025</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    Click on "View Full Database" button above to see the complete master database
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Employees Master */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Employees Master</CardTitle>
                <Button
                  className="btn-rounded bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setIsEmployeeModalOpen(true)}
                  data-testid="button-add-employee-master"
                >
                  + Add Employee
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto admin-scrollbar">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Employee ID</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Name</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Father's Name</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Employee Status</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Date of Joining</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Current CTC</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA001</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Sundhar Raj</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">David Wilson</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Intern</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">12-08-2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">10,000</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA002</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">kavitha</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Tom Anderson</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Permanent</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">10-07-2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">15,000</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA003</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Vignesh</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Robert Kim</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Probation</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">22-10-2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">12,000</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTA004</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Saran</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Kevin Brown</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Probation</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">02-11-2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">9,500</td>
                      </tr>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white">STTL005</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Helen</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Mel Gibson</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Permanent</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">12-12-2025</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">14,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="rounded-[4px] border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => setIsIncrementModalOpen(true)}
                    data-testid="button-open-increment-modal"
                  >
                    Increment
                  </Button>
                  <Button
                    className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-4 py-2 rounded font-medium text-sm"
                    onClick={() => {
                      sessionStorage.setItem('adminDashboardSidebarTab', sidebarTab);
                      sessionStorage.setItem('masterDatabaseTab', 'employee');
                      navigate('/master-database');
                    }}
                  >
                    View More
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Client Master */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Client Master</CardTitle>
                <Button
                  className="btn-rounded bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setIsClientModalOpen(true)}
                  data-testid="button-add-client-master"
                >
                  + Add New Client
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto admin-scrollbar">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Client Code</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Brand Name</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Location</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">SPOC</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Website</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Current Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingClients ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">Loading clients...</td>
                        </tr>
                      ) : masterDataClients.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">No clients found. Click "+ Add New Client" to add one.</td>
                        </tr>
                      ) : (
                        masterDataClients.slice(0, 5).map((row: any, index: number) => {
                          const statusClass = row.currentStatus === 'active' ? 'bg-green-100 text-green-800' :
                            row.currentStatus === 'frozen' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800';
                          return (
                            <tr key={row.id || index} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">{row.clientCode}</td>
                              <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.brandName}</td>
                              <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.location || 'N/A'}</td>
                              <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.spoc || 'N/A'}</td>
                              <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.website || 'N/A'}</td>
                              <td className="py-3 px-3">
                                <span className={`${statusClass} text-sm font-semibold px-3 py-1 rounded-full`}>• {(row.currentStatus || 'active').toUpperCase()}</span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-4 py-2 rounded font-medium text-sm"
                    onClick={() => {
                      sessionStorage.setItem('adminDashboardSidebarTab', sidebarTab);
                      sessionStorage.setItem('masterDatabaseTab', 'client');
                      navigate('/master-database');
                    }}
                  >
                    View More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'performance':
        return (
          <div className="flex h-full">
            {/* Middle Column - Scrollable Content */}
            <div className="flex-1 px-6 py-6 overflow-y-auto admin-scrollbar">
              {/* Performance Header with Tabs */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Performance</h2>
                <div className="flex gap-2">
                  <Button
                    className="bg-purple-800 hover:bg-purple-900 text-white px-4 py-2 rounded text-sm"
                    onClick={() => setIsTargetMappingModalOpen(true)}
                  >
                    Target Mapping
                  </Button>
                  <Button
                    className="bg-purple-800 hover:bg-purple-900 text-white px-4 py-2 rounded text-sm"
                    onClick={() => setIsRevenueMappingModalOpen(true)}
                  >
                    Revenue Mapping
                  </Button>
                  <Button
                    className="bg-purple-800 hover:bg-purple-900 text-white px-4 py-2 rounded text-sm"
                    onClick={() => {
                      setEditingIncentiveMapping(null);
                      setIsIncentiveMappingModalOpen(true);
                    }}
                    data-testid="button-incentive-mapping"
                  >
                    Incentive Mapping
                  </Button>
                </div>
              </div>

              {/* Filter Dropdowns */}
              <div className="flex gap-4 mb-4">
                <Select value={selectedPerformanceTeam} onValueChange={setSelectedPerformanceTeam} data-testid="select-performance-team">
                  <SelectTrigger className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-4 py-2 rounded font-medium text-sm w-48">
                    <SelectValue placeholder="All Teams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {performanceTeamLeaders.map((leader) => (
                      <SelectItem key={leader.id} value={leader.id}>
                        {leader.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedPerformancePeriod} onValueChange={setSelectedPerformancePeriod}>
                  <SelectTrigger className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-4 py-2 rounded font-medium text-sm w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Chart Area - Grid Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 bg-white dark:bg-gray-900 px-6 pb-6">
                {/* Performance Chart */}
                <div className="xl:col-span-5">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-300">Performance</h3>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => setIsPerformanceChartModalOpen(true)}
                      data-testid="button-expand-performance-chart"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap justify-start gap-x-3 gap-y-1 mb-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Delivered</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Required</span>
                    </div>
                  </div>
                  <div className="h-[260px]">
                    <PerformanceTrendChart
                      data={outerPerformanceChartData}
                      height="100%"
                      chartId="performance-tab"
                    />
                  </div>
                </div>

                {/* Revenue Analysis Chart */}
                <div className="xl:col-span-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-300">Revenue Analysis</h3>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => setIsRevenueGraphModalOpen(true)}
                      data-testid="button-expand-revenue-graph"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </Button>
                  </div>
                  <div className="flex justify-start space-x-4 mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Team Revenue</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-0.5 bg-green-500"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Avg (₹{(revenueBenchmark / 1000).toFixed(0)}K)</span>
                    </div>
                  </div>
                  <div className="h-[200px]">
                    <RevenueChart
                      data={revenueData}
                      height="100%"
                      benchmarkValue={revenueBenchmark}
                    />
                  </div>
                </div>

                {/* Performance Gauge */}
                <div className="xl:col-span-3 flex flex-col items-center justify-center">
                  <div className="w-full max-w-sm mx-auto">
                    <PerformanceGauge value={performanceMetrics.performancePercentage} />
                  </div>

                  <Button
                    className="bg-cyan-400 hover:bg-cyan-500 text-black mt-4 px-6 py-2 rounded"
                    onClick={() => setIsPerformanceDataModalOpen(true)}
                    data-testid="button-show-performance-data"
                  >
                    Show Data
                  </Button>
                </div>
              </div>

              {/* Team Performance Table */}
              <Card className="bg-gray-50 dark:bg-gray-800 mt-6">
                <CardHeader className="pb-2 pt-3 flex flex-row flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Team Performance</CardTitle>
                  <Button
                    className="bg-cyan-400 hover:bg-cyan-500 text-black px-6 py-2 rounded"
                    onClick={() => setIsTeamPerformanceTableModalOpen(true)}
                    data-testid="button-view-team-performance-table"
                  >
                    View List
                  </Button>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="overflow-x-auto admin-scrollbar">
                    <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded">
                      <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Talent Advisor</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Joining Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Tenure</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Closures</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Last Closure</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Qtrs Achieved</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingTeamPerformance ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                              Loading team performance data...
                            </td>
                          </tr>
                        ) : teamPerformanceData.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                              No team performance data available
                            </td>
                          </tr>
                        ) : (
                          teamPerformanceData.slice(0, 4).map((member, index) => (
                            <tr key={member.id || index} className="border-b border-gray-100 dark:border-gray-700">
                              <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{member.talentAdvisor}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{member.joiningDate}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{member.tenure}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{member.closures}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{member.lastClosure}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{member.qtrsAchieved}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Data Table */}
              <Card className="bg-gray-50 dark:bg-gray-800 mt-6">
                <CardHeader className="pb-2 pt-3 flex flex-row flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Revenue Data</CardTitle>
                  <Button
                    className="bg-cyan-400 hover:bg-cyan-500 text-black px-6 py-2 rounded"
                    onClick={() => {
                      setEditingRevenueMapping(null);
                      setIsRevenueMappingModalOpen(true);
                    }}
                    data-testid="button-add-revenue-mapping"
                  >
                    + Add Revenue
                  </Button>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="overflow-x-auto admin-scrollbar">
                    {isLoadingRevenue ? (
                      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                        Loading revenue data...
                      </div>
                    ) : revenueMappings.length === 0 ? (
                      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                        No revenue data available
                      </div>
                    ) : (
                      <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded">
                        <thead>
                          <tr className="bg-gray-200 dark:bg-gray-700">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Talent Advisor</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Team Lead</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Position</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Client</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Quarter</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Year</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Revenue</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentRevenueMappings.map((mapping: any) => {
                            const payment = formatRevenuePaymentStatus(mapping);
                            return (
                            <tr key={mapping.id} className="border-b border-gray-100 dark:border-gray-700" data-testid={`row-revenue-${mapping.id}`}>
                              <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{mapping.talentAdvisorName || 'N/A'}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{mapping.teamLeadName || 'N/A'}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{mapping.position || 'N/A'}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{mapping.clientName || 'N/A'}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{mapping.quarter || 'N/A'}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{mapping.year || 'N/A'}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                {mapping.revenue ? `₹${Number(mapping.revenue).toLocaleString('en-IN')}` : 'N/A'}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 text-xs rounded ${payment.isReceived
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                  : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                  }`}>
                                  {payment.label}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => e.stopPropagation()}
                                      data-testid={`button-actions-revenue-${mapping.id}`}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingRevenueMapping(mapping);
                                        setIsRevenueMappingModalOpen(true);
                                      }}
                                      className="cursor-pointer"
                                      data-testid={`button-edit-revenue-${mapping.id}`}
                                    >
                                      <EditIcon className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteRevenueMapping(mapping.id, `${mapping.talentAdvisorName || 'N/A'} - ${mapping.position || 'N/A'}`);
                                      }}
                                      className="cursor-pointer text-red-600 focus:text-red-600"
                                      data-testid={`button-delete-revenue-${mapping.id}`}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </CardContent>
              </Card>

              {renderIncentiveDataSection()}
            </div>

            {/* Right Sidebar - Quarterly/Yearly Metrics */}
            <div className="w-64 bg-gray-100 dark:bg-gray-800 p-4 flex flex-col space-y-3 overflow-y-auto">
              {/* Quarterly/Yearly Selector */}
              <div>
                <Select value={dashboardPerformancePeriod} onValueChange={setDashboardPerformancePeriod}>
                  <SelectTrigger className="w-full bg-teal-400 text-black font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Current Quarter Section */}
              <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-4 rounded-md">
                <div className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">CURRENT</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">QUARTER</div>
                <div className="text-right text-2xl font-bold mt-2" data-testid="text-current-quarter">{performanceMetrics.currentQuarter}</div>
              </div>

              {/* Minimum Target */}
              <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-4 rounded-md">
                <div className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">MINIMUM</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">TARGET</div>
                <div className="text-right text-2xl font-bold mt-2" data-testid="text-minimum-target">{performanceMetrics.minimumTarget.toLocaleString('en-IN')}</div>
              </div>

              {/* Target Achieved */}
              <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-4 rounded-md">
                <div className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">TARGET</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">ACHIEVED</div>
                <div className="text-right text-2xl font-bold mt-2" data-testid="text-target-achieved">{performanceMetrics.targetAchieved.toLocaleString('en-IN')}</div>
              </div>

              {/* Closures Made */}
              <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-4 rounded-md">
                <div className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">CLOSURES</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">MADE</div>
                <div className="text-right text-3xl font-bold mt-2" data-testid="text-closures-count">{performanceMetrics.closuresCount}</div>
              </div>

              {/* Incentives Made */}
              <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-4 rounded-md">
                <div className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">INCENTIVES</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">MADE</div>
                <div className="text-right text-2xl font-bold mt-2" data-testid="text-incentives-earned">{performanceMetrics.incentiveEarned.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        );
      default:
        return renderTeamSection();
    }
  };

  // User Management Content Function
  const renderUserManagementContent = () => {
    const formatLastLogin = (lastLoginAt: string | null | undefined) => {
      if (!lastLoginAt) return 'N/A';
      try {
        const date = new Date(lastLoginAt);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return 'N/A';
      }
    };

    const getRoleDisplayName = (role: string) => formatEmployeeStatusLabel(role);

    return (
      <div className="flex h-full overflow-hidden">
        {/* Main Content Area - Scrollable */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="px-6 py-6 space-y-6 overflow-y-auto admin-scrollbar" style={{ height: 'calc(100vh - 4rem)' }}>
            {/* User Management Header - Add User Button at top left */}
            <div className="flex items-center justify-between mb-6">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-10 text-sm whitespace-nowrap"
                data-testid="button-add-user"
                onClick={() => setIsAddUserModalOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>

              {/* Search Bar */}
              <div className="w-full max-w-md relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search user..."
                  value={userManagementSearch}
                  onChange={(e) => setUserManagementSearch(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setUserManagementTab('all')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${userManagementTab === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setUserManagementTab('clients')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${userManagementTab === 'clients'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
              >
                Clients
              </button>
              <button
                onClick={() => setUserManagementTab('team_leaders')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${userManagementTab === 'team_leaders'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
              >
                Team Leaders
              </button>
              <button
                onClick={() => setUserManagementTab('talent_advisors')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${userManagementTab === 'talent_advisors'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
              >
                Talent Advisors
              </button>
            </div>

            {/* User Management Table */}
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto admin-scrollbar">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">ID</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Name</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Email</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Role</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Status</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Last Login</th>
                        <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingEmployees ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">Loading...</td>
                        </tr>
                      ) : userManagementEmployees.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">No users found.</td>
                        </tr>
                      ) : (
                        userManagementEmployees.map((emp: any) => {
                          const isOnHold = (emp.accountStatus || 'active') === 'hold';
                          const row = (
                          <tr
                            className={`border-b border-gray-100 dark:border-gray-800 ${
                              isOnHold ? 'cursor-help bg-amber-50/40 hover:bg-amber-50/70 dark:bg-amber-950/20 dark:hover:bg-amber-950/30' : ''
                            }`}
                          >
                            <td className="py-3 px-3 text-gray-900 dark:text-white">{emp.employeeId || 'N/A'}</td>
                            <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{emp.name || 'N/A'}</td>
                            <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{emp.email || 'N/A'}</td>
                            <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{getRoleDisplayName(emp.role || 'N/A')}</td>
                            <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                              {(() => {
                                const isOnline = activeEmployeeIds.has(emp.id);
                                if (isOnHold) {
                                  return (
                                    <span className="px-2 py-1 rounded text-xs bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                                      On-Hold
                                    </span>
                                  );
                                }
                                if (isOnline) {
                                  return (
                                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                      Active
                                    </span>
                                  );
                                }
                                return (
                                  <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                    Offline
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{formatLastLogin(emp.lastLoginAt)}</td>
                            <td className="py-3 px-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    handleEditUser(emp);
                                  }}>
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  {(emp.accountStatus || 'active') === 'hold' ? (
                                    <DropdownMenuItem
                                      onClick={() => resumeEmployeeMutation.mutate(emp.id)}
                                      disabled={resumeEmployeeMutation.isPending || emp.role === 'admin'}
                                    >
                                      <RotateCcw className="mr-2 h-4 w-4" />
                                      Resume User
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setUserToHold({
                                          id: emp.id,
                                          name: emp.name,
                                          email: emp.email,
                                        });
                                        setIsHoldUserModalOpen(true);
                                      }}
                                      disabled={emp.role === 'admin'}
                                      className="text-amber-700 dark:text-amber-400"
                                    >
                                      <PauseCircle className="mr-2 h-4 w-4" />
                                      Hold User
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setUserToDelete({ id: emp.id, name: emp.name });
                                      setIsPasswordDialogOpen(true);
                                    }}
                                    className="text-red-600 dark:text-red-400"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                          );

                          return (
                            <UserHoldRowTooltip key={emp.id} employee={emp}>
                              {row}
                            </UserHoldRowTooltip>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Side - Online Activities (Fixed Width, Non-scrollable) */}
        <div className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 px-4 py-6 flex flex-col space-y-3 flex-shrink-0 overflow-hidden">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Online Activities</h3>

          {/* Online Card */}
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4 text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Online</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{onlineCount}</div>
            </CardContent>
          </Card>

          {/* Offline Card */}
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-4 text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Offline</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{userManagementEmployees.length - onlineCount}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Reset activeTab when switching between sidebar tabs
  useEffect(() => {
    // When switching to dashboard, ensure activeTab is reset to 'team' (default dashboard tab)
    if (sidebarTab === 'dashboard') {
      if (activeTab === 'user-management') {
        setActiveTab('team');
      }
    }
    if (sidebarTab === 'nudges') {
      markAdminNudgesAsSeen();
      setNudgeSeenVersion((v) => v + 1);
    }
  }, [sidebarTab]);

  useEffect(() => {
    if (
      pipelineView === "candidate-session" &&
      !(sidebarTab === "pipeline" || (sidebarTab === "dashboard" && activeTab === "pipeline"))
    ) {
      handleCloseCandidateSession();
    }
  }, [sidebarTab, activeTab, pipelineView]);

  const renderSidebarContent = () => {
    switch (sidebarTab) {
      case 'dashboard':
        // Dashboard shows the Team section with tabs (team, requirements, pipeline, etc.)
        return (
          <div className="flex h-full min-h-0 flex-col">
            <div
              className={
                activeTab === 'pipeline'
                  ? 'min-h-0 flex-1 overflow-hidden'
                  : 'flex-1 overflow-y-auto admin-scrollbar'
              }
            >
              {renderTabContent()}
            </div>
          </div>
        );
      case 'nudges':
        return (
          <div className="px-6 py-6 h-full overflow-y-auto admin-scrollbar space-y-6">
            <ActiveNudgesTable />
            <NudgeLogsTab key="admin-nudge-logs" />
          </div>
        );
      case 'user-management':
        // User Management is a separate section - render it directly
        return renderUserManagementContent();
      case 'requirements':
        return (
          <div className="h-full flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
            <div className="flex gap-6 flex-1 overflow-hidden px-6 py-6">
              {/* Main Section - Roles to Assign and Requirements Tables */}
              <div className="flex-1 flex flex-col gap-6 overflow-y-auto admin-scrollbar">

                {/* Roles to Assign Table - Image 2 Design */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white whitespace-nowrap">Roles to Assign</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <SearchBar
                        value={rolesToAssignSearch}
                        onChange={setRolesToAssignSearch}
                        placeholder="Search here"
                        testId="input-search-roles"
                        className=""
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          setIsRefreshingRoles(true);
                          try {
                            await refetchClientJDs();
                            // Add a small delay to show the animation
                            setTimeout(() => {
                              setIsRefreshingRoles(false);
                            }, 500);
                          } catch (error) {
                            setIsRefreshingRoles(false);
                          }
                        }}
                        className="text-xs p-2 flex-shrink-0"
                        disabled={isLoadingClientJDs || isRefreshingRoles}
                        title="Refresh"
                      >
                        {(isLoadingClientJDs || isRefreshingRoles) ? (
                          <RotateCcw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className={`overflow-x-auto transition-opacity duration-300 ${isRefreshingRoles ? 'opacity-50' : 'opacity-100'}`}>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">Client ID</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">Client</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">SPOC Name</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">Role</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">Shared Date</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">JD</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingClientJDs ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">Loading JDs...</td>
                          </tr>
                        ) : !clientJDs || clientJDs.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">No client-submitted JDs found.</td>
                          </tr>
                        ) : (
                          (clientJDs as any[])
                            .filter((jd: any) => {
                              if (!rolesToAssignSearch.trim()) return true;
                              const search = rolesToAssignSearch.toLowerCase();
                              return (
                                (jd.clientId || '').toLowerCase().includes(search) ||
                                (jd.company || '').toLowerCase().includes(search) ||
                                (jd.spocName || '').toLowerCase().includes(search) ||
                                (jd.role || '').toLowerCase().includes(search) ||
                                (jd.sharedDate || '').toLowerCase().includes(search)
                              );
                            })
                            .slice(0, 5)
                            .map((jd: any) => (
                              <tr key={jd.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="py-3 px-3 text-gray-900 dark:text-white text-sm whitespace-nowrap">{jd.clientId || 'N/A'}</td>
                                <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap">{jd.company || 'N/A'}</td>
                                <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap">{jd.spocName || 'N/A'}</td>
                                <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">
                                  <div className="whitespace-nowrap">{jd.role || 'N/A'}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-500">
                                    {(jd.requirement?.noOfPositions ?? jd.noOfPositions ?? 1)} position{(jd.requirement?.noOfPositions ?? jd.noOfPositions ?? 1) > 1 ? 's' : ''}
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap">{jd.sharedDate || 'N/A'}</td>
                                <td className="py-3 px-3 whitespace-nowrap">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedJD({
                                        ...jd.requirement,
                                        clientId: jd.clientId,
                                        spocName: jd.spocName,
                                        companyLogo: jd.companyLogo ?? null,
                                      });
                                      setIsJDPreviewModalOpen(true);
                                    }}
                                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
                                  >
                                    Review JD
                                  </Button>
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setJdToAdd(jd);
                                      setIsAddToRequirementAlertOpen(true);
                                    }}
                                    className="text-xs p-2"
                                    title="Add to Requirement"
                                  >
                                    <FilePlus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                  </Button>
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Requirements Table - Image 3 Design */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white whitespace-nowrap">Requirements</h3>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <SearchBar
                        value={requirementsSearch}
                        onChange={setRequirementsSearch}
                        placeholder="Search here"
                        testId="input-search-requirements"
                        className=""
                      />
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded text-sm"
                        onClick={() => {
                          setEditingRequirement(null);
                          setInitialRequirementData(null);
                          setIsAddRequirementModalOpen(true);
                        }}
                        data-testid="button-add-requirement-header"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Requirement
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleArchivesClick}
                        disabled={isLoadingArchivedRequirements || archivedRequirements.length === 0}
                        data-testid="button-archives"
                      >
                        <Folder className="h-4 w-4 mr-2" />
                        Archives
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm w-[88px]">Req ID</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm w-[200px] max-w-[200px]">Positions</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Company</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">SPOC</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Talent Advisor</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Team Lead</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Criticality</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Resume Count</th>
                          <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedRequirements.map((requirement: Requirement, index: number) => {
                          const criticalityColor = requirement.criticality === 'HIGH' ? 'text-red-600' : requirement.criticality === 'MEDIUM' ? 'text-blue-600' : 'text-gray-600';
                          return (
                            <tr
                              key={requirement.id}
                              title={getRequirementRowTitle(requirement)}
                              className={`border-b border-gray-100 dark:border-gray-800 ${getRequirementRowClassName(requirement, index)}`}
                            >
                              <td className="py-3 px-3 w-[88px] text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                {getRequirementDisplayId(requirement)}
                              </td>
                              <td className="py-3 px-3 w-[200px] max-w-[200px] text-gray-900 dark:text-white font-medium text-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="truncate" title={requirement.position}>{requirement.position}</span>
                                  {getRequirementStateBadge(requirement)}
                                </div>
                                <div className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                  {(() => {
                                    const splitMeta = getRequirementSplitMeta(requirement);
                                    const taSplitMeta = getRequirementTaSplitMeta(requirement);
                                    const splitBadge = getRequirementSplitBadgeLabel(requirement);
                                    return (
                                      <>
                                        {splitMeta?.roleId ? (
                                          <span>Role ID {splitMeta.roleId} • </span>
                                        ) : null}
                                        {requirement.noOfPositions ?? 1} position{(requirement.noOfPositions ?? 1) > 1 ? 's' : ''}
                                        {splitBadge && (
                                          <span
                                            className={taSplitMeta ? " text-purple-700" : " text-indigo-700"}
                                            title={splitBadge.title}
                                          >
                                            {` • ${splitBadge.label}`}
                                            {taSplitMeta?.totalSplits
                                              ? ` (${taSplitMeta.splitIndex}/${taSplitMeta.totalSplits})`
                                              : splitMeta?.totalSplits
                                                ? ` (${splitMeta.splitIndex}/${splitMeta.totalSplits})`
                                                : ""}
                                          </span>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">{requirement.company}</td>
                              <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">{requirement.spoc}</td>
                              <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">
                                {requirement.talentAdvisor || 'Unassigned'}
                              </td>
                              <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">
                                {requirement.teamLead || 'N/A'}
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${requirement.criticality === 'HIGH' ? 'bg-red-600' : requirement.criticality === 'MEDIUM' ? 'bg-blue-600' : 'bg-gray-600'}`}></span>
                                  <span className={`text-sm font-medium ${criticalityColor} dark:text-gray-300`}>
                                    {requirement.criticality}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {(requirement as Requirement & { resumeCount?: string }).resumeCount || "00/00"}
                              </td>
                              <td className="py-3 px-3">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem onClick={() => handleEditRequirement(requirement)}>
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleManageRequirement(requirement)}>
                                      Manage
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedJD(requirement);
                                      setIsJDPreviewModalOpen(true);
                                    }}>
                                      View JD
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleReassign(requirement)}>
                                      Reassign
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          );
                        })}









                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      className="h-10 rounded-[6px] bg-cyan-400 px-7 text-sm font-medium text-slate-900 hover:bg-cyan-500 disabled:bg-cyan-200 disabled:text-slate-500"
                      onClick={handleRequirementsViewMore}
                      disabled={requirements.length <= 10}
                    >
                      View More
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Section - Priority Distribution with Tabs */}
              <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                <Tabs defaultValue="guideline" className="w-full flex flex-col h-full">
                  <div className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
                    <TabsList className="flex w-full bg-gray-100 dark:bg-gray-800 p-1 rounded-lg gap-1">
                      <TabsTrigger value="guideline" className="text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white rounded-md transition-all flex-shrink-0">Guidelines</TabsTrigger>
                      <TabsTrigger value="priority" className="text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white rounded-md transition-all flex-1">Performance Metrics</TabsTrigger>
                    </TabsList>
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style>{`
                    .overflow-y-auto::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                    {/* Guideline Tab - Image 2 Design (Static Values) */}
                    <TabsContent value="guideline" className="space-y-2 mt-4">
                      {/* HIGH Priority Group */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded">
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">HIGH</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Easy</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityDistribution.HIGH.Easy).padStart(2, '0')}</span>
                          </div>
                          <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Med</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityDistribution.HIGH.Medium).padStart(2, '0')}</span>
                          </div>
                          <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Tough</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityDistribution.HIGH.Tough).padStart(2, '0')}</span>
                          </div>
                        </div>
                      </div>

                      {/* MED Priority Group */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded">
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">MED</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Easy</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityDistribution.MEDIUM.Easy).padStart(2, '0')}</span>
                          </div>
                          <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Med</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityDistribution.MEDIUM.Medium).padStart(2, '0')}</span>
                          </div>
                          <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Tough</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityDistribution.MEDIUM.Tough).padStart(2, '0')}</span>
                          </div>
                        </div>
                      </div>

                      {/* LOW Priority Group */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded">
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">LOW</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Easy</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityDistribution.LOW.Easy).padStart(2, '0')}</span>
                          </div>
                          <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Med</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityDistribution.LOW.Medium).padStart(2, '0')}</span>
                          </div>
                          <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Tough</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityDistribution.LOW.Tough).padStart(2, '0')}</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Priority Recruitments Tab - Image 3 Design (Calculated Values) */}
                    <TabsContent value="priority" className="space-y-3 mt-4">
                      {/* High Priority Card */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <ChevronUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <span className="text-sm font-medium text-red-600 dark:text-red-400">High priority</span>
                          </div>
                          <span className="text-2xl font-bold text-red-600 dark:text-red-400">{String(priorityCounts.counts.HIGH).padStart(2, '0')}</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Easy</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityCounts.breakdowns.HIGH.Easy).padStart(2, '0')}</span>
                          </div>
                          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Medium</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityCounts.breakdowns.HIGH.Medium).padStart(2, '0')}</span>
                          </div>
                          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Tough</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityCounts.breakdowns.HIGH.Tough).padStart(2, '0')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Medium Priority Card */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <div className="flex gap-0.5">
                                <ChevronLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                            </div>
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Medium priority</span>
                          </div>
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{String(priorityCounts.counts.MEDIUM).padStart(2, '0')}</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Easy</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityCounts.breakdowns.MEDIUM.Easy).padStart(2, '0')}</span>
                          </div>
                          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Medium</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityCounts.breakdowns.MEDIUM.Medium).padStart(2, '0')}</span>
                          </div>
                          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Tough</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityCounts.breakdowns.MEDIUM.Tough).padStart(2, '0')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Low Priority Card */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Low priority</span>
                          </div>
                          <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">{String(priorityCounts.counts.LOW).padStart(2, '0')}</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Easy</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityCounts.breakdowns.LOW.Easy).padStart(2, '0')}</span>
                          </div>
                          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Medium</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityCounts.breakdowns.LOW.Medium).padStart(2, '0')}</span>
                          </div>
                          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Tough</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(priorityCounts.breakdowns.LOW.Tough).padStart(2, '0')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Total Distribution Card with Pending/Closed */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Distribution</span>
                          </div>
                          <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{String(priorityCounts.counts.TOTAL).padStart(2, '0')}</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Pending Distribution</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(distributionCounts.pending).padStart(2, '0')}</span>
                          </div>
                          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Closed Distribution</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(distributionCounts.closed).padStart(2, '0')}</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          </div>
        );
      case 'pipeline':
        return (
          <div className="flex h-full min-h-0 overflow-hidden">
            {renderAdminPipelineView()}
          </div>
        );
      case 'master-data':
        return (
          <div className="flex h-full">
            {/* Main Content */}
            <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto admin-scrollbar">
              {/* Resume Database */}
              <Card>
                <CardHeader className="flex flex-col items-start gap-4">
                  {/* Top buttons row */}
                  <div className="flex gap-2 w-full">
                    <Button
                      className="btn-rounded bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded"
                      onClick={() => {
                        setMasterDbConfirmationTab('resume');
                        setMasterDbConfirmationOpen(true);
                      }}
                    >
                      View Full Database
                    </Button>
                    <Button
                      className="btn-rounded bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
                      onClick={() => setIsClientModalOpen(true)}
                      data-testid="button-add-new-client"
                    >
                      + Add New Client
                    </Button>
                    <Button
                      className="btn-rounded bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded"
                      onClick={() => setIsEmployeeModalOpen(true)}
                      data-testid="button-add-employee"
                    >
                      + Add Employee
                    </Button>
                  </div>
                  {/* Title and View More row */}
                  <div className="flex flex-row items-center justify-between w-full">
                    <CardTitle className="text-lg text-gray-900 dark:text-white">Resume Database</CardTitle>
                    <Button
                      className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-6 py-2 rounded text-sm"
                      onClick={() => {
                        setMasterDbConfirmationTab('resume');
                        setMasterDbConfirmationOpen(true);
                      }}
                      data-testid="button-view-more-resume-database"
                    >
                      View More
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto admin-scrollbar">
                    <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Candidate ID</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Role</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Email</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingCandidates ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">Loading candidates...</td>
                          </tr>
                        ) : (candidates as any[]).length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">No candidates found. Click "+ Add Employee" to add one.</td>
                          </tr>
                        ) : (
                          (candidates as any[]).slice(0, 5).map((row: any, index: number) => (
                            <tr key={row.id || index} className={`border-b border-gray-100 dark:border-gray-800 ${index % 2 === 0 ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                              <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{row.candidateId || '-'}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{row.fullName || '-'}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{row.currentRole || row.position || '-'}</td>
                              <td className="py-3 px-4 text-blue-600 dark:text-blue-400">{row.email || '-'}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{row.location || '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Employees Master */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Employees Master</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="rounded-[4px] border-blue-300 text-blue-700 hover:bg-blue-50 text-sm px-4"
                      onClick={() => setIsIncrementModalOpen(true)}
                      data-testid="button-open-increment-modal-master-data"
                    >
                      Increment
                    </Button>
                    <Button
                      className="btn-rounded bg-cyan-400 hover:bg-cyan-500 text-slate-900 text-sm px-4"
                      onClick={() => {
                        setMasterDbConfirmationTab('employee');
                        setMasterDbConfirmationOpen(true);
                      }}
                    >
                      View More
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto admin-scrollbar">
                    <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Employee ID</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Father's Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Employee Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Date of Joining</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Current CTC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingEmployees ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">Loading employees...</td>
                          </tr>
                        ) : hrEmployees.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">No employees found. Click "+ Add Employee" to add one.</td>
                          </tr>
                        ) : (
                          hrEmployees.slice(0, 5).map((row: any, index: number) => (
                            <tr key={row.id || index} className={`border-b border-gray-100 dark:border-gray-800 ${index % 2 === 0 ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                              <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{row.employeeId}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{row.name}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">-</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{row.role || 'N/A'}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{row.joiningDate || 'N/A'}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">-</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Client Master */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Client Master</CardTitle>
                  <Button
                    className="btn-rounded bg-cyan-400 hover:bg-cyan-500 text-slate-900 text-sm px-4"
                    onClick={() => {
                      setMasterDbConfirmationTab('client');
                      setMasterDbConfirmationOpen(true);
                    }}
                  >
                    View More
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto admin-scrollbar">
                    <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Client Code</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Brand Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Location</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">SPOC</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Website</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Current Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingClients ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">Loading clients...</td>
                          </tr>
                        ) : masterDataClients.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">No clients found. Click "+ Add Client" to add one.</td>
                          </tr>
                        ) : (
                          masterDataClients.slice(0, 5).map((row: any, index: number) => {
                            const statusClass = row.currentStatus === 'active' ? 'bg-green-100 text-green-800' :
                              row.currentStatus === 'frozen' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800';
                            return (
                              <tr key={row.id || index} className={`border-b border-gray-100 dark:border-gray-800 ${index % 2 === 0 ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{row.clientCode}</td>
                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{row.brandName}</td>
                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{row.location || 'N/A'}</td>
                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{row.spoc || 'N/A'}</td>
                                <td className="py-3 px-4 text-blue-600 dark:text-blue-400">{row.website || 'N/A'}</td>
                                <td className="py-3 px-4">
                                  <span className={`${statusClass} text-sm font-semibold px-3 py-1 rounded-full`}>• {(row.currentStatus || 'active').toUpperCase()}</span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics Panel */}
            <div className="w-80 bg-blue-50 dark:bg-blue-900/20 border-l border-gray-200 dark:border-gray-700 px-6 pb-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Totals</h3>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">DIRECT UPLOADS</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-direct-uploads">{masterTotals.directUploads.toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">RECRUITER UPLOADS</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-recruiter-uploads">{masterTotals.recruiterUploads.toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">RESUMES</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-resumes">{masterTotals.resumes.toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">HEAD COUNT</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-head-count">{masterTotals.headCount.toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">SALARY PAID</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-salary-paid">{masterTotals.salaryPaid.toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">OTHER EXPENSES</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-other-expenses">{masterTotals.otherExpenses.toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">TOOLS & DATABASES</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-tools-databases">{masterTotals.toolsAndDatabases.toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">RENT PAID</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-rent-paid">{masterTotals.rentPaid.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'performance':
        return (
          <div className="flex h-full">
            {/* Middle Column - Scrollable Content */}
            <div className="flex-1 px-6 py-6 overflow-y-auto admin-scrollbar space-y-6">
              {/* Performance Header with Tabs */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Performance</h2>
                <div className="flex gap-2">
                  <Button
                    className="bg-purple-800 hover:bg-purple-900 text-white px-4 py-2 rounded text-sm"
                    onClick={() => setIsTargetMappingModalOpen(true)}
                  >
                    Target Mapping
                  </Button>
                  <Button
                    className="bg-purple-800 hover:bg-purple-900 text-white px-4 py-2 rounded text-sm"
                    onClick={() => setIsRevenueMappingModalOpen(true)}
                  >
                    Revenue Mapping
                  </Button>
                  <Button
                    className="bg-purple-800 hover:bg-purple-900 text-white px-4 py-2 rounded text-sm"
                    onClick={() => {
                      setEditingIncentiveMapping(null);
                      setIsIncentiveMappingModalOpen(true);
                    }}
                    data-testid="button-incentive-mapping-alt"
                  >
                    Incentive Mapping
                  </Button>
                </div>
              </div>

              {/* Filters and Main Content */}
              <div className="flex gap-6">
                {/* Left Section with Chart */}
                <div className="flex-1">
                  {/* Filter Dropdowns */}
                  <div className="flex gap-4 mb-4">
                    <Select value={selectedPerformanceTeam} onValueChange={setSelectedPerformanceTeam} data-testid="select-performance-team">
                      <SelectTrigger className="w-48 bg-cyan-400 text-black">
                        <SelectValue placeholder="All Teams" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Teams</SelectItem>
                        {performanceTeamLeaders.map((leader) => (
                          <SelectItem key={leader.id} value={leader.id}>
                            {leader.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedPerformancePeriod} onValueChange={setSelectedPerformancePeriod}>
                      <SelectTrigger className="w-32 bg-cyan-400 text-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Chart Area - Grid Layout */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 bg-white dark:bg-gray-900 px-6 pb-6">
                    {/* Performance Chart */}
                    <div className="xl:col-span-5">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-300">Performance</h3>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => setIsPerformanceChartModalOpen(true)}
                          data-testid="button-expand-performance-chart-alt"
                        >
                          <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap justify-start gap-x-3 gap-y-1 mb-2">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Delivered</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Required</span>
                        </div>
                      </div>
                      <div className="h-[260px]">
                        <PerformanceTrendChart
                          data={outerPerformanceChartData}
                          height="100%"
                          chartId="performance-tab-alt"
                        />
                      </div>
                    </div>

                    {/* Revenue Analysis Chart */}
                    <div className="xl:col-span-4">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-300">Revenue Analysis</h3>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => setIsRevenueGraphModalOpen(true)}
                          data-testid="button-expand-revenue-graph"
                        >
                          <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </Button>
                      </div>
                      <div className="flex justify-start space-x-4 mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Team Revenue</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-0.5 bg-green-500"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Avg (₹{(revenueBenchmark / 1000).toFixed(0)}K)
                          </span>
                        </div>
                      </div>
                      <div className="h-[200px]">
                        <RevenueChart
                          data={revenueData}
                          height="100%"
                          benchmarkValue={revenueBenchmark}
                        />
                      </div>
                    </div>

                    {/* Performance Gauge */}
                    <div className="xl:col-span-3 flex flex-col items-center justify-center">
                      <div className="w-full max-w-sm mx-auto">
                        <PerformanceGauge value={performancePageMetrics.performancePercentage} />
                      </div>

                      <Button
                        className="bg-cyan-400 hover:bg-cyan-500 text-black mt-4 px-6 py-2 rounded"
                        onClick={() => setIsPerformanceDataModalOpen(true)}
                        data-testid="button-show-performance-data"
                      >
                        Show Data
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Performance Table */}
              <Card className="bg-gray-50 dark:bg-gray-800 mt-6">
                <CardHeader className="pb-2 pt-3 flex flex-row flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Team Performance</CardTitle>
                  <Button
                    className="bg-cyan-400 hover:bg-cyan-500 text-black px-6 py-2 rounded"
                    onClick={() => setIsTeamPerformanceTableModalOpen(true)}
                    data-testid="button-view-team-performance-table-alt"
                  >
                    View List
                  </Button>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="overflow-x-auto admin-scrollbar">
                    <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded">
                      <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Talent Advisor</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Joining Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Tenure</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Closures</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Last Closure</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Qtrs Achieved</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamPerformanceData.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                              No team performance data available
                            </td>
                          </tr>
                        ) : (
                          teamPerformanceData.slice(0, 4).map((member, index) => (
                            <tr key={member.id || index} className="border-b border-gray-100 dark:border-gray-700">
                              <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{member.talentAdvisor}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{member.joiningDate}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{member.tenure}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{member.closures}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{member.lastClosure}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{member.qtrsAchieved}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Data Table */}
              <Card className="bg-gray-50 dark:bg-gray-800 mt-6">
                <CardHeader className="pb-2 pt-3 flex flex-row flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Revenue Data</CardTitle>
                  <Button
                    className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-6 py-2 rounded font-medium text-sm"
                    onClick={() => setIsClosureModalOpen(true)}
                    data-testid="button-view-more-revenue"
                  >
                    View More
                  </Button>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="overflow-x-auto admin-scrollbar">
                    {isLoadingRevenue ? (
                      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                        Loading revenue data...
                      </div>
                    ) : revenueMappings.length === 0 ? (
                      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                        No revenue data available
                      </div>
                    ) : (
                      <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded">
                        <thead>
                          <tr className="bg-gray-200 dark:bg-gray-700">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Talent Advisor</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Team Lead</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Position</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Client</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Quarter</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Year</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Revenue</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentRevenueMappings.map((mapping: any) => {
                            const payment = formatRevenuePaymentStatus(mapping);
                            return (
                            <tr key={mapping.id} className="border-b border-gray-100 dark:border-gray-700" data-testid={`row-revenue-2-${mapping.id}`}>
                              <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{mapping.talentAdvisorName || 'N/A'}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{mapping.teamLeadName || 'N/A'}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{mapping.position || 'N/A'}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{mapping.clientName || 'N/A'}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{mapping.quarter || 'N/A'}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{mapping.year || 'N/A'}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                {mapping.revenue ? `₹${Number(mapping.revenue).toLocaleString('en-IN')}` : 'N/A'}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 text-xs rounded ${payment.isReceived
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                  : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                  }`}>
                                  {payment.label}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => e.stopPropagation()}
                                      data-testid={`button-actions-revenue-2-${mapping.id}`}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingRevenueMapping(mapping);
                                        setIsRevenueMappingModalOpen(true);
                                      }}
                                      className="cursor-pointer"
                                      data-testid={`button-edit-revenue-2-${mapping.id}`}
                                    >
                                      <EditIcon className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteRevenueMapping(mapping.id, `${mapping.talentAdvisorName || 'N/A'} - ${mapping.position || 'N/A'}`);
                                      }}
                                      className="cursor-pointer text-red-600 focus:text-red-600"
                                      data-testid={`button-delete-revenue-2-${mapping.id}`}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </CardContent>
              </Card>

              {renderIncentiveDataSection()}
            </div>

            {/* Right Sidebar - Quarterly/Yearly Metrics */}
            <div className="w-64 bg-gray-100 dark:bg-gray-800 p-4 flex flex-col space-y-3 overflow-y-auto">
              {/* Separate Summary Selector */}
              <div className="space-y-3">
                <Select value={performanceSummaryScope} onValueChange={(value: 'overall' | 'quarterly' | 'yearly') => setPerformanceSummaryScope(value)}>
                  <SelectTrigger className="w-full bg-teal-400 text-black font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overall">Overall</SelectItem>
                    <SelectItem value="quarterly">Quarter</SelectItem>
                    <SelectItem value="yearly">Year</SelectItem>
                  </SelectContent>
                </Select>

                {performanceSummaryScope === 'quarterly' && (
                  <>
                    <Select value={performanceSummaryQuarter} onValueChange={setPerformanceSummaryQuarter}>
                      <SelectTrigger className="w-full bg-white text-slate-900 font-medium dark:bg-gray-700 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Q1">Q1</SelectItem>
                        <SelectItem value="Q2">Q2</SelectItem>
                        <SelectItem value="Q3">Q3</SelectItem>
                        <SelectItem value="Q4">Q4</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={performanceSummaryYear} onValueChange={setPerformanceSummaryYear}>
                      <SelectTrigger className="w-full bg-white text-slate-900 font-medium dark:bg-gray-700 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {performanceSummaryYearOptions.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}

                {performanceSummaryScope === 'yearly' && (
                  <Select value={performanceSummaryYear} onValueChange={setPerformanceSummaryYear}>
                    <SelectTrigger className="w-full bg-white text-slate-900 font-medium dark:bg-gray-700 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {performanceSummaryYearOptions.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Summary Label */}
              <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-4 rounded-md">
                <div className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">CURRENT</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">SUMMARY</div>
                <div className="text-right text-2xl font-bold mt-2" data-testid="text-current-quarter">{performancePageMetrics.currentQuarter}</div>
              </div>

              {/* Minimum Target */}
              <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-4 rounded-md">
                <div className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">MINIMUM</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">TARGET</div>
                <div className="text-right text-2xl font-bold mt-2" data-testid="text-minimum-target">{performancePageMetrics.minimumTarget.toLocaleString('en-IN')}</div>
              </div>

              {/* Target Achieved */}
              <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-4 rounded-md">
                <div className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">TARGET</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">ACHIEVED</div>
                <div className="text-right text-2xl font-bold mt-2" data-testid="text-target-achieved">{performancePageMetrics.targetAchieved.toLocaleString('en-IN')}</div>
              </div>

              {/* Closures Made */}
              <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-4 rounded-md">
                <div className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">CLOSURES</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">MADE</div>
                <div className="text-right text-3xl font-bold mt-2" data-testid="text-closures-count">{performancePageMetrics.closuresCount}</div>
              </div>

              {/* Incentives Made */}
              <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-4 rounded-md">
                <div className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">INCENTIVES</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">MADE</div>
                <div className="text-right text-2xl font-bold mt-2" data-testid="text-incentives-earned">{performancePageMetrics.incentiveEarned.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        );
      case 'report':
        return (
          <div className="admin-reports-page px-6 py-6 h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reports & Analytics</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Generate and download comprehensive reports for teams, requirements, and general data</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
              {/* Teams Section */}
              <Card className="flex flex-col min-h-0 shadow-md border-2 border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-4 flex-shrink-0 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Teams Reports
                  </CardTitle>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Generate team performance and metrics reports</p>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto admin-scrollbar space-y-4 p-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Report Type</label>
                    <Select value={teamsReportType} onValueChange={setTeamsReportType}>
                      <SelectTrigger className="w-full h-10 text-sm border-gray-300 dark:border-gray-600 cursor-pointer" data-testid="select-teams-report-type">
                        <SelectValue placeholder="Select Report Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="target-incentives">Target & Incentives</SelectItem>
                        <SelectItem value="productive-metrics">Productive Metrics</SelectItem>
                        <SelectItem value="cash-outflows">Cash Outflows</SelectItem>
                        <SelectItem value="key-aspects">Key Aspects</SelectItem>
                        <SelectItem value="resume-database">Resume Database</SelectItem>
                        <SelectItem value="key-totals">Key Totals</SelectItem>
                        <SelectItem value="list-of-users">List of Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Period</label>
                    <Select value={teamsPeriod} onValueChange={setTeamsPeriod}>
                      <SelectTrigger className="w-full h-10 text-sm border-gray-300 dark:border-gray-600 cursor-pointer" data-testid="select-teams-period">
                        <SelectValue placeholder="Select Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="custom">Custom Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {teamsPeriod === 'monthly' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Month</label>
                        <Select value={teamsReportMonth} onValueChange={setTeamsReportMonth}>
                          <SelectTrigger className="w-full h-10 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {REPORT_MONTHS.map((m) => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Year</label>
                        <Select value={teamsReportYear} onValueChange={setTeamsReportYear}>
                          <SelectTrigger className="w-full h-10 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((y) => (
                              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  {teamsPeriod === 'quarterly' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quarter</label>
                        <Select value={teamsReportQuarter} onValueChange={setTeamsReportQuarter}>
                          <SelectTrigger className="w-full h-10 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {REPORT_QUARTERS.map((q) => (
                              <SelectItem key={q} value={q}>{q}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Year</label>
                        <Select value={teamsReportYear} onValueChange={setTeamsReportYear}>
                          <SelectTrigger className="w-full h-10 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((y) => (
                              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  {teamsPeriod === 'weekly' && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Week starting</label>
                      <StandardDatePicker
                        value={teamsWeekStart}
                        onChange={setTeamsWeekStart}
                        placeholder="Select week start date"
                        className="w-full h-10"
                      />
                    </div>
                  )}
                  {teamsPeriod === 'yearly' && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Year</label>
                      <Select value={teamsReportYear} onValueChange={setTeamsReportYear}>
                        <SelectTrigger className="w-full h-10 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((y) => (
                            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {teamsPeriod === 'custom' && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date</label>
                      <StandardDatePicker
                        value={teamsCustomDate}
                        onChange={setTeamsCustomDate}
                        placeholder="Select date"
                        className="w-full h-10"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">File Format</label>
                    <Select value={teamsFileFormat} onValueChange={setTeamsFileFormat}>
                      <SelectTrigger className="w-full h-10 text-sm border-gray-300 dark:border-gray-600 cursor-pointer" data-testid="select-teams-file-format">
                        <SelectValue placeholder="File Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full h-11 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                      onClick={() => handleDownloadClick('teams')}
                      data-testid="button-download-teams"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Reports Section */}
              <Card className="flex flex-col min-h-0 shadow-md border-2 border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-4 flex-shrink-0 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    Custom Reports
                  </CardTitle>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Select and configure specific report types</p>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto admin-scrollbar space-y-4 p-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Period</label>
                    <Select value={reportsPeriod} onValueChange={setReportsPeriod}>
                      <SelectTrigger className="w-full h-10 text-sm" data-testid="select-reports-period">
                        <SelectValue placeholder="Select Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="custom">Custom Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {reportsPeriod === 'monthly' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Month</label>
                        <Select value={reportsReportMonth} onValueChange={setReportsReportMonth}>
                          <SelectTrigger className="w-full h-10 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {REPORT_MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Year</label>
                        <Select value={reportsReportYear} onValueChange={setReportsReportYear}>
                          <SelectTrigger className="w-full h-10 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((y) => (
                              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  {reportsPeriod === 'quarterly' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quarter</label>
                        <Select value={reportsReportQuarter} onValueChange={setReportsReportQuarter}>
                          <SelectTrigger className="w-full h-10 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {REPORT_QUARTERS.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Year</label>
                        <Select value={reportsReportYear} onValueChange={setReportsReportYear}>
                          <SelectTrigger className="w-full h-10 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((y) => (
                              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  {reportsPeriod === 'weekly' && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Week starting</label>
                      <StandardDatePicker
                        value={reportsWeekStart}
                        onChange={setReportsWeekStart}
                        placeholder="Select week start date"
                        className="w-full h-10"
                      />
                    </div>
                  )}
                  {reportsPeriod === 'yearly' && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Year</label>
                      <Select value={reportsReportYear} onValueChange={setReportsReportYear}>
                        <SelectTrigger className="w-full h-10 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((y) => (
                            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {reportsPeriod === 'custom' && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date</label>
                      <StandardDatePicker
                        value={reportsCustomDate}
                        onChange={setReportsCustomDate}
                        placeholder="Select date"
                        className="w-full h-10"
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-3">Select Reports</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" data-testid="checkbox-requirements">
                        <Checkbox
                          checked={reportsCheckboxes.requirements}
                          onCheckedChange={() => toggleReportCheckbox('requirements')}
                        />
                        <span className={`text-sm font-medium ${reportsCheckboxes.requirements ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          Requirements
                        </span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" data-testid="checkbox-pipeline">
                        <Checkbox
                          checked={reportsCheckboxes.pipeline}
                          onCheckedChange={() => toggleReportCheckbox('pipeline')}
                        />
                        <span className={`text-sm font-medium ${reportsCheckboxes.pipeline ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          Pipeline
                        </span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" data-testid="checkbox-closure-reports">
                        <Checkbox
                          checked={reportsCheckboxes.closureReports}
                          onCheckedChange={() => toggleReportCheckbox('closureReports')}
                        />
                        <span className={`text-sm font-medium ${reportsCheckboxes.closureReports ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          Closure
                        </span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" data-testid="checkbox-team-performance">
                        <Checkbox
                          checked={reportsCheckboxes.teamPerformance}
                          onCheckedChange={() => toggleReportCheckbox('teamPerformance')}
                        />
                        <span className={`text-sm font-medium ${reportsCheckboxes.teamPerformance ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          Performance
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Team</label>
                    <Select value={reportsTeam} onValueChange={setReportsTeam}>
                      <SelectTrigger className="w-full h-10 text-sm border-gray-300 dark:border-gray-600 cursor-pointer" data-testid="select-reports-team">
                        <SelectValue placeholder="Team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {monthlyPerformanceData?.teams?.map((team) => (
                          <SelectItem key={team} value={team.toLowerCase()}>
                            {team}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Priority</label>
                    <Select value={reportsPriority} onValueChange={setReportsPriority}>
                      <SelectTrigger className="w-full h-10 text-sm border-gray-300 dark:border-gray-600 cursor-pointer" data-testid="select-reports-priority">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="all">All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Type</label>
                    <Select value={reportsType} onValueChange={setReportsType}>
                      <SelectTrigger className="w-full h-10 text-sm border-gray-300 dark:border-gray-600 cursor-pointer" data-testid="select-reports-type">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="opened">Opened</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                        <SelectItem value="all">All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">File Format</label>
                    <Select value={reportsFileFormat} onValueChange={setReportsFileFormat}>
                      <SelectTrigger className="w-full h-10 text-sm border-gray-300 dark:border-gray-600 cursor-pointer" data-testid="select-reports-file-format">
                        <SelectValue placeholder="File Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4">
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 text-white w-full h-11 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                      onClick={() => handleDownloadClick('reports')}
                      data-testid="button-download-reports"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* General Section */}
              <Card className="flex flex-col min-h-0 shadow-md border-2 border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-4 flex-shrink-0 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                    General Reports
                  </CardTitle>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Export employee and client master data</p>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto admin-scrollbar space-y-4 p-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Report Type</label>
                    <Select value={generalReportType} onValueChange={setGeneralReportType}>
                      <SelectTrigger className="w-full h-10 text-sm border-gray-300 dark:border-gray-600 cursor-pointer" data-testid="select-general-report-type">
                        <SelectValue placeholder="Select Report Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee-master">Employee Master</SelectItem>
                        <SelectItem value="client-master">Client Master</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">File Format</label>
                    <Select value={generalFileFormat} onValueChange={setGeneralFileFormat}>
                      <SelectTrigger className="w-full h-10 text-sm border-gray-300 dark:border-gray-600 cursor-pointer" data-testid="select-general-file-format">
                        <SelectValue placeholder="File Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4">
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white w-full h-11 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                      onClick={() => handleDownloadClick('general')}
                      data-testid="button-download-general"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'metrics':
        return (
          <div className="flex h-full gap-6 px-6 py-6">
            {/* Middle Section - Key Metrics and Cash Outflow - Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-6 admin-scrollbar pr-4">
              {/* Split Section - Key Metrics and Client Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Key Metrics Section (Half Size) */}
                <Card>
                  <CardHeader className="p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <CardTitle className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">Key Metrics</CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Select value={selectedKeyMetricsClient} onValueChange={setSelectedKeyMetricsClient}>
                          <SelectTrigger className="w-28 sm:w-32 input-styled rounded text-xs sm:text-sm" data-testid="select-key-metrics-client">
                            <SelectValue placeholder="Client" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.length === 0 ? (
                              <SelectItem value="no-clients" disabled>No Clients</SelectItem>
                            ) : (
                              <>
                                {clients.map((client: any) => (
                                  <SelectItem key={client.id} value={client.id}>
                                    {client.brandName || client.incorporatedName || 'Unknown'}
                                  </SelectItem>
                                ))}
                                <SelectItem value="all">All Clients</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>

                        <Select value={selectedKeyMetricsPeriod} onValueChange={setSelectedKeyMetricsPeriod}>
                          <SelectTrigger className="w-28 sm:w-32 input-styled rounded text-xs sm:text-sm" data-testid="select-key-metrics-period">
                            <SelectValue placeholder="Monthly" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6">
                    <div className="h-48 sm:h-64 mb-4">
                      {!keyAspectsData.chartData || keyAspectsData.chartData.length === 0 ? (
                        <div className="flex items-center justify-center w-full h-full bg-gray-50 dark:bg-gray-800 rounded-md border border-dashed border-gray-300 dark:border-gray-600">
                          <div className="text-center">
                            <p className="text-gray-600 dark:text-gray-400 text-sm">No metrics data available</p>
                            <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Data will appear once metrics are recorded</p>
                          </div>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={keyAspectsData.chartData}
                            margin={{
                              top: 5,
                              right: 15,
                              left: 10,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" style={{ fontSize: '10px' }} />
                            <YAxis style={{ fontSize: '10px' }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                            <Line type="monotone" dataKey="growthMoM" name="Growth MoM (%)" stroke="#82ca9d" strokeWidth={2} />
                            <Line type="monotone" dataKey="burnRate" name="Burn Rate (%)" stroke="#ff7c7c" strokeWidth={2} />
                            <Line type="monotone" dataKey="churnRate" name="Churn Rate (%)" stroke="#ffc658" strokeWidth={2} />
                            <Line type="monotone" dataKey="attrition" name="Attrition (%)" stroke="#8884d8" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button
                        className="bg-cyan-400 hover:bg-cyan-500 text-black px-3 sm:px-4 py-2 rounded text-xs sm:text-sm"
                        onClick={() => setIsMetricsModalOpen(true)}
                        data-testid="button-show-more-key-metrics"
                      >
                        Show More
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Client Metrics Summary Section (Half Size) */}
                <Card>
                  <CardHeader className="p-4 lg:p-6">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">Client Metrics</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsClientMetricsModalOpen(true)}
                          className="h-8 w-8"
                          data-testid="button-open-client-metrics-modal"
                        >
                          <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      {/* Speed Metrics Summary */}
                      <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">Speed Metrics</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2 border border-blue-100 dark:border-blue-800">
                            <div className="text-xs font-medium text-blue-700 dark:text-blue-400">1st Submission</div>
                            <div className="text-base sm:text-lg font-bold text-blue-900 dark:text-blue-300">{adminSpeedMetrics.timeToFirstSubmission} <span className="text-xs">days</span></div>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2 border border-blue-100 dark:border-blue-800">
                            <div className="text-xs font-medium text-blue-700 dark:text-blue-400">Time to Fill</div>
                            <div className="text-base sm:text-lg font-bold text-blue-900 dark:text-blue-300">{adminSpeedMetrics.timeToFill} <span className="text-xs">days</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Quality Metrics Summary */}
                      <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Quality Metrics</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-green-50 dark:bg-green-900/20 rounded p-2 border border-green-100 dark:border-green-800">
                            <div className="text-xs font-medium text-green-700 dark:text-green-400">Submission Rate</div>
                            <div className="text-base sm:text-lg font-bold text-green-900 dark:text-green-300">{adminQualityMetrics.submissionToShortList}<span className="text-xs">%</span></div>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 rounded p-2 border border-green-100 dark:border-green-800">
                            <div className="text-xs font-medium text-green-700 dark:text-green-400">Offer Rate</div>
                            <div className="text-base sm:text-lg font-bold text-green-900 dark:text-green-300">{adminQualityMetrics.interviewToOffer}<span className="text-xs">%</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Impact Metrics Summary */}
                      <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Impact Metrics</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-red-50 dark:bg-red-900/20 rounded p-2 border border-red-100 dark:border-red-800">
                            <div className="text-xs font-medium text-red-700 dark:text-red-400">Client NPS</div>
                            <div className="text-base sm:text-lg font-bold text-red-900 dark:text-red-300">+{adminImpactMetrics.clientNps}</div>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 rounded p-2 border border-red-100 dark:border-red-800">
                            <div className="text-xs font-medium text-red-700 dark:text-red-400">Retention Rate</div>
                            <div className="text-base sm:text-lg font-bold text-red-900 dark:text-red-300">{adminImpactMetrics.firstYearRetentionRate}<span className="text-xs">%</span></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button
                        className="bg-cyan-400 hover:bg-cyan-500 text-black px-3 sm:px-4 py-2 rounded text-xs sm:text-sm flex items-center gap-2"
                        onClick={() => {
                          setIsClientMetricsModalOpen(true);
                          setTimeout(() => window.print(), 300);
                        }}
                        data-testid="button-download-client-metrics-summary"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cash Outflow Section */}
              <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Cash Outflow</CardTitle>
                  {cashoutData.length > 5 && (
                    <Button
                      className="bg-cyan-400 hover:bg-cyan-500 text-black px-6 py-2 rounded"
                      onClick={() => setIsCashoutModalOpen(true)}
                      size="sm"
                      data-testid="button-view-more-cashout"
                    >
                      View More
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {/* Input Form */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <Select
                        value={cashoutForm.month}
                        onValueChange={(value) => setCashoutForm({ ...cashoutForm, month: value })}
                      >
                        <SelectTrigger className="input-styled rounded border-2 border-cyan-300 bg-white text-slate-900 shadow-sm data-[placeholder]:text-slate-400 focus:border-cyan-500 dark:border-cyan-600 dark:bg-gray-800 dark:text-white dark:data-[placeholder]:text-slate-400" data-testid="select-cashout-month">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="January">January</SelectItem>
                          <SelectItem value="February">February</SelectItem>
                          <SelectItem value="March">March</SelectItem>
                          <SelectItem value="April">April</SelectItem>
                          <SelectItem value="May">May</SelectItem>
                          <SelectItem value="June">June</SelectItem>
                          <SelectItem value="July">July</SelectItem>
                          <SelectItem value="August">August</SelectItem>
                          <SelectItem value="September">September</SelectItem>
                          <SelectItem value="October">October</SelectItem>
                          <SelectItem value="November">November</SelectItem>
                          <SelectItem value="December">December</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Year"
                        className="input-styled rounded border-2 border-cyan-300 bg-white placeholder:text-slate-400 focus:border-cyan-500 shadow-sm dark:border-cyan-600 dark:bg-gray-800 dark:placeholder:text-slate-400"
                        value={cashoutForm.year}
                        onChange={(e) => setCashoutForm({ ...cashoutForm, year: e.target.value })}
                        data-testid="input-cashout-year"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Number of Employees"
                        className="input-styled rounded border-2 border-cyan-300 bg-white placeholder:text-slate-400 focus:border-cyan-500 shadow-sm dark:border-cyan-600 dark:bg-gray-800 dark:placeholder:text-slate-400"
                        value={cashoutForm.employees}
                        onChange={(e) => setCashoutForm({ ...cashoutForm, employees: e.target.value })}
                        data-testid="input-cashout-employees"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <Input
                        type="number"
                        placeholder="Total Salary"
                        className="input-styled rounded border-2 border-cyan-300 bg-white placeholder:text-slate-400 focus:border-cyan-500 shadow-sm dark:border-cyan-600 dark:bg-gray-800 dark:placeholder:text-slate-400"
                        value={cashoutForm.salary}
                        onChange={(e) => setCashoutForm({ ...cashoutForm, salary: e.target.value })}
                        data-testid="input-cashout-salary"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Incentive"
                        className="input-styled rounded border-2 border-cyan-300 bg-white placeholder:text-slate-400 focus:border-cyan-500 shadow-sm dark:border-cyan-600 dark:bg-gray-800 dark:placeholder:text-slate-400"
                        value={cashoutForm.incentive}
                        onChange={(e) => setCashoutForm({ ...cashoutForm, incentive: e.target.value })}
                        data-testid="input-cashout-incentive"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Database & Tools cost"
                        className="input-styled rounded border-2 border-cyan-300 bg-white placeholder:text-slate-400 focus:border-cyan-500 shadow-sm dark:border-cyan-600 dark:bg-gray-800 dark:placeholder:text-slate-400"
                        value={cashoutForm.tools}
                        onChange={(e) => setCashoutForm({ ...cashoutForm, tools: e.target.value })}
                        data-testid="input-cashout-tools"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <Input
                        type="number"
                        placeholder="Rent"
                        className="input-styled rounded border-2 border-cyan-300 bg-white placeholder:text-slate-400 focus:border-cyan-500 shadow-sm dark:border-cyan-600 dark:bg-gray-800 dark:placeholder:text-slate-400"
                        value={cashoutForm.rent}
                        onChange={(e) => setCashoutForm({ ...cashoutForm, rent: e.target.value })}
                        data-testid="input-cashout-rent"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Other Expenses"
                        className="input-styled rounded border-2 border-cyan-300 bg-white placeholder:text-slate-400 focus:border-cyan-500 shadow-sm dark:border-cyan-600 dark:bg-gray-800 dark:placeholder:text-slate-400"
                        value={cashoutForm.others}
                        onChange={(e) => setCashoutForm({ ...cashoutForm, others: e.target.value })}
                        data-testid="input-cashout-others"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      {editingCashout && (
                        <Button
                          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => {
                            setEditingCashout(null);
                            setCashoutForm({
                              month: '',
                              year: '',
                              employees: '',
                              salary: '',
                              incentive: '',
                              tools: '',
                              rent: '',
                              others: ''
                            });
                          }}
                          data-testid="button-cancel-cashout-edit"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        className="bg-cyan-400 hover:bg-cyan-500 text-black px-4 py-2 rounded w-20 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleAddCashoutData}
                        disabled={!isCashoutFormComplete || createCashOutflowMutation.isPending || updateCashOutflowMutation.isPending}
                        data-testid="button-add-cashout"
                      >
                        {editingCashout ? "Update" : "Add"}
                      </Button>
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="overflow-x-auto admin-scrollbar">
                    <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Month</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Year</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Employees Count</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Total Salary</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Incentives</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Tools Cost</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Rent</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Others Cost</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingCashout ? (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-gray-500 dark:text-gray-400">
                              Loading cash outflow data...
                            </td>
                          </tr>
                        ) : cashoutData.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-gray-500 dark:text-gray-400">
                              No cash outflow data found. Add your first entry above.
                            </td>
                          </tr>
                        ) : (
                          cashoutData.slice(0, 5).map((row, index) => (
                            <tr key={row.id || index} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-3 px-4 text-gray-900 dark:text-white">{row.month}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{row.year}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{row.employees}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">₹{row.salary.toLocaleString('en-IN')}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">₹{row.incentive.toLocaleString('en-IN')}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">₹{row.tools.toLocaleString('en-IN')}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">₹{row.rent.toLocaleString('en-IN')}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">₹{row.others.toLocaleString('en-IN')}</td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => e.stopPropagation()}
                                      data-testid={`button-actions-cashout-${row.id}`}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditCashout(row);
                                      }}
                                      className="cursor-pointer"
                                      data-testid={`button-edit-cashout-${row.id}`}
                                    >
                                      <EditIcon className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCashout(row.id, `${row.month} ${row.year}`);
                                      }}
                                      className="cursor-pointer text-red-600 focus:text-red-600"
                                      data-testid={`button-delete-cashout-${row.id}`}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Key Aspects - Separately Scrollable */}
            <div className="w-80 border-l-2 border-gray-300 dark:border-gray-600 pl-6 overflow-y-auto admin-scrollbar">
              <Card className="bg-gray-100 dark:bg-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-700 dark:text-gray-300">Key Aspects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    {/* Growth MoM */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        GROWTH<span className="text-xs align-super ml-0.5">MoM</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-growth-mom">{keyAspectsData.growthMoM}%</div>
                    </div>

                    {/* Growth YoY */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        GROWTH<span className="text-xs align-super ml-0.5">YoY</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-growth-yoy">{keyAspectsData.growthYoY}%</div>
                    </div>

                    {/* Burn Rate */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        BURN<span className="text-xs align-super ml-0.5">RATE</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-burn-rate">{keyAspectsData.burnRate}%</div>
                    </div>

                    {/* Churn Rate */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        CHURN<span className="text-xs align-super ml-0.5">RATE</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-churn-rate">{keyAspectsData.churnRate}%</div>
                    </div>

                    {/* Attrition */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-300">ATTRITION</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-attrition">{keyAspectsData.attrition}%</div>
                    </div>

                    {/* Net Profit */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-300">NET PROFIT</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white" data-testid="text-net-profit">{keyAspectsData.netProfit.toLocaleString()}</div>
                    </div>

                    {/* Revenue */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        REVENUE<span className="text-xs align-super ml-0.5">PER EMPLOYEE</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white" data-testid="text-revenue-per-employee">{keyAspectsData.revenuePerEmployee.toLocaleString()}</div>
                    </div>

                    {/* Client Acquisition Cost */}
                    <div className="flex items-center justify-between py-4">
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        CLIENT<span className="text-xs align-super ml-0.5">ACQUISITION COST</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white" data-testid="text-client-acquisition-cost">{keyAspectsData.clientAcquisitionCost.toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      default:
        return renderTeamSection();
    }
  };

  return (
    <div className="admin-dashboard flex flex-col bg-gray-50 dark:bg-gray-900 min-h-screen">
      <style>{`
        .admin-dashboard table thead th {
          font-weight: 700 !important;
          color: #0f172a !important;
        }
        .dark .admin-dashboard table thead th {
          color: #f8fafc !important;
        }
      `}</style>
      <div className="pl-11">
        <AdminTopHeader
          companyName="Scaling Theory"
          onHelpClick={() => setIsChatOpen(true)}
          onOpenNudgesTab={() => setSidebarTab("nudges")}
          onNavigateToSection={(section) => {
            const tabMap: Record<string, string> = {
              closures: "performance",
              nudges: "nudges",
              escalations: "nudges",
              pipeline: "pipeline",
              requirements: "requirements",
              newCandidates: "pipeline",
            };
            const next = tabMap[section];
            if (next) setSidebarTab(next);
          }}
        />
      </div>
      <div className="flex flex-1">
        <AdminSidebar activeTab={sidebarTab} onTabChange={setSidebarTab} hasUnreadNudges={hasUnreadNudges} />
        <div className="flex-1 ml-16 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
          {renderSidebarContent()}
        </div>
        {sidebarTab === 'dashboard' && <TeamMembersSidebar />}
      </div>

      {/* Recruiter Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Recruiter Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="p-6 space-y-4">
              {/* Header with name and ID */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    R. {selectedMember.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {selectedMember.role}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ID: {selectedMember.id}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex">
                  <span className="text-gray-700 dark:text-gray-300 font-medium w-20">Email:</span>
                  <span className="text-gray-600 dark:text-gray-400">{selectedMember.email}</span>
                </div>

                <div className="flex">
                  <span className="text-gray-700 dark:text-gray-300 font-medium w-20">Mobile:</span>
                  <span className="text-gray-600 dark:text-gray-400">{selectedMember.mobile}</span>
                </div>

                <div className="flex">
                  <span className="text-gray-700 dark:text-gray-300 font-medium w-20">Joined:</span>
                  <span className="text-gray-600 dark:text-gray-400">{selectedMember.joined}</span>
                </div>

                <div className="flex">
                  <span className="text-gray-700 dark:text-gray-300 font-medium w-20">Closures:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">{selectedMember.closures}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => handleEmailClick(selectedMember.email)}
                  className="btn-rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 flex-1"
                >
                  <Mail size={16} />
                  Email
                </Button>
                <Button
                  onClick={() => handleCallClick(selectedMember.mobile)}
                  className="btn-rounded bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 flex-1"
                >
                  <Phone size={16} />
                  Call
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Target & Incentives View All Modal */}
      <Dialog open={isTargetModalOpen} onOpenChange={setIsTargetModalOpen}>
        <DialogContent className="max-w-5xl mx-auto max-h-[80vh]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                All Target & Incentives Data
              </DialogTitle>
              <SearchBar
                value={targetSearch}
                onChange={setTargetSearch}
                placeholder="Search targets..."
                testId="input-search-targets"
              />
            </div>
          </DialogHeader>
          <div className="p-4 overflow-y-auto admin-scrollbar" style={{ maxHeight: '60vh' }}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-200 dark:bg-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">TL</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">TA</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Quarter</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Minimum Target</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Target Achieved</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Closures</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Incentives</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingTargets ? (
                    <tr>
                      <td colSpan={8} className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredTargetMappings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                        {targetSearch ? 'No matching target mappings found' : 'No target mappings found'}
                      </td>
                    </tr>
                  ) : (
                    filteredTargetMappings.map((target, index) => (
                      <tr key={target.id} className={index % 2 === 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800"}>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium border-b border-gray-100 dark:border-gray-700">{target.teamLeadName || "-"}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium border-b border-gray-100 dark:border-gray-700">{target.teamMemberName}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{target.quarter} {target.year}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{target.minimumTarget}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{target.targetAchieved || "-"}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{target.closures || "-"}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{target.incentives || "-"}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                                data-testid={`button-actions-target-all-${target.id}`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTarget(target);
                                  setIsTargetModalOpen(false);
                                }}
                                className="cursor-pointer"
                                data-testid={`button-edit-target-all-${target.id}`}
                              >
                                <EditIcon className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTarget(target.id, `${target.teamMemberName} - ${target.quarter} ${target.year}`);
                                  setIsTargetModalOpen(false);
                                }}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                                data-testid={`button-delete-target-all-${target.id}`}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setIsTargetModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded"
                data-testid="button-close-targets-modal"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delivered View Modal */}
      <DailyDeliveryModal
        open={isDeliveredModalOpen}
        onOpenChange={setIsDeliveredModalOpen}
        title="Delivered Items"
        rows={deliveredData}
        columns={[
          { key: 'requirement', label: 'Requirement' },
          { key: 'candidate', label: 'Candidate' },
          { key: 'client', label: 'Client' },
          { key: 'deliveredDate', label: 'Delivered Date' },
          { key: 'status', label: 'Status' }
        ]}
        emptyMessage="No delivered items today"
        statusClassName={(status) => "px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"}
        testIdPrefix="delivered"
      />

      {/* Defaulted View Modal */}
      <DailyDeliveryModal
        open={isDefaultedModalOpen}
        onOpenChange={setIsDefaultedModalOpen}
        title="Defaulted Items"
        rows={defaultedData}
        columns={[
          { key: 'requirement', label: 'Requirement' },
          { key: 'candidate', label: 'Candidate' },
          { key: 'client', label: 'Client' },
          { key: 'expectedDate', label: 'Expected Date' },
          { key: 'status', label: 'Status' }
        ]}
        emptyMessage="No defaulted items today"
        statusClassName={(status) => "px-2 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}
        testIdPrefix="defaulted"
      />

      {/* TL Meetings Modal */}
      <Dialog open={isTlMeetingsModalOpen} onOpenChange={setIsTlMeetingsModalOpen}>
        <DialogContent className="max-w-5xl mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              TL's Pending Meetings
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-200 dark:bg-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Meeting Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Person</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Agenda</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meetingsLoading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">Loading meetings...</td>
                    </tr>
                  ) : tlMeetings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">No pending meetings</td>
                    </tr>
                  ) : (
                    tlMeetings.map((meeting: any, index: number) => (
                      <tr key={meeting.id || index} className={index % 2 === 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800"}>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium border-b border-gray-100 dark:border-gray-700">{meeting.meetingType}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{format(new Date(meeting.meetingDate), 'dd-MMM-yyyy')}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{meeting.meetingTime}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{meeting.person}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{meeting.agenda}</td>
                        <td className="py-3 px-4 text-sm border-b border-gray-100 dark:border-gray-700">
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${meeting.status === 'scheduled' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}>
                            {meeting.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm border-b border-gray-100 dark:border-gray-700">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                data-testid={`button-meeting-actions-${meeting.id}`}
                              >
                                <EditIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                              <DropdownMenuItem
                                onClick={() => handleRescheduleMeeting(meeting)}
                                data-testid={`menuitem-reschedule-${meeting.id}`}
                                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              >
                                Reschedule
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteMeeting(meeting.id, meeting.person)}
                                data-testid={`menuitem-delete-${meeting.id}`}
                                className="text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setIsTlMeetingsModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded"
                data-testid="button-close-tl-meetings-modal"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* All Messages Modal */}
      <Dialog open={isAllMessagesModalOpen} onOpenChange={setIsAllMessagesModalOpen}>
        <DialogContent className="max-w-5xl mx-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                All Messages (Last 3 Days)
              </DialogTitle>
              <SearchBar
                value={messagesSearch}
                onChange={setMessagesSearch}
                placeholder="Search messages..."
                testId="input-search-messages"
              />
            </div>
          </DialogHeader>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-200 dark:bg-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Message</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages
                    .filter(message => {
                      const threeDaysAgo = new Date();
                      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                      return message.timestamp >= threeDaysAgo;
                    })
                    .map((message, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800"}>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium border-b border-gray-100 dark:border-gray-700">{message.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{message.message}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{message.date}</td>
                        <td className="py-3 px-4 text-sm border-b border-gray-100 dark:border-gray-700">
                          <span className={`w-3 h-3 rounded-full inline-block ${message.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                            }`}></span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setIsAllMessagesModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded"
                data-testid="button-close-all-messages-modal"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CEO Meetings Modal */}
      <Dialog open={isCeoMeetingsModalOpen} onOpenChange={setIsCeoMeetingsModalOpen}>
        <DialogContent className="max-w-5xl mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              CEO's Pending Meetings
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-200 dark:bg-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Meeting Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Time</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Person</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Agenda</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meetingsLoading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">Loading meetings...</td>
                    </tr>
                  ) : ceoMeetings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">No pending meetings</td>
                    </tr>
                  ) : (
                    ceoMeetings.map((meeting: any, index: number) => (
                      <tr key={meeting.id || index} className={index % 2 === 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800"}>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium border-b border-gray-100 dark:border-gray-700">{meeting.meetingType}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{format(new Date(meeting.meetingDate), 'dd-MMM-yyyy')}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{meeting.meetingTime}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{meeting.person}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">{meeting.agenda}</td>
                        <td className="py-3 px-4 text-sm border-b border-gray-100 dark:border-gray-700">
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${meeting.status === 'scheduled' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}>
                            {meeting.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm border-b border-gray-100 dark:border-gray-700">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                data-testid={`button-meeting-actions-${meeting.id}`}
                              >
                                <EditIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                              <DropdownMenuItem
                                onClick={() => handleRescheduleMeeting(meeting)}
                                data-testid={`menuitem-reschedule-${meeting.id}`}
                                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              >
                                Reschedule
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteMeeting(meeting.id, meeting.person)}
                                data-testid={`menuitem-delete-${meeting.id}`}
                                className="text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setIsCeoMeetingsModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded"
                data-testid="button-close-ceo-meetings-modal"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Message Modal */}
      <Dialog open={isCreateMessageModalOpen} onOpenChange={(open) => { setIsCreateMessageModalOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-md mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="sr-only">Create Message</DialogTitle>
          </DialogHeader>
          <div className="p-3 pt-2">
            <div className="space-y-3">
              <Select value={selectedRecipient} onValueChange={setSelectedRecipient} data-testid="select-message-recipient" required>
                <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded">
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  {isLoadingEmployees ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    employees
                      .filter((e: Employee) =>
                        (e.role === 'team_leader' || e.role === 'recruiter') &&
                        (e.isActive === true || e.isActive === undefined)
                      )
                      .map((employee: Employee) => {
                        const roleLabel = employee.role === 'team_leader' ? 'TL' : employee.role === 'recruiter' ? 'TA' : '';
                        return (
                          <SelectItem key={employee.id} value={employee.id} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                            {roleLabel ? `${employee.name} (${roleLabel})` : employee.name}
                          </SelectItem>
                        );
                      })
                  )}
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Enter here!"
                rows={4}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="w-full resize-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded"
                data-testid="textarea-message-content"
                required
              />

              <div className="flex justify-end">
                <Button
                  onClick={handleSendMessage}
                  disabled={!selectedRecipient || !messageContent.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded flex items-center gap-2"
                  data-testid="button-send-message"
                >
                  Send
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Modal for viewing and replying to messages */}
      {selectedChatRoom && <ChatModal roomId={selectedChatRoom} isOpen={isChatModalOpen} onClose={() => { setIsChatModalOpen(false); setSelectedChatRoom(null); }} onMessageSent={refetchChatRooms} employeeId={employee?.id} />}

      {/* Meetings Menu Modal - Last 7 Days */}
      <Dialog open={isMeetingsMenuModalOpen} onOpenChange={setIsMeetingsMenuModalOpen}>
        <DialogContent className="max-w-4xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center text-gray-900 dark:text-white">
              Meetings - Last 7 Days
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4">
            {meetingsLast7Days.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No meetings found in the last 7 days
              </div>
            ) : (
              <div className="space-y-3">
                {meetingsLast7Days.map((meeting: any) => {
                  const meetingDateTime = new Date(`${meeting.meetingDate} ${meeting.meetingTime}`);
                  const isExpanded = expandedMeetings.has(meeting.id);

                  return (
                    <div
                      key={meeting.id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {meeting.meetingType || meeting.agenda || 'Meeting'}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {format(meetingDateTime, 'dd-MMM-yyyy')} at {meeting.meetingTime}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRescheduleMeeting(meeting)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="Edit meeting"
                          >
                            <EditIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => toggleMeetingExpansion(meeting.id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Meeting With:</span> {meeting.person || 'N/A'}
                          </div>
                          {meeting.agenda && meeting.agenda !== 'General Discussion' && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Description:</span> {meeting.agenda}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Members:</span>
                            <div className="flex -space-x-2">
                              {(() => {
                                const participants: string[] = [];
                                if (meeting.personId) participants.push(meeting.personId);
                                if (meeting.members && Array.isArray(meeting.members)) {
                                  participants.push(...meeting.members);
                                }
                                const uniqueParticipants = Array.from(new Set(participants));
                                const participantNames = uniqueParticipants
                                  .map(id => employees.find((e: Employee) => e.id === id))
                                  .filter(Boolean)
                                  .slice(0, 5);
                                const remainingCount = Math.max(0, uniqueParticipants.length - 5);

                                if (uniqueParticipants.length === 0) {
                                  return <span className="text-xs text-gray-500">No members</span>;
                                }

                                return (
                                  <>
                                    {participantNames.map((emp: Employee | undefined, idx: number) => {
                                      if (!emp) return null;
                                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'];
                                      return (
                                        <div
                                          key={emp.id}
                                          className={`w-8 h-8 rounded-full ${colors[idx % colors.length]} border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-medium`}
                                          title={emp.name}
                                        >
                                          {emp.name.charAt(0).toUpperCase()}
                                        </div>
                                      );
                                    })}
                                    {remainingCount > 0 && (
                                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                                        +{remainingCount}
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${meeting.status === 'completed' || meetingDateTime < new Date()
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                              }`}>
                              {meeting.status === 'completed' || meetingDateTime < new Date() ? 'Completed' : 'Scheduled'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => setIsMeetingsMenuModalOpen(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded"
              data-testid="button-close-meetings-menu-modal"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Meeting Modal */}
      <Dialog open={isCreateMeetingModalOpen} onOpenChange={(open) => { setIsCreateMeetingModalOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-[90vh] max-h-[700px] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center text-gray-900 dark:text-white">
              Meeting scheduling
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Meeting Title with Label on Left */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[120px]">
                Meeting Title
              </label>
              <div className="relative flex-1">
                <Input
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded pr-10 py-2"
                  data-testid="input-meeting-title"
                />
                <EditIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              </div>
            </div>

            {/* Meeting For - Attendees (who need to attend) */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[120px]">
                Meeting For
              </label>
              <div className="relative flex-1">
                <Select
                  value={meetingFor}
                  onValueChange={(value) => {
                    setMeetingFor(value);
                  }}
                  data-testid="select-meeting-for"
                  required
                >
                  <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded pr-10 py-2">
                    <SelectValue placeholder="Select attendees" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <SelectItem value="all_tl" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold">
                      All Team Leaders
                    </SelectItem>
                    <SelectItem value="all_ta" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold">
                      All Talent Advisors
                    </SelectItem>
                    {employees
                      .filter((e: Employee) => e.role === 'team_leader')
                      .map((tl: Employee) => (
                        <SelectItem key={`team_${tl.id}`} value={`team_${tl.id}`} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                          {tl.name}'s Team
                        </SelectItem>
                      ))}
                    {employees
                      .filter((e: Employee) => e.role === 'team_leader')
                      .map((employee: Employee) => (
                        <SelectItem key={employee.id} value={employee.id} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                          {employee.name} (TL)
                        </SelectItem>
                      ))}
                    {employees
                      .filter((e: Employee) => e.role === 'recruiter')
                      .map((employee: Employee) => (
                        <SelectItem key={employee.id} value={employee.id} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                          {employee.name} (TA)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <EditIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Meeting With - Admin or Client */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[120px]">
                Meeting With
              </label>
              <div className="relative flex-1">
                <Select
                  value={meetingWith}
                  onValueChange={(value) => {
                    setMeetingWith(value);
                    if (value !== 'client') {
                      setSelectedClientId('');
                    }
                  }}
                  data-testid="select-meeting-with"
                  required
                >
                  <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded pr-10 py-2">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    {(() => {
                      const admin = employees.find((e: Employee) => e.role === 'admin');
                      return admin ? (
                        <SelectItem key="admin" value="admin" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                          {admin.name} (CEO)
                        </SelectItem>
                      ) : null;
                    })()}
                    <SelectItem value="client" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                      Client
                    </SelectItem>
                  </SelectContent>
                </Select>
                <EditIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Client Selection - Show when Client is selected */}
            {meetingWith === 'client' && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[120px]">
                  Select Client
                </label>
                <div className="relative flex-1">
                  <Select
                    value={selectedClientId}
                    onValueChange={setSelectedClientId}
                    data-testid="select-client"
                    required
                  >
                    <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded pr-10 py-2">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      {isLoadingClients ? (
                        <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                      ) : (
                        (clients as any[]).map((client: any) => (
                          <SelectItem
                            key={client.id}
                            value={client.id}
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {client.spoc || 'N/A'} - {client.brandName || client.incorporatedName || 'Unknown Company'}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <EditIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Meeting Description - Optional */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[120px]">
                Meeting Description <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="relative flex-1">
                <Input
                  value={meetingDescription}
                  onChange={(e) => setMeetingDescription(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded pr-10 py-2"
                  data-testid="input-meeting-description"
                  placeholder="Enter meeting description"
                />
                <EditIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              </div>
            </div>

            {/* Add Members Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="add-members"
                checked={showAddMembers}
                onCheckedChange={(checked) => setShowAddMembers(checked as boolean)}
                data-testid="checkbox-add-members"
              />
              <label htmlFor="add-members" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                Add Members
              </label>
            </div>

            {/* Add Members Section */}
            {showAddMembers && (
              <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                {/* Search Bar with Autocomplete */}
                <div className="relative">
                  <Input
                    value={memberSearchTerm}
                    onChange={(e) => {
                      const search = e.target.value;
                      setMemberSearchTerm(search);
                      // Filter and show suggestions
                      if (search.trim()) {
                        const filtered = employees.filter((e: Employee) =>
                          e.name.toLowerCase().includes(search.toLowerCase())
                        ).slice(0, 5); // Show top 5 suggestions
                        setMemberSuggestions(filtered);
                      } else {
                        setMemberSuggestions([]);
                      }
                    }}
                    onFocus={() => {
                      if (memberSearchTerm.trim()) {
                        const filtered = employees.filter((e: Employee) =>
                          e.name.toLowerCase().includes(memberSearchTerm.toLowerCase())
                        ).slice(0, 5);
                        setMemberSuggestions(filtered);
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding suggestions to allow click
                      setTimeout(() => setMemberSuggestions([]), 200);
                    }}
                    placeholder="Type to search members..."
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded pl-10"
                    data-testid="input-member-search"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />

                  {/* Autocomplete Suggestions Dropdown */}
                  {memberSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg max-h-48 overflow-y-auto">
                      {memberSuggestions.map((employee: Employee) => {
                        const isSelected = meetingMembers.includes(employee.id);
                        return (
                          <div
                            key={employee.id}
                            className={`flex items-center justify-between p-2 cursor-pointer transition-colors ${isSelected
                              ? 'bg-blue-100 dark:bg-blue-900/30'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            onMouseDown={(e) => {
                              e.preventDefault(); // Prevent input blur
                              if (isSelected) {
                                setMeetingMembers(meetingMembers.filter(id => id !== employee.id));
                              } else {
                                setMeetingMembers([...meetingMembers, employee.id]);
                              }
                              setMemberSearchTerm('');
                              setMemberSuggestions([]);
                            }}
                          >
                            <span className="text-sm text-gray-900 dark:text-white">
                              {employee.name} ({employee.role === 'team_leader' ? 'TL' : employee.role === 'recruiter' ? 'TA' : 'Admin'})
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Add Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const ceo = employees.find((e: Employee) => e.role === 'admin');
                      if (ceo && !meetingMembers.includes(ceo.id)) {
                        setMeetingMembers([...meetingMembers, ceo.id]);
                      }
                    }}
                    className="text-xs"
                    data-testid="button-add-ceo"
                  >
                    + CEO
                  </Button>
                  {employees
                    .filter((e: Employee) => e.role === 'team_leader')
                    .slice(0, 2)
                    .map((tl: Employee, index: number) => (
                      <Button
                        key={tl.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!meetingMembers.includes(tl.id)) {
                            setMeetingMembers([...meetingMembers, tl.id]);
                          }
                        }}
                        className="text-xs"
                        data-testid={`button-add-tl-${index + 1}`}
                      >
                        + Team Leader {index + 1}
                      </Button>
                    ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allTLs = employees
                        .filter((e: Employee) => e.role === 'team_leader')
                        .map((e: Employee) => e.id);
                      setMeetingMembers(Array.from(new Set([...meetingMembers, ...allTLs])));
                    }}
                    className="text-xs"
                    data-testid="button-add-both-tl"
                  >
                    + Both TL
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allIds = employees.map((e: Employee) => e.id);
                      setMeetingMembers(allIds);
                    }}
                    className="text-xs"
                    data-testid="button-add-all-members"
                  >
                    + All Members
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setMeetingMembers([])}
                    className="text-xs"
                    data-testid="button-add-none"
                  >
                    + None
                  </Button>
                </div>

                {/* Selected Members List */}
                {meetingMembers.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Members:</div>
                    <div className="flex flex-wrap gap-2">
                      {meetingMembers.map((memberId) => {
                        const member = employees.find((e: Employee) => e.id === memberId);
                        return member ? (
                          <div
                            key={memberId}
                            className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs"
                          >
                            {member.name}
                            <button
                              onClick={() => setMeetingMembers(meetingMembers.filter(id => id !== memberId))}
                              className="ml-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Date with Label on Left */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[120px]">
                Date
              </label>
              <div className="flex-1">
                <StandardDatePicker
                  value={meetingDate}
                  onChange={setMeetingDate}
                  placeholder="Select date"
                  className="w-full"
                />
              </div>
            </div>

            {/* Time with Label on Left */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[120px]">
                Time
              </label>
              <div className="relative flex-1">
                <Input
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded py-2"
                  data-testid="input-meeting-time"
                  required
                />
              </div>
            </div>
          </div>

          {/* Set Meeting Button - Fixed at bottom */}
          <div className="flex justify-center p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleSetMeeting}
              disabled={!meetingTitle || !meetingFor || !meetingWith || !meetingDate || !meetingTime || (meetingWith === 'client' && !selectedClientId)}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-2 rounded text-base font-medium w-full"
              data-testid="button-set-meeting"
            >
              Set Meeting
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Meeting Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center text-gray-900 dark:text-white">
              Meeting Preview
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            {/* Preview Content */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title:</label>
                <p className="text-gray-900 dark:text-white mt-1">{meetingTitle}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meeting For:</label>
                <p className="text-gray-900 dark:text-white mt-1">
                  {meetingFor === 'all_tl' ? 'All Team Leaders' :
                    meetingFor === 'all_ta' ? 'All Talent Advisors' :
                      meetingFor.startsWith('team_') ?
                        (() => {
                          const tlId = meetingFor.replace('team_', '');
                          const tl = employees.find((e: Employee) => e.id === tlId);
                          return tl ? `${tl.name}'s Team` : meetingFor;
                        })() :
                        (() => {
                          const person = employees.find((e: Employee) => e.id === meetingFor);
                          return person ? person.name : meetingFor;
                        })()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meeting With:</label>
                <p className="text-gray-900 dark:text-white mt-1">
                  {meetingWith === 'all_tl' ? 'All Team Leaders' :
                    meetingWith === 'all_ta' ? 'All Talent Advisors' :
                      meetingWith.startsWith('team_') ?
                        (() => {
                          const tlId = meetingWith.replace('team_', '');
                          const tl = employees.find((e: Employee) => e.id === tlId);
                          return tl ? `${tl.name}'s Team` : meetingWith;
                        })() :
                        (() => {
                          const person = employees.find((e: Employee) => e.id === meetingWith);
                          return person ? person.name : meetingWith;
                        })()}
                </p>
              </div>
              {meetingDescription && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description:</label>
                  <p className="text-gray-900 dark:text-white mt-1">{meetingDescription}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date:</label>
                <p className="text-gray-900 dark:text-white mt-1">
                  {meetingDate ? format(meetingDate, 'dd-MM-yyyy') : ''}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time:</label>
                <p className="text-gray-900 dark:text-white mt-1">{meetingTime}</p>
              </div>
              {meetingMembers.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Members:</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {meetingMembers.map((memberId) => {
                      const member = employees.find((e: Employee) => e.id === memberId);
                      return member ? (
                        <span
                          key={memberId}
                          className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-sm"
                        >
                          {member.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowPreviewModal(false)}
              className="flex-1"
            >
              Edit
            </Button>
            <Button
              onClick={handleScheduleMeeting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isClosureReportActionModalOpen}
        onOpenChange={(open) => {
          setIsClosureReportActionModalOpen(open);
          if (!open) {
            resetClosureReportActionState();
          }
        }}
      >
        <DialogContent className="max-w-3xl border-none bg-slate-50 p-0 overflow-hidden">
          <DialogHeader className="px-7 pt-7">
            <DialogTitle className="text-[20px] font-medium text-slate-900">
              {closureReportActionType === 'early-exit' ? 'Early Exit' : 'Offer Dropped'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 px-7 pb-7">
            <Textarea
              value={closureReportActionReason}
              onChange={(e) => setClosureReportActionReason(e.target.value)}
              placeholder="Enter reason for offer decline..."
              className="min-h-[170px] resize-none rounded-2xl border-slate-200 bg-white text-base placeholder:text-slate-400"
            />

            <div className="space-y-2">
              <Label className="text-base font-medium text-slate-700">Date</Label>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <Input
                  type="date"
                  value={closureReportActionDate}
                  onChange={(e) => setClosureReportActionDate(e.target.value)}
                  className="h-11 w-full rounded-2xl border-slate-200 bg-white md:max-w-[250px]"
                />

                {closureReportActionType === 'early-exit' && earlyExitDayCount !== null && (
                  <div className={`flex items-center gap-2 text-sm ${earlyExitDayCount > 90 ? 'text-green-600' : 'text-red-500'}`}>
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                    <span>
                      Offer declined on Day {earlyExitDayCount} of the 90-day Early Exit window
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setClosureReportReRequirementRequested((prev) => !prev)}
              className="flex items-center gap-3 text-left"
            >
              <Checkbox
                checked={closureReportReRequirementRequested}
                onCheckedChange={() => {}}
                className="pointer-events-none rounded-none border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:text-white"
              />
              <span className="text-base text-slate-500">Request for re-require by client</span>
            </button>

            <Button
              type="button"
              className="h-14 w-full rounded-2xl bg-red-600 text-white text-[18px] font-semibold hover:bg-red-700"
              onClick={handleConfirmClosureReportAction}
              disabled={closureReportActionMutation.isPending}
            >
              {closureReportActionMutation.isPending ? 'Saving...' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Closure Reports Modal */}
      <Dialog open={isClosureReportsModalOpen} onOpenChange={setIsClosureReportsModalOpen}>
        <DialogContent className="max-w-5xl mx-auto max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                All Closure Reports
              </DialogTitle>
              <SearchBar
                value={closureReportsSearch}
                onChange={setClosureReportsSearch}
                placeholder="Search closures..."
                testId="input-search-closure-reports"
              />
            </div>
          </DialogHeader>
          <div className="p-4 overflow-y-auto admin-scrollbar" style={{ maxHeight: '60vh' }}>
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-[#f7f4f0] dark:bg-gray-800">
                    <th className="rounded-l-2xl p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Candidate</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Position</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Client</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Talent Advisor</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">QTR</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Offered Date</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Joined Date</th>
                    <th className="rounded-r-2xl p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingClosureReports ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500 dark:text-gray-400">
                        Loading closure reports...
                      </td>
                    </tr>
                  ) : filteredClosureReports.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500 dark:text-gray-400">
                        {closureReportsSearch ? `No results found for "${closureReportsSearch}"` : "No closure reports available"}
                      </td>
                    </tr>
                  ) : (
                    filteredClosureReports.map((report) => (
                      <tr
                        key={report.id}
                        title={getClosureActionHoverText(report) || undefined}
                        className={`shadow-[0_0_0_1px_rgba(226,232,240,0.8)] dark:bg-gray-900 ${
                          report.closureAction?.type
                            ? 'bg-rose-50/90 hover:bg-rose-100/80'
                            : 'bg-white'
                        }`}
                      >
                        <td className="rounded-l-2xl p-3 text-gray-900 dark:text-white">{report.candidate}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{report.position}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{report.client}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{report.talentAdvisor || 'Unassigned'}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <span>{getClosureQuarterLabel(report)}</span>
                            {report.closureAction?.type && (
                              <span className="rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-700">
                                Flagged
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{report.offeredDate}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{report.joinedDate}</td>
                        <td className="rounded-r-2xl p-3">
                          {renderClosureReportActions(report)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Requirement Modal */}
      <AddRequirementModal
        isOpen={isAddRequirementModalOpen}
        onClose={() => {
          setIsAddRequirementModalOpen(false);
          setEditingRequirement(null);
          setInitialRequirementData(null);
          setJdToAdd(null);
        }}
        initialData={editingRequirement || initialRequirementData}
        jdIdToDelete={jdToAdd?.id || null}
        onSuccess={() => {
          // Refresh client JDs list after successful conversion
          queryClient.invalidateQueries({ queryKey: ['/api/admin/client-jds'] });
          queryClient.invalidateQueries({ queryKey: ['/api/admin/archived-requirements'] });
          setEditingRequirement(null);
          setJdToAdd(null);
        }}
      />

      {/* Add to Requirement Alert Dialog */}
      <AlertDialog open={isAddToRequirementAlertOpen} onOpenChange={setIsAddToRequirementAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add to Requirement</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to add this JD as a new requirement? The requirement form will be pre-filled with available information from the JD.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {jdToAdd?.requirement?.jdFile && (
            <div className="py-2">
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                JD file will be shared to the requirement
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (jdToAdd && jdToAdd.requirement) {
                  const req = jdToAdd.requirement;
                  setInitialRequirementData({
                    position: req.position || jdToAdd.role || '',
                    company: req.company || '',
                    spoc: req.spoc || jdToAdd.spocName || '',
                    noOfPositions: req.noOfPositions || 1,
                    jdFile: req.jdFile || null,
                    jdText: req.jdText || null,
                    sourceDetails: req.sourceDetails || null,
                  });
                  setEditingRequirement(null);
                  setIsAddToRequirementAlertOpen(false);
                  setIsAddRequirementModalOpen(true);
                }
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Target Mapping Modal */}
      <TargetMappingModal
        isOpen={isTargetMappingModalOpen}
        onClose={() => {
          setIsTargetMappingModalOpen(false);
          setEditingTarget(null);
        }}
        editingTarget={editingTarget}
      />

      {/* Revenue Mapping Modal */}
      <RevenueMappingModal
        isOpen={isRevenueMappingModalOpen}
        onClose={() => {
          setIsRevenueMappingModalOpen(false);
          setEditingRevenueMapping(null);
        }}
        editingRevenueMapping={editingRevenueMapping}
      />

      <IncentiveMappingModal
        isOpen={isIncentiveMappingModalOpen}
        onClose={() => {
          setIsIncentiveMappingModalOpen(false);
          setEditingIncentiveMapping(null);
        }}
        editingIncentiveMapping={editingIncentiveMapping}
      />

      {/* Performance Chart Modal */}
      <PerformanceChartModal
        isOpen={isPerformanceChartModalOpen}
        onClose={() => setIsPerformanceChartModalOpen(false)}
        initialTeamId={selectedPerformanceTeam}
        initialPeriod={selectedPerformancePeriod}
        teamLeaders={performanceTeamLeaders}
      />

      {/* Team Performance Table Modal */}
      <TeamPerformanceTableModal
        isOpen={isTeamPerformanceTableModalOpen}
        onClose={() => setIsTeamPerformanceTableModalOpen(false)}
        teamId={selectedPerformanceTeam}
      />

      {/* Closure Modal */}
      <ClosureModal
        isOpen={isClosureModalOpen}
        onClose={() => setIsClosureModalOpen(false)}
        onEditMapping={(mappingId) => {
          const mapping = revenueMappings.find((m: { id: string }) => m.id === mappingId);
          if (mapping) {
            setEditingRevenueMapping(mapping);
            setIsRevenueMappingModalOpen(true);
          } else {
            toast({
              title: "Unable to edit",
              description: "Revenue mapping not found. Try refreshing the page.",
              variant: "destructive",
            });
          }
        }}
        onDeleteMapping={handleDeleteRevenueMapping}
      />

      {/* Add Team Leader Modal */}
      <AddTeamLeaderModal
        isOpen={isAddTeamLeaderModalOpen}
        onClose={() => setIsAddTeamLeaderModalOpen(false)}
        onSubmit={handleAddUser}
      />

      {/* Add Talent Advisor Modal */}
      <AddTalentAdvisorModal
        isOpen={isAddTalentAdvisorModalOpen}
        onClose={() => setIsAddTalentAdvisorModalOpen(false)}
        onSubmit={handleAddUser}
      />

      {/* Add Recruiter Modal */}
      <AddRecruiterModal
        isOpen={isAddRecruiterModalOpen}
        onClose={() => { setIsAddRecruiterModalOpen(false); setEditingUser(null); }}
        editData={editingUser && (editingUser.role === 'Recruiter' || editingUser.role === 'recruiter' || editingUser.role === 'Talent Advisor') ? editingUser : null}
        onSubmit={editingUser ? handleUpdateUser : handleAddUser}
      />

      {/* Password Protected Delete Dialog for Revenue Mapping Management */}
      <Dialog open={isRevenueMappingPasswordDialogOpen} onOpenChange={handleRevenueMappingPasswordDialogOpenChange} data-testid="dialog-password-delete-revenue-mapping">
        <DialogContent className="max-w-md" data-testid="dialog-password-confirm-revenue-mapping">
          <DialogHeader>
            <DialogTitle>Confirm Revenue Mapping Deletion</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              To delete revenue mapping "{revenueMappingToDelete?.description}", please enter your admin password for security.
            </p>

            <div className="space-y-2">
              <Label htmlFor="delete-revenue-mapping-password">Admin Password</Label>
              <PasswordInput
                id="delete-revenue-mapping-password"
                placeholder="Enter your password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isVerifyingPassword) {
                    handleVerifyRevenueMappingPassword();
                  }
                }}
                disabled={isVerifyingPassword || passwordAttempts >= 3}
                data-testid="input-delete-revenue-mapping-password"
              />
            </div>

            {passwordAttempts > 0 && passwordAttempts < 3 && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {3 - passwordAttempts} attempt(s) remaining
              </p>
            )}

            {passwordAttempts >= 3 && (
              <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                Maximum attempts reached. Please try again later.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelRevenueMappingDelete}
              disabled={isVerifyingPassword}
              data-testid="button-cancel-delete-revenue-mapping"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleVerifyRevenueMappingPassword}
              disabled={isVerifyingPassword || passwordAttempts >= 3 || !passwordInput}
              data-testid="button-confirm-delete-revenue-mapping"
            >
              {isVerifyingPassword ? "Verifying..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Protected Delete Dialog for Cash Outflow Management */}
      <Dialog open={isCashoutPasswordDialogOpen} onOpenChange={handleCashoutPasswordDialogOpenChange} data-testid="dialog-password-delete-cashout">
        <DialogContent className="max-w-md" data-testid="dialog-password-confirm-cashout">
          <DialogHeader>
            <DialogTitle>Confirm Cash Outflow Deletion</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              To delete cash outflow "{cashoutToDelete?.description}", please enter your admin password for security.
            </p>

            <div className="space-y-2">
              <Label htmlFor="delete-cashout-password">Admin Password</Label>
              <PasswordInput
                id="delete-cashout-password"
                placeholder="Enter your password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isVerifyingPassword) {
                    handleVerifyCashoutPassword();
                  }
                }}
                disabled={isVerifyingPassword || passwordAttempts >= 3}
                data-testid="input-delete-cashout-password"
              />
            </div>

            {passwordAttempts > 0 && passwordAttempts < 3 && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {3 - passwordAttempts} attempt(s) remaining
              </p>
            )}

            {passwordAttempts >= 3 && (
              <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                Maximum attempts reached. Please try again later.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelCashoutDelete}
              disabled={isVerifyingPassword}
              data-testid="button-cancel-delete-cashout"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleVerifyCashoutPassword}
              disabled={isVerifyingPassword || passwordAttempts >= 3 || !passwordInput}
              data-testid="button-confirm-delete-cashout"
            >
              {isVerifyingPassword ? "Verifying..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Protected Delete Dialog for Target Management */}
      <Dialog open={isTargetPasswordDialogOpen} onOpenChange={handleTargetPasswordDialogOpenChange} data-testid="dialog-password-delete-target">
        <DialogContent className="max-w-md" data-testid="dialog-password-confirm-target">
          <DialogHeader>
            <DialogTitle>Confirm Target Deletion</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              To delete target "{targetToDelete?.description}", please enter your admin password for security.
            </p>

            <div className="space-y-2">
              <Label htmlFor="delete-target-password">Admin Password</Label>
              <PasswordInput
                id="delete-target-password"
                placeholder="Enter your password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isVerifyingPassword) {
                    handleVerifyTargetPassword();
                  }
                }}
                disabled={isVerifyingPassword || passwordAttempts >= 3}
                data-testid="input-delete-target-password"
              />
            </div>

            {passwordAttempts > 0 && passwordAttempts < 3 && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {3 - passwordAttempts} attempt(s) remaining
              </p>
            )}

            {passwordAttempts >= 3 && (
              <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                Maximum attempts reached. Please try again later.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelTargetDelete}
              disabled={isVerifyingPassword}
              data-testid="button-cancel-delete-target"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleVerifyTargetPassword}
              disabled={isVerifyingPassword || passwordAttempts >= 3 || !passwordInput}
              data-testid="button-confirm-delete-target"
            >
              {isVerifyingPassword ? "Verifying..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <HoldUserModal
        isOpen={isHoldUserModalOpen}
        userName={userToHold?.name || ""}
        userEmail={userToHold?.email || ""}
        isSubmitting={holdEmployeeMutation.isPending}
        onClose={() => {
          setIsHoldUserModalOpen(false);
          setUserToHold(null);
        }}
        onConfirm={(payload) => {
          if (!userToHold) return;
          holdEmployeeMutation.mutate({ id: userToHold.id, payload });
        }}
      />

      {/* Password Protected Delete Dialog for User Management */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={handlePasswordDialogOpenChange} data-testid="dialog-password-delete">
        <DialogContent className="max-w-md" data-testid="dialog-password-confirm">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              To delete "{userToDelete?.name}", please enter your admin password for security.
            </p>

            <div className="space-y-2">
              <Label htmlFor="delete-password">Admin Password</Label>
              <PasswordInput
                id="delete-password"
                placeholder="Enter your password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isVerifyingPassword) {
                    handleVerifyPassword();
                  }
                }}
                disabled={isVerifyingPassword || passwordAttempts >= 3}
                data-testid="input-delete-password"
              />
            </div>

            {passwordAttempts > 0 && passwordAttempts < 3 && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {3 - passwordAttempts} attempt(s) remaining
              </p>
            )}

            {passwordAttempts >= 3 && (
              <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                Maximum attempts exceeded. You will be logged out.
              </p>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={isVerifyingPassword}
              data-testid="button-cancel-password"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleVerifyPassword}
              disabled={isVerifyingPassword || passwordAttempts >= 3 || !passwordInput}
              data-testid="button-confirm-password"
            >
              {isVerifyingPassword ? 'Verifying...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Team Leader Modal New */}
      <AddTeamLeaderModalNew
        isOpen={isAddTeamLeaderModalNewOpen}
        onClose={() => { setIsAddTeamLeaderModalNewOpen(false); setEditingUser(null); }}
        editData={editingUser && (editingUser.role === 'Team Leader' || editingUser.role === 'team_leader') ? editingUser : null}
        onSubmit={editingUser ? handleUpdateUser : handleAddUser}
      />

      {/* Add Client Credentials Modal */}
      <AddClientCredentialsModal
        isOpen={isAddClientCredentialsModalOpen}
        onClose={() => {
          setIsAddClientCredentialsModalOpen(false);
          setEditingUser(null);
        }}
        editData={
          editingUser &&
          ["client", "client_admin", "client_member", "Client", "Client Admin", "Client Member"].includes(
            String(editingUser.role || ""),
          )
            ? editingUser
            : null
        }
        onSubmit={editingUser ? handleUpdateUser : handleAddClientCredentials}
      />

      {/* Unified Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => {
          setIsAddUserModalOpen(false);
          setEditingUser(null);
        }}
        editData={editingUser}
        onSubmit={handleUnifiedUserSubmit}
      />

      {/* Reassign Requirement Modal */}
      <Dialog open={isReassignModalOpen} onOpenChange={(open) => {
        setIsReassignModalOpen(open);
        if (!open) {
          setSelectedTeamLeadId("");
          setIsReassignConfirmOpen(false);
        }
      }}>
        <DialogContent className="max-w-lg overflow-hidden border-0 p-0">
          <DialogHeader className="border-b border-slate-200 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900">
            <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">Reassign Requirement</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 px-6 py-5">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-950">
              <p className="text-base font-semibold text-slate-900 dark:text-white">{selectedRequirement?.position}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selectedRequirement?.company}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 px-3 py-3 dark:bg-slate-900">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Current Team Lead</p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{selectedRequirement?.teamLead || 'Unassigned'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-3 dark:bg-slate-900">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Talent Advisor</p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{selectedRequirement?.talentAdvisor || 'Unassigned'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Reassign to Team Lead
              </label>
              <Select value={selectedTeamLeadId} onValueChange={setSelectedTeamLeadId}>
                <SelectTrigger className="input-styled h-12 rounded-xl border-slate-200 bg-slate-50 text-slate-900 shadow-sm data-[placeholder]:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:data-[placeholder]:text-slate-500">
                  <SelectValue placeholder={isLoadingTeamLeads ? "Loading..." : "Select Team Lead"} />
                </SelectTrigger>
                <SelectContent>
                  {teamLeads.map((tl) => (
                    <SelectItem key={tl.id} value={tl.id}>
                      {tl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsReassignModalOpen(false);
                  setSelectedTeamLeadId("");
                }}
                className="rounded-md border-slate-300 px-5"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!selectedTeamLeadId) {
                    toast({ title: "Error", description: "Please select a Team Lead", variant: "destructive" });
                    return;
                  }
                  setIsReassignConfirmOpen(true);
                }}
                className="h-10 rounded-md bg-cyan-400 px-5 font-medium text-slate-900 hover:bg-cyan-500"
                disabled={updateRequirementMutation.isPending || !selectedTeamLeadId || isLoadingTeamLeads}
              >
                {updateRequirementMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isReassignConfirmOpen} onOpenChange={setIsReassignConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Reassignment</AlertDialogTitle>
            <AlertDialogDescription>
              This requirement will be reassigned to {teamLeads.find((tl: any) => String(tl.id) === String(selectedTeamLeadId))?.name || 'the selected Team Lead'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                submitReassignment();
              }}
              className="bg-cyan-500 text-slate-900 hover:bg-cyan-600"
            >
              Confirm Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isManageRequirementModalOpen} onOpenChange={(open) => {
        setIsManageRequirementModalOpen(open);
        if (!open) {
          setManageRequirementAction(selectedRequirement?.managementStatus === 'hold' ? 'resume' : '');
          setManageRequirementReason('');
        }
      }}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogHeader className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
            <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              {selectedRequirement?.managementStatus === 'hold' ? 'Update Held Requirement' : 'Manage Requirement'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 px-6 py-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedRequirement?.position}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{selectedRequirement?.company}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">Choose Action</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={manageRequirementAction === getManageActionLabels().primaryValue ? 'default' : 'outline'}
                  onClick={() => setManageRequirementAction(getManageActionLabels().primaryValue)}
                  className={manageRequirementAction === getManageActionLabels().primaryValue
                    ? `${getManageActionLabels().primaryValue === 'resume' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-black'} rounded-[6px] h-11`
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 rounded-[6px] h-11'}
                  data-testid={`button-manage-requirement-${getManageActionLabels().primaryValue}`}
                >
                  {getManageActionLabels().primary}
                </Button>
                <Button
                  type="button"
                  variant={manageRequirementAction === getManageActionLabels().secondaryValue ? 'default' : 'outline'}
                  onClick={() => setManageRequirementAction(getManageActionLabels().secondaryValue)}
                  className={manageRequirementAction === getManageActionLabels().secondaryValue
                    ? 'bg-rose-600 hover:bg-rose-700 text-white rounded-[6px] h-11'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 rounded-[6px] h-11'}
                  data-testid={`button-manage-requirement-${getManageActionLabels().secondaryValue}`}
                >
                  {getManageActionLabels().secondary}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manage-requirement-reason" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Reason for Update
              </Label>
              <Textarea
                id="manage-requirement-reason"
                value={manageRequirementReason}
                onChange={(e) => setManageRequirementReason(e.target.value)}
                placeholder={manageRequirementAction === 'closed'
                  ? 'Enter the reason for closing this requirement.'
                  : manageRequirementAction === 'resume'
                    ? 'Enter the reason for resuming this requirement.'
                    : 'Enter the reason for putting this requirement on hold.'}
                className="min-h-[120px] border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                data-testid="textarea-manage-requirement-reason"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setIsManageRequirementModalOpen(false)}
                className="rounded-[6px] border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitManageRequirement}
                className={`rounded-[6px] ${manageRequirementAction === 'closed' ? 'bg-rose-600 hover:bg-rose-700 text-white' : manageRequirementAction === 'resume' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-amber-400 hover:bg-amber-500 text-black'}`}
                disabled={!manageRequirementAction || !manageRequirementReason.trim() || updateRequirementMutation.isPending || archiveRequirementMutation.isPending}
              >
                {updateRequirementMutation.isPending || archiveRequirementMutation.isPending ? 'Submitting...' : manageRequirementAction === 'resume' ? 'Resume' : 'Submit'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* All Requirements Modal */}
      <Dialog open={isAllRequirementsModalOpen} onOpenChange={(open) => {
        setIsAllRequirementsModalOpen(open);
        if (!open) setAllRequirementsModalSearch('');
      }}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between gap-4">
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                All Requirements ({requirements.length})
              </DialogTitle>
              <div className="flex-shrink-0">
                <SearchBar
                  value={allRequirementsModalSearch}
                  onChange={setAllRequirementsModalSearch}
                  placeholder="Search here"
                  testId="input-search-all-requirements-modal"
                  className="max-w-md"
                />
              </div>
            </div>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm w-[88px]">Req ID</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm w-[200px] max-w-[200px]">Positions</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Company</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">SPOC</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Talent Advisor</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Team Lead</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Criticality</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Resume Count</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements
                    .filter((requirement: Requirement) => {
                      if (!allRequirementsModalSearch) return true;
                      const search = allRequirementsModalSearch.toLowerCase();
                      return (
                        requirement.position?.toLowerCase().includes(search) ||
                        requirement.company?.toLowerCase().includes(search) ||
                        requirement.spoc?.toLowerCase().includes(search) ||
                        requirement.talentAdvisor?.toLowerCase().includes(search) ||
                        requirement.teamLead?.toLowerCase().includes(search) ||
                        requirement.criticality?.toLowerCase().includes(search)
                      );
                    })
                    .map((requirement: Requirement, index: number) => {
                      const criticalityColor = requirement.criticality === 'HIGH' ? 'text-red-600' : requirement.criticality === 'MEDIUM' ? 'text-blue-600' : 'text-gray-600';
                      const resumeCount = (requirement as Requirement & { resumeCount?: string }).resumeCount || "00/00";
                      return (
                        <tr
                          key={requirement.id}
                          title={getRequirementRowTitle(requirement)}
                          className={`border-b border-gray-100 dark:border-gray-800 ${getRequirementRowClassName(requirement, index)}`}
                        >
                          <td className="py-3 px-3 w-[88px] text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {getRequirementDisplayId(requirement)}
                          </td>
                          <td className="py-3 px-3 w-[200px] max-w-[200px] text-gray-900 dark:text-white font-medium text-sm">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="truncate" title={requirement.position}>{requirement.position}</span>
                              {getRequirementStateBadge(requirement)}
                            </div>
                            <div className="text-xs font-normal text-gray-500 dark:text-gray-400 truncate">
                              {(() => {
                                const splitMeta = getRequirementSplitMeta(requirement);
                                const taSplitMeta = getRequirementTaSplitMeta(requirement);
                                const splitBadge = getRequirementSplitBadgeLabel(requirement);
                                return (
                                  <>
                                    {splitMeta?.roleId ? (
                                      <span>Role ID {splitMeta.roleId} • </span>
                                    ) : null}
                                    {requirement.noOfPositions ?? 1} position{(requirement.noOfPositions ?? 1) > 1 ? 's' : ''}
                                    {splitBadge && (
                                      <span
                                        className={taSplitMeta ? " text-purple-700" : " text-indigo-700"}
                                        title={splitBadge.title}
                                      >
                                        {` • ${splitBadge.label}`}
                                        {taSplitMeta?.totalSplits
                                          ? ` (${taSplitMeta.splitIndex}/${taSplitMeta.totalSplits})`
                                          : splitMeta?.totalSplits
                                            ? ` (${splitMeta.splitIndex}/${splitMeta.totalSplits})`
                                            : ""}
                                      </span>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">{requirement.company}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">{requirement.spoc}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">
                            {requirement.talentAdvisor || 'Unassigned'}
                          </td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">
                            {requirement.teamLead || 'N/A'}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${requirement.criticality === 'HIGH' ? 'bg-red-600' : requirement.criticality === 'MEDIUM' ? 'bg-blue-600' : 'bg-gray-600'}`}></span>
                              <span className={`text-sm font-medium ${criticalityColor} dark:text-gray-300`}>
                                {requirement.criticality}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {resumeCount}
                          </td>
                          <td className="py-3 px-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleEditRequirement(requirement)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleManageRequirement(requirement)}>
                                  Manage
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedJD(requirement);
                                  setIsJDPreviewModalOpen(true);
                                }}>
                                  View JD
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReassign(requirement)}>
                                  Reassign
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Metrics Modal */}
      <Dialog open={isMetricsModalOpen} onOpenChange={setIsMetricsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Key Metrics - Full View</DialogTitle>
            <div className="flex gap-2 mt-4">
              <Select value={selectedKeyMetricsClient} onValueChange={setSelectedKeyMetricsClient}>
                <SelectTrigger className="w-40 input-styled rounded" data-testid="select-key-metrics-client-modal">
                  <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.length === 0 ? (
                    <SelectItem value="no-clients" disabled>No Clients</SelectItem>
                  ) : (
                    <>
                      {clients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.brandName || client.incorporatedName || 'Unknown'}
                        </SelectItem>
                      ))}
                      <SelectItem value="all">All Clients</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>

              <Select value={selectedKeyMetricsPeriod} onValueChange={setSelectedKeyMetricsPeriod}>
                <SelectTrigger className="w-40 input-styled rounded" data-testid="select-key-metrics-period-modal">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogHeader>
          <div className="overflow-y-auto">
            <div className="h-[420px] mt-4">
              {!keyAspectsData.chartData || keyAspectsData.chartData.length === 0 ? (
                <div className="flex items-center justify-center w-full h-full bg-gray-50 dark:bg-gray-800 rounded-md border border-dashed border-gray-300 dark:border-gray-600">
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">No metrics data available</p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Data will appear once metrics are recorded</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={keyAspectsData.chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" style={{ fontSize: '12px' }} />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="growthMoM" name="Growth MoM (%)" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="burnRate" name="Burn Rate (%)" stroke="#ff7c7c" strokeWidth={2} />
                    <Line type="monotone" dataKey="churnRate" name="Churn Rate (%)" stroke="#ffc658" strokeWidth={2} />
                    <Line type="monotone" dataKey="attrition" name="Attrition (%)" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pipeline Modal */}
      <Dialog open={isPipelineModalOpen} onOpenChange={setIsPipelineModalOpen}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Pipeline Details</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto pr-2">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Stage</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Count</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Candidates</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { stage: 'SOURCED', count: 15, candidates: 'John Smith, Alice Johnson, Bob Wilson', progress: '100%' },
                    { stage: 'SHORTLISTED', count: 9, candidates: 'John Smith, Alice Johnson, Bob Wilson', progress: '60%' },
                    { stage: 'INTRO CALL', count: 7, candidates: 'John Smith, Alice Johnson', progress: '47%' },
                    { stage: 'ASSIGNMENT', count: 9, candidates: 'John Smith, Alice Johnson, Carol Brown', progress: '60%' },
                    { stage: 'L1', count: 15, candidates: 'John Smith, Alice Johnson, Carol Brown', progress: '100%' },
                    { stage: 'L2', count: 9, candidates: 'John Smith, Alice Johnson', progress: '60%' },
                    { stage: 'L3', count: 3, candidates: 'John Smith', progress: '20%' },
                    { stage: 'FINAL ROUND', count: 9, candidates: 'John Smith, Alice Johnson, Carol Brown', progress: '60%' },
                    { stage: 'HR ROUND', count: 9, candidates: 'John Smith, Alice Johnson', progress: '60%' },
                    { stage: 'OFFER STAGE', count: 9, candidates: 'John Smith, Alice Johnson', progress: '60%' },
                    { stage: 'CLOSURE', count: 3, candidates: 'John Smith', progress: '20%' },
                    { stage: 'OFFER DROP', count: 3, candidates: 'Alice Johnson', progress: '20%' },
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">{row.stage}</td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.count}</td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.candidates}</td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.progress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cashout Modal */}
      <Dialog
        open={isCashoutModalOpen}
        onOpenChange={(open) => {
          // Only allow closing if not in edit mode, or reset edit mode when closing
          if (!open && editingCashout) {
            setEditingCashout(null);
            setCashoutForm({
              month: '',
              year: '',
              employees: '',
              salary: '',
              incentive: '',
              tools: '',
              rent: '',
              others: ''
            });
          }
          setIsCashoutModalOpen(open);
        }}
      >
        <DialogContent className="cash-outflow-modal !flex h-[90vh] max-h-[90vh] w-[95vw] max-w-6xl flex-col gap-0 overflow-hidden p-0 sm:rounded-lg">
          <DialogHeader className="shrink-0 space-y-0 border-b border-gray-200 px-6 py-4 pr-14 dark:border-gray-700">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <DialogTitle className="text-left text-lg font-semibold">
                All Cash Outflow Data
              </DialogTitle>
              <div className="w-full shrink-0 sm:w-72">
                <SearchBar
                  value={cashoutSearch}
                  onChange={setCashoutSearch}
                  placeholder="Search cash outflow..."
                  testId="input-search-cash-outflow"
                />
              </div>
            </div>
          </DialogHeader>
          <div className="cash-outflow-modal__body admin-scrollbar min-h-0 flex-1 overscroll-contain px-6 py-3">
            <table className="w-full min-w-[880px] border-collapse text-sm">
              <thead className="sticky top-0 z-[1] bg-gray-50 dark:bg-gray-900">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">
                    Month
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">
                    Year
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">
                    Employees Count
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">
                    Total Salary
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">
                    Incentives
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">
                    Tools Cost
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">
                    Rent
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">
                    Others Cost
                  </th>
                  <th className="w-[72px] px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoadingCashout ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                      Loading cash outflow data...
                    </td>
                  </tr>
                ) : filteredCashoutData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                      {cashoutSearch ? 'No matching cash outflow data found' : 'No cash outflow data found'}
                    </td>
                  </tr>
                ) : (
                  filteredCashoutData.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                    >
                      <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">
                        {row.month}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{row.year}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                        {row.employees}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                        ₹{row.salary.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                        ₹{row.incentive.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                        ₹{row.tools.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                        ₹{row.rent.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                        ₹{row.others.toLocaleString('en-IN')}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                              data-testid={`button-actions-cashout-all-${row.id}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCashout(row);
                                setIsCashoutModalOpen(false);
                              }}
                              className="cursor-pointer"
                              data-testid={`button-edit-cashout-all-${row.id}`}
                            >
                              <EditIcon className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCashout(row.id, `${row.month} ${row.year}`);
                                setIsCashoutModalOpen(false);
                              }}
                              className="cursor-pointer text-red-600 focus:text-red-600"
                              data-testid={`button-delete-cashout-all-${row.id}`}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Database View Modal */}
      <Dialog open={isDatabaseModalOpen} onOpenChange={setIsDatabaseModalOpen}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Full Database View</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto pr-2">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Employee ID</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Name</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Team</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Total Applicants</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Uploads</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} className="py-8 px-3 text-center text-gray-500 dark:text-gray-400">
                      No database records available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New Client Modal - Comprehensive Form */}
      <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
        <DialogContent className="master-modal-dialog flex max-h-[90vh] w-[95vw] max-w-2xl flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-hide px-1 py-2">
          <div className="space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Brand Name *"
                  className="input-styled rounded"
                  value={clientForm.brandName}
                  onChange={(e) => setClientForm({ ...clientForm, brandName: e.target.value })}
                  data-testid="input-brand-name"
                />
              </div>
              <div>
                <Input
                  placeholder="Incorporated Name"
                  className="input-styled rounded"
                  value={clientForm.incorporatedName}
                  onChange={(e) => setClientForm({ ...clientForm, incorporatedName: e.target.value })}
                  data-testid="input-incorporated-name"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="GSTIN"
                  className="input-styled rounded"
                  value={clientForm.gstin}
                  onChange={(e) => setClientForm({ ...clientForm, gstin: e.target.value })}
                  data-testid="input-gstin"
                />
              </div>
              <div>
                <Input
                  placeholder="Address"
                  className="input-styled rounded"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  data-testid="input-address"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Location"
                  className="input-styled rounded"
                  value={clientForm.location}
                  onChange={(e) => setClientForm({ ...clientForm, location: e.target.value })}
                  data-testid="input-location"
                />
              </div>
              <div>
                <Input
                  placeholder="SPOC"
                  className="input-styled rounded"
                  value={clientForm.spoc}
                  onChange={(e) => setClientForm({ ...clientForm, spoc: e.target.value })}
                  data-testid="input-spoc"
                />
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Email *"
                  type="email"
                  className="input-styled rounded"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  data-testid="input-email"
                />
              </div>
              <div>
                <Input
                  placeholder="Website"
                  className="input-styled rounded"
                  value={clientForm.website}
                  onChange={(e) => setClientForm({ ...clientForm, website: e.target.value })}
                  data-testid="input-website"
                />
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="LinkedIn"
                  className="input-styled rounded"
                  value={clientForm.linkedin}
                  onChange={(e) => setClientForm({ ...clientForm, linkedin: e.target.value })}
                  data-testid="input-linkedin"
                />
              </div>
              <div>
                <Select
                  value={clientForm.agreement}
                  onValueChange={(value) => setClientForm({ ...clientForm, agreement: value })}
                >
                  <SelectTrigger className="input-styled rounded" data-testid="select-agreement">
                    <SelectValue placeholder="Agreement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Signup Pending">Signup Pending</SelectItem>
                    <SelectItem value="Signup Completed">Signup Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 5b - Client Type & Partner */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  value={clientForm.clientType}
                  onValueChange={(value) =>
                    setClientForm({ ...clientForm, clientType: value as 'direct' | 'partnership', partnerId: value === 'direct' ? '' : clientForm.partnerId })
                  }
                >
                  <SelectTrigger className="input-styled rounded" data-testid="select-client-type">
                    <SelectValue placeholder="Client Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select
                  value={clientForm.partnerId}
                  onValueChange={(value) => setClientForm({ ...clientForm, partnerId: value })}
                  disabled={clientForm.clientType !== 'partnership'}
                >
                  <SelectTrigger className="input-styled rounded" data-testid="select-partner-name">
                    <SelectValue placeholder="Partner Name" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Partner list – Master Data clients that can act as partners */}
                    {masterDataClients.map((client: any) => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {client.brandName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 6 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  placeholder="Percentage"
                  type="number"
                  min="0"
                  max="100"
                  className="input-styled rounded pr-8"
                  value={clientForm.percentage}
                  onChange={(e) => setClientForm({ ...clientForm, percentage: e.target.value })}
                  data-testid="input-percentage"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">%</span>
              </div>
              <div>
                <Select
                  value={clientForm.currentStatus}
                  onValueChange={(value) => setClientForm({ ...clientForm, currentStatus: value })}
                >
                  <SelectTrigger className="input-styled rounded" data-testid="select-active">
                    <SelectValue placeholder="Active" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="frozen">Frozen</SelectItem>
                    <SelectItem value="churned">Churned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 7 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  value={clientForm.category}
                  onValueChange={(value) => setClientForm({ ...clientForm, category: value })}
                >
                  <SelectTrigger className="input-styled rounded" data-testid="select-category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  placeholder="Payment terms"
                  className="input-styled rounded"
                  value={clientForm.paymentTerms}
                  onChange={(e) => setClientForm({ ...clientForm, paymentTerms: e.target.value })}
                  data-testid="input-payment-terms"
                />
              </div>
            </div>

            {/* Row 8 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  value={clientForm.source}
                  onValueChange={(value) => setClientForm({ ...clientForm, source: value })}
                >
                  <SelectTrigger className="input-styled rounded" data-testid="select-source">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Outbound Lead (Sales)">Outbound Lead (Sales)</SelectItem>
                    <SelectItem value="Client Referral">Client Referral</SelectItem>
                    <SelectItem value="VC Referral">VC Referral</SelectItem>
                    <SelectItem value="Inbound Lead">Inbound Lead</SelectItem>
                    <SelectItem value="Other Referral">Other Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1 block">Start Date :</Label>
                <StandardDatePicker
                  value={clientStartDate}
                  onChange={(date) => {
                    setClientStartDate(date);
                    setClientForm({ ...clientForm, startDate: date ? format(date, "yyyy-MM-dd") : '' });
                  }}
                  placeholder="dd-mm-yyyy"
                  className="input-styled w-full rounded"
                />
              </div>
            </div>

            {/* Row 9 - Company Logo */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Company Logo</Label>
                <div className="flex items-center gap-4">
                  {clientLogoPreview && (
                    <div className="w-20 h-20 border border-gray-300 rounded-lg overflow-hidden">
                      <img src={clientLogoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setClientLogoFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setClientLogoPreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="input-styled rounded"
                      data-testid="input-company-logo"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <Button
                className="rounded bg-[#2563EB] px-8 py-2 font-medium text-white shadow-sm hover:bg-blue-700"
                onClick={async () => {
                  if (!clientForm.brandName || !clientForm.email) {
                    toast({
                      title: "Validation Error",
                      description: "Please fill in Brand Name and Email (required fields)",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  // If logo file is selected, upload it first
                  let logoUrl = clientForm.logo;
                  if (clientLogoFile) {
                    try {
                      const formData = new FormData();
                      formData.append('logo', clientLogoFile);
                      const uploadResponse = await fetch('/api/admin/upload-logo', {
                        method: 'POST',
                        credentials: 'include',
                        body: formData
                      });
                      if (uploadResponse.ok) {
                        const uploadData = await uploadResponse.json();
                        logoUrl = uploadData.url;
                      }
                    } catch (error) {
                      console.error('Logo upload error:', error);
                    }
                  }
                  
                  createClientMutation.mutate({ ...clientForm, logo: logoUrl });
                }}
                disabled={createClientMutation.isPending}
                data-testid="button-submit-client"
              >
                {createClientMutation.isPending ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Employee Modal */}
      <Dialog open={isEmployeeModalOpen} onOpenChange={setIsEmployeeModalOpen}>
        <DialogContent className="master-modal-dialog flex max-h-[90vh] w-[95vw] max-w-2xl flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-hide px-1 py-2">
          <div className="space-y-4">
            {/* Row 1 - Employee ID (read-only/auto-generated) and Employee Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Employee ID"
                  className="input-styled rounded bg-gray-50 dark:bg-gray-800"
                  value={employeeForm.employeeId || 'Unique ID (Auto-generated)'}
                  readOnly
                  data-testid="input-employee-id"
                />
              </div>
              <div>
                <Input
                  placeholder="Employee Name *"
                  className="input-styled rounded"
                  value={employeeForm.name}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                  data-testid="input-employee-name"
                />
              </div>
            </div>

            {/* Row 2 - Address and Designation */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Address"
                  className="input-styled rounded"
                  value={employeeForm.address}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })}
                  data-testid="input-address"
                />
              </div>
              <div>
                <Input
                  placeholder="Designation"
                  className="input-styled rounded"
                  value={employeeForm.designation}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, designation: e.target.value })}
                  data-testid="input-designation"
                />
              </div>
            </div>

            {/* Row 3 - Email and Mobile Number */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Email *"
                  type="email"
                  className="input-styled rounded"
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                  data-testid="input-employee-email"
                />
              </div>
              <div>
                <Input
                  placeholder="Mobile Number"
                  className="input-styled rounded"
                  value={employeeForm.phone}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                  data-testid="input-phone"
                />
              </div>
            </div>

            {/* Row 4 - Date of Joining and Employment Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col w-full">
                <Label className="text-sm font-medium text-gray-700 mb-1">Joining Date :</Label>
                <StandardDatePicker
                  value={employeeForm.joiningDate ? new Date(employeeForm.joiningDate) : undefined}
                  onChange={(date) => setEmployeeForm({ ...employeeForm, joiningDate: date ? date.toISOString().split('T')[0] : '' })}
                  placeholder="dd-mm-yyyy"
                  maxDate={new Date()}
                  className="input-styled w-full rounded"
                />
              </div>
              <div className="flex flex-col w-full">
                <Select
                  value={employeeForm.employmentStatus}
                  onValueChange={(value) => setEmployeeForm({ ...employeeForm, employmentStatus: value })}
                >
                  <SelectTrigger className="input-styled rounded w-full" data-testid="select-employment-status">
                    <SelectValue placeholder="Employment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 5 - ESIC and EPFO */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  value={employeeForm.esic}
                  onValueChange={(value) => setEmployeeForm({ ...employeeForm, esic: value })}
                >
                  <SelectTrigger className="input-styled rounded" data-testid="select-esic">
                    <SelectValue placeholder="ESIC" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={employeeForm.epfo}
                  onValueChange={(value) => setEmployeeForm({ ...employeeForm, epfo: value })}
                >
                  <SelectTrigger className="input-styled rounded" data-testid="select-epfo">
                    <SelectValue placeholder="EPFO" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 6 - ESIC.No and EPFO.No */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="ESIC.No"
                  className="input-styled rounded"
                  value={employeeForm.esicNo}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, esicNo: e.target.value })}
                  data-testid="input-esic-no"
                />
              </div>
              <div>
                <Input
                  placeholder="EPFO.No"
                  className="input-styled rounded"
                  value={employeeForm.epfoNo}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, epfoNo: e.target.value })}
                  data-testid="input-epfo-no"
                />
              </div>
            </div>

            {/* Row 7 - DoB and Mother Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col w-full">
                <Label className="text-sm font-medium text-gray-700 mb-1">Date of Birth :</Label>
                <StandardDatePicker
                  value={employeeForm.fatherName ? new Date(employeeForm.fatherName) : undefined}
                  onChange={(date) => setEmployeeForm({ ...employeeForm, fatherName: date ? date.toISOString().split('T')[0] : '' })}
                  placeholder="dd-mm-yyyy"
                  maxDate={new Date()}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col w-full">
                <Input
                  type="text"
                  placeholder="Mother Name"
                  className="input-styled rounded w-full"
                  value={employeeForm.motherName}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, motherName: e.target.value })}
                  data-testid="input-mother-name"
                />
              </div>
            </div>

            {/* Row 8 - Father's contact number and Mother's Number */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Father's Contact Number"
                  className="input-styled rounded"
                  value={employeeForm.fatherNumber}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, fatherNumber: e.target.value })}
                  data-testid="input-father-number"
                />
              </div>
              <div>
                <Input
                  placeholder="Mother's Contact Number"
                  className="input-styled rounded"
                  value={employeeForm.motherNumber}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, motherNumber: e.target.value })}
                  data-testid="input-mother-number"
                />
              </div>
            </div>

            {/* Row 9 - Offered CTC and Current Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Offered CTC"
                  className="input-styled rounded"
                  value={employeeForm.offeredCtc}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, offeredCtc: e.target.value })}
                  data-testid="input-offered-ctc"
                />
              </div>
              <div>
                <Select
                  value={employeeForm.currentStatus}
                  onValueChange={(value) => setEmployeeForm({ ...employeeForm, currentStatus: value })}
                >
                  <SelectTrigger className="input-styled rounded" data-testid="select-current-status">
                    <SelectValue placeholder="Current Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Probation">Probation</SelectItem>
                    <SelectItem value="Notice Period">Notice Period</SelectItem>
                    <SelectItem value="Resigned">Resigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 10 - Increment Count and Appraised Quarter */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  value={employeeForm.incrementCount}
                  onValueChange={(value) => setEmployeeForm({ ...employeeForm, incrementCount: value })}
                >
                  <SelectTrigger className="input-styled rounded" data-testid="select-increment-count">
                    <SelectValue placeholder="Increment Count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5+">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={employeeForm.appraisedQuarter}
                  onValueChange={(value) => setEmployeeForm({ ...employeeForm, appraisedQuarter: value })}
                >
                  <SelectTrigger className="input-styled rounded" data-testid="select-appraised-quarter">
                    <SelectValue placeholder="Appraised Quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">Q1</SelectItem>
                    <SelectItem value="Q2">Q2</SelectItem>
                    <SelectItem value="Q3">Q3</SelectItem>
                    <SelectItem value="Q4">Q4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 11 - Appraised Amount and Appraised Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Appraised Amount"
                  className="input-styled rounded"
                  value={employeeForm.appraisedAmount}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, appraisedAmount: e.target.value })}
                  data-testid="input-appraised-amount"
                />
              </div>
              <div>
                <Select
                  value={employeeForm.appraisedYear}
                  onValueChange={(value) => setEmployeeForm({ ...employeeForm, appraisedYear: value })}
                >
                  <SelectTrigger className="input-styled rounded" data-testid="select-appraised-year">
                    <SelectValue placeholder="Appraised Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 12 - Yearly CTC and Current Monthly CTC */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Yearly CTC"
                  className="input-styled rounded"
                  value={employeeForm.yearlyCTC}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, yearlyCTC: e.target.value })}
                  data-testid="input-yearly-ctc"
                />
              </div>
              <div>
                <Input
                  placeholder="Current Monthly CTC"
                  className="input-styled rounded"
                  value={employeeForm.currentMonthlyCTC}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, currentMonthlyCTC: e.target.value })}
                  data-testid="input-current-monthly-ctc"
                />
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bank Details</h3>

              {/* Row 13 - Name as per Bank and Account Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    placeholder="Name as per Bank"
                    className="input-styled rounded"
                    value={employeeForm.nameAsPerBank}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, nameAsPerBank: e.target.value })}
                    data-testid="input-name-as-per-bank"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Account Number"
                    className="input-styled rounded"
                    value={employeeForm.accountNumber}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, accountNumber: e.target.value })}
                    data-testid="input-account-number"
                  />
                </div>
              </div>

              {/* Row 14 - IFSC Code and Bank Name */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Input
                    placeholder="IFSC Code"
                    className="input-styled rounded"
                    value={employeeForm.ifscCode}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, ifscCode: e.target.value })}
                    data-testid="input-ifsc-code"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Bank Name"
                    className="input-styled rounded"
                    value={employeeForm.bankName}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, bankName: e.target.value })}
                    data-testid="input-bank-name"
                  />
                </div>
              </div>

              {/* Row 15 - Branch and City */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Input
                    placeholder="Branch"
                    className="input-styled rounded"
                    value={employeeForm.branch}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, branch: e.target.value })}
                    data-testid="input-branch"
                  />
                </div>
                <div>
                  <Input
                    placeholder="City"
                    className="input-styled rounded"
                    value={employeeForm.city}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, city: e.target.value })}
                    data-testid="input-city"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <Button
                className="rounded bg-[#2563EB] px-8 py-2 font-medium text-white shadow-sm hover:bg-blue-700"
                onClick={() => {
                  if (!employeeForm.name || !employeeForm.email) {
                    toast({
                      title: "Validation Error",
                      description: "Please fill in all required fields (Name, Email)",
                      variant: "destructive",
                    });
                    return;
                  }
                  createEmployeeMutation.mutate(employeeForm);
                }}
                disabled={createEmployeeMutation.isPending}
                data-testid="button-submit-employee"
              >
                {createEmployeeMutation.isPending ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Master View More Modal */}
      <Dialog open={isClientMasterModalOpen} onOpenChange={setIsClientMasterModalOpen}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <DialogTitle>Client Master - Full Table</DialogTitle>
              <SearchBar
                value={clientMasterSearch}
                onChange={setClientMasterSearch}
                placeholder="Search clients..."
                testId="input-search-clients"
              />
            </div>
          </DialogHeader>
          <div className="overflow-y-auto pr-2">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Client Code</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Brand Name</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Location</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">SPOC</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Website</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Current Status</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingClients ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">Loading clients...</td>
                    </tr>
                  ) : filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">{clientMasterSearch ? 'No matching clients found' : 'No clients found. Click "+ Add Client" to add one.'}</td>
                    </tr>
                  ) : (
                    filteredClients.map((row: any, index: number) => {
                      const statusClass = row.currentStatus === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        row.currentStatus === 'frozen' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
                      return (
                        <tr key={row.id || index} className={`border-b border-gray-100 dark:border-gray-800 ${index % 2 === 0 ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">{row.clientCode}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.brandName}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.location || 'N/A'}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.spoc || 'N/A'}</td>
                          <td className="py-3 px-3 text-blue-600 dark:text-blue-400">{row.website || 'N/A'}</td>
                          <td className="py-3 px-3">
                            <span className={`${statusClass} text-sm font-semibold px-3 py-1 rounded-full`}>• {(row.currentStatus || 'active').toUpperCase()}</span>
                          </td>
                          <td className="py-3 px-3">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete client "${row.brandName}"?`)) {
                                  deleteClientMutation.mutate(row.id);
                                }
                              }}
                              disabled={deleteClientMutation.isPending}
                              data-testid={`button-delete-client-${row.id}`}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Increment Modal */}
      <Dialog
        open={isIncrementModalOpen}
        onOpenChange={(open) => {
          setIsIncrementModalOpen(open);
          if (!open) {
            resetIncrementForm();
          }
        }}
      >
        <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Increment</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Select Employee</Label>
                <Popover open={isIncrementEmployeePickerOpen} onOpenChange={setIsIncrementEmployeePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between border-gray-200 bg-gray-50 font-normal text-left hover:bg-gray-100"
                    >
                      <span className={selectedIncrementEmployee ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>
                        {selectedIncrementEmployee
                          ? `${selectedIncrementEmployee.name} (${selectedIncrementEmployee.employeeId})`
                          : 'Select Talent Advisor or Team Leader'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[420px] p-3" align="start">
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          value={incrementEmployeeSearch}
                          onChange={(e) => setIncrementEmployeeSearch(e.target.value)}
                          placeholder="Search by name, mail, ID, or role"
                          className={`border-gray-200 bg-gray-50 pl-9 ${incrementEmployeeSearch ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 placeholder:text-gray-400 dark:placeholder:text-gray-500'}`}
                        />
                      </div>
                      <div className="max-h-64 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700">
                        {filteredIncrementEmployees.length === 0 ? (
                          <div className="px-3 py-6 text-sm text-center text-gray-500">
                            No matching employees found.
                          </div>
                        ) : (
                          filteredIncrementEmployees.map((employee: any) => (
                            <button
                              key={employee.id}
                              type="button"
                              onClick={() => {
                                setIncrementForm((prev) => ({ ...prev, selectedEmployeeId: employee.id }));
                                setIsIncrementEmployeePickerOpen(false);
                              }}
                              className="flex w-full items-start justify-between border-b border-gray-100 px-3 py-3 text-left last:border-b-0 hover:bg-blue-50 dark:border-gray-800 dark:hover:bg-blue-900/20"
                            >
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{employee.name}</div>
                                <div className="text-xs text-gray-500">{employee.email || 'No email'}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-medium text-blue-700 dark:text-blue-300">{employee.employeeId || employee.id}</div>
                                <div className="text-xs text-gray-500">
                                  {employee.role === 'team_leader' ? 'Team Leader' : 'Talent Advisor'}
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Selected Employee Mail</Label>
                <Input
                  value={selectedIncrementEmployee?.email || ''}
                  readOnly
                  placeholder="Employee mail will appear here"
                  className={`border-gray-200 bg-gray-50 ${selectedIncrementEmployee?.email ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 placeholder:text-gray-400 dark:placeholder:text-gray-500'}`}
                />
              </div>

              <div className="space-y-2">
                <Label>Selected Employee ID</Label>
                <Input
                  value={selectedIncrementEmployee?.employeeId || selectedIncrementEmployee?.id || ''}
                  readOnly
                  placeholder="Employee ID will appear here"
                  className={`border-gray-200 bg-gray-50 ${selectedIncrementEmployee?.employeeId || selectedIncrementEmployee?.id ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 placeholder:text-gray-400 dark:placeholder:text-gray-500'}`}
                />
              </div>

              <div className="space-y-2">
                <Label>Increment Type</Label>
                <Select
                  value={incrementForm.incrementType}
                  onValueChange={(value) => setIncrementForm((prev) => ({ ...prev, incrementType: value }))}
                >
                  <SelectTrigger className="border-gray-200 bg-gray-50">
                    <SelectValue placeholder="Select increment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Increment Percentage (%) or Amount</Label>
                <div className="grid grid-cols-[160px_minmax(0,1fr)] gap-2">
                  <Select
                    value={incrementForm.incrementValueType}
                    onValueChange={(value) => setIncrementForm((prev) => ({ ...prev, incrementValueType: value }))}
                  >
                    <SelectTrigger className="border-gray-200 bg-gray-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={incrementForm.incrementValue}
                    onChange={(e) => setIncrementForm((prev) => ({ ...prev, incrementValue: e.target.value }))}
                    placeholder={incrementForm.incrementValueType === 'percentage' ? 'e.g. 12' : 'e.g. 50000'}
                    className={`border-gray-200 bg-gray-50 ${incrementForm.incrementValue ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 placeholder:text-gray-400 dark:placeholder:text-gray-500'}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Current Salary / CTC</Label>
                <Input
                  value={selectedEmployeeCurrentCtc}
                  readOnly
                  placeholder="Current salary / CTC will appear here"
                  className={`border-gray-200 bg-gray-50 ${selectedEmployeeCurrentCtc ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 placeholder:text-gray-400 dark:placeholder:text-gray-500'}`}
                />
              </div>

              <div className="space-y-2">
                <Label>New Revised Salary / CTC</Label>
                <Input
                  value={incrementForm.revisedCtc}
                  onChange={(e) => setIncrementForm((prev) => ({ ...prev, revisedCtc: e.target.value }))}
                  placeholder="Enter revised salary / CTC"
                  className={`border-gray-200 bg-gray-50 ${incrementForm.revisedCtc ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 placeholder:text-gray-400 dark:placeholder:text-gray-500'}`}
                />
              </div>

              <div className="space-y-2">
                <Label>Effective Date of Increment</Label>
                <StandardDatePicker
                  value={incrementEffectiveDate}
                  onChange={setIncrementEffectiveDate}
                  placeholder="Select effective date"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsIncrementModalOpen(false);
                resetIncrementForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                toast({
                  title: 'Frontend ready',
                  description: 'Increment form UI is ready. Backend flow can be connected next.',
                });
                setIsIncrementModalOpen(false);
                resetIncrementForm();
              }}
            >
              Save Increment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Master View More Modal */}
      <Dialog open={isEmployeeMasterModalOpen} onOpenChange={setIsEmployeeMasterModalOpen}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <DialogTitle>Employee Master - Full Table</DialogTitle>
              <SearchBar
                value={employeeMasterSearch}
                onChange={setEmployeeMasterSearch}
                placeholder="Search employees..."
                testId="input-search-employees"
              />
            </div>
          </DialogHeader>
          <div className="overflow-y-auto pr-2">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Employee ID</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Name</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Father's Name</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Employee Status</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Date of Joining</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Current CTC</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingEmployees ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">Loading employees...</td>
                    </tr>
                  ) : filteredHrEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">{employeeMasterSearch ? 'No matching employees found' : 'No employees found. Click "+ Add Employee" to add one.'}</td>
                    </tr>
                  ) : (
                    filteredHrEmployees.map((row: any, index: number) => (
                      <tr key={row.id || index} className={`border-b border-gray-100 dark:border-gray-800 ${index % 2 === 0 ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                        <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">{row.employeeId}</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.name}</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">-</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.role || 'N/A'}</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.joiningDate || 'N/A'}</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">-</td>
                        <td className="py-3 px-3">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete employee "${row.name}"?`)) {
                                deleteEmployeeMutation.mutate(row.id);
                              }
                            }}
                            disabled={deleteEmployeeMutation.isPending}
                            data-testid={`button-delete-employee-${row.id}`}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resume Database View More Modal */}
      <Dialog open={isResumeDatabaseModalOpen} onOpenChange={setIsResumeDatabaseModalOpen}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <DialogTitle>Resume Database - Full Table</DialogTitle>
              <SearchBar
                value={resumeDatabaseSearch}
                onChange={setResumeDatabaseSearch}
                placeholder="Search database..."
                testId="input-search-resume-database"
              />
            </div>
          </DialogHeader>
          <div className="overflow-y-auto pr-2 flex-1">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Candidate ID</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Name</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Role</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Email</th>
                    <th className="text-left p-2 font-medium text-gray-700 dark:text-gray-300 text-sm">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingCandidates ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">Loading candidates...</td>
                    </tr>
                  ) : filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">{resumeDatabaseSearch ? 'No matching candidates found' : 'No candidates found. Click "+ Add Employee" to add one.'}</td>
                    </tr>
                  ) : (
                    filteredCandidates.map((row: any, index: number) => (
                      <tr key={row.id || index} className={`border-b border-gray-100 dark:border-gray-800 ${index % 2 === 0 ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                        <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">{row.candidateId || '-'}</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.fullName || '-'}</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.currentRole || row.position || '-'}</td>
                        <td className="py-3 px-3 text-blue-600 dark:text-blue-400">{row.email || '-'}</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.location || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => setIsResumeDatabaseModalOpen(false)}
              data-testid="button-close-resume-modal"
            >
              Close
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setIsResumeDatabaseModalOpen(false);
                sessionStorage.setItem('adminDashboardSidebarTab', sidebarTab);
                sessionStorage.setItem('masterDatabaseTab', 'resume');
                navigate('/master-database');
              }}
              data-testid="button-view-full-database"
            >
              View Full Database
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Performance Data Modal */}
      <Dialog open={isPerformanceDataModalOpen} onOpenChange={setIsPerformanceDataModalOpen}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">Performance Data - {displayPerformanceMetrics?.currentQuarter || 'Q1 2024'}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto pr-2 max-h-[calc(85vh-120px)]">
            {/* Performance Summary Cards - Using API data */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-cyan-200 dark:border-cyan-800">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Minimum Target</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-min-target">
                    ₹{(displayPerformanceMetrics?.minimumTarget ?? 0).toLocaleString('en-IN')}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Target Achieved</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-achieved-target">
                    ₹{(displayPerformanceMetrics?.targetAchieved ?? 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                    {displayPerformanceMetrics?.performancePercentage ?? 0}% Performance
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Closures</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-total-closures">
                    {displayPerformanceMetrics?.closuresCount ?? 0}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Incentives</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-total-incentives">
                    ₹{(displayPerformanceMetrics?.incentiveEarned ?? 0).toLocaleString('en-IN')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Performance Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Resource</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Role</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Quarter</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Minimum Target</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Target Achieved</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Performance %</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Closures</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Incentives</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingTargets ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500 dark:text-gray-400">
                        Loading performance data...
                      </td>
                    </tr>
                  ) : targetMappings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No performance data available yet
                      </td>
                    </tr>
                  ) : (
                    targetMappings.slice(0, 10).map((row: any, index) => {
                      const targetValue = typeof row.minimumTarget === 'number' ? row.minimumTarget : parseInt(String(row.minimumTarget).replace(/,/g, ''), 10);
                      const achievedValue = typeof row.targetAchieved === 'number' ? row.targetAchieved : parseInt(String(row.targetAchieved).replace(/,/g, ''), 10);
                      const performancePercent = targetValue > 0 ? ((achievedValue / targetValue) * 100).toFixed(2) : '0.00';
                      const performanceColor = parseFloat(performancePercent) >= 80 ? 'text-green-600 dark:text-green-400' :
                        parseFloat(performancePercent) >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400';

                      return (
                        <tr key={row.id || index} className={`border-b border-gray-100 dark:border-gray-800 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/50' : ''}`}>
                          <td className="py-3 px-3 text-gray-900 dark:text-white font-medium" data-testid={`text-resource-${index}`}>{row.teamMemberName || 'N/A'}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.teamMemberRole || 'N/A'}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.quarter}-{row.year}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">₹{targetValue.toLocaleString()}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">₹{achievedValue.toLocaleString()}</td>
                          <td className={`py-3 px-3 font-semibold ${performanceColor}`}>{performancePercent}%</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{row.closures || 0}</td>
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">₹{(row.incentives || 0).toLocaleString()}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Performance Data Confirmation Dialog */}
      <AlertDialog open={isResetPerformanceConfirmOpen} onOpenChange={setIsResetPerformanceConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Performance Data</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all performance data? This will permanently delete all target mappings, revenue mappings, and related data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-reset-performance">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetPerformanceDataMutation.mutate();
                setIsResetPerformanceConfirmOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              data-testid="button-confirm-reset-performance"
            >
              Reset Performance Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Master Data Confirmation Dialog */}
      <AlertDialog open={isResetMasterDataConfirmOpen} onOpenChange={setIsResetMasterDataConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Master Data</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all master data? This will permanently delete all resume/candidate records and deliveries. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-reset-master">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetMasterDataMutation.mutate();
                setIsResetMasterDataConfirmOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              data-testid="button-confirm-reset-master"
            >
              Reset Master Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Download Confirmation Dialog */}
      <AlertDialog open={showDownloadConfirm} onOpenChange={setShowDownloadConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Download</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to download this report? The file will be generated based on your selected filters and format.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-download">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDownload}
              className="bg-cyan-400 hover:bg-cyan-500 text-black"
              data-testid="button-confirm-download"
            >
              Confirm Download
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Alert */}
      {showAlert && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 shadow-lg z-50 rounded w-80 overflow-hidden animate-in slide-in-from-right duration-300">
          <div className="p-4 text-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium">{alertMessage}</span>
            </div>
          </div>
          <div className="h-1 bg-green-500 animate-pulse"></div>
        </div>
      )}


      {/* Performance Graph Modal */}
      <Dialog open={isPerformanceGraphModalOpen} onOpenChange={setIsPerformanceGraphModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Overall Performance - Detailed View</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 p-1">
            <div className="flex flex-wrap items-end gap-4">
              <Select value={selectedDailyMetricsTeam} onValueChange={setSelectedDailyMetricsTeam}>
                <SelectTrigger className={`w-44 h-9 ${ADMIN_FILTER_SELECT_CLASS}`} data-testid="select-performance-modal-team">
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overall">Overall</SelectItem>
                    {employees
                      .filter((emp: Employee) => emp.role === 'team_leader' && emp.isActive)
                      .map((teamLeader: Employee) => (
                        <SelectItem key={teamLeader.id} value={teamLeader.id}>
                          {teamLeader.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              <StandardDatePicker
                value={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
                placeholder="Select date"
                className={`w-44 h-9 ${ADMIN_FILTER_DATE_CLASS}`}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Delivered (selected day)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Required (daily target)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-0.5 border-t-2 border-dashed border-gray-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Benchmark ({performanceBenchmark})</span>
              </div>
            </div>
            <div className="h-[420px]">
              <PerformanceChart
                data={performanceData}
                height="100%"
                benchmarkValue={performanceBenchmark}
                showDualLines
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revenue Graph Modal */}
      <Dialog open={isRevenueGraphModalOpen} onOpenChange={setIsRevenueGraphModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Revenue Analysis - Detailed View</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Filters Section */}
            <div className="flex flex-row gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Team</label>
                <Select value={revenueTeam} onValueChange={setRevenueTeam}>
                  <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" data-testid="select-revenue-team">
                    <SelectValue placeholder="All Teams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teamLeads.map((tl: any) => (
                      <SelectItem key={tl.id} value={tl.id}>
                        {tl.name} (TL)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">From</label>
                <Input
                  type="date"
                  value={revenueDateFrom ? format(revenueDateFrom, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setRevenueDateFrom(date);
                  }}
                  className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  data-testid="input-revenue-date-from"
                />
              </div>

              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">To</label>
                <Input
                  type="date"
                  value={revenueDateTo ? format(revenueDateTo, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setRevenueDateTo(date);
                  }}
                  className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  data-testid="input-revenue-date-to"
                />
              </div>

              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Period</label>
                <Select value={revenuePeriod} onValueChange={setRevenuePeriod}>
                  <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" data-testid="select-revenue-period">
                    <SelectValue placeholder="Monthly" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-start space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Team Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-green-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Average Benchmark (₹{(revenueBenchmark / 1000).toFixed(0)}K)
                </span>
              </div>
            </div>
            <div className="h-[420px]">
              <RevenueChart
                data={revenueData}
                height="100%"
                benchmarkValue={revenueBenchmark}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Master Database Confirmation Modal */}
      <AlertDialog open={masterDbConfirmationOpen} onOpenChange={setMasterDbConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Open Master Database</AlertDialogTitle>
            <AlertDialogDescription>
              This will open the Master Database page. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                sessionStorage.setItem('adminDashboardSidebarTab', sidebarTab);
                sessionStorage.setItem('masterDatabaseTab', masterDbConfirmationTab);
                navigate('/master-database');
                setMasterDbConfirmationOpen(false);
              }}
            >
              Open
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Client Metrics Modal */}
      <Dialog open={isClientMetricsModalOpen} onOpenChange={setIsClientMetricsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto print-visible">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Client Metrics - Full View</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Header Section */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Speed Metrics</h2>
              <div className="flex items-center gap-4">
                {/* Date/Period Selector */}
                {clientMetricsPeriod === "daily" && (
                  <StandardDatePicker
                    value={clientMetricsDate}
                    onChange={setClientMetricsDate}
                    placeholder="Select date"
                    className="w-auto"
                  />
                )}

                {clientMetricsPeriod === "weekly" && (
                  <StandardDatePicker
                    value={clientMetricsWeekStart}
                    onChange={setClientMetricsWeekStart}
                    placeholder="Select start date"
                    className="w-auto"
                  />
                )}

                {clientMetricsPeriod === "monthly" && (
                  <div className="flex items-center gap-2">
                    <Select value={clientMetricsMonth} onValueChange={setClientMetricsMonth}>
                      <SelectTrigger className="w-32" data-testid="select-client-metrics-month">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="January">January</SelectItem>
                        <SelectItem value="February">February</SelectItem>
                        <SelectItem value="March">March</SelectItem>
                        <SelectItem value="April">April</SelectItem>
                        <SelectItem value="May">May</SelectItem>
                        <SelectItem value="June">June</SelectItem>
                        <SelectItem value="July">July</SelectItem>
                        <SelectItem value="August">August</SelectItem>
                        <SelectItem value="September">September</SelectItem>
                        <SelectItem value="October">October</SelectItem>
                        <SelectItem value="November">November</SelectItem>
                        <SelectItem value="December">December</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={clientMetricsYear} onValueChange={setClientMetricsYear}>
                      <SelectTrigger className="w-24" data-testid="select-client-metrics-year">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Select value={clientMetricsPeriod} onValueChange={setClientMetricsPeriod}>
                  <SelectTrigger className="w-24" data-testid="select-client-metrics-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedClientMetricsClientId} onValueChange={setSelectedClientMetricsClientId}>
                  <SelectTrigger className="w-44" data-testid="select-client-metrics-client">
                    <SelectValue placeholder="Client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {masterDataClients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.brandName || client.incorporatedName || "Unknown"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Speed Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="text-sm font-medium text-blue-700 mb-2">Time to 1st Submission</h3>
                <div className="flex items-end space-x-3 mb-2">
                  <span className="text-3xl font-bold text-blue-900">{adminSpeedMetrics.timeToFirstSubmission}</span>
                  <span className="text-sm text-blue-700 mb-1">days</span>
                  <div className="w-3 h-3 bg-cyan-400 rounded-full mb-1"></div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="text-sm font-medium text-blue-700 mb-2">Time to Interview</h3>
                <div className="flex items-end space-x-3 mb-2">
                  <span className="text-3xl font-bold text-blue-900">{adminSpeedMetrics.timeToInterview}</span>
                  <span className="text-sm text-blue-700 mb-1">days</span>
                  <div className="w-3 h-3 bg-red-400 rounded-full mb-1"></div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="text-sm font-medium text-blue-700 mb-2">Time to Offer</h3>
                <div className="flex items-end space-x-3 mb-2">
                  <span className="text-3xl font-bold text-blue-900">{adminSpeedMetrics.timeToOffer}</span>
                  <span className="text-sm text-blue-700 mb-1">days</span>
                  <div className="w-3 h-3 bg-purple-400 rounded-full mb-1"></div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="text-sm font-medium text-blue-700 mb-2">Time to Fill</h3>
                <div className="flex items-end space-x-3 mb-2">
                  <span className="text-3xl font-bold text-blue-900">{adminSpeedMetrics.timeToFill}</span>
                  <span className="text-sm text-blue-700 mb-1">days</span>
                  <div className="w-3 h-3 bg-amber-600 rounded-full mb-1"></div>
                </div>
              </div>
            </div>

            {/* Quality Metrics */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quality Metrics</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-green-100 rounded-lg p-4 border border-green-200">
                  <h3 className="text-sm font-medium text-green-700 mb-2">Submission to Short List %</h3>
                  <div className="flex items-end space-x-3 mb-2">
                    <span className="text-3xl font-bold text-green-800">{adminQualityMetrics.submissionToShortList}</span>
                    <span className="text-sm text-green-700 mb-1">%</span>
                    <div className="w-3 h-3 bg-cyan-400 rounded-full mb-1"></div>
                  </div>
                </div>

                <div className="bg-green-100 rounded-lg p-4 border border-green-200">
                  <h3 className="text-sm font-medium text-green-700 mb-2">Interview to Offer %</h3>
                  <div className="flex items-end space-x-3 mb-2">
                    <span className="text-3xl font-bold text-green-800">{adminQualityMetrics.interviewToOffer}</span>
                    <span className="text-sm text-green-700 mb-1">%</span>
                    <div className="w-3 h-3 bg-red-400 rounded-full mb-1"></div>
                  </div>
                </div>

                <div className="bg-green-100 rounded-lg p-4 border border-green-200">
                  <h3 className="text-sm font-medium text-green-700 mb-2">Offer Acceptance %</h3>
                  <div className="flex items-end space-x-3 mb-2">
                    <span className="text-3xl font-bold text-green-800">{adminQualityMetrics.offerAcceptance}</span>
                    <span className="text-sm text-green-700 mb-1">%</span>
                    <div className="w-3 h-3 bg-purple-400 rounded-full mb-1"></div>
                  </div>
                </div>

                <div className="bg-green-100 rounded-lg p-4 border border-green-200">
                  <h3 className="text-sm font-medium text-green-700 mb-2">Early Attrition %</h3>
                  <div className="flex items-end space-x-3 mb-2">
                    <span className="text-3xl font-bold text-green-800">{adminQualityMetrics.earlyAttrition}</span>
                    <span className="text-sm text-green-700 mb-1">%</span>
                    <div className="w-3 h-3 bg-amber-600 rounded-full mb-1"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Metrics */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Impact Metrics</h2>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h3 className="text-sm font-medium text-red-700 mb-2">Speed to Hire value</h3>
                  <div className="text-3xl font-bold text-red-600">{adminImpactMetrics.speedToHire || adminSpeedMetrics.timeToFill}</div>
                  <div className="text-sm text-gray-600 mt-1">Days faster*</div>
                </div>

                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h3 className="text-sm font-medium text-red-700 mb-2">Revenue Impact Of Delay</h3>
                  <div className="text-3xl font-bold text-red-600">{adminImpactMetrics.revenueImpactOfDelay}</div>
                  <div className="text-sm text-gray-600 mt-1">Lost per Role*</div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="text-sm font-medium text-purple-700 mb-2">Client NPS</h3>
                  <div className="text-3xl font-bold text-purple-600">+{adminImpactMetrics.clientNps}</div>
                  <div className="text-sm text-gray-600 mt-1">Net Promoter Score*</div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="text-sm font-medium text-purple-700 mb-2">Candidate NPS</h3>
                  <div className="text-3xl font-bold text-purple-600">+{adminImpactMetrics.candidateNps}</div>
                  <div className="text-sm text-gray-600 mt-1">Net Promoter Score*</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 relative">
                  <h3 className="text-sm font-medium text-yellow-700 mb-2">Feedback Turn Around</h3>
                  <div className="text-3xl font-bold text-yellow-600 mb-1">{adminImpactMetrics.feedbackTurnAround}</div>
                  {isEditingFeedbackModal ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">days (Avg.</span>
                        <Input
                          type="number"
                          value={avgDaysValueModal}
                          onChange={(e) => setAvgDaysValueModal(e.target.value)}
                          className="h-7 w-16 text-sm"
                          data-testid="input-feedback-turnaround-avg-modal"
                          autoFocus
                        />
                        <span className="text-xs text-gray-600">days)*</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={handleSaveModal}
                          className="h-7 text-xs"
                          data-testid="button-save-feedback-turnaround-modal"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleCancelModal}
                          className="h-7 text-xs"
                          variant="outline"
                          data-testid="button-cancel-feedback-turnaround-modal"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-xs text-gray-500">days (Avg. {adminImpactMetrics.feedbackTurnAroundAvgDays} days)*</div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleEditClickModal}
                        className="absolute top-2 right-2 h-6 w-6 hover-elevate"
                        data-testid="button-edit-feedback-turnaround-modal"
                      >
                        <EditIcon className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h3 className="text-sm font-medium text-yellow-700 mb-2">First Year Retention Rate</h3>
                  <div className="text-3xl font-bold text-yellow-600">{adminImpactMetrics.firstYearRetentionRate}</div>
                  <div className="text-sm text-gray-600 mt-1">%</div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h3 className="text-sm font-medium text-yellow-700 mb-2">Fulfillment Rate</h3>
                  <div className="text-3xl font-bold text-yellow-600">{adminImpactMetrics.fulfillmentRate}</div>
                  <div className="text-sm text-gray-600 mt-1">%</div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h3 className="text-sm font-medium text-yellow-700 mb-2">Revenue Recovered</h3>
                  <div className="text-3xl font-bold text-yellow-600">{adminImpactMetrics.revenueRecovered} <span className="text-2xl">L</span></div>
                  <div className="text-sm text-gray-600 mt-1">Gained per hire*</div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="flex justify-end mt-6">
              <Button
                onClick={() => window.print()}
                className="bg-cyan-400 hover:bg-cyan-500 text-black px-6 py-2 rounded shadow-lg flex items-center gap-2"
                data-testid="button-download-metrics-modal"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Support Modal */}
      <ChatDock
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userName={userName}
        userRole={userRole}
      />

      <JobDescriptionDetailsModal
        open={isJDPreviewModalOpen}
        onOpenChange={setIsJDPreviewModalOpen}
        data={selectedJD}
        variant="admin"
        subtitle="Review all JD information before assigning as requirement."
      />

      {/* View More JD Modal */}
      <Dialog open={isViewMoreJDModalOpen} onOpenChange={setIsViewMoreJDModalOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-4 pb-3 border-b">
            <DialogTitle className="text-xl font-semibold">All Job Descriptions from Clients</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-10rem)] px-6 py-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Client ID</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Client</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">SPOC Name</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Role</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Shared Date</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">JD</th>
                    <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!clientJDs || (clientJDs as any[]).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">No client-submitted JDs found.</td>
                    </tr>
                  ) : (
                    (clientJDs as any[]).map((jd: any) => (
                      <tr key={jd.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-3 text-gray-900 dark:text-white text-sm">{jd.clientId || 'N/A'}</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">{jd.company || 'N/A'}</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">{jd.spocName || 'N/A'}</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">{jd.role || 'N/A'}</td>
                        <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-sm">{jd.sharedDate || 'N/A'}</td>
                        <td className="py-3 px-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedJD({
                                ...jd.requirement,
                                clientId: jd.clientId,
                                spocName: jd.spocName,
                                companyLogo: jd.companyLogo ?? null,
                              });
                              setIsViewMoreJDModalOpen(false);
                              setIsJDPreviewModalOpen(true);
                            }}
                            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
                          >
                            View JD
                          </Button>
                        </td>
                        <td className="py-3 px-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setJdToAdd(jd);
                              setIsViewMoreJDModalOpen(false);
                              setIsAddToRequirementAlertOpen(true);
                            }}
                            className="text-xs p-2"
                            title="Add to Requirement"
                          >
                            <FilePlus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50 dark:bg-gray-800/50">
            <Button
              onClick={() => setIsViewMoreJDModalOpen(false)}
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
