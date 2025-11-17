import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [incentivePaidMonth, setIncentivePaidMonth] = useState<string>("");

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
            <Select value={talentAdvisor} onValueChange={setTalentAdvisor}>
              <SelectTrigger className="w-full bg-gray-50" data-testid="select-talent-advisor">
                <SelectValue placeholder="Talent Advisor" />
              </SelectTrigger>
              <SelectContent>
                {talentAdvisors.map((ta: any) => (
                  <SelectItem key={ta.id} value={ta.id}>
                    {ta.name} ({ta.employeeId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={teamLead} onValueChange={setTeamLead}>
              <SelectTrigger className="w-full bg-gray-50" data-testid="select-team-lead">
                <SelectValue placeholder="Team Lead" />
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

          {/* Second Row - Year and Quarter */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min="2000"
              max="2099"
              maxLength={4}
              className="bg-gray-50"
              data-testid="input-year"
            />
            <Select value={quarter} onValueChange={setQuarter}>
              <SelectTrigger className="w-full bg-gray-50" data-testid="select-quarter">
                <SelectValue placeholder="Quarter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JFM">JFM (Jan-Feb-Mar)</SelectItem>
                <SelectItem value="AMJ">AMJ (Apr-May-Jun)</SelectItem>
                <SelectItem value="JAS">JAS (Jul-Aug-Sep)</SelectItem>
                <SelectItem value="OND">OND (Oct-Nov-Dec)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Third Row - Position and Client */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="bg-gray-50"
              data-testid="input-position"
            />
            <Select value={client} onValueChange={setClient}>
              <SelectTrigger className="w-full bg-gray-50" data-testid="select-client">
                <SelectValue placeholder="Client" />
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

          {/* Fourth Row - Client Type and Partner Name */}
          <div className="grid grid-cols-2 gap-4">
            <Select value={clientType} onValueChange={setClientType}>
              <SelectTrigger className="w-full bg-gray-50" data-testid="select-client-type">
                <SelectValue placeholder="Client Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Direct">Direct</SelectItem>
                <SelectItem value="Partner">Partner</SelectItem>
              </SelectContent>
            </Select>
            {clientType === "Partner" && (
              <Input
                type="text"
                placeholder="Partner Name"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                className="bg-gray-50"
                data-testid="input-partner-name"
              />
            )}
          </div>

          {/* Fifth Row - Offered Date and Closure Date */}
          <div className="grid grid-cols-2 gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-gray-50"
                  data-testid="button-offered-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {offeredDate ? format(offeredDate, "PPP") : <span className="text-muted-foreground">Offered Date</span>}
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-gray-50"
                  data-testid="button-closure-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {closureDate ? format(closureDate, "PPP") : <span className="text-muted-foreground">Closure Date</span>}
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

          {/* Sixth Row - Percentage and Revenue */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Input
                type="number"
                placeholder="Percentage"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="pr-8 bg-gray-50"
                min="0"
                max="100"
                step="0.01"
                data-testid="input-percentage"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                %
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                placeholder="Revenue"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                className="pl-8 bg-gray-50"
                min="0"
                step="0.01"
                data-testid="input-revenue"
              />
            </div>
          </div>

          {/* Seventh Row - Incentive Plan and Incentive */}
          <div className="grid grid-cols-2 gap-4">
            <Select value={incentivePlan} onValueChange={setIncentivePlan}>
              <SelectTrigger className="w-full bg-gray-50" data-testid="select-incentive-plan">
                <SelectValue placeholder="Incentive Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TL">TL</SelectItem>
                <SelectItem value="TA">TA</SelectItem>
                <SelectItem value="Business Development">Business Development</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                placeholder="Incentive"
                value={incentive}
                onChange={(e) => setIncentive(e.target.value)}
                className="pl-8 bg-gray-50"
                min="0"
                step="0.01"
                data-testid="input-incentive"
              />
            </div>
          </div>

          {/* Eighth Row - Source and Invoice Date */}
          <div className="grid grid-cols-2 gap-4">
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="w-full bg-gray-50" data-testid="select-source">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="Naukri">Naukri</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Direct">Direct</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-gray-50"
                  data-testid="button-invoice-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {invoiceDate ? format(invoiceDate, "PPP") : <span className="text-muted-foreground">Invoice Date</span>}
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

          {/* Ninth Row - Invoice Number and Received Payment */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Invoice Number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="bg-gray-50"
              data-testid="input-invoice-number"
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                placeholder="Received Payment"
                value={receivedPayment}
                onChange={(e) => setReceivedPayment(e.target.value)}
                className="pl-8 bg-gray-50"
                min="0"
                step="0.01"
                data-testid="input-received-payment"
              />
            </div>
          </div>

          {/* Tenth Row - Payment Details and Payment Status */}
          <div className="grid grid-cols-2 gap-4">
            <Select value={paymentDetails} onValueChange={setPaymentDetails}>
              <SelectTrigger className="w-full bg-gray-50" data-testid="select-payment-details">
                <SelectValue placeholder="Payment Details" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fully paid">Fully paid</SelectItem>
                <SelectItem value="Part paid">Part paid</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="Payment Status"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="bg-gray-50"
              data-testid="input-payment-status"
            />
          </div>

          {/* Eleventh Row - Incentive Paid Month */}
          <div className="grid grid-cols-2 gap-4">
            <Select value={incentivePaidMonth} onValueChange={setIncentivePaidMonth}>
              <SelectTrigger className="w-full bg-gray-50" data-testid="select-incentive-paid-month">
                <SelectValue placeholder="Incentive Paid Month" />
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