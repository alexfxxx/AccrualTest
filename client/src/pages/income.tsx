import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate, formatBillingPeriod, getCurrentBillingPeriod, getStatusVariant } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { IncomeRecordWithRelations, Customer, RouteWithRelations } from "@shared/schema";

const incomeFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  routeId: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  billingPeriod: z.string().min(1, "Billing period is required"),
  incomeType: z.string().default("route"),
  description: z.string().optional(),
  paymentStatus: z.string().default("pending"),
  dueDate: z.string().optional(),
  paidDate: z.string().optional(),
});

type IncomeFormData = z.infer<typeof incomeFormSchema>;

export default function Income() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeRecordWithRelations | null>(null);
  const { toast } = useToast();

  const { data: incomeRecords, isLoading } = useQuery<IncomeRecordWithRelations[]>({
    queryKey: ["/api/income"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: routes } = useQuery<RouteWithRelations[]>({
    queryKey: ["/api/routes"],
  });

  const form = useForm<IncomeFormData>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      customerId: "",
      routeId: "",
      amount: "",
      billingPeriod: getCurrentBillingPeriod(),
      incomeType: "route",
      description: "",
      paymentStatus: "pending",
      dueDate: "",
      paidDate: "",
    },
  });

  const selectedCustomerId = form.watch("customerId");
  const customerRoutes = routes?.filter(
    (r) => r.customerId?.toString() === selectedCustomerId
  );

  const createMutation = useMutation({
    mutationFn: (data: IncomeFormData) => {
      const payload = {
        ...data,
        customerId: parseInt(data.customerId),
        routeId: data.routeId && data.routeId !== "none" ? parseInt(data.routeId) : null,
        dueDate: data.dueDate || null,
        paidDate: data.paidDate || null,
      };
      return apiRequest("POST", "/api/income", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Income record created successfully" });
      handleClose();
    },
    onError: () => {
      toast({ title: "Failed to create income record", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: IncomeFormData & { id: number }) => {
      const payload = {
        ...data,
        customerId: parseInt(data.customerId),
        routeId: data.routeId && data.routeId !== "none" ? parseInt(data.routeId) : null,
        dueDate: data.dueDate || null,
        paidDate: data.paidDate || null,
      };
      return apiRequest("PUT", `/api/income/${data.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Income record updated successfully" });
      handleClose();
    },
    onError: () => {
      toast({ title: "Failed to update income record", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/income/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Income record deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete income record", variant: "destructive" });
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    setEditingIncome(null);
    form.reset();
  };

  const handleEdit = (income: IncomeRecordWithRelations) => {
    setEditingIncome(income);
    form.reset({
      customerId: income.customerId?.toString() ?? "",
      routeId: income.routeId?.toString() ?? "",
      amount: income.amount,
      billingPeriod: income.billingPeriod,
      incomeType: income.incomeType,
      description: income.description ?? "",
      paymentStatus: income.paymentStatus,
      dueDate: income.dueDate ?? "",
      paidDate: income.paidDate ?? "",
    });
    setIsOpen(true);
  };

  const onSubmit = (data: IncomeFormData) => {
    if (editingIncome) {
      updateMutation.mutate({ ...data, id: editingIncome.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    {
      header: "Period",
      accessor: (row: IncomeRecordWithRelations) => formatBillingPeriod(row.billingPeriod),
    },
    {
      header: "Customer",
      accessor: (row: IncomeRecordWithRelations) => row.customer?.name ?? "-",
    },
    {
      header: "Route",
      accessor: (row: IncomeRecordWithRelations) => row.route?.name ?? "-",
    },
    {
      header: "Type",
      accessor: (row: IncomeRecordWithRelations) => (
        <Badge variant={row.incomeType === "route" ? "default" : "secondary"}>
          {row.incomeType}
        </Badge>
      ),
    },
    {
      header: "Amount",
      accessor: (row: IncomeRecordWithRelations) => (
        <span className="font-mono tabular-nums">{formatCurrency(row.amount)}</span>
      ),
      className: "text-right",
    },
    {
      header: "Due Date",
      accessor: (row: IncomeRecordWithRelations) => formatDate(row.dueDate),
    },
    {
      header: "Status",
      accessor: (row: IncomeRecordWithRelations) => (
        <Badge variant={getStatusVariant(row.paymentStatus)}>{row.paymentStatus}</Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (row: IncomeRecordWithRelations) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            data-testid={`button-edit-income-${row.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Are you sure you want to delete this income record?")) {
                deleteMutation.mutate(row.id);
              }
            }}
            data-testid={`button-delete-income-${row.id}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
      className: "w-24",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Income"
        description="Track monthly income from customers and ad-hoc trips"
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-income">
                <Plus className="h-4 w-4 mr-2" />
                Add Income
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingIncome ? "Edit Income Record" : "Add New Income Record"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-income-customer">
                                <SelectValue placeholder="Select customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {customers?.map((c) => (
                                <SelectItem key={c.id} value={c.id.toString()}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="routeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Route</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-income-route">
                                <SelectValue placeholder="Select route (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {customerRoutes?.map((r) => (
                                <SelectItem key={r.id} value={r.id.toString()}>
                                  {r.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="incomeType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Income Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-income-type">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="route">Route (Contract)</SelectItem>
                              <SelectItem value="adhoc">Ad-hoc Trip</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (SGD) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              data-testid="input-income-amount"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="billingPeriod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Period *</FormLabel>
                          <FormControl>
                            <Input
                              type="month"
                              {...field}
                              data-testid="input-income-period"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="paymentStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-income-status">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-income-due" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="paidDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paid Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-income-paid" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} data-testid="input-income-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-save-income"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingIncome
                        ? "Update"
                        : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        columns={columns}
        data={incomeRecords ?? []}
        isLoading={isLoading}
        emptyMessage="No income records found"
        emptyAction={
          <Button onClick={() => setIsOpen(true)} data-testid="button-add-first-income">
            <Plus className="h-4 w-4 mr-2" />
            Add your first income record
          </Button>
        }
      />
    </div>
  );
}
