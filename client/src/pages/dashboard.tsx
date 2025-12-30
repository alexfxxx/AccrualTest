import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate, getStatusVariant } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  DollarSign,
  Receipt,
  TrendingUp,
  TrendingDown,
  Route,
  Bus,
  Users,
  Building2,
  Settings2,
  GripVertical,
  Database,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Customer, Vehicle, Employee, IncomeRecord, Expense, Route as RouteType } from "@shared/schema";

interface DashboardStats {
  totalIncomeMonth: number;
  totalIncomeYTD: number;
  totalExpensesMonth: number;
  totalExpensesYTD: number;
  netProfitMonth: number;
  netProfitYTD: number;
  activeRoutes: number;
  activeVehicles: number;
  activeEmployees: number;
  recentIncome: IncomeRecord[];
  recentExpenses: Expense[];
  monthlyTrend: { month: string; income: number; expenses: number }[];
}

interface WidgetConfig {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "financial-kpis", title: "Financial KPIs", visible: true, order: 0 },
  { id: "operational-stats", title: "Operational Statistics", visible: true, order: 1 },
  { id: "income-expense-trend", title: "Income vs Expenses Trend", visible: true, order: 2 },
  { id: "payment-status", title: "Payment Status Overview", visible: true, order: 3 },
  { id: "recent-transactions", title: "Recent Transactions", visible: true, order: 4 },
  { id: "top-customers", title: "Top Customers by Revenue", visible: true, order: 5 },
  { id: "vehicle-utilization", title: "Vehicle Status Overview", visible: true, order: 6 },
  { id: "employee-breakdown", title: "Employee Cost Breakdown", visible: true, order: 7 },
  { id: "quick-stats", title: "Quick Stats", visible: true, order: 8 },
];

const STORAGE_KEY = "dashboard-widget-config";

function loadWidgetConfig(): WidgetConfig[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load widget config", e);
  }
  return DEFAULT_WIDGETS;
}

