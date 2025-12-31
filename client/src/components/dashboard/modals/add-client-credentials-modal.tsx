import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { StandardDatePicker } from "@/components/ui/standard-date-picker";
import { useQuery } from "@tanstack/react-query";

interface AddClientCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
  onSubmit: (data: any) => void;
}

export default function AddClientCredentialsModal({ isOpen, onClose, editData, onSubmit }: AddClientCredentialsModalProps) {
  const [formData, setFormData] = useState({
    clientId: editData?.clientId || "",
    firstName: editData?.name?.split(' ')[0] || editData?.firstName || "",
    lastName: editData?.name?.split(' ').slice(1).join(' ') || editData?.lastName || "",
    phoneNumber: editData?.phoneNumber || "",
    email: editData?.email || "",
    password: editData?.password || "",
    joiningDate: editData?.joiningDate || "",
  });
  const [joiningDate, setJoiningDate] = useState<Date | undefined>(
    editData?.joiningDate ? new Date(editData.joiningDate) : undefined
  );

  // Fetch companies from Master Data (only non-login-only clients)
  const { data: allClients = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/clients'],
    enabled: isOpen,
  });

  // Filter to only show Master Data companies (isLoginOnly = false)
  const masterDataCompanies = allClients.filter((client: any) => !client.isLoginOnly);

  // Update form data when editData changes
  useEffect(() => {
    if (editData) {
      setFormData({
        clientId: editData?.clientId || "",
        firstName: editData?.name?.split(' ')[0] || editData?.firstName || "",
        lastName: editData?.name?.split(' ').slice(1).join(' ') || editData?.lastName || "",
        phoneNumber: editData?.phoneNumber || "",
        email: editData?.email || "",
        password: editData?.password || "",
        joiningDate: editData?.joiningDate || "",
      });
      setJoiningDate(editData?.joiningDate ? new Date(editData.joiningDate) : undefined);
    }
  }, [editData]);

  // Sync joiningDate state with formData
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      joiningDate: joiningDate ? format(joiningDate, "yyyy-MM-dd") : ""
    }));
  }, [joiningDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId) {
      alert("Please select a company from Master Data");
      return;
    }
    
    const submitData = {
      ...formData,
      id: editData?.id || `STCL${String(Date.now()).slice(-3)}`,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      role: "client"
    };
    
    onSubmit(submitData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      clientId: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      password: "",
      joiningDate: "",
    });
    setJoiningDate(undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg mx-auto bg-white rounded-lg shadow-lg my-4">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {editData ? "Edit Client" : "Add New Client"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
          {/* Select Client Company - First Field */}
          <Select
            value={formData.clientId}
            onValueChange={(value) => setFormData({...formData, clientId: value})}
            required
          >
            <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500" data-testid="select-client-company">
              <SelectValue placeholder="Select Client (Company)" />
            </SelectTrigger>
            <SelectContent>
              {masterDataCompanies.length === 0 ? (
                <SelectItem value="" disabled>No companies found. Create a company in Master Data first.</SelectItem>
              ) : (
                masterDataCompanies.map((client: any) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.brandName || client.incorporatedName || client.clientCode} ({client.clientCode})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              placeholder="First name"
              required
              className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
              data-testid="input-client-first-name"
            />
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              placeholder="Last name"
              required
              className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
              data-testid="input-client-last-name"
            />
          </div>

          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            placeholder="Enter phone number"
            required
            className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
            data-testid="input-client-phone-number"
          />

          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Enter email"
            required
            className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
            data-testid="input-client-email"
          />

          <PasswordInput
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="Enter password"
            required
            className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
            data-testid="input-client-password"
          />

          <StandardDatePicker
            value={joiningDate}
            onChange={setJoiningDate}
            placeholder="dd-mm-yyyy"
            className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
          />

          <div className="flex gap-3 pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300"
              data-testid="button-cancel-client"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 rounded bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-add-client"
            >
              {editData ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
