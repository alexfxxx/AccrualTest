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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency, getStatusVariant } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Subcontractor, Customer, Route } from "@shared/schema";

const subcontractorFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  customerId: z.string().optional(),
  routeId: z.string().optional(),
  monthlyCost: z.string().optional(),
  vehicleNumber: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  status: z.string().default("active"),
});

type SubcontractorFormData = z.infer<typeof subcontractorFormSchema>;

export default function Subcontractors() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingSubcontractor, setEditingSubcontractor] = useState<Subcontractor | null>(null);
  const { toast } = useToast();

  const { data: subcontractors, isLoading } = useQuery<Subcontractor[]>({
    queryKey: ["/api/subcontractors"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: routes } = useQuery<Route[]>({
    queryKey: ["/api/routes"],
  });

  const form = useForm<SubcontractorFormData>({
    resolver: zodResolver(subcontractorFormSchema),
    defaultValues: {
      name: "",
      customerId: "none",
      routeId: "none",
      monthlyCost: "",
      vehicleNumber: "",
      contactPerson: "",
      phone: "",
      status: "active",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: SubcontractorFormData) => {
      const payload = {
        name: data.name,
        customerId: data.customerId && data.customerId !== "none" ? parseInt(data.customerId) : null,
        routeId: data.routeId && data.routeId !== "none" ? parseInt(data.routeId) : null,
        monthlyCost: data.monthlyCost || null,
        vehicleNumber: data.vehicleNumber || null,
        contactPerson: data.contactPerson || null,
        phone: data.phone || null,
        status: data.status,
      };
      return apiRequest("POST", "/api/subcontractors", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subcontractors"] });
      toast({ title: "Subcontractor created successfully" });
      handleClose();
    },
    onError: () => {
      toast({ title: "Failed to create subcontractor", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: SubcontractorFormData & { id: number }) => {
      const payload = {
        name: data.name,
        customerId: data.customerId && data.customerId !== "none" ? parseInt(data.customerId) : null,
        routeId: data.routeId && data.routeId !== "none" ? parseInt(data.routeId) : null,
        monthlyCost: data.monthlyCost || null,
        vehicleNumber: data.vehicleNumber || null,
        contactPerson: data.contactPerson || null,
        phone: data.phone || null,
        status: data.status,
      };
      return apiRequest("PUT", `/api/subcontractors/${data.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subcontractors"] });
      toast({ title: "Subcontractor updated successfully" });
      handleClose();
    },
    onError: () => {
      toast({ title: "Failed to update subcontractor", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/subcontractors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subcontractors"] });
      toast({ title: "Subcontractor deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete subcontractor", variant: "destructive" });
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    setEditingSubcontractor(null);
    form.reset();
  };

  const handleEdit = (subcontractor: Subcontractor) => {
    setEditingSubcontractor(subcontractor);
    form.reset({
      name: subcontractor.name,
      customerId: subcontractor.customerId?.toString() ?? "none",
      routeId: subcontractor.routeId?.toString() ?? "none",
      monthlyCost: subcontractor.monthlyCost ?? "",
      vehicleNumber: subcontractor.vehicleNumber ?? "",
      contactPerson: subcontractor.contactPerson ?? "",
      phone: subcontractor.phone ?? "",
      status: subcontractor.status,
    });
    setIsOpen(true);
  };

  const onSubmit = (data: SubcontractorFormData) => {
    if (editingSubcontractor) {
      updateMutation.mutate({ ...data, id: editingSubcontractor.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const getCustomerName = (customerId: number | null) => {
    if (!customerId) return "-";
    const customer = customers?.find((c) => c.id === customerId);
    return customer?.name ?? "-";
  };

  const getRouteName = (routeId: number | null) => {
    if (!routeId) return "-";
    const route = routes?.find((r) => r.id === routeId);
    return route?.name ?? "-";
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      accessor: "name" as const,
      cell: (row: Subcontractor) => (
        <span className="font-medium" data-testid={`text-name-${row.id}`}>
          {row.name}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      accessor: "customerId" as const,
      cell: (row: Subcontractor) => (
        <span data-testid={`text-customer-${row.id}`}>
          {getCustomerName(row.customerId)}
        </span>
      ),
    },
    {
      key: "route",
      header: "Route",
      accessor: "routeId" as const,
      cell: (row: Subcontractor) => (
        <span data-testid={`text-route-${row.id}`}>
          {getRouteName(row.routeId)}
        </span>
      ),
    },
    {
      key: "monthlyCost",
      header: "Monthly Cost",
      accessor: "monthlyCost" as const,
      cell: (row: Subcontractor) => (
        <span className="font-mono" data-testid={`text-cost-${row.id}`}>
          {row.monthlyCost ? formatCurrency(row.monthlyCost) : "-"}
        </span>
      ),
    },
    {
      key: "vehicleNumber",
      header: "Vehicle",
      accessor: "vehicleNumber" as const,
      cell: (row: Subcontractor) => (
        <span data-testid={`text-vehicle-${row.id}`}>
          {row.vehicleNumber ?? "-"}
        </span>
      ),
    },
    {
      key: "contactPerson",
      header: "Contact",
      accessor: "contactPerson" as const,
      cell: (row: Subcontractor) => (
        <span data-testid={`text-contact-${row.id}`}>
          {row.contactPerson ?? "-"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: "status" as const,
      cell: (row: Subcontractor) => (
        <Badge variant={getStatusVariant(row.status)} data-testid={`badge-status-${row.id}`}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      accessor: "id" as const,
      cell: (row: Subcontractor) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row)}
            data-testid={`button-edit-${row.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteMutation.mutate(row.id)}
            data-testid={`button-delete-${row.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full p-6 gap-6 overflow-auto">
      <PageHeader
        title="Subcontractors"
        description="Manage subcontractors for outsourced routes"
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-subcontractor">
                <Plus className="h-4 w-4 mr-2" />
                Add Subcontractor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingSubcontractor ? "Edit Subcontractor" : "Add Subcontractor"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Subcontractor name" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-customer">
                                <SelectValue placeholder="Select customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {customers?.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                  {customer.name}
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
                              <SelectTrigger data-testid="select-route">
                                <SelectValue placeholder="Select route" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {routes?.map((route) => (
                                <SelectItem key={route.id} value={route.id.toString()}>
                                  {route.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="monthlyCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Cost (SGD)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              data-testid="input-monthly-cost"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vehicleNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Number</FormLabel>
                          <FormControl>
                            <Input placeholder="SBA1234X" {...field} data-testid="input-vehicle-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person</FormLabel>
                          <FormControl>
                            <Input placeholder="Contact name" {...field} data-testid="input-contact-person" />
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
                            <Input placeholder="+65 9123 4567" {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
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

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancel">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-submit"
                    >
                      {editingSubcontractor ? "Update" : "Create"}
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
        data={subcontractors ?? []}
        isLoading={isLoading}
        emptyMessage="No subcontractors found. Add your first subcontractor to get started."
      />
    </div>
  );
}
