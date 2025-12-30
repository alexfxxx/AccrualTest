import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CashFlowForecast {
  months: {
    month: string;
    inflows: number;
    outflows: number;
    netFlow: number;
    cumulativeBalance: number;
    details: {
      routeIncome: number;
      expectedPayments: number;
      vehicleInstallments: number;
      vehicleInsurance: number;
      vehicleParking: number;
      employeeCosts: number;
      subcontractorCosts: number;
      recurringExpenses: number;
    };
  }[];
  summary: {
    totalInflows: number;
    totalOutflows: number;
    netCashFlow: number;
    endingBalance: number;
  };
}

export default function ReportsCashFlow() {
  const [period, setPeriod] = useState("6");

  const { data: forecast, isLoading } = useQuery<CashFlowForecast>({
    queryKey: ["/api/reports/cashflow", period],
    queryFn: async () => {
      const res = await fetch(`/api/reports/cashflow?period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch cash flow forecast");
      return res.json();
    },
  });

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Cash Flow Forecast"
        description="Project future cash flows based on current data"
        actions={
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48" data-testid="select-cashflow-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Months</SelectItem>
              <SelectItem value="6">6 Months</SelectItem>
              <SelectItem value="12">12 Months</SelectItem>
              <SelectItem value="24">24 Months</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-80 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-80 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Inflows</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-mono tabular-nums text-chart-2">
                  {formatCurrency(forecast?.summary.totalInflows ?? 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Outflows</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-mono tabular-nums text-chart-5">
                  {formatCurrency(forecast?.summary.totalOutflows ?? 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Net Cash Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-bold font-mono tabular-nums ${
                    (forecast?.summary.netCashFlow ?? 0) < 0 ? "text-destructive" : ""
                  }`}
                >
                  {formatCurrency(forecast?.summary.netCashFlow ?? 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Ending Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-bold font-mono tabular-nums ${
                    (forecast?.summary.endingBalance ?? 0) < 0 ? "text-destructive" : ""
                  }`}
                >
                  {formatCurrency(forecast?.summary.endingBalance ?? 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Monthly Inflows vs Outflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={forecast?.months ?? []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis
                        className="text-xs"
                        tickFormatter={(val) => `S$${(val / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="inflows"
                        name="Inflows"
                        fill="hsl(var(--chart-2))"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="outflows"
                        name="Outflows"
                        fill="hsl(var(--chart-5))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Cumulative Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecast?.months ?? []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis
                        className="text-xs"
                        tickFormatter={(val) => `S$${(val / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="cumulativeBalance"
                        name="Cumulative Balance"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-1))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Monthly Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Inflows</TableHead>
                      <TableHead className="text-right">Outflows</TableHead>
                      <TableHead className="text-right">Net Flow</TableHead>
                      <TableHead className="text-right">Running Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forecast?.months.map((month, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{month.month}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-chart-2">
                          {formatCurrency(month.inflows)}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-chart-5">
                          {formatCurrency(month.outflows)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono tabular-nums ${
                            month.netFlow < 0 ? "text-destructive" : ""
                          }`}
                        >
                          {formatCurrency(month.netFlow)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono tabular-nums font-medium ${
                            month.cumulativeBalance < 0 ? "text-destructive" : ""
                          }`}
                        >
                          {formatCurrency(month.cumulativeBalance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
