import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardDatePicker } from "@/components/ui/standard-date-picker";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface RevenueMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRevenueMapping?: any;
}


export default function RevenueMappingModal({ isOpen, onClose, editingRevenueMapping }: RevenueMappingModalProps) {
  const queryClient = useQueryClient();
  const [talentAdvisor, setTalentAdvisor] = useState<string>("");
  const [teamLead, setTeamLead] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [quarter, setQuarter] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [client, setClient] = useState<string>("");
  const [clientType, setClientType] = useState<string>("");
  const [partnerName, setPartnerName] = useState<string>("");
  const [offeredDate, setOfferedDate] = useState<Date | undefined>(undefined);
  const [closureDate, setClosureDate] = useState<Date | undefined>(undefined);
  const [percentage, setPercentage] = useState<string>("");
  const [revenue, setRevenue] = useState<string>("");
  const [incentivePlan, setIncentivePlan] = useState<string>("");
  const [incentive, setIncentive] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [otherSource, setOtherSource] = useState<string>("");
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(undefined);
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [receivedPayment, setReceivedPayment] = useState<string>("");
  const [paymentDetails, setPaymentDetails] = useState<string>("");
  const [incentivePaidMonth, setIncentivePaidMonth] = useState<string>("");

  // Fetch employees for TA and TL dropdowns
  const { data: employees } = useQuery<any[]>({
    queryKey: ['/api/admin/employees'],
  });

  // Fetch clients for Client dropdown
  const { data: clients } = useQuery<any[]>({
    queryKey: ['/api/clients'],
  });

  // Filter TAs and TLs from employees
  const talentAdvisors = (employees || []).filter((emp: any) => 
    emp.role === 'recruiter' || 
    emp.designation?.toLowerCase().includes('advisor') || 
    emp.designation?.toLowerCase().includes('recruiter')
  );

  const teamLeads = (employees || []).filter((emp: any) => 
    emp.role === 'team_leader' || 
    emp.designation?.toLowerCase().includes('team lead') ||
    emp.designation?.toLowerCase().includes('lead')
  );

  // Filter TAs based on selected Team Lead
  const filteredTalentAdvisors = useMemo(() => {
    if (!teamLead) return [];
    const selectedTL = teamLeads.find(tl => tl.id === teamLead);
    if (!selectedTL) return [];
    // Filter TAs who report to the selected team leader
    return (employees || []).filter((emp: any) => 
      (emp.role === 'recruiter' || emp.role === 'talent_advisor' || 
       emp.designation?.toLowerCase().includes('advisor') || 
       emp.designation?.toLowerCase().includes('recruiter')) &&
      emp.reportingTo === selectedTL.employeeId
    );
  }, [teamLead, employees, teamLeads]);

  // Clear partnerName when clientType is not "Partner"
  useEffect(() => {
    if (clientType !== "Partner") {
      setPartnerName("");
    }
  }, [clientType]);

  // Clear otherSource when source is not "Other"
  useEffect(() => {
    if (source !== "Other") {
      setOtherSource("");
    }
  }, [source]);

  // Reset talent advisor when team lead changes
  useEffect(() => {
    if (teamLead) {
      setTalentAdvisor("");
    }
  }, [teamLead]);

  // Map old quarter values to new ones
  const mapQuarterValue = (quarter: string): string => {
    const quarterMap: Record<string, string> = {
      'JFM': 'Q1',
      'AMJ': 'Q2',
      'JAS': 'Q3',
      'OND': 'Q4'
    };
    return quarterMap[quarter] || quarter;
  };

  // Populate form when editing
  useEffect(() => {
    if (editingRevenueMapping) {
      setTalentAdvisor(editingRevenueMapping.talentAdvisorId || "");
      setTeamLead(editingRevenueMapping.teamLeadId || "");
      setYear(editingRevenueMapping.year?.toString() || "");
      setQuarter(mapQuarterValue(editingRevenueMapping.quarter || ""));
      setPosition(editingRevenueMapping.position || "");
      setClient(editingRevenueMapping.clientId || "");
      setClientType(editingRevenueMapping.clientType || "");
      setPartnerName(editingRevenueMapping.partnerName || "");
      setOfferedDate(editingRevenueMapping.offeredDate ? new Date(editingRevenueMapping.offeredDate) : undefined);
      setClosureDate(editingRevenueMapping.closureDate ? new Date(editingRevenueMapping.closureDate) : undefined);
      setPercentage(editingRevenueMapping.percentage?.toString() || "");
      setRevenue(editingRevenueMapping.revenue?.toString() || "");
      setIncentivePlan(editingRevenueMapping.incentivePlan || "");
      setIncentive(editingRevenueMapping.incentive?.toString() || "");
      setPaymentStatus(editingRevenueMapping.paymentReceived ? "Received" : "Pending");
      setSource(editingRevenueMapping.source || "");
      setOtherSource(editingRevenueMapping.source === "Other" ? editingRevenueMapping.source : "");
      setInvoiceDate(editingRevenueMapping.invoiceDate ? new Date(editingRevenueMapping.invoiceDate) : undefined);
      setInvoiceNumber(editingRevenueMapping.invoiceNumber || "");
      setReceivedPayment(editingRevenueMapping.paymentReceived ? "Yes" : "No");
      setPaymentDetails(editingRevenueMapping.paymentDetails || "");
      setIncentivePaidMonth(editingRevenueMapping.incentivePaidMonth || "");
    } else {
      // Reset form when creating new
      setTalentAdvisor("");
      setTeamLead("");
      setYear("");
      setQuarter("");
      setPosition("");
      setClient("");
      setClientType("");
      setPartnerName("");
      setOfferedDate(undefined);
      setClosureDate(undefined);
      setPercentage("");
      setRevenue("");
      setIncentivePlan("");
      setIncentive("");
      setPaymentStatus("");
      setSource("");
      setOtherSource("");
      setInvoiceDate(undefined);
      setInvoiceNumber("");
      setReceivedPayment("");
      setPaymentDetails("");
      setIncentivePaidMonth("");
    }
  }, [editingRevenueMapping, isOpen]);

  // Create/Update revenue mapping mutation
  const revenueMappingMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingRevenueMapping) {
        return await apiRequest("PUT", `/api/admin/revenue-mappings/${editingRevenueMapping.id}`, data);
      } else {
        return await apiRequest("POST", "/api/admin/revenue-mappings", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/revenue-mappings"] });
      toast({
        title: "Success",
        description: editingRevenueMapping ? "Revenue mapping updated successfully" : "Revenue mapping created successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save revenue mapping",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    // Validate required fields
    const finalSource = source === "Other" ? otherSource : source;
    
    if (!talentAdvisor || !teamLead || !year || !quarter || !position || !client || !clientType || !percentage || !revenue || !incentivePlan || !incentive || !finalSource) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Send as strings - backend will parse them
    const data = {
      talentAdvisorId: talentAdvisor,
      teamLeadId: teamLead,
      year, // string
      quarter,
      position,
      clientId: client,
      clientType,
      partnerName: clientType === "Partner" ? partnerName : null,
      offeredDate: offeredDate ? format(offeredDate, "yyyy-MM-dd") : null,
      closureDate: closureDate ? format(closureDate, "yyyy-MM-dd") : null,
      percentage, // string
      revenue, // string
      incentivePlan,
      incentive, // string
      source: finalSource,
      invoiceDate: invoiceDate ? format(invoiceDate, "yyyy-MM-dd") : null,
      invoiceNumber: invoiceNumber || null,
      receivedPayment: receivedPayment || null,
      paymentDetails: paymentDetails || null,
      paymentStatus: paymentStatus || null,
      incentivePaidMonth: incentivePaidMonth || null,
    };

    revenueMappingMutation.mutate(data);
  };

  const RequiredLabel = ({ text }: { text: string }) => (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {text} <span className="text-red-500">*</span>
    </label>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader className="border-b pb-4 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <DialogTitle className="text-lg font-semibold">
            Revenue Mapping
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Row 1 - Team Lead & Talent Advisor */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <RequiredLabel text="Team Lead" />
              <Select value={teamLead} onValueChange={setTeamLead}>
                <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700" data-testid="select-team-lead">
                  <SelectValue placeholder="Select Team Lead" />
                </SelectTrigger>
                <SelectContent>
                  {teamLeads.map((tl: any) => (
                    <SelectItem key={tl.id} value={tl.id}>
                      {tl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <RequiredLabel text="Talent Advisor" />
              <Select 
                value={talentAdvisor} 
                onValueChange={setTalentAdvisor}
                disabled={!teamLead}
              >
                <SelectTrigger 
                  className={`w-full bg-gray-50 dark:bg-gray-700 ${!teamLead ? 'opacity-50 cursor-not-allowed' : ''}`}
                  data-testid="select-talent-advisor"
                >
                  <SelectValue placeholder="Select Talent Advisor" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTalentAdvisors.length === 0 ? (
                    <SelectItem value="no-tas" disabled>
                      No talent advisors found
                    </SelectItem>
                  ) : (
                    filteredTalentAdvisors.map((ta: any) => (
                      <SelectItem key={ta.id} value={ta.id}>
                        {ta.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2 - Year & Quarter */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <RequiredLabel text="Year" />
              <Input
                type="number"
                placeholder="YYYY"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="2000"
                max="2099"
                maxLength={4}
                className="bg-gray-50 dark:bg-gray-700"
                data-testid="input-year"
              />
            </div>
            <div>
              <RequiredLabel text="Quarter" />
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700" data-testid="select-quarter">
                  <SelectValue placeholder="Select Quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1">Q1 (Jan-Feb-Mar)</SelectItem>
                  <SelectItem value="Q2">Q2 (Apr-May-Jun)</SelectItem>
                  <SelectItem value="Q3">Q3 (Jul-Aug-Sep)</SelectItem>
                  <SelectItem value="Q4">Q4 (Oct-Nov-Dec)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3 - Position & Client */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <RequiredLabel text="Position" />
              <Input
                type="text"
                placeholder="Job Position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="bg-gray-50 dark:bg-gray-700"
                data-testid="input-position"
              />
            </div>
            <div>
              <RequiredLabel text="Client" />
              <Select value={client} onValueChange={setClient}>
                <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700" data-testid="select-client">
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.brandName || c.incorporatedName || c.name || 'Unknown Client'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4 - Client Type & Partner Name */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <RequiredLabel text="Client Type" />
              <Select value={clientType} onValueChange={setClientType}>
                <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700" data-testid="select-client-type">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Direct">Direct</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Partner Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter Partner Name"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                disabled={clientType !== "Partner"}
                className={`bg-gray-50 dark:bg-gray-700 ${clientType !== "Partner" ? "opacity-50 cursor-not-allowed" : ""}`}
                data-testid="input-partner-name"
              />
            </div>
          </div>

          {/* Row 5 - Offered Date & Closure Date */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Offered Date</label>
              <StandardDatePicker
                value={offeredDate}
                onChange={setOfferedDate}
                placeholder="Select date"
                className="w-full bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Closure Date</label>
              <StandardDatePicker
                value={closureDate}
                onChange={setClosureDate}
                placeholder="Select date"
                className="w-full bg-gray-50 dark:bg-gray-700"
              />
            </div>
          </div>

          {/* Row 6 - Percentage & Revenue */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <RequiredLabel text="Percentage" />
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  className="pr-8 bg-gray-50 dark:bg-gray-700"
                  min="0"
                  max="100"
                  step="0.01"
                  data-testid="input-percentage"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <div>
              <RequiredLabel text="Revenue" />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  className="pl-8 bg-gray-50 dark:bg-gray-700"
                  min="0"
                  step="0.01"
                  data-testid="input-revenue"
                />
              </div>
            </div>
          </div>

          {/* Row 7 - Incentive Plan & Incentive */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <RequiredLabel text="Incentive Plan" />
              <Select value={incentivePlan} onValueChange={setIncentivePlan}>
                <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700" data-testid="select-incentive-plan">
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TL">TL</SelectItem>
                  <SelectItem value="TA">TA</SelectItem>
                  <SelectItem value="Business Development">Business Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <RequiredLabel text="Incentive" />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={incentive}
                  onChange={(e) => setIncentive(e.target.value)}
                  className="pl-8 bg-gray-50 dark:bg-gray-700"
                  min="0"
                  step="0.01"
                  data-testid="input-incentive"
                />
              </div>
            </div>
          </div>

          {/* Row 8 - Source & Other Source (Conditional) */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <RequiredLabel text="Source" />
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700" data-testid="select-source">
                  <SelectValue placeholder="Select Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Naukri">Naukri</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Direct">Direct</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <RequiredLabel text="Specify Source" />
              <Input
                type="text"
                placeholder="Enter source name"
                value={otherSource}
                onChange={(e) => setOtherSource(e.target.value)}
                disabled={source !== "Other"}
                className={`bg-gray-50 dark:bg-gray-700 ${source !== "Other" ? "opacity-50 cursor-not-allowed" : ""}`}
                data-testid="input-other-source"
              />
            </div>
          </div>

          {/* Row 9 - Invoice Date & Invoice Number */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Date</label>
              <StandardDatePicker
                value={invoiceDate}
                onChange={setInvoiceDate}
                placeholder="Select date"
                className="w-full bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Number</label>
              <Input
                type="text"
                placeholder="Invoice Number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="bg-gray-50 dark:bg-gray-700"
                data-testid="input-invoice-number"
              />
            </div>
          </div>

          {/* Row 10 - Received Payment & Payment Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Received Payment</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={receivedPayment}
                  onChange={(e) => setReceivedPayment(e.target.value)}
                  className="pl-8 bg-gray-50 dark:bg-gray-700"
                  min="0"
                  step="0.01"
                  data-testid="input-received-payment"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Details</label>
              <Select value={paymentDetails} onValueChange={setPaymentDetails}>
                <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700" data-testid="select-payment-details">
                  <SelectValue placeholder="Select Details" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fully paid">Fully paid</SelectItem>
                  <SelectItem value="Part paid">Part paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 11 - Payment Status & Incentive Paid Month */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Status</label>
              <Input
                type="text"
                placeholder="Payment Status"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="bg-gray-50 dark:bg-gray-700"
                data-testid="input-payment-status"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Incentive Paid Month</label>
              <Select value={incentivePaidMonth} onValueChange={setIncentivePaidMonth}>
                <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700" data-testid="select-incentive-paid-month">
                  <SelectValue placeholder="Select Month" />
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
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 flex justify-end gap-3 border-t">
            <Button 
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-violet-600 hover:bg-violet-700"
              data-testid="button-submit"
            >
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
