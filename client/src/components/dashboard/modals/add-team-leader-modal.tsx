import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AddTeamLeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
  onSubmit: (data: any) => void;
}

export default function AddTeamLeaderModal({ isOpen, onClose, editData, onSubmit }: AddTeamLeaderModalProps) {
  const [formData, setFormData] = useState({
    id: editData?.id || "",
    name: editData?.name || "",
    email: editData?.email || "",
    phone: editData?.phone || "",
    department: editData?.department || "",
    joiningDate: editData?.joiningDate || "",
    experience: editData?.experience || "",
    status: editData?.status || "Active"
  });
  const [joiningDate, setJoiningDate] = useState<Date | undefined>(
    editData?.joiningDate ? new Date(editData.joiningDate) : undefined
  );

  // Update form data when editData changes
  useEffect(() => {
    if (editData) {
      setFormData({
        id: editData?.id || "",
        name: editData?.name || "",
        email: editData?.email || "",
        phone: editData?.phone || "",
        department: editData?.department || "",
        joiningDate: editData?.joiningDate || "",
        experience: editData?.experience || "",
        status: editData?.status || "Active"
      });
      setJoiningDate(editData?.joiningDate ? new Date(editData.joiningDate) : undefined);
    }
  }, [editData]);

  // Sync joiningDate state with formData
  useEffect(() => {
    if (joiningDate) {
      setFormData(prev => ({
        ...prev,
        joiningDate: format(joiningDate, "yyyy-MM-dd")
      }));
    }
  }, [joiningDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      id: formData.id || `STTL${String(Date.now()).slice(-3)}`,
      role: "Team Leader"
    };
    
    onSubmit(submitData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      id: "",
      name: "",
      email: "",
      phone: "",
      department: "",
      joiningDate: "",
      experience: "",
      status: "Active"
    });
    setJoiningDate(undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {editData ? "Edit Team Leader" : "Add Team Leader"}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
              Full Name *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter full name"
              required
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Enter email address"
              required
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="Enter phone number"
              required
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="department" className="text-sm font-medium text-gray-700 mb-2 block">
              Department
            </Label>
            <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recruitment">Recruitment</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="business-development">Business Development</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="joiningDate" className="text-sm font-medium text-gray-700 mb-2 block">
              Joining Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !joiningDate && "text-muted-foreground"
                  )}
                  id="joiningDate"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {joiningDate ? format(joiningDate, "dd-MM-yyyy") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={joiningDate}
                  onSelect={setJoiningDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="experience" className="text-sm font-medium text-gray-700 mb-2 block">
              Experience (Years)
            </Label>
            <Input
              id="experience"
              type="number"
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
              placeholder="Years of experience"
              min="0"
              max="50"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2 block">
              Status
            </Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {editData ? "Update" : "Add"} Team Leader
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}