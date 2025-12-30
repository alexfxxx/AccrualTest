import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Route,
  DollarSign,
  Receipt,
  Bus,
  UserCog,
  FileText,
  TrendingUp,
  Truck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    group: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
    ],
  },
  {
    group: "Operations",
    items: [
      { title: "Customers", url: "/customers", icon: Users },
      { title: "Routes", url: "/routes", icon: Route },
      { title: "Vehicles", url: "/vehicles", icon: Bus },
      { title: "Employees", url: "/employees", icon: UserCog },
      { title: "Subcontractors", url: "/subcontractors", icon: Truck },
    ],
  },
  {
    group: "Finance",
    items: [
      { title: "Income", url: "/income", icon: DollarSign },
      { title: "Expenses", url: "/expenses", icon: Receipt },
    ],
  },
  {
    group: "Reports",
    items: [
      { title: "Profit & Loss", url: "/reports/pnl", icon: FileText },
      { title: "Cash Flow", url: "/reports/cashflow", icon: TrendingUp },
    ],
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
            <Bus className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">Transport Co.</span>
            <span className="text-xs text-muted-foreground">Accounting System</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-2">
        {navigationItems.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {group.group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location === item.url || 
                    (item.url !== "/" && location.startsWith(item.url));
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="gap-3"
                      >
                        <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <p className="text-xs text-muted-foreground text-center">
          Singapore Locale (SGD)
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
