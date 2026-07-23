import Link from "next/link";
import { LayoutDashboard, Phone, Users, UserRound, Building2, Bell, Settings } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Calls", href: "/dashboard/calls", icon: Phone },
  { name: "Doctors", href: "/dashboard/doctors", icon: Users },
  { name: "Patients", href: "/dashboard/patients", icon: UserRound },
  { name: "Organizations", href: "/dashboard/organizations", icon: Building2 },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-sidebar-foreground">CallMind AI</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <item.icon className="h-5 w-5 opacity-70 group-hover:opacity-100" />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-sidebar-foreground">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            CM
          </div>
          <div className="flex flex-col">
            <span>Admin User</span>
            <span className="text-xs text-muted-foreground">admin@callmind.ai</span>
          </div>
        </div>
      </div>
    </div>
  );
}
