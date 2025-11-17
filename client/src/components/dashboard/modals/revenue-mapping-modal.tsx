import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface RevenueMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RevenueMappingModal({ isOpen, onClose }: RevenueMappingModalProps) {
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
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(undefined);
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [receivedPayment, setReceivedPayment] = useState<string>("");
  const [paymentDetails, setPaymentDetails] = useState<string>("");
  const [incentiveDisbursedDate, setIncentiveDisbursedDate] = useState<Date | undefined>(undefined);

  // Fetch employees for TA and TL dropdowns
  const { data: employees } = useQuery<any[]>({
    queryKey: ['/api/employees'],
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

  const handleSubmit = () => {
    // Handle form submission
    console.log("Form submitted");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-lg font-semibold">
            Revenue Mapping
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* First Row - TA and TL */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ta" data-testid="label-ta">Talent Advisor</Label>
              <Select value={talentAdvisor} onValueChange={setTalentAdvisor}>
                <SelectTrigger className="w-full" data-testid="select-talent-advisor">
                  <SelectValue placeholder="Select Talent Advisor" />
                </SelectTrigger>
                <SelectContent>
                  {talentAdvisors.map((ta: any) => (
                    <SelectItem key={ta.id} value={ta.id}>
                      {ta.name} ({ta.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tl" data-testid="label-tl">Team Lead</Label>
              <Select value={teamLead} onValueChange={setTeamLead}>
                <SelectTrigger className="w-full" data-testid="select-team-lead">
                  <SelectValue placeholder="Select Team Lead" />
                </SelectTrigger>
                <SelectContent>
                  {teamLeads.map((tl: any) => (
                    <SelectItem key={tl.id} value={tl.id}>
                      {tl.name} ({tl.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Second Row - Year and Quarter */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year" data-testid="label-year">Year</Label>
              <Input
                id="year"
                type="number"
                placeholder="YYYY"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="2000"
                max="2099"
                maxLength={4}
                data-testid="input-year"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quarter" data-testid="label-quarter">Quarter</Label>
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger className="w-full" data-testid="select-quarter">
                  <SelectValue placeholder="Select Quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JFM">JFM (Jan-Feb-Mar)</SelectItem>
                  <SelectItem value="AMJ">AMJ (Apr-May-Jun)</SelectItem>
                  <SelectItem value="JAS">JAS (Jul-Aug-Sep)</SelectItem>
                  <SelectItem value="OND">OND (Oct-Nov-Dec)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Third Row - Position and Client */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position" data-testid="label-position">Position</Label>
              <Input
                id="position"
                type="text"
                placeholder="Enter position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                data-testid="input-position"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client" data-testid="label-client">Client</Label>
              <Select value={client} onValueChange={setClient}>
                <SelectTrigger className="w-full" data-testid="select-client">
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.brandName} ({c.clientCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fourth Row - Client Type and Partner Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientType" data-testid="label-client-type">Client Type</Label>
              <Select value={clientType} onValueChange={setClientType}>
                <SelectTrigger className="w-full" data-testid="select-client-type">
                  <SelectValue placeholder="Select Client Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Direct">Direct</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {clientType === "Partner" && (
              <div className="space-y-2">
                <Label htmlFor="partnerName" data-testid="label-partner-name">Partner Name</Label>
                <Input
                  id="partnerName"
                  type="text"
                  placeholder="Enter partner name"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  data-testid="input-partner-name"
                />
              </div>
            )}
          </div>

          {/* Fifth Row - Offered Date and Closure Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="offeredDate" data-testid="label-offered-date">Offered Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-testid="button-offered-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {offeredDate ? format(offeredDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={offeredDate}
                    onSelect={setOfferedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="closureDate" data-testid="label-closure-date">Closure Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-testid="button-closure-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {closureDate ? format(closureDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={closureDate}
                    onSelect={setClosureDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Sixth Row - Percentage and Revenue */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="percentage" data-testid="label-percentage">Percentage</Label>
              <div className="relative">
                <Input
                  id="percentage"
                  type="number"
                  placeholder="Enter percentage"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  className="pr-8"
                  min="0"
                  max="100"
                  step="0.01"
                  data-testid="input-percentage"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenue" data-testid="label-revenue">Revenue</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="revenue"
                  type="number"
                  placeholder="Enter revenue"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="0.01"
                  data-testid="input-revenue"
                />
              </div>
            </div>
          </div>

          {/* Seventh Row - Incentive Plan and Incentive */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="incentivePlan" data-testid="label-incentive-plan">Incentive Plan</Label>
              <Select value={incentivePlan} onValueChange={setIncentivePlan}>
                <SelectTrigger className="w-full" data-testid="select-incentive-plan">
                  <SelectValue placeholder="Select Incentive Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TL">TL</SelectItem>
                  <SelectItem value="TA">TA</SelectItem>
                  <SelectItem value="Business Development">Business Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="incentive" data-testid="label-incentive">Incentive</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="incentive"
                  type="number"
                  placeholder="Enter incentive"
                  value={incentive}
                  onChange={(e) => setIncentive(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="0.01"
                  data-testid="input-incentive"
                />
              </div>
            </div>
          </div>

          {/* Eighth Row - Payment Status and Source */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentStatus" data-testid="label-payment-status">Payment Status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="w-full" data-testid="select-payment-status">
                  <SelectValue placeholder="Select Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source" data-testid="label-source">Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="w-full" data-testid="select-source">
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
          </div>

          {/* Ninth Row - Invoice Date and Invoice Number */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceDate" data-testid="label-invoice-date">Invoice Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-testid="button-invoice-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {invoiceDate ? format(invoiceDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={invoiceDate}
                    onSelect={setInvoiceDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber" data-testid="label-invoice-number">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                type="text"
                placeholder="Enter invoice number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                data-testid="input-invoice-number"
              />
            </div>
          </div>

          {/* Tenth Row - Received Payment and Payment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="receivedPayment" data-testid="label-received-payment">Received Payment</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="receivedPayment"
                  type="number"
                  placeholder="Enter received payment"
                  value={receivedPayment}
                  onChange={(e) => setReceivedPayment(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="0.01"
                  data-testid="input-received-payment"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDetails" data-testid="label-payment-details">Payment Details</Label>
              <Input
                id="paymentDetails"
                type="text"
                placeholder="Enter payment details"
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                data-testid="input-payment-details"
              />
            </div>
          </div>

          {/* Eleventh Row - Incentive Disbursed Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="incentiveDisbursedDate" data-testid="label-incentive-disbursed-date">Incentive Disbursed Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-testid="button-incentive-disbursed-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {incentiveDisbursedDate ? format(incentiveDisbursedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={incentiveDisbursedDate}
                    onSelect={setIncentiveDisbursedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end gap-3">
            <Button 
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
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