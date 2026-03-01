import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardDatePicker } from "@/components/ui/standard-date-picker";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any;
  onSubmit: (data: any) => void;
}

export default function AddUserModal({ isOpen, onClose, editData, onSubmit }: AddUserModalProps) {
  const [activeTab, setActiveTab] = useState<"client" | "team-leader" | "recruiter">("client");
  
  // Form data for Client tab
  const [clientFormData, setClientFormData] = useState({
    clientId: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    joiningDate: "",
  });
  const [clientJoiningDate, setClientJoiningDate] = useState<Date | undefined>(undefined);

  // Form data for Team Leader tab
  const [teamLeaderFormData, setTeamLeaderFormData] = useState({
    clientId: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    joiningDate: "",
  });
  const [teamLeaderJoiningDate, setTeamLeaderJoiningDate] = useState<Date | undefined>(undefined);

  // Form data for Recruiter tab
  const [recruiterFormData, setRecruiterFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    joiningDate: "",
    reportingTo: "",
  });
  const [recruiterJoiningDate, setRecruiterJoiningDate] = useState<Date | undefined>(undefined);

  // Fetch companies from Master Data (only non-login-only clients)
  const { data: allClients = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/clients'],
    enabled: isOpen,
  });

  // Filter to only show Master Data companies (isLoginOnly = false)
  const masterDataCompanies = allClients.filter((client: any) => !client.isLoginOnly);

  // Fetch team leaders for recruiter assignment
  const { data: teamLeaders = [], isLoading: teamLeadersLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/team-leaders'],
    enabled: isOpen,
  });

  // Initialize form data when editData changes
  useEffect(() => {
    if (editData) {
      const role = editData.role?.toLowerCase();
      if (role === 'client' || role === 'client') {
        setActiveTab("client");
        setClientFormData({
          clientId: editData?.clientId || "",
          firstName: editData?.name?.split(' ')[0] || editData?.firstName || "",
          lastName: editData?.name?.split(' ').slice(1).join(' ') || editData?.lastName || "",
          phoneNumber: editData?.phoneNumber || "",
          email: editData?.email || "",
          password: editData?.password || "",
          joiningDate: editData?.joiningDate || "",
        });
        setClientJoiningDate(editData?.joiningDate ? new Date(editData.joiningDate) : undefined);
      } else if (role === 'team leader' || role === 'team_leader') {
        setActiveTab("team-leader");
        setTeamLeaderFormData({
          clientId: editData?.clientId || "",
          firstName: editData?.name?.split(' ')[0] || editData?.firstName || "",
          lastName: editData?.name?.split(' ').slice(1).join(' ') || editData?.lastName || "",
          phoneNumber: editData?.phoneNumber || "",
          email: editData?.email || "",
          password: editData?.password || "",
          joiningDate: editData?.joiningDate || "",
        });
        setTeamLeaderJoiningDate(editData?.joiningDate ? new Date(editData.joiningDate) : undefined);
      } else if (role === 'recruiter' || role === 'talent advisor') {
        setActiveTab("recruiter");
        setRecruiterFormData({
          firstName: editData?.name?.split(' ')[0] || editData?.firstName || "",
          lastName: editData?.name?.split(' ').slice(1).join(' ') || editData?.lastName || "",
          phoneNumber: editData?.phoneNumber || "",
          email: editData?.email || "",
          password: editData?.password || "",
          joiningDate: editData?.joiningDate || "",
          reportingTo: editData?.reportingTo || "",
        });
        setRecruiterJoiningDate(editData?.joiningDate ? new Date(editData.joiningDate) : undefined);
      }
    } else {
      // Reset all forms when opening for new user
      setClientFormData({
        clientId: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        password: "",
        joiningDate: "",
      });
      setTeamLeaderFormData({
        clientId: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        password: "",
        joiningDate: "",
      });
      setRecruiterFormData({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        password: "",
        joiningDate: "",
        reportingTo: "",
      });
      setClientJoiningDate(undefined);
      setTeamLeaderJoiningDate(undefined);
      setRecruiterJoiningDate(undefined);
      setActiveTab("client");
    }
  }, [editData, isOpen]);

  // Sync joiningDate state with formData for Client
  useEffect(() => {
    setClientFormData(prev => ({
      ...prev,
      joiningDate: clientJoiningDate ? format(clientJoiningDate, "yyyy-MM-dd") : ""
    }));
  }, [clientJoiningDate]);

  // Sync joiningDate state with formData for Team Leader
  useEffect(() => {
    setTeamLeaderFormData(prev => ({
      ...prev,
      joiningDate: teamLeaderJoiningDate ? format(teamLeaderJoiningDate, "yyyy-MM-dd") : ""
    }));
  }, [teamLeaderJoiningDate]);

  // Sync joiningDate state with formData for Recruiter
  useEffect(() => {
    setRecruiterFormData(prev => ({
      ...prev,
      joiningDate: recruiterJoiningDate ? format(recruiterJoiningDate, "yyyy-MM-dd") : ""
    }));
  }, [recruiterJoiningDate]);

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientFormData.clientId) {
      alert("Please select a company from Master Data");
      return;
    }
    
    const submitData = {
      ...clientFormData,
      id: editData?.id || `STCL${String(Date.now()).slice(-3)}`,
      name: `${clientFormData.firstName} ${clientFormData.lastName}`.trim(),
      role: "client"
    };
    
    onSubmit(submitData);
    handleClose();
  };

  const handleTeamLeaderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...teamLeaderFormData,
      id: editData?.id || `STL${String(Date.now()).slice(-3)}`,
      name: `${teamLeaderFormData.firstName} ${teamLeaderFormData.lastName}`.trim(),
      role: "Team Leader"
    };
    
    onSubmit(submitData);
    handleClose();
  };

  const handleRecruiterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...recruiterFormData,
      id: editData?.id || `STA${String(Date.now()).slice(-3)}`,
      name: `${recruiterFormData.firstName} ${recruiterFormData.lastName}`.trim(),
      role: "Recruiter"
    };
    
    onSubmit(submitData);
    handleClose();
  };

  const handleClose = () => {
    setClientFormData({
      clientId: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      password: "",
      joiningDate: "",
    });
    setTeamLeaderFormData({
      clientId: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      password: "",
      joiningDate: "",
    });
    setRecruiterFormData({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      password: "",
      joiningDate: "",
    });
    setClientJoiningDate(undefined);
    setTeamLeaderJoiningDate(undefined);
    setRecruiterJoiningDate(undefined);
    setActiveTab("client");
    onClose();
  };

  const getTitle = () => {
    if (editData) {
      if (activeTab === "client") return "Edit Client";
      if (activeTab === "team-leader") return "Edit Team Leader";
      if (activeTab === "recruiter") return "Edit Recruiter";
    }
    if (activeTab === "client") return "Add New Client";
    if (activeTab === "team-leader") return "Add New Team Leader";
    if (activeTab === "recruiter") return "Add New Recruiter";
    return "Add New Client";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg mx-auto bg-white rounded-lg shadow-lg my-4">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "client" | "team-leader" | "recruiter")} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 mx-6">
            <TabsTrigger value="client" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              Client
            </TabsTrigger>
            <TabsTrigger value="team-leader" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              Team Leader
            </TabsTrigger>
            <TabsTrigger value="recruiter" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              Recruiter
            </TabsTrigger>
          </TabsList>

          {/* Client Tab */}
          <TabsContent value="client" className="px-6 pb-6 space-y-3">
            <form onSubmit={handleClientSubmit} className="space-y-3">
              {/* Select Client Company - First Field */}
              <Select
                value={clientFormData.clientId}
                onValueChange={(value) => setClientFormData({...clientFormData, clientId: value})}
                required
              >
                <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500" data-testid="select-client-company">
                  <SelectValue placeholder="Select Client (company)" />
                </SelectTrigger>
                <SelectContent>
                  {masterDataCompanies.length === 0 ? (
                    <SelectItem value="no-companies" disabled>No companies found. Create a company in Master Data first.</SelectItem>
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
                  id="client-firstName"
                  type="text"
                  value={clientFormData.firstName}
                  onChange={(e) => setClientFormData({...clientFormData, firstName: e.target.value})}
                  placeholder="First name"
                  required
                  className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
                  data-testid="input-client-first-name"
                />
                <Input
                  id="client-lastName"
                  type="text"
                  value={clientFormData.lastName}
                  onChange={(e) => setClientFormData({...clientFormData, lastName: e.target.value})}
                  placeholder="Last name"
                  required
                  className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
                  data-testid="input-client-last-name"
                />
              </div>

              <Input
                id="client-phoneNumber"
                type="tel"
                value={clientFormData.phoneNumber}
                onChange={(e) => setClientFormData({...clientFormData, phoneNumber: e.target.value})}
                placeholder="Enter Phone Number"
                required
                className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
                data-testid="input-client-phone-number"
              />

              <Input
                id="client-email"
                type="email"
                value={clientFormData.email}
                onChange={(e) => setClientFormData({...clientFormData, email: e.target.value})}
                placeholder="Gmail"
                required
                className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
                data-testid="input-client-email"
              />

              <PasswordInput
                id="client-password"
                value={clientFormData.password}
                onChange={(e) => setClientFormData({...clientFormData, password: e.target.value})}
                placeholder="Password"
                required
                className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
                data-testid="input-client-password"
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Joining Date
                </label>
                <StandardDatePicker
                  value={clientJoiningDate}
                  onChange={setClientJoiningDate}
                  placeholder="dd-mm-yyyy"
                  className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 rounded bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
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
          </TabsContent>

          {/* Team Leader Tab */}
          <TabsContent value="team-leader" className="px-6 pb-6 space-y-3">
            <form onSubmit={handleTeamLeaderSubmit} className="space-y-3">
              {/* Select Client Company - First Field */}
              <Select
                value={teamLeaderFormData.clientId}
                onValueChange={(value) => setTeamLeaderFormData({...teamLeaderFormData, clientId: value})}
              >
                <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500" data-testid="select-team-leader-company">
                  <SelectValue placeholder="Select Client (company)" />
                </SelectTrigger>
                <SelectContent>
                  {masterDataCompanies.length === 0 ? (
                    <SelectItem value="no-companies" disabled>No companies found. Create a company in Master Data first.</SelectItem>
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
                  id="team-leader-firstName"
                  type="text"
                  value={teamLeaderFormData.firstName}
                  onChange={(e) => setTeamLeaderFormData({...teamLeaderFormData, firstName: e.target.value})}
                  placeholder="First name"
                  required
                  className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
                  data-testid="input-team-leader-first-name"
                />
                <Input
                  id="team-leader-lastName"
                  type="text"
                  value={teamLeaderFormData.lastName}
                  onChange={(e) => setTeamLeaderFormData({...teamLeaderFormData, lastName: e.target.value})}
                  placeholder="Last name"
                  required
                  className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
                  data-testid="input-team-leader-last-name"
                />
              </div>

              <Input
                id="team-leader-phoneNumber"
                type="tel"
                value={teamLeaderFormData.phoneNumber}
                onChange={(e) => setTeamLeaderFormData({...teamLeaderFormData, phoneNumber: e.target.value})}
                placeholder="Enter Phone Number"
                required
                className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
                data-testid="input-team-leader-phone-number"
              />

              <Input
                id="team-leader-email"
                type="email"
                value={teamLeaderFormData.email}
                onChange={(e) => setTeamLeaderFormData({...teamLeaderFormData, email: e.target.value})}
                placeholder="Gmail"
                required
                className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
                data-testid="input-team-leader-email"
              />

              <PasswordInput
                id="team-leader-password"
                value={teamLeaderFormData.password}
                onChange={(e) => setTeamLeaderFormData({...teamLeaderFormData, password: e.target.value})}
                placeholder="Password"
                required
                className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
                data-testid="input-team-leader-password"
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Joining Date
                </label>
                <StandardDatePicker
                  value={teamLeaderJoiningDate}
                  onChange={setTeamLeaderJoiningDate}
                  placeholder="dd-mm-yyyy"
                  className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 rounded bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
                  data-testid="button-cancel-team-leader"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 rounded bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-add-team-leader"
                >
                  {editData ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Recruiter Tab */}
          <TabsContent value="recruiter" className="px-6 pb-6 space-y-3">
            <form onSubmit={handleRecruiterSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="recruiter-firstName"
                  type="text"
                  value={recruiterFormData.firstName}
                  onChange={(e) => setRecruiterFormData({...recruiterFormData, firstName: e.target.value})}
                  placeholder="First name"
                  required
                  className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
                  data-testid="input-recruiter-first-name"
                />
                <Input
                  id="recruiter-lastName"
                  type="text"
                  value={recruiterFormData.lastName}
                  onChange={(e) => setRecruiterFormData({...recruiterFormData, lastName: e.target.value})}
                  placeholder="Last name"
                  required
                  className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
                  data-testid="input-recruiter-last-name"
                />
              </div>

              <Input
                id="recruiter-phoneNumber"
                type="tel"
                value={recruiterFormData.phoneNumber}
                onChange={(e) => setRecruiterFormData({...recruiterFormData, phoneNumber: e.target.value})}
                placeholder="Enter Phone Number"
                required
                className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
                data-testid="input-recruiter-phone-number"
              />

              <Input
                id="recruiter-email"
                type="email"
                value={recruiterFormData.email}
                onChange={(e) => setRecruiterFormData({...recruiterFormData, email: e.target.value})}
                placeholder="Gmail"
                required
                className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
                data-testid="input-recruiter-email"
              />

              <PasswordInput
                id="recruiter-password"
                value={recruiterFormData.password}
                onChange={(e) => setRecruiterFormData({...recruiterFormData, password: e.target.value})}
                placeholder="Password"
                required
                className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
                data-testid="input-recruiter-password"
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Joining Date
                </label>
                <StandardDatePicker
                  value={recruiterJoiningDate}
                  onChange={setRecruiterJoiningDate}
                  placeholder="dd-mm-yyyy"
                  className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Assign to
                </label>
                <Select
                  value={recruiterFormData.reportingTo}
                  onValueChange={(value) => setRecruiterFormData({ ...recruiterFormData, reportingTo: value })}
                >
                  <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-sm text-gray-500" data-testid="select-assign-to-tl">
                    <SelectValue placeholder={teamLeadersLoading ? "Loading team leaders..." : "Select Team Leader"} />
                  </SelectTrigger>
                  <SelectContent>
                    {teamLeadersLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading team leaders...
                      </SelectItem>
                    ) : teamLeaders && teamLeaders.length > 0 ? (
                      teamLeaders.map((tl: any) => (
                        <SelectItem key={tl.employeeId} value={tl.employeeId}>
                          {tl.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-leaders" disabled>
                        No team leaders available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 rounded bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
                  data-testid="button-cancel-recruiter"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 rounded bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-add-recruiter"
                >
                  {editData ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

