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

  const { data: allClients = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/clients'],
    enabled: isOpen,
  });

  const masterDataCompanies = allClients.filter((client: any) => !client.isLoginOnly);

  const { data: teamLeaders = [], isLoading: teamLeadersLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/team-leaders'],
    enabled: isOpen,
  });

  const isClientRole = (role?: string | null) => {
    const normalized = (role || "").toLowerCase();
    return normalized === "client" || normalized === "client_admin" || normalized === "client_member";
  };

  useEffect(() => {
    if (editData) {
      const role = editData.role?.toLowerCase();
      if (isClientRole(role)) {
        setActiveTab("client");
        setClientFormData({
          clientId: editData?.clientCompanyId || editData?.clientId || "",
          firstName: editData?.name?.split(' ')[0] || editData?.firstName || "",
          lastName: editData?.name?.split(' ').slice(1).join(' ') || editData?.lastName || "",
          phoneNumber: editData?.phone || editData?.phoneNumber || "",
          email: editData?.email || "",
          password: "",
          joiningDate: editData?.joiningDate || "",
        });
        setClientJoiningDate(editData?.joiningDate ? new Date(editData.joiningDate) : undefined);
      } else if (role === 'team leader' || role === 'team_leader') {
        setActiveTab("team-leader");
        setTeamLeaderFormData({
          clientId: editData?.clientId || "",
          firstName: editData?.name?.split(' ')[0] || editData?.firstName || "",
          lastName: editData?.name?.split(' ').slice(1).join(' ') || editData?.lastName || "",
          phoneNumber: editData?.phone || editData?.phoneNumber || "",
          email: editData?.email || "",
          password: "",
          joiningDate: editData?.joiningDate || "",
        });
        setTeamLeaderJoiningDate(editData?.joiningDate ? new Date(editData.joiningDate) : undefined);
      } else if (role === 'recruiter' || role === 'talent advisor') {
        setActiveTab("recruiter");
        setRecruiterFormData({
          firstName: editData?.name?.split(' ')[0] || editData?.firstName || "",
          lastName: editData?.name?.split(' ').slice(1).join(' ') || editData?.lastName || "",
          phoneNumber: editData?.phone || editData?.phoneNumber || "",
          email: editData?.email || "",
          password: "",
          joiningDate: editData?.joiningDate || "",
          reportingTo: editData?.reportingTo || "",
        });
        setRecruiterJoiningDate(editData?.joiningDate ? new Date(editData.joiningDate) : undefined);
      }
    } else {
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

  useEffect(() => {
    setClientFormData((prev) => ({
      ...prev,
      joiningDate: clientJoiningDate ? format(clientJoiningDate, "yyyy-MM-dd") : ""
    }));
  }, [clientJoiningDate]);

  useEffect(() => {
    setTeamLeaderFormData((prev) => ({
      ...prev,
      joiningDate: teamLeaderJoiningDate ? format(teamLeaderJoiningDate, "yyyy-MM-dd") : ""
    }));
  }, [teamLeaderJoiningDate]);

  useEffect(() => {
    setRecruiterFormData((prev) => ({
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

    onSubmit({
      ...clientFormData,
      dbId: editData?.id,
      employeeId: editData?.employeeId,
      id: editData?.employeeId || editData?.id || `STCL${String(Date.now()).slice(-3)}`,
      name: `${clientFormData.firstName} ${clientFormData.lastName}`.trim(),
      role: editData?.role || "client_admin",
    });
    handleClose();
  };

  const handleTeamLeaderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...teamLeaderFormData,
      dbId: editData?.id,
      employeeId: editData?.employeeId,
      id: editData?.employeeId || editData?.id || `STL${String(Date.now()).slice(-3)}`,
      name: `${teamLeaderFormData.firstName} ${teamLeaderFormData.lastName}`.trim(),
      role: "Team Leader",
    });
    handleClose();
  };

  const handleRecruiterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...recruiterFormData,
      dbId: editData?.id,
      employeeId: editData?.employeeId,
      id: editData?.employeeId || editData?.id || `STA${String(Date.now()).slice(-3)}`,
      name: `${recruiterFormData.firstName} ${recruiterFormData.lastName}`.trim(),
      role: "Recruiter",
    });
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
      reportingTo: "",
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

  const inputClassName = "h-10 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:ring-slate-200";
  const selectClassName = "h-10 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 data-[placeholder]:text-slate-400";
  const dateClassName = "h-10 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400";
  const formLayoutClassName = "flex min-h-[360px] flex-col justify-between gap-4";
  const formFieldsClassName = "space-y-3";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="mx-auto my-4 max-w-xl overflow-hidden rounded-[24px] border-0 bg-white p-0 shadow-2xl">
        <DialogHeader className="px-6 pb-3 pt-6">
          <DialogTitle className="text-[1.35rem] font-semibold text-slate-900">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-3 text-xs leading-5 text-slate-500">
          Note: Employee / user records should be created first in the <span className="font-semibold">Master Data</span> page.
          Use this form to create login credentials for those existing records (matching by email).
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (!editData) setActiveTab(value as "client" | "team-leader" | "recruiter");
          }}
          className="w-full"
        >
          <div className="px-6">
            <TabsList className={`grid h-11 w-full grid-cols-3 rounded-full bg-slate-100 p-1 ${editData ? "pointer-events-none opacity-70" : ""}`}>
              <TabsTrigger value="client" className="rounded-full text-sm font-medium text-slate-600 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                Client
              </TabsTrigger>
              <TabsTrigger value="team-leader" className="rounded-full text-sm font-medium text-slate-600 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                Team Leader
              </TabsTrigger>
              <TabsTrigger value="recruiter" className="rounded-full text-sm font-medium text-slate-600 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                Recruiter
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="min-h-[430px] px-6 pb-6 pt-5">
            <TabsContent value="client" className="mt-0">
              <form onSubmit={handleClientSubmit} className={formLayoutClassName}>
                <div className={formFieldsClassName}>
                  <Select
                    value={clientFormData.clientId}
                    onValueChange={(value) => setClientFormData({ ...clientFormData, clientId: value })}
                    required
                  >
                    <SelectTrigger className={selectClassName} data-testid="select-client-company">
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
                    <Input id="client-firstName" type="text" value={clientFormData.firstName} onChange={(e) => setClientFormData({ ...clientFormData, firstName: e.target.value })} placeholder="First name" required className={inputClassName} data-testid="input-client-first-name" />
                    <Input id="client-lastName" type="text" value={clientFormData.lastName} onChange={(e) => setClientFormData({ ...clientFormData, lastName: e.target.value })} placeholder="Last name" required className={inputClassName} data-testid="input-client-last-name" />
                  </div>

                  <Input id="client-phoneNumber" type="tel" value={clientFormData.phoneNumber} onChange={(e) => setClientFormData({ ...clientFormData, phoneNumber: e.target.value })} placeholder="Enter phone number" required className={inputClassName} data-testid="input-client-phone-number" />
                  <Input id="client-email" type="email" value={clientFormData.email} onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })} placeholder="Enter email" required className={inputClassName} data-testid="input-client-email" />
                  <PasswordInput id="client-password" value={clientFormData.password} onChange={(e) => setClientFormData({ ...clientFormData, password: e.target.value })} placeholder={editData ? "Leave blank to keep current password" : "Enter password"} required={!editData} className={inputClassName} data-testid="input-client-password" />

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">Joining Date</label>
                    <StandardDatePicker value={clientJoiningDate} onChange={setClientJoiningDate} placeholder="dd-mm-yyyy" className={dateClassName} />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button type="button" variant="outline" onClick={handleClose} className="h-10 flex-1 rounded-[10px] border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-50" data-testid="button-cancel-client">Cancel</Button>
                  <Button type="submit" className="h-10 flex-1 rounded-[10px] bg-green-600 text-sm text-white hover:bg-green-700" data-testid="button-add-client">{editData ? "Update" : "Add"}</Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="team-leader" className="mt-0">
              <form onSubmit={handleTeamLeaderSubmit} className={formLayoutClassName}>
                <div className={formFieldsClassName}>
                  <div className="grid grid-cols-2 gap-4">
                    <Input id="team-leader-firstName" type="text" value={teamLeaderFormData.firstName} onChange={(e) => setTeamLeaderFormData({ ...teamLeaderFormData, firstName: e.target.value })} placeholder="First name" required className={inputClassName} data-testid="input-team-leader-first-name" />
                    <Input id="team-leader-lastName" type="text" value={teamLeaderFormData.lastName} onChange={(e) => setTeamLeaderFormData({ ...teamLeaderFormData, lastName: e.target.value })} placeholder="Last name" required className={inputClassName} data-testid="input-team-leader-last-name" />
                  </div>

                  <Input id="team-leader-phoneNumber" type="tel" value={teamLeaderFormData.phoneNumber} onChange={(e) => setTeamLeaderFormData({ ...teamLeaderFormData, phoneNumber: e.target.value })} placeholder="Enter phone number" required className={inputClassName} data-testid="input-team-leader-phone-number" />
                  <Input id="team-leader-email" type="email" value={teamLeaderFormData.email} onChange={(e) => setTeamLeaderFormData({ ...teamLeaderFormData, email: e.target.value })} placeholder="Enter email" required className={inputClassName} data-testid="input-team-leader-email" />
                  <PasswordInput id="team-leader-password" value={teamLeaderFormData.password} onChange={(e) => setTeamLeaderFormData({ ...teamLeaderFormData, password: e.target.value })} placeholder={editData ? "Leave blank to keep current password" : "Enter password"} required={!editData} className={inputClassName} data-testid="input-team-leader-password" />

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">Joining Date</label>
                    <StandardDatePicker value={teamLeaderJoiningDate} onChange={setTeamLeaderJoiningDate} placeholder="dd-mm-yyyy" className={dateClassName} />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button type="button" variant="outline" onClick={handleClose} className="h-10 flex-1 rounded-[10px] border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-50" data-testid="button-cancel-team-leader">Cancel</Button>
                  <Button type="submit" className="h-10 flex-1 rounded-[10px] bg-green-600 text-sm text-white hover:bg-green-700" data-testid="button-add-team-leader">{editData ? "Update" : "Add"}</Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="recruiter" className="mt-0">
              <form onSubmit={handleRecruiterSubmit} className={formLayoutClassName}>
                <div className={formFieldsClassName}>
                  <div className="grid grid-cols-2 gap-4">
                    <Input id="recruiter-firstName" type="text" value={recruiterFormData.firstName} onChange={(e) => setRecruiterFormData({ ...recruiterFormData, firstName: e.target.value })} placeholder="First name" required className={inputClassName} data-testid="input-recruiter-first-name" />
                    <Input id="recruiter-lastName" type="text" value={recruiterFormData.lastName} onChange={(e) => setRecruiterFormData({ ...recruiterFormData, lastName: e.target.value })} placeholder="Last name" required className={inputClassName} data-testid="input-recruiter-last-name" />
                  </div>

                  <Input id="recruiter-phoneNumber" type="tel" value={recruiterFormData.phoneNumber} onChange={(e) => setRecruiterFormData({ ...recruiterFormData, phoneNumber: e.target.value })} placeholder="Enter phone number" required className={inputClassName} data-testid="input-recruiter-phone-number" />
                  <Input id="recruiter-email" type="email" value={recruiterFormData.email} onChange={(e) => setRecruiterFormData({ ...recruiterFormData, email: e.target.value })} placeholder="Enter email" required className={inputClassName} data-testid="input-recruiter-email" />
                  <PasswordInput id="recruiter-password" value={recruiterFormData.password} onChange={(e) => setRecruiterFormData({ ...recruiterFormData, password: e.target.value })} placeholder={editData ? "Leave blank to keep current password" : "Enter password"} required={!editData} className={inputClassName} data-testid="input-recruiter-password" />

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">Joining Date</label>
                    <StandardDatePicker value={recruiterJoiningDate} onChange={setRecruiterJoiningDate} placeholder="dd-mm-yyyy" className={dateClassName} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">Assign to</label>
                    <Select value={recruiterFormData.reportingTo} onValueChange={(value) => setRecruiterFormData({ ...recruiterFormData, reportingTo: value })}>
                      <SelectTrigger className={selectClassName} data-testid="select-assign-to-tl">
                        <SelectValue placeholder={teamLeadersLoading ? "Loading team leaders..." : "Select Team Leader"} />
                      </SelectTrigger>
                      <SelectContent>
                        {teamLeadersLoading ? (
                          <SelectItem value="loading" disabled>Loading team leaders...</SelectItem>
                        ) : teamLeaders && teamLeaders.length > 0 ? (
                          teamLeaders.map((tl: any) => (
                            <SelectItem key={tl.employeeId} value={tl.employeeId}>
                              {tl.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-leaders" disabled>No team leaders available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button type="button" variant="outline" onClick={handleClose} className="h-10 flex-1 rounded-[10px] border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-50" data-testid="button-cancel-recruiter">Cancel</Button>
                  <Button type="submit" className="h-10 flex-1 rounded-[10px] bg-green-600 text-sm text-white hover:bg-green-700" data-testid="button-add-recruiter">{editData ? "Update" : "Add"}</Button>
                </div>
              </form>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
