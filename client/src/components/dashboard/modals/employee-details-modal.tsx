import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { StandardDatePicker } from "@/components/ui/standard-date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Mail, Phone, Calendar } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EmployeeDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    fathersName?: string;
    joiningDate?: string;
    employeeStatus?: string;
    ctc?: string;
    address?: string;
    designation?: string;
    employmentStatus?: string;
    esic?: string;
    epfo?: string;
    esicNo?: string;
    epfoNo?: string;
    motherName?: string;
    fatherNumber?: string;
    motherNumber?: string;
    offeredCtc?: string;
    currentStatus?: string;
    incrementCount?: string;
    appraisedQuarter?: string;
    appraisedAmount?: string;
    appraisedYear?: string;
    yearlyCTC?: string;
    currentMonthlyCTC?: string;
    department?: string;
    nameAsPerBank?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branch?: string;
    city?: string;
  };
}

export default function EmployeeDetailsModal({ open, onOpenChange, employee }: EmployeeDetailsModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    designation: "",
    joiningDate: "",
    employmentStatus: "",
    esic: "",
    epfo: "",
    esicNo: "",
    epfoNo: "",
    fatherName: "",
    motherName: "",
    fatherNumber: "",
    motherNumber: "",
    offeredCtc: "",
    currentStatus: "",
    incrementCount: "",
    appraisedQuarter: "",
    appraisedAmount: "",
    appraisedYear: "",
    yearlyCTC: "",
    currentMonthlyCTC: "",
    department: "",
    nameAsPerBank: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branch: "",
    city: "",
  });

  // Update form data when employee prop changes
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        address: employee.address || "",
        designation: employee.designation || "",
        joiningDate: employee.joiningDate || "",
        employmentStatus: employee.employmentStatus || "",
        esic: employee.esic || "",
        epfo: employee.epfo || "",
        esicNo: employee.esicNo || "",
        epfoNo: employee.epfoNo || "",
        fatherName: employee.fathersName || employee.fatherName || "",
        motherName: employee.motherName || "",
        fatherNumber: employee.fatherNumber || "",
        motherNumber: employee.motherNumber || "",
        offeredCtc: employee.offeredCtc || employee.ctc || "",
        currentStatus: employee.currentStatus || "",
        incrementCount: employee.incrementCount || "",
        appraisedQuarter: employee.appraisedQuarter || "",
        appraisedAmount: employee.appraisedAmount || "",
        appraisedYear: employee.appraisedYear || "",
        yearlyCTC: employee.yearlyCTC || "",
        currentMonthlyCTC: employee.currentMonthlyCTC || "",
        department: employee.department || "",
        nameAsPerBank: employee.nameAsPerBank || "",
        accountNumber: employee.accountNumber || "",
        ifscCode: employee.ifscCode || "",
        bankName: employee.bankName || "",
        branch: employee.branch || "",
        city: employee.city || "",
      });
    }
  }, [employee]);

  const updateEmployeeMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!employee?.id) throw new Error("Employee ID is required");
      const response = await apiRequest('PUT', `/api/admin/employees/${employee.id}`, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        designation: data.designation,
        joiningDate: data.joiningDate,
        employmentStatus: data.employmentStatus,
        esic: data.esic,
        epfo: data.epfo,
        esicNo: data.esicNo,
        epfoNo: data.epfoNo,
        fatherName: data.fatherName,
        motherName: data.motherName,
        fatherNumber: data.fatherNumber,
        motherNumber: data.motherNumber,
        offeredCtc: data.offeredCtc,
        currentStatus: data.currentStatus,
        incrementCount: data.incrementCount,
        appraisedQuarter: data.appraisedQuarter,
        appraisedAmount: data.appraisedAmount,
        appraisedYear: data.appraisedYear,
        yearlyCTC: data.yearlyCTC,
        currentMonthlyCTC: data.currentMonthlyCTC,
        department: data.department,
        nameAsPerBank: data.nameAsPerBank,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        bankName: data.bankName,
        branch: data.branch,
        city: data.city,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/employees'] });
      toast({
        title: "Record Updated",
        description: "Employee details have been updated successfully",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    handleInputChange("joiningDate", date ? date.toISOString().split('T')[0] : '');
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Name and Email are required fields",
        variant: "destructive",
      });
      return;
    }
    updateEmployeeMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto scrollbar-hide" data-testid="dialog-employee-details">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Employee Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
                <Input
                  id="name"
                  className="bg-gray-50"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Employee Name"
                  data-testid="input-employee-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email *
                </Label>
                <Input
                  id="email"
                  className="bg-gray-50"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="employee@example.com"
                  data-testid="input-employee-email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone
                </Label>
                <Input
                  id="phone"
                  className="bg-gray-50"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Phone Number"
                  data-testid="input-employee-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                <Input
                  id="address"
                  className="bg-gray-50"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Address"
                  data-testid="input-address"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="designation" className="text-sm font-medium">Designation</Label>
                <Input
                  id="designation"
                  className="bg-gray-50"
                  value={formData.designation}
                  onChange={(e) => handleInputChange("designation", e.target.value)}
                  placeholder="Designation"
                  data-testid="input-designation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                <Input
                  id="department"
                  className="bg-gray-50"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  placeholder="Department"
                  data-testid="input-department"
                />
              </div>
            </div>
          </div>

          {/* Employment Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Employment Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="joiningDate" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Date of Joining
                </Label>
                <StandardDatePicker
                  value={formData.joiningDate ? new Date(formData.joiningDate) : undefined}
                  onChange={handleDateChange}
                  placeholder="DD-MM-YYYY"
                  maxDate={new Date()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentStatus" className="text-sm font-medium">Employment Status</Label>
                <Select value={formData.employmentStatus} onValueChange={(value) => handleInputChange("employmentStatus", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Employment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentStatus" className="text-sm font-medium">Current Status</Label>
                <Select value={formData.currentStatus} onValueChange={(value) => handleInputChange("currentStatus", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Current Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Probation">Probation</SelectItem>
                    <SelectItem value="Notice Period">Notice Period</SelectItem>
                    <SelectItem value="Resigned">Resigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="incrementCount" className="text-sm font-medium">Increment Count</Label>
                <Select value={formData.incrementCount} onValueChange={(value) => handleInputChange("incrementCount", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Increment Count" />
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
            </div>
          </div>

          {/* ESIC & EPFO Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">ESIC & EPFO</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="esic" className="text-sm font-medium">ESIC</Label>
                <Select value={formData.esic} onValueChange={(value) => handleInputChange("esic", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ESIC" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="epfo" className="text-sm font-medium">EPFO</Label>
                <Select value={formData.epfo} onValueChange={(value) => handleInputChange("epfo", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select EPFO" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="esicNo" className="text-sm font-medium">ESIC No</Label>
                <Input
                  id="esicNo"
                  className="bg-gray-50"
                  value={formData.esicNo}
                  onChange={(e) => handleInputChange("esicNo", e.target.value)}
                  placeholder="ESIC Number"
                  data-testid="input-esic-no"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="epfoNo" className="text-sm font-medium">EPFO No</Label>
                <Input
                  id="epfoNo"
                  className="bg-gray-50"
                  value={formData.epfoNo}
                  onChange={(e) => handleInputChange("epfoNo", e.target.value)}
                  placeholder="EPFO Number"
                  data-testid="input-epfo-no"
                />
              </div>
            </div>
          </div>

          {/* Family Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Family Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fatherName" className="text-sm font-medium">Father's Name</Label>
                <Input
                  id="fatherName"
                  className="bg-gray-50"
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange("fatherName", e.target.value)}
                  placeholder="Father's Name"
                  data-testid="input-fathers-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherName" className="text-sm font-medium">Mother's Name</Label>
                <Input
                  id="motherName"
                  className="bg-gray-50"
                  value={formData.motherName}
                  onChange={(e) => handleInputChange("motherName", e.target.value)}
                  placeholder="Mother's Name"
                  data-testid="input-mother-name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fatherNumber" className="text-sm font-medium">Father's Contact Number</Label>
                <Input
                  id="fatherNumber"
                  className="bg-gray-50"
                  value={formData.fatherNumber}
                  onChange={(e) => handleInputChange("fatherNumber", e.target.value)}
                  placeholder="Father's Contact Number"
                  data-testid="input-father-number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherNumber" className="text-sm font-medium">Mother's Contact Number</Label>
                <Input
                  id="motherNumber"
                  className="bg-gray-50"
                  value={formData.motherNumber}
                  onChange={(e) => handleInputChange("motherNumber", e.target.value)}
                  placeholder="Mother's Contact Number"
                  data-testid="input-mother-number"
                />
              </div>
            </div>
          </div>

          {/* CTC & Appraisal Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CTC & Appraisal</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="offeredCtc" className="text-sm font-medium">Offered CTC</Label>
                <Input
                  id="offeredCtc"
                  className="bg-gray-50"
                  type="text"
                  value={formData.offeredCtc}
                  onChange={(e) => handleInputChange("offeredCtc", e.target.value)}
                  placeholder="Offered CTC"
                  data-testid="input-offered-ctc"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearlyCTC" className="text-sm font-medium">Yearly CTC</Label>
                <Input
                  id="yearlyCTC"
                  className="bg-gray-50"
                  type="text"
                  value={formData.yearlyCTC}
                  onChange={(e) => handleInputChange("yearlyCTC", e.target.value)}
                  placeholder="Yearly CTC"
                  data-testid="input-yearly-ctc"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentMonthlyCTC" className="text-sm font-medium">Current Monthly CTC</Label>
                <Input
                  id="currentMonthlyCTC"
                  className="bg-gray-50"
                  type="text"
                  value={formData.currentMonthlyCTC}
                  onChange={(e) => handleInputChange("currentMonthlyCTC", e.target.value)}
                  placeholder="Current Monthly CTC"
                  data-testid="input-current-monthly-ctc"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appraisedAmount" className="text-sm font-medium">Appraised Amount</Label>
                <Input
                  id="appraisedAmount"
                  className="bg-gray-50"
                  type="text"
                  value={formData.appraisedAmount}
                  onChange={(e) => handleInputChange("appraisedAmount", e.target.value)}
                  placeholder="Appraised Amount"
                  data-testid="input-appraised-amount"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appraisedQuarter" className="text-sm font-medium">Appraised Quarter</Label>
                <Select value={formData.appraisedQuarter} onValueChange={(value) => handleInputChange("appraisedQuarter", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">Q1</SelectItem>
                    <SelectItem value="Q2">Q2</SelectItem>
                    <SelectItem value="Q3">Q3</SelectItem>
                    <SelectItem value="Q4">Q4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appraisedYear" className="text-sm font-medium">Appraised Year</Label>
                <Select value={formData.appraisedYear} onValueChange={(value) => handleInputChange("appraisedYear", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
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
          </div>

          {/* Bank Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bank Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameAsPerBank" className="text-sm font-medium">Name as per Bank</Label>
                <Input
                  id="nameAsPerBank"
                  className="bg-gray-50"
                  value={formData.nameAsPerBank}
                  onChange={(e) => handleInputChange("nameAsPerBank", e.target.value)}
                  placeholder="Name as per Bank"
                  data-testid="input-name-as-per-bank"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-sm font-medium">Account Number</Label>
                <Input
                  id="accountNumber"
                  className="bg-gray-50"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                  placeholder="Account Number"
                  data-testid="input-account-number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ifscCode" className="text-sm font-medium">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  className="bg-gray-50"
                  value={formData.ifscCode}
                  onChange={(e) => handleInputChange("ifscCode", e.target.value)}
                  placeholder="IFSC Code"
                  data-testid="input-ifsc-code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName" className="text-sm font-medium">Bank Name</Label>
                <Input
                  id="bankName"
                  className="bg-gray-50"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange("bankName", e.target.value)}
                  placeholder="Bank Name"
                  data-testid="input-bank-name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch" className="text-sm font-medium">Branch</Label>
                <Input
                  id="branch"
                  className="bg-gray-50"
                  value={formData.branch}
                  onChange={(e) => handleInputChange("branch", e.target.value)}
                  placeholder="Branch"
                  data-testid="input-branch"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">City</Label>
                <Input
                  id="city"
                  className="bg-gray-50"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="City"
                  data-testid="input-city"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-employee"
          >
            Cancel
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSave}
            disabled={updateEmployeeMutation.isPending}
            data-testid="button-save-employee"
          >
            {updateEmployeeMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
