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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate, getStatusVariant, calculateCPF, calculateEmployeeCost } from "@/lib/utils";
import { CsvImportDialog } from "@/components/csv-import-dialog";
import { Plus, Pencil, Trash2, Download, Upload } from "lucide-react";
import type { Employee } from "@shared/schema";

const employeeFormSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  name: z.string().min(1, "Name is required"),
  position: z.string().optional(),
  department: z.string().optional(),
  workerType: z.string().default("local"),
  salary: z.string().min(1, "Salary is required"),
  bonus: z.string().optional(),
  foreignWorkerLevy: z.string().optional(),
  status: z.string().default("active"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

export default function Employees() {
  const [isOpen, setIsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  const handleExport = () => {
    window.open("/api/employees/export", "_blank");
  };

  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      employeeId: "",
      name: "",
      position: "",
      department: "",
      workerType: "local",
      salary: "",
      bonus: "",
      foreignWorkerLevy: "",
      status: "active",
      startDate: "",
      endDate: "",
      email: "",
      phone: "",
    },
  });

  const workerType = form.watch("workerType");

  const createMutation = useMutation({
    mutationFn: (data: EmployeeFormData) => {
      const payload = {
        ...data,
        bonus: data.bonus || "0",
        foreignWorkerLevy: data.workerType === "foreign" ? data.foreignWorkerLevy : null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
      };
      return apiRequest("POST", "/api/employees", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ title: "Employee created successfully" });
      handleClose();
    },
    onError: () => {
      toast({ title: "Failed to create employee", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: EmployeeFormData & { id: number }) => {
      const payload = {
        ...data,
        bonus: data.bonus || "0",
        foreignWorkerLevy: data.workerType === "foreign" ? data.foreignWorkerLevy : null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
      };
      return apiRequest("PUT", `/api/employees/${data.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ title: "Employee updated successfully" });
      handleClose();
    },
    onError: () => {
      toast({ title: "Failed to update employee", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ title: "Employee deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete employee", variant: "destructive" });
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    setEditingEmployee(null);
    form.reset();
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    form.reset({
      employeeId: employee.employeeId,
      name: employee.name,
      position: employee.position ?? "",
      department: employee.department ?? "",
      workerType: employee.workerType,
      salary: employee.salary,
      bonus: employee.bonus ?? "",
      foreignWorkerLevy: employee.foreignWorkerLevy ?? "",
      status: employee.status,
      startDate: employee.startDate ?? "",
      endDate: employee.endDate ?? "",
      email: employee.email ?? "",
      phone: employee.phone ?? "",
    });
    setIsOpen(true);
  };

  const onSubmit = (data: EmployeeFormData) => {
    if (editingEmployee) {
      updateMutation.mutate({ ...data, id: editingEmployee.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    { header: "Employee ID", accessor: "employeeId" as const },
    { header: "Name", accessor: "name" as const },
    { header: "Position", accessor: (row: Employee) => row.position ?? "-" },
    { header: "Department", accessor: (row: Employee) => row.department ?? "-" },
    {
      header: "Type",
      accessor: (row: Employee) => (
        <Badge variant={row.workerType === "local" ? "default" : "secondary"}>
          {row.workerType}
        </Badge>
      ),
    },
    {
      header: "Salary",
      accessor: (row: Employee) => (
        <span className="font-mono tabular-nums">{formatCurrency(row.salary)}</span>
      ),
      className: "text-right",
    },
    {
      header: "CPF/Levy",
      accessor: (row: Employee) => {
        const salary = parseFloat(row.salary);
        const levy = row.foreignWorkerLevy ? parseFloat(row.foreignWorkerLevy) : 0;
        const amount = row.workerType === "local" ? calculateCPF(salary) : levy;
        return (
          <span className="font-mono tabular-nums text-muted-foreground">
            {formatCurrency(amount)}
          </span>
        );
      },
      className: "text-right",
    },
    {
      header: "Total Cost",
      accessor: (row: Employee) => {
        const salary = parseFloat(row.salary);
        const levy = row.foreignWorkerLevy ? parseFloat(row.foreignWorkerLevy) : 0;
        const total = calculateEmployeeCost(salary, row.workerType, levy);
        return (
          <span className="font-mono tabular-nums font-medium">{formatCurrency(total)}</span>
        );
      },
      className: "text-right",
    },
    {
      header: "Status",
      accessor: (row: Employee) => (
        <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (row: Employee) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            data-testid={`button-edit-employee-${row.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Are you sure you want to delete this employee?")) {
                deleteMutation.mutate(row.id);
              }
            }}
            data-testid={`button-delete-employee-${row.id}`}
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
        title="Employees"
        description="Manage employee records with CPF/levy calculations"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} data-testid="button-export-employees">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={() => setIsImportOpen(true)} data-testid="button-import-employees">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-employee">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? "Edit Employee" : "Add New Employee"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee ID *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-employee-id" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-employee-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-employee-position" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-employee-department" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="workerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Worker Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-employee-type">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="local">Local (CPF applies)</SelectItem>
                              <SelectItem value="foreign">Foreign (Levy applies)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {field.value === "local"
                              ? "17% CPF contribution will be calculated"
                              : "Custom levy amount will apply"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-employee-status">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Salary (SGD) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              data-testid="input-employee-salary"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {workerType === "foreign" && (
                      <FormField
                        control={form.control}
                        name="foreignWorkerLevy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Levy (SGD)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                data-testid="input-employee-levy"
                              />
                            </FormControl>
                            <FormDescription>Foreign worker levy amount</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="bonus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bonus (SGD)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              data-testid="input-employee-bonus"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} data-testid="input-employee-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-employee-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-employee-start" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-employee-end" />
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
                      data-testid="button-save-employee"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingEmployee
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

      <CsvImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        endpoint="/api/employees"
        queryKey="/api/employees"
        entityName="Employees"
      />

      <DataTable
        columns={columns}
        data={employees ?? []}
        isLoading={isLoading}
        emptyMessage="No employees found"
        emptyAction={
          <Button onClick={() => setIsOpen(true)} data-testid="button-add-first-employee">
            <Plus className="h-4 w-4 mr-2" />
            Add your first employee
          </Button>
        }
      />
    </div>
  );
}
