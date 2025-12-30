import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency in SGD
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "S$ 0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "S$ 0.00";
  
  if (num < 0) {
    return `(S$ ${Math.abs(num).toLocaleString("en-SG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })})`;
  }
  
  return `S$ ${num.toLocaleString("en-SG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Format date for display
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-SG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Format billing period
export function formatBillingPeriod(period: string): string {
  const [year, month] = period.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-SG", { month: "long", year: "numeric" });
}

// Get current billing period in YYYY-MM format
export function getCurrentBillingPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Calculate CPF contribution (17% for local workers)
export function calculateCPF(salary: number): number {
  return salary * 0.17;
}

// Calculate total employee cost
export function calculateEmployeeCost(
  salary: number,
  workerType: string,
  levy: number = 0
): number {
  if (workerType === "local") {
    return salary + calculateCPF(salary);
  }
  return salary + levy;
}

// Status badge variants
export function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case "active":
    case "paid":
      return "default";
    case "inactive":
    case "pending":
      return "secondary";
    case "overdue":
    case "maintenance":
      return "destructive";
    default:
      return "outline";
  }
}
