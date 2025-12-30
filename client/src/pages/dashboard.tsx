import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, getStatusVariant } from "@/lib/utils";
import {
  DollarSign,
  Receipt,
  TrendingUp,
  Route,
  Bus,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Customer, Vehicle, Employee, IncomeRecord, Expense } from "@shared/schema";

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

export default function Dashboard() {
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

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader title="Dashboard" description="Overview of your transport business" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
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
  const activeEmployees = employees?.filter(e => e.status === "active").length ?? 0;
  const totalCustomers = customers?.length ?? 0;

  return (
    <div className="p-6 space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Overview of your transport business" 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Income (Month)"
          value={formatCurrency(stats?.totalIncomeMonth ?? 0)}
          icon={DollarSign}
        />
        <StatCard
          title="Income (YTD)"
          value={formatCurrency(stats?.totalIncomeYTD ?? 0)}
          icon={DollarSign}
        />
        <StatCard
          title="Expenses (Month)"
          value={formatCurrency(stats?.totalExpensesMonth ?? 0)}
          icon={Receipt}
        />
        <StatCard
          title="Expenses (YTD)"
          value={formatCurrency(stats?.totalExpensesYTD ?? 0)}
          icon={Receipt}
        />
        <StatCard
          title="Net Profit (Month)"
          value={formatCurrency(stats?.netProfitMonth ?? 0)}
          icon={TrendingUp}
        />
        <StatCard
          title="Net Profit (YTD)"
          value={formatCurrency(stats?.netProfitYTD ?? 0)}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Active Routes"
          value={String(stats?.activeRoutes ?? 0)}
          icon={Route}
        />
        <StatCard
          title="Active Vehicles"
          value={String(activeVehicles)}
          subtitle={`${vehicles?.length ?? 0} total`}
          icon={Bus}
        />
        <StatCard
          title="Employees"
          value={String(activeEmployees)}
          subtitle={`${employees?.length ?? 0} total`}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Income vs Expenses Trend
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

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.recentIncome?.slice(0, 3).map((income) => (
              <div key={income.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium">{income.description || "Route Income"}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(income.dueDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono tabular-nums text-chart-2">
                    +{formatCurrency(income.amount)}
                  </p>
                  <Badge variant={getStatusVariant(income.paymentStatus)} className="text-xs">
                    {income.paymentStatus}
                  </Badge>
                </div>
              </div>
            ))}
            {stats?.recentExpenses?.slice(0, 3).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
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
      </div>

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
              <p className="text-xs text-muted-foreground">Total Customers</p>
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
    </div>
  );
}