function saveWidgetConfig(config: WidgetConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Dashboard() {
  const { toast } = useToast();
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig[]>(loadWidgetConfig);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOverWidget, setDragOverWidget] = useState<string | null>(null);

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: routes } = useQuery<RouteType[]>({
    queryKey: ["/api/routes"],
  });

  const { data: income } = useQuery<IncomeRecord[]>({
    queryKey: ["/api/income"],
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/seed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Database seeded with comprehensive sample data" });
      queryClient.invalidateQueries();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to seed database", variant: "destructive" });
    },
  });

  useEffect(() => {
    saveWidgetConfig(widgetConfig);
  }, [widgetConfig]);

  const toggleWidget = (id: string) => {
    setWidgetConfig(prev =>
      prev.map(w => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
  };

  const moveWidget = (dragId: string, hoverId: string) => {
    const dragIndex = widgetConfig.findIndex(w => w.id === dragId);
    const hoverIndex = widgetConfig.findIndex(w => w.id === hoverId);
    if (dragIndex === hoverIndex) return;

    const newConfig = [...widgetConfig];
    const [removed] = newConfig.splice(dragIndex, 1);
    newConfig.splice(hoverIndex, 0, removed);
    newConfig.forEach((w, i) => (w.order = i));
    setWidgetConfig(newConfig);
  };

  const resetWidgets = () => {
    setWidgetConfig(DEFAULT_WIDGETS);
    toast({ title: "Reset", description: "Dashboard widgets reset to default" });
  };

  const visibleWidgets = widgetConfig
    .filter(w => w.visible)
    .sort((a, b) => a.order - b.order);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader title="Dashboard" description="Overview of your transport business" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeVehicles = vehicles?.filter(v => v.status === "active").length ?? 0;
  const maintenanceVehicles = vehicles?.filter(v => v.status === "maintenance").length ?? 0;
  const inactiveVehicles = vehicles?.filter(v => v.status === "inactive").length ?? 0;
  const activeEmployees = employees?.filter(e => e.status === "active").length ?? 0;
  const localEmployees = employees?.filter(e => e.workerType === "local" && e.status === "active").length ?? 0;
  const foreignEmployees = employees?.filter(e => e.workerType === "foreign" && e.status === "active").length ?? 0;
  const totalCustomers = customers?.filter(c => c.status === "active").length ?? 0;

  const paymentStatusData = [
    { name: "Paid", value: income?.filter(i => i.paymentStatus === "paid").length ?? 0, color: "hsl(var(--chart-2))" },
    { name: "Pending", value: income?.filter(i => i.paymentStatus === "pending").length ?? 0, color: "hsl(var(--chart-4))" },
    { name: "Overdue", value: income?.filter(i => i.paymentStatus === "overdue").length ?? 0, color: "hsl(var(--destructive))" },
  ];

  const vehicleStatusData = [
    { name: "Active", value: activeVehicles, color: "hsl(var(--chart-2))" },
    { name: "Maintenance", value: maintenanceVehicles, color: "hsl(var(--chart-4))" },
    { name: "Inactive", value: inactiveVehicles, color: "hsl(var(--muted-foreground))" },
  ];

  const employeeCostData = employees
    ?.filter(e => e.status === "active")
    .reduce((acc: { local: number; foreign: number; cpf: number; levy: number }, emp) => {
      const salary = parseFloat(emp.salary || "0");
      if (emp.workerType === "local") {
        acc.local += salary;
        acc.cpf += salary * 0.17;
      } else {
        acc.foreign += salary;
        acc.levy += parseFloat(emp.foreignWorkerLevy || "0");
      }
      return acc;
    }, { local: 0, foreign: 0, cpf: 0, levy: 0 });

  const topCustomers = customers
    ?.filter(c => c.status === "active")
    .map(c => {
      const customerIncome = income
        ?.filter(i => i.customerId === c.id)
        .reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0) ?? 0;
      return { name: c.name, revenue: customerIncome };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5) ?? [];

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "financial-kpis":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              title="Income (Month)"
              value={formatCurrency(stats?.totalIncomeMonth ?? 0)}
              icon={DollarSign}
              data-testid="stat-income-month"
            />
            <StatCard
              title="Income (YTD)"
              value={formatCurrency(stats?.totalIncomeYTD ?? 0)}
              icon={DollarSign}
              data-testid="stat-income-ytd"
            />
            <StatCard
              title="Expenses (Month)"
              value={formatCurrency(stats?.totalExpensesMonth ?? 0)}
              icon={Receipt}
              data-testid="stat-expenses-month"
            />
            <StatCard
              title="Expenses (YTD)"
              value={formatCurrency(stats?.totalExpensesYTD ?? 0)}
              icon={Receipt}
              data-testid="stat-expenses-ytd"
            />
            <StatCard
              title="Net Profit (Month)"
              value={formatCurrency(stats?.netProfitMonth ?? 0)}
              icon={(stats?.netProfitMonth ?? 0) >= 0 ? TrendingUp : TrendingDown}
              data-testid="stat-profit-month"
            />
            <StatCard
              title="Net Profit (YTD)"
              value={formatCurrency(stats?.netProfitYTD ?? 0)}
              icon={(stats?.netProfitYTD ?? 0) >= 0 ? TrendingUp : TrendingDown}
              data-testid="stat-profit-ytd"
            />
          </div>
        );

      case "operational-stats":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Customers"
              value={String(totalCustomers)}
              icon={Building2}
              data-testid="stat-customers"
            />
            <StatCard
              title="Active Routes"
              value={String(stats?.activeRoutes ?? 0)}
              icon={Route}
              data-testid="stat-routes"
            />
            <StatCard
              title="Active Vehicles"
              value={String(activeVehicles)}
              subtitle={`${maintenanceVehicles} in maintenance`}
              icon={Bus}
              data-testid="stat-vehicles"
            />
            <StatCard
              title="Employees"
              value={String(activeEmployees)}
              subtitle={`${localEmployees} local, ${foreignEmployees} foreign`}
              icon={Users}
              data-testid="stat-employees"
            />
          </div>
        );

      case "income-expense-trend":
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Income vs Expenses Trend (Last 12 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.monthlyTrend ?? []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(val) => `S$${(val / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );

      case "payment-status":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Payment Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="h-48 w-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {paymentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-chart-2" />
                    <span className="flex-1">Paid</span>
                    <Badge variant="secondary">{paymentStatusData[0].value} records</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-chart-4" />
                    <span className="flex-1">Pending</span>
                    <Badge variant="secondary">{paymentStatusData[1].value} records</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <span className="flex-1">Overdue</span>
                    <Badge variant="destructive">{paymentStatusData[2].value} records</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "recent-transactions":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.recentIncome?.slice(0, 4).map((incomeItem) => (
                <div key={incomeItem.id} className="flex items-center justify-between py-2 border-b border-border last:border-0" data-testid={`transaction-income-${incomeItem.id}`}>
                  <div>
                    <p className="text-sm font-medium">{incomeItem.description || "Route Income"}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(incomeItem.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono tabular-nums text-chart-2">
                      +{formatCurrency(incomeItem.amount)}
                    </p>
                    <Badge variant={getStatusVariant(incomeItem.paymentStatus)} className="text-xs">
                      {incomeItem.paymentStatus}
                    </Badge>
                  </div>
                </div>
              ))}
              {stats?.recentExpenses?.slice(0, 3).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between py-2 border-b border-border last:border-0" data-testid={`transaction-expense-${expense.id}`}>
                  <div>
                    <p className="text-sm font-medium">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(expense.expenseDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono tabular-nums text-destructive">
                      -{formatCurrency(expense.amount)}
                    </p>
                  </div>
                </div>
              ))}
              {(!stats?.recentIncome?.length && !stats?.recentExpenses?.length) && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent transactions
                </p>
              )}
            </CardContent>
          </Card>
        );

      case "top-customers":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Top Customers by Revenue (YTD)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={customer.name} className="flex items-center gap-3" data-testid={`top-customer-${index}`}>
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{customer.name}</p>
                      <div className="h-2 bg-muted rounded-full mt-1">
                        <div
                          className="h-2 bg-primary rounded-full"
                          style={{ width: `${(customer.revenue / (topCustomers[0]?.revenue || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm font-mono tabular-nums">{formatCurrency(customer.revenue)}</p>
                  </div>
                ))}
                {topCustomers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No customer data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case "vehicle-utilization":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Vehicle Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="h-48 w-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={vehicleStatusData.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={false}
                      >
                        {vehicleStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-chart-2" />
                    <span className="flex-1">Active</span>
                    <Badge variant="secondary">{activeVehicles} vehicles</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Settings2 className="h-5 w-5 text-chart-4" />
                    <span className="flex-1">Maintenance</span>
                    <Badge variant="secondary">{maintenanceVehicles} vehicles</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Bus className="h-5 w-5 text-muted-foreground" />
                    <span className="flex-1">Inactive</span>
                    <Badge variant="outline">{inactiveVehicles} vehicles</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "employee-breakdown":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Monthly Employee Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-md bg-muted/50">
                    <p className="text-xs text-muted-foreground">Local Salaries</p>
                    <p className="text-lg font-bold font-mono">{formatCurrency(employeeCostData?.local ?? 0)}</p>
                    <p className="text-xs text-muted-foreground">{localEmployees} employees</p>
                  </div>
                  <div className="p-4 rounded-md bg-muted/50">
                    <p className="text-xs text-muted-foreground">CPF Contribution (17%)</p>
                    <p className="text-lg font-bold font-mono">{formatCurrency(employeeCostData?.cpf ?? 0)}</p>
                    <p className="text-xs text-muted-foreground">Employer portion</p>
                  </div>
                  <div className="p-4 rounded-md bg-muted/50">
                    <p className="text-xs text-muted-foreground">Foreign Salaries</p>
                    <p className="text-lg font-bold font-mono">{formatCurrency(employeeCostData?.foreign ?? 0)}</p>
                    <p className="text-xs text-muted-foreground">{foreignEmployees} employees</p>
                  </div>
                  <div className="p-4 rounded-md bg-muted/50">
                    <p className="text-xs text-muted-foreground">Foreign Worker Levy</p>
                    <p className="text-lg font-bold font-mono">{formatCurrency(employeeCostData?.levy ?? 0)}</p>
                    <p className="text-xs text-muted-foreground">Monthly levy</p>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Monthly Cost</span>
                  <span className="text-lg font-bold font-mono">
                    {formatCurrency(
                      (employeeCostData?.local ?? 0) +
                      (employeeCostData?.cpf ?? 0) +
                      (employeeCostData?.foreign ?? 0) +
                      (employeeCostData?.levy ?? 0)
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "quick-stats":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-md bg-muted/50">
                  <p className="text-2xl font-bold font-mono">{totalCustomers}</p>
                  <p className="text-xs text-muted-foreground">Active Customers</p>
                </div>
                <div className="text-center p-4 rounded-md bg-muted/50">
                  <p className="text-2xl font-bold font-mono">{stats?.activeRoutes ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Active Routes</p>
                </div>
                <div className="text-center p-4 rounded-md bg-muted/50">
                  <p className="text-2xl font-bold font-mono">{activeVehicles}</p>
                  <p className="text-xs text-muted-foreground">Active Vehicles</p>
                </div>
                <div className="text-center p-4 rounded-md bg-muted/50">
                  <p className="text-2xl font-bold font-mono">{activeEmployees}</p>
                  <p className="text-xs text-muted-foreground">Active Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your transport business"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              data-testid="button-seed-data"
            >
              <Database className="h-4 w-4 mr-2" />
              {seedMutation.isPending ? "Loading..." : "Load Sample Data"}
            </Button>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-customize-widgets">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Customize Dashboard</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    Toggle widgets on/off and drag to reorder.
                  </p>
                  <div className="space-y-2" data-testid="widget-config-list">
                    {widgetConfig.sort((a, b) => a.order - b.order).map((widget) => (
                      <div
                        key={widget.id}
                        className={`flex items-center gap-3 p-3 rounded-md border bg-card cursor-move transition-all ${
                          draggedWidget === widget.id ? "opacity-50 scale-95" : ""
                        } ${dragOverWidget === widget.id && draggedWidget !== widget.id ? "border-primary border-2" : ""}`}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = "move";
                          setDraggedWidget(widget.id);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                        }}
                        onDragEnter={() => setDragOverWidget(widget.id)}
                        onDragLeave={() => setDragOverWidget(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedWidget && draggedWidget !== widget.id) {
                            moveWidget(draggedWidget, widget.id);
                          }
                          setDraggedWidget(null);
                          setDragOverWidget(null);
                        }}
                        onDragEnd={() => {
                          setDraggedWidget(null);
                          setDragOverWidget(null);
                        }}
                        data-testid={`widget-config-${widget.id}`}
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" data-testid={`drag-handle-${widget.id}`} />
                        <Label htmlFor={widget.id} className="flex-1 cursor-pointer" data-testid={`label-${widget.id}`}>
                          {widget.title}
                        </Label>
                        <Switch
                          id={widget.id}
                          checked={widget.visible}
                          onCheckedChange={() => toggleWidget(widget.id)}
                          data-testid={`switch-${widget.id}`}
                        />
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={resetWidgets}
                    data-testid="button-reset-widgets"
                  >
                    Reset to Default
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {visibleWidgets.map((widget) => (
        <div key={widget.id} data-testid={`widget-${widget.id}`}>
          {renderWidget(widget.id)}
        </div>
      ))}
    </div>
  );
}
