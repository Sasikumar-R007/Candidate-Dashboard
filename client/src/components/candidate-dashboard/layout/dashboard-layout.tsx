import { ReactNode, useState } from "react";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>

        <footer className="py-6 px-8 bg-white border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>© 2026 StaffOS Recruitment Platform. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 border-none w-64 bg-slate-900">
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
