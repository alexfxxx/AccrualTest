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
import { formatCurrency, getStatusVariant } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { RouteWithRelations, Customer, Vehicle } from "@shared/schema";

const routeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  customerId: z.string().min(1, "Customer is required"),
  monthlyRate: z.string().min(1, "Monthly rate is required"),
  routeType: z.string().default("owned"),
  subcontractorName: z.string().optional(),
  subcontractorCost: z.string().optional(),
  vehicleId: z.string().optional(),
  status: z.string().default("active"),
  description: z.string().optional(),
});

type RouteFormData = z.infer<typeof routeFormSchema>;

export default function Routes() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteWithRelations | null>(null);
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: routes, isLoading } = useQuery<RouteWithRelations[]>({
    queryKey: ["/api/routes"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const form = useForm<RouteFormData>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      name: "",
      customerId: "",
      monthlyRate: "",
      routeType: "owned",
      subcontractorName: "",
      subcontractorCost: "",
      vehicleId: "",
      status: "active",
      description: "",
    },
  });

  const routeType = form.watch("routeType");

  const createMutation = useMutation({
    mutationFn: (data: RouteFormData) => {
      const payload = {
        ...data,
        customerId: parseInt(data.customerId),
        vehicleId: data.vehicleId && data.vehicleId !== "none" ? parseInt(data.vehicleId) : null,
        subcontractorName: data.routeType === "subcontracted" ? data.subcontractorName : null,
        subcontractorCost: data.routeType === "subcontracted" ? data.subcontractorCost : null,
      };
      return apiRequest("POST", "/api/routes", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      toast({ title: "Route created successfully" });
      handleClose();
    },
    onError: () => {
      toast({ title: "Failed to create route", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: RouteFormData & { id: number }) => {
      const payload = {
        ...data,
        customerId: parseInt(data.customerId),
        vehicleId: data.vehicleId && data.vehicleId !== "none" ? parseInt(data.vehicleId) : null,
        subcontractorName: data.routeType === "subcontracted" ? data.subcontractorName : null,
        subcontractorCost: data.routeType === "subcontracted" ? data.subcontractorCost : null,
      };
      return apiRequest("PUT", `/api/routes/${data.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      toast({ title: "Route updated successfully" });
      handleClose();
    },
    onError: () => {
      toast({ title: "Failed to update route", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/routes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      toast({ title: "Route deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete route", variant: "destructive" });
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    setEditingRoute(null);
    form.reset();
  };

  const handleEdit = (route: RouteWithRelations) => {
    setEditingRoute(route);
    form.reset({
      name: route.name,
      customerId: route.customerId?.toString() ?? "",
      monthlyRate: route.monthlyRate,
      routeType: route.routeType,
      subcontractorName: route.subcontractorName ?? "",
      subcontractorCost: route.subcontractorCost ?? "",
      vehicleId: route.vehicleId?.toString() ?? "",
      status: route.status,
      description: route.description ?? "",
    });
    setIsOpen(true);
  };

  const onSubmit = (data: RouteFormData) => {
    if (editingRoute) {
      updateMutation.mutate({ ...data, id: editingRoute.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const calculateProfit = (route: RouteWithRelations) => {
    const rate = parseFloat(route.monthlyRate);
    const cost = route.subcontractorCost ? parseFloat(route.subcontractorCost) : 0;
    return rate - cost;
  };

  const columns = [
    { header: "Route Name", accessor: "name" as const },
    {
      header: "Customer",
      accessor: (row: RouteWithRelations) => row.customer?.name ?? "-",
    },
    {
      header: "Monthly Rate",
      accessor: (row: RouteWithRelations) => (
        <span className="font-mono tabular-nums">{formatCurrency(row.monthlyRate)}</span>
      ),
      className: "text-right",
    },
    {
      header: "Type",
      accessor: (row: RouteWithRelations) => (
        <Badge variant={row.routeType === "owned" ? "default" : "secondary"}>
          {row.routeType}
        </Badge>
      ),
    },
    {
      header: "Profit",
      accessor: (row: RouteWithRelations) => (
        <span className="font-mono tabular-nums">
          {formatCurrency(calculateProfit(row))}
        </span>
      ),
      className: "text-right",
    },
    {
      header: "Status",
      accessor: (row: RouteWithRelations) => (
        <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (row: RouteWithRelations) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            data-testid={`button-edit-route-${row.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Are you sure you want to delete this route?")) {
                deleteMutation.mutate(row.id);
              }
            }}
            data-testid={`button-delete-route-${row.id}`}
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
        title="Routes"
        description="Manage bus routes and contracts"
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-route">
                <Plus className="h-4 w-4 mr-2" />
                Add Route
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRoute ? "Edit Route" : "Add New Route"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Route Name *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-route-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-route-customer">
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
                      name="monthlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Rate (SGD) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              data-testid="input-route-rate"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="routeType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Route Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-route-type">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="owned">Owned (Company Operates)</SelectItem>
                              <SelectItem value="subcontracted">Subcontracted</SelectItem>
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
                          <FormLabel>Assigned Vehicle</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-route-vehicle">
                                <SelectValue placeholder="Select vehicle (optional)" />
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
                    {routeType === "subcontracted" && (
                      <>
                        <FormField
                          control={form.control}
                          name="subcontractorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subcontractor Name</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-route-subcontractor" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="subcontractorCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subcontractor Cost (SGD)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  data-testid="input-route-subcost"
                                />
                              </FormControl>
                              <FormDescription>
                                Monthly cost paid to subcontractor
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-route-status">
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
                      name="description"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} data-testid="input-route-description" />
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
                      data-testid="button-save-route"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingRoute
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

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter by Customer:</span>
          <Select value={customerFilter} onValueChange={setCustomerFilter}>
            <SelectTrigger className="w-[250px]" data-testid="select-filter-customer">
              <SelectValue placeholder="All Customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customers?.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {customerFilter !== "all" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCustomerFilter("all")}
            data-testid="button-clear-filter"
          >
            Clear filter
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={(routes ?? []).filter(
          (route) => customerFilter === "all" || route.customerId?.toString() === customerFilter
        )}
        isLoading={isLoading}
        emptyMessage={customerFilter !== "all" ? "No routes found for this customer" : "No routes found"}
        emptyAction={
          <Button onClick={() => setIsOpen(true)} data-testid="button-add-first-route">
            <Plus className="h-4 w-4 mr-2" />
            Add your first route
          </Button>
        }
      />
    </div>
  );
}
