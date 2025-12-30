import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  FormDescription,
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { ExpenseWithRelations, ExpenseCategory, Vehicle } from "@shared/schema";

const expenseFormSchema = z.object({
  categoryId: z.string().optional(),
  vehicleId: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  expenseDate: z.string().min(1, "Date is required"),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

export default function Expenses() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseWithRelations | null>(null);
  const { toast } = useToast();

  const { data: expenses, isLoading } = useQuery<ExpenseWithRelations[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: categories } = useQuery<ExpenseCategory[]>({
    queryKey: ["/api/expense-categories"],
  });

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      categoryId: "",
      vehicleId: "",
      amount: "",
      description: "",
      expenseDate: new Date().toISOString().split("T")[0],
      isRecurring: false,
      recurringFrequency: "",
    },
  });

  const categoryForm = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const isRecurring = form.watch("isRecurring");

  const createMutation = useMutation({
    mutationFn: (data: ExpenseFormData) => {
      const payload = {
        ...data,
        categoryId: data.categoryId && data.categoryId !== "none" ? parseInt(data.categoryId) : null,
        vehicleId: data.vehicleId && data.vehicleId !== "none" ? parseInt(data.vehicleId) : null,
        recurringFrequency: data.isRecurring ? data.recurringFrequency : null,
      };
      return apiRequest("POST", "/api/expenses", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Expense created successfully" });
      handleClose();
    },
    onError: () => {
      toast({ title: "Failed to create expense", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ExpenseFormData & { id: number }) => {
      const payload = {
        ...data,
        categoryId: data.categoryId && data.categoryId !== "none" ? parseInt(data.categoryId) : null,
        vehicleId: data.vehicleId && data.vehicleId !== "none" ? parseInt(data.vehicleId) : null,
        recurringFrequency: data.isRecurring ? data.recurringFrequency : null,
      };
      return apiRequest("PUT", `/api/expenses/${data.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Expense updated successfully" });
      handleClose();
    },
    onError: () => {
      toast({ title: "Failed to update expense", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Expense deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete expense", variant: "destructive" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      apiRequest("POST", "/api/expense-categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expense-categories"] });
      toast({ title: "Category created successfully" });
      setIsCategoryOpen(false);
      categoryForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to create category", variant: "destructive" });
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    setEditingExpense(null);
    form.reset();
  };

  const handleEdit = (expense: ExpenseWithRelations) => {
    setEditingExpense(expense);
    form.reset({
      categoryId: expense.categoryId?.toString() ?? "",
      vehicleId: expense.vehicleId?.toString() ?? "",
      amount: expense.amount,
      description: expense.description,
      expenseDate: expense.expenseDate,
      isRecurring: expense.isRecurring,
      recurringFrequency: expense.recurringFrequency ?? "",
    });
    setIsOpen(true);
  };

  const onSubmit = (data: ExpenseFormData) => {
    if (editingExpense) {
      updateMutation.mutate({ ...data, id: editingExpense.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    {
      header: "Date",
      accessor: (row: ExpenseWithRelations) => formatDate(row.expenseDate),
      sortKey: (row: ExpenseWithRelations) => row.expenseDate,
    },
    {
      header: "Description",
      accessor: "description" as const,
      sortKey: (row: ExpenseWithRelations) => row.description,
    },
    {
      header: "Category",
      accessor: (row: ExpenseWithRelations) => row.category?.name ?? "-",
      sortKey: (row: ExpenseWithRelations) => row.category?.name ?? "",
    },
    {
      header: "Vehicle",
      accessor: (row: ExpenseWithRelations) => row.vehicle?.registrationNumber ?? "-",
      sortKey: (row: ExpenseWithRelations) => row.vehicle?.registrationNumber ?? "",
    },
    {
      header: "Amount",
      accessor: (row: ExpenseWithRelations) => (
        <span className="font-mono tabular-nums">{formatCurrency(row.amount)}</span>
      ),
      className: "text-right",
      sortKey: (row: ExpenseWithRelations) => parseFloat(row.amount),
    },
    {
      header: "Recurring",
      accessor: (row: ExpenseWithRelations) =>
        row.isRecurring ? (
          <Badge variant="secondary">{row.recurringFrequency}</Badge>
        ) : (
          "-"
        ),
      sortKey: (row: ExpenseWithRelations) => row.isRecurring ? 1 : 0,
    },
    {
      header: "Actions",
      accessor: (row: ExpenseWithRelations) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            data-testid={`button-edit-expense-${row.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Are you sure you want to delete this expense?")) {
                deleteMutation.mutate(row.id);
              }
            }}
            data-testid={`button-delete-expense-${row.id}`}
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
        title="Expenses"
        description="Track and categorize business expenses"
        actions={
          <div className="flex gap-2">
            <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-add-category">
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Expense Category</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={categoryForm.handleSubmit((data) =>
                    createCategoryMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm font-medium">Category Name *</label>
                    <Input
                      {...categoryForm.register("name", { required: true })}
                      data-testid="input-category-name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      {...categoryForm.register("description")}
                      data-testid="input-category-description"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCategoryOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createCategoryMutation.isPending}
                      data-testid="button-save-category"
                    >
                      Create
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-expense">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingExpense ? "Edit Expense" : "Add New Expense"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-expense-description" />
                            </FormControl>
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
                                data-testid="input-expense-amount"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="expenseDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-expense-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-expense-category">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {categories?.map((c) => (
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
                        name="vehicleId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle (if applicable)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-expense-vehicle">
                                  <SelectValue placeholder="Select vehicle" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {vehicles?.map((v) => (
                                  <SelectItem key={v.id} value={v.id.toString()}>
                                    {v.registrationNumber} - {v.make} {v.model}
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
                        name="isRecurring"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Recurring Expense</FormLabel>
                              <FormDescription>
                                Is this a recurring expense?
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-expense-recurring"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {isRecurring && (
                        <FormField
                          control={form.control}
                          name="recurringFrequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequency</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-expense-frequency">
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="quarterly">Quarterly</SelectItem>
                                  <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                        data-testid="button-save-expense"
                      >
                        {createMutation.isPending || updateMutation.isPending
                          ? "Saving..."
                          : editingExpense
                          ? "Update"
                          : "Create"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={expenses ?? []}
        isLoading={isLoading}
        emptyMessage="No expenses found"
        emptyAction={
          <Button onClick={() => setIsOpen(true)} data-testid="button-add-first-expense">
            <Plus className="h-4 w-4 mr-2" />
            Add your first expense
          </Button>
        }
      />
    </div>
  );
}
