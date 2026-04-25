import { 
  Bell, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  Briefcase,
  Zap
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Application Updated",
    description: "Your application for Senior Full Stack Engineer at InnovateTech moved to 'Screening'.",
    time: "2 hours ago",
    icon: CheckCircle2,
    iconColor: "text-green-500",
    bgColor: "bg-green-50",
    unread: true
  },
  {
    id: 2,
    title: "New Custom Match",
    description: "A new Staff Software Engineer role matches 92% of your profile.",
    time: "5 hours ago",
    icon: Zap,
    iconColor: "text-indigo-500",
    bgColor: "bg-indigo-50",
    unread: true
  },
  {
    id: 3,
    title: "Profile Insight",
    description: "Add 'Next.js' to your skills to unlock 15 more job matches.",
    time: "1 day ago",
    icon: Sparkles,
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50",
    unread: false
  }
];

export default function NotificationCenter() {
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-600 hover:bg-slate-100 rounded-full transition-all active:scale-90">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 mt-2 p-0 border-slate-200 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <DropdownMenuLabel className="p-4 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-xs uppercase tracking-widest text-slate-900">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button className="text-[10px] font-bold text-indigo-600 hover:underline px-2">
            Mark all read
          </button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0" />
        <ScrollArea className="h-[350px]">
          <div className="flex flex-col">
            {MOCK_NOTIFICATIONS.map((notif) => (
              <div 
                key={notif.id} 
                className={cn(
                  "p-4 border-b border-slate-50 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer group",
                  notif.unread && "bg-indigo-50/30"
                )}
              >
                <div className={cn("p-2 rounded-xl shrink-0 group-hover:scale-110 transition-transform", notif.bgColor, notif.iconColor)}>
                  <notif.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-black text-[11px] text-slate-900 uppercase tracking-tight truncate">{notif.title}</p>
                    <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{notif.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium line-clamp-2">
                    {notif.description}
                  </p>
                </div>
                {notif.unread && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <DropdownMenuSeparator className="m-0" />
        <div className="p-3 bg-slate-50/50 text-center">
          <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-600 transition-colors">
            View all activity
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
