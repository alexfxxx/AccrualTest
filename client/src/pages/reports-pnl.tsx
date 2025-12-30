import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { Printer } from "lucide-react";

interface PLReport {
  period: { from: string; to: string };
  income: {
    routeIncome: number;
    adhocIncome: number;
    totalIncome: number;
    byCustomer: { name: string; amount: number }[];
  };
  expenses: {
    byCategory: { name: string; amount: number }[];
    subcontractorCosts: number;
    employeeCosts: number;
    vehicleCosts: number;
    totalExpenses: number;
  };
  netProfit: number;
}

export default function ReportsPnL() {
  const [fromDate, setFromDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-01-01`;
  });
  const [toDate, setToDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });

  const { data: report, isLoading } = useQuery<PLReport>({
    queryKey: ["/api/reports/pnl", fromDate, toDate],
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 print:p-0">
      <PageHeader
        title="Profit & Loss Statement"
        description="Review income and expenses for a selected period"
        actions={
          <Button onClick={handlePrint} data-testid="button-print-pnl">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        }
      />

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Select Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                data-testid="input-pnl-from"
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                data-testid="input-pnl-to"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="print:shadow-none print:border-0">
          <CardHeader className="print:pb-2">
            <div className="text-center">
              <h2 className="text-xl font-bold">Transport Co.</h2>
              <p className="text-lg font-semibold">Profit & Loss Statement</p>
              <p className="text-sm text-muted-foreground">
                For the period {new Date(fromDate).toLocaleDateString("en-SG")} to{" "}
                {new Date(toDate).toLocaleDateString("en-SG")}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                Income
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-1">
                  <span className="pl-4">Route Income</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(report?.income.routeIncome ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="pl-4">Ad-hoc Income</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(report?.income.adhocIncome ?? 0)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between py-1 font-semibold">
                  <span>Total Income</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(report?.income.totalIncome ?? 0)}
                  </span>
                </div>
              </div>

              {report?.income.byCustomer && report.income.byCustomer.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">By Customer:</p>
                  {report.income.byCustomer.map((c, i) => (
                    <div key={i} className="flex justify-between py-1 text-sm">
                      <span className="pl-8 text-muted-foreground">{c.name}</span>
                      <span className="font-mono tabular-nums text-muted-foreground">
                        {formatCurrency(c.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator className="border-t-2" />

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                Expenses
              </h3>
              <div className="space-y-2">
                {report?.expenses.byCategory?.map((cat, i) => (
                  <div key={i} className="flex justify-between py-1">
                    <span className="pl-4">{cat.name}</span>
                    <span className="font-mono tabular-nums">
                      {formatCurrency(cat.amount)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between py-1">
                  <span className="pl-4">Subcontractor Costs</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(report?.expenses.subcontractorCosts ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="pl-4">Employee Costs (Salary + CPF/Levy)</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(report?.expenses.employeeCosts ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="pl-4">Vehicle Costs (Installments + Insurance + Parking)</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(report?.expenses.vehicleCosts ?? 0)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between py-1 font-semibold">
                  <span>Total Expenses</span>
                  <span className="font-mono tabular-nums">
                    {formatCurrency(report?.expenses.totalExpenses ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="border-t-4 border-double" />

            <div className="flex justify-between py-2 text-lg font-bold">
              <span>Net Profit / (Loss)</span>
              <span
                className={`font-mono tabular-nums ${
                  (report?.netProfit ?? 0) < 0 ? "text-destructive" : ""
                }`}
              >
                {formatCurrency(report?.netProfit ?? 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
