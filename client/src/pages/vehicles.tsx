import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { formatCurrency, formatDate, getStatusVariant } from "@/lib/utils";
import { CsvImportDialog } from "@/components/csv-import-dialog";
import { Plus, Pencil, Trash2, ChevronLeft, Download, Upload } from "lucide-react";
import type { VehicleWithRelations, VehicleInstallment, VehicleInsurance, VehicleParking } from "@shared/schema";

const vehicleFormSchema = z.object({
  registrationNumber: z.string().min(1, "Registration number is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().optional(),
  capacity: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.string().optional(),
  status: z.string().default("active"),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

export default function Vehicles() {
  const [isOpen, setIsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleWithRelations | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithRelations | null>(null);
  const { toast } = useToast();

  const handleExport = () => {
    window.open("/api/vehicles/export", "_blank");
  };

  const { data: vehicles, isLoading } = useQuery<VehicleWithRelations[]>({
    queryKey: ["/api/vehicles"],
  });

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      registrationNumber: "",
      make: "",
      model: "",
      year: "",
      capacity: "",
      purchaseDate: "",
      purchasePrice: "",
      status: "active",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: VehicleFormData) => {
      const payload = {
        ...data,
        year: data.year ? parseInt(data.year) : null,
        capacity: data.capacity ? parseInt(data.capacity) : null,
        purchaseDate: data.purchaseDate || null,
        purchasePrice: data.purchasePrice || null,
      };
      return apiRequest("POST", "/api/vehicles", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({ title: "Vehicle created successfully" });
      handleClose();
    },
    onError: () => {
      toast({ title: "Failed to create vehicle", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: VehicleFormData & { id: number }) => {
      const payload = {
        ...data,
        year: data.year ? parseInt(data.year) : null,
        capacity: data.capacity ? parseInt(data.capacity) : null,
        purchaseDate: data.purchaseDate || null,
        purchasePrice: data.purchasePrice || null,
      };
      return apiRequest("PUT", `/api/vehicles/${data.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({ title: "Vehicle updated successfully" });
      handleClose();
    },
    onError: () => {
      toast({ title: "Failed to update vehicle", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({ title: "Vehicle deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete vehicle", variant: "destructive" });
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    setEditingVehicle(null);
    form.reset();
  };

  const handleEdit = (vehicle: VehicleWithRelations) => {
    setEditingVehicle(vehicle);
    form.reset({
      registrationNumber: vehicle.registrationNumber,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year?.toString() ?? "",
      capacity: vehicle.capacity?.toString() ?? "",
      purchaseDate: vehicle.purchaseDate ?? "",
      purchasePrice: vehicle.purchasePrice ?? "",
      status: vehicle.status,
    });
    setIsOpen(true);
  };

  const onSubmit = (data: VehicleFormData) => {
    if (editingVehicle) {
      updateMutation.mutate({ ...data, id: editingVehicle.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    { header: "Registration", accessor: "registrationNumber" as const },
    { header: "Make", accessor: "make" as const },
    { header: "Model", accessor: "model" as const },
    { header: "Year", accessor: (row: VehicleWithRelations) => row.year ?? "-" },
    { header: "Capacity", accessor: (row: VehicleWithRelations) => row.capacity ?? "-" },
    {
      header: "Status",
      accessor: (row: VehicleWithRelations) => (
        <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (row: VehicleWithRelations) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedVehicle(row);
            }}
            data-testid={`button-view-vehicle-${row.id}`}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            data-testid={`button-edit-vehicle-${row.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Are you sure you want to delete this vehicle?")) {
                deleteMutation.mutate(row.id);
              }
            }}
            data-testid={`button-delete-vehicle-${row.id}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
      className: "w-32",
    },
  ];

  if (selectedVehicle) {
    return (
      <VehicleDetail
        vehicle={selectedVehicle}
        onBack={() => setSelectedVehicle(null)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Vehicles"
        description="Manage your vehicle fleet"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} data-testid="button-export-vehicles">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={() => setIsImportOpen(true)} data-testid="button-import-vehicles">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-vehicle">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vehicle
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="registrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-vehicle-registration" />
                          </FormControl>
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
                              <SelectTrigger data-testid="select-vehicle-status">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Make *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-vehicle-make" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-vehicle-model" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} data-testid="input-vehicle-year" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacity (seats)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} data-testid="input-vehicle-capacity" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="purchaseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-vehicle-purchase-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="purchasePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Price (SGD)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              data-testid="input-vehicle-price"
                            />
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
                      data-testid="button-save-vehicle"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingVehicle
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
        endpoint="/api/vehicles"
        queryKey="/api/vehicles"
        entityName="Vehicles"
      />

      <DataTable
        columns={columns}
        data={vehicles ?? []}
        isLoading={isLoading}
        emptyMessage="No vehicles found"
        emptyAction={
          <Button onClick={() => setIsOpen(true)} data-testid="button-add-first-vehicle">
            <Plus className="h-4 w-4 mr-2" />
            Add your first vehicle
          </Button>
        }
      />
    </div>
  );
}

function VehicleDetail({
  vehicle,
  onBack,
}: {
  vehicle: VehicleWithRelations;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const { data: installments, isLoading: loadingInstallments } = useQuery<VehicleInstallment[]>({
    queryKey: ["/api/vehicles", vehicle.id, "installments"],
  });

  const { data: insurance, isLoading: loadingInsurance } = useQuery<VehicleInsurance[]>({
    queryKey: ["/api/vehicles", vehicle.id, "insurance"],
  });

  const { data: parking, isLoading: loadingParking } = useQuery<VehicleParking[]>({
    queryKey: ["/api/vehicles", vehicle.id, "parking"],
  });

  const [isInstallmentOpen, setIsInstallmentOpen] = useState(false);
  const [isInsuranceOpen, setIsInsuranceOpen] = useState(false);
  const [isParkingOpen, setIsParkingOpen] = useState(false);

  const installmentForm = useForm({
    defaultValues: {
      monthlyAmount: "",
      startDate: "",
      endDate: "",
      lender: "",
      notes: "",
    },
  });

  const insuranceForm = useForm({
    defaultValues: {
      provider: "",
      policyNumber: "",
      premium: "",
      startDate: "",
      endDate: "",
      coverageType: "",
    },
  });

  const parkingForm = useForm({
    defaultValues: {
      location: "",
      monthlyCost: "",
      startDate: "",
      endDate: "",
    },
  });

  const createInstallmentMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("POST", `/api/vehicles/${vehicle.id}/installments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles", vehicle.id, "installments"] });
      toast({ title: "Installment added successfully" });
      setIsInstallmentOpen(false);
      installmentForm.reset();
    },
  });

  const createInsuranceMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("POST", `/api/vehicles/${vehicle.id}/insurance`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles", vehicle.id, "insurance"] });
      toast({ title: "Insurance added successfully" });
      setIsInsuranceOpen(false);
      insuranceForm.reset();
    },
  });

  const createParkingMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("POST", `/api/vehicles/${vehicle.id}/parking`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles", vehicle.id, "parking"] });
      toast({ title: "Parking added successfully" });
      setIsParkingOpen(false);
      parkingForm.reset();
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">
            {vehicle.registrationNumber}
          </h1>
          <p className="text-muted-foreground">
            {vehicle.make} {vehicle.model} {vehicle.year && `(${vehicle.year})`}
          </p>
        </div>
        <Badge variant={getStatusVariant(vehicle.status)} className="ml-auto">
          {vehicle.status}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="installments" data-testid="tab-installments">Installments</TabsTrigger>
          <TabsTrigger value="insurance" data-testid="tab-insurance">Insurance</TabsTrigger>
          <TabsTrigger value="parking" data-testid="tab-parking">Parking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold font-mono">{vehicle.capacity ?? "-"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Purchase Date</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">{formatDate(vehicle.purchaseDate)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Purchase Price</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-mono tabular-nums">{formatCurrency(vehicle.purchasePrice)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={getStatusVariant(vehicle.status)}>{vehicle.status}</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Finance Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Finance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Insurance Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Insurance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {loadingInsurance ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : insurance && insurance.length > 0 ? (
                    <>
                      {insurance.map((ins, idx) => (
                        <div key={ins.id} className={idx > 0 ? "pt-3 border-t" : ""}>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Provider:</span>
                            <span className="font-medium">{ins.provider}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Premium:</span>
                            <span className="font-mono tabular-nums">{formatCurrency(ins.premium)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Coverage:</span>
                            <span>{ins.coverageType ?? "-"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Renewal:</span>
                            <span>{formatDate(ins.endDate)}</span>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-muted-foreground">No insurance records</p>
                  )}
                </CardContent>
              </Card>

              {/* Finance/Installment Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Financing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {loadingInstallments ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : installments && installments.length > 0 ? (
                    <>
                      {installments.map((inst, idx) => {
                        const today = new Date();
                        const startDate = new Date(inst.startDate);
                        const endDate = new Date(inst.endDate);
                        const monthlyAmount = parseFloat(inst.monthlyAmount);
                        
                        const totalMonths = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
                        const elapsedMonths = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
                        const remainingMonths = Math.max(0, totalMonths - elapsedMonths);
                        const balanceRemaining = remainingMonths * monthlyAmount;
                        
                        return (
                          <div key={inst.id} className={idx > 0 ? "pt-3 border-t" : ""}>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Finance Company:</span>
                              <span className="font-medium">{inst.lender ?? "-"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Monthly Payment:</span>
                              <span className="font-mono tabular-nums">{formatCurrency(inst.monthlyAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Period:</span>
                              <span>{formatDate(inst.startDate)} - {formatDate(inst.endDate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Months Remaining:</span>
                              <span>{remainingMonths} of {totalMonths}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Balance Remaining:</span>
                              <span className="font-mono tabular-nums font-medium">{formatCurrency(balanceRemaining.toFixed(2))}</span>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <p className="text-muted-foreground">No financing records</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Installment Schedule Table */}
          {installments && installments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Installment Schedule</h3>
              {installments.map((inst) => {
                const today = new Date();
                const startDate = new Date(inst.startDate);
                const endDate = new Date(inst.endDate);
                const monthlyAmount = parseFloat(inst.monthlyAmount);
                
                const scheduleRows: { month: string; dueDate: Date; amount: number; remainingBalance: number; isPast: boolean }[] = [];
                let current = new Date(startDate);
                current.setDate(1);
                
                const allMonths: Date[] = [];
                while (current <= endDate) {
                  allMonths.push(new Date(current));
                  current.setMonth(current.getMonth() + 1);
                }
                
                allMonths.forEach((monthDate, idx) => {
                  const monthLabel = monthDate.toLocaleDateString("en-SG", { year: "numeric", month: "short" });
                  const dueDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 15);
                  const remainingPayments = allMonths.length - idx - 1;
                  const remainingBalance = remainingPayments * monthlyAmount;
                  const isPast = dueDate < today;
                  
                  scheduleRows.push({
                    month: monthLabel,
                    dueDate,
                    amount: monthlyAmount,
                    remainingBalance,
                    isPast,
                  });
                });
                
                return (
                  <Card key={inst.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{inst.lender ?? "Financing"} - {formatCurrency(inst.monthlyAmount)}/month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-60 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-background border-b z-10">
                            <tr>
                              <th className="text-left py-2 px-3">Month</th>
                              <th className="text-left py-2 px-3">Due Date</th>
                              <th className="text-right py-2 px-3">Amount</th>
                              <th className="text-right py-2 px-3">Balance After</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scheduleRows.map((row) => (
                              <tr key={row.month} className={row.isPast ? "text-muted-foreground" : ""}>
                                <td className="py-2 px-3">{row.month}</td>
                                <td className="py-2 px-3">{row.dueDate.toLocaleDateString("en-SG")}</td>
                                <td className="py-2 px-3 text-right font-mono tabular-nums">{formatCurrency(row.amount.toFixed(2))}</td>
                                <td className="py-2 px-3 text-right font-mono tabular-nums">{formatCurrency(row.remainingBalance.toFixed(2))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="installments" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isInstallmentOpen} onOpenChange={setIsInstallmentOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-installment">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Installment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Installment</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={installmentForm.handleSubmit((data) =>
                    createInstallmentMutation.mutate({
                      ...data,
                      vehicleId: vehicle.id,
                      endDate: data.endDate || null,
                    })
                  )}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Monthly Amount (SGD) *</label>
                      <Input
                        type="number"
                        step="0.01"
                        {...installmentForm.register("monthlyAmount", { required: true })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Lender</label>
                      <Input {...installmentForm.register("lender")} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Start Date *</label>
                      <Input type="date" {...installmentForm.register("startDate", { required: true })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Date *</label>
                      <Input type="date" {...installmentForm.register("endDate", { required: true })} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsInstallmentOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createInstallmentMutation.isPending}>
                      Add
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <DataTable
            columns={[
              {
                header: "Monthly Amount",
                accessor: (row: VehicleInstallment) => (
                  <span className="font-mono">{formatCurrency(row.monthlyAmount)}</span>
                ),
                className: "text-right",
              },
              { header: "Lender", accessor: (row: VehicleInstallment) => row.lender ?? "-" },
              { header: "Start Date", accessor: (row: VehicleInstallment) => formatDate(row.startDate) },
              { header: "End Date", accessor: (row: VehicleInstallment) => formatDate(row.endDate) },
            ]}
            data={installments ?? []}
            isLoading={loadingInstallments}
            emptyMessage="No installments found"
          />
        </TabsContent>

        <TabsContent value="insurance" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isInsuranceOpen} onOpenChange={setIsInsuranceOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-insurance">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Insurance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Insurance</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={insuranceForm.handleSubmit((data) =>
                    createInsuranceMutation.mutate({
                      ...data,
                      vehicleId: vehicle.id,
                    })
                  )}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Provider *</label>
                      <Input {...insuranceForm.register("provider", { required: true })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Policy Number</label>
                      <Input {...insuranceForm.register("policyNumber")} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Premium (SGD) *</label>
                      <Input
                        type="number"
                        step="0.01"
                        {...insuranceForm.register("premium", { required: true })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Coverage Type</label>
                      <Input {...insuranceForm.register("coverageType")} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Start Date *</label>
                      <Input type="date" {...insuranceForm.register("startDate", { required: true })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Date *</label>
                      <Input type="date" {...insuranceForm.register("endDate", { required: true })} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsInsuranceOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createInsuranceMutation.isPending}>
                      Add
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <DataTable
            columns={[
              { header: "Provider", accessor: "provider" as const },
              { header: "Policy Number", accessor: (row: VehicleInsurance) => row.policyNumber ?? "-" },
              {
                header: "Premium",
                accessor: (row: VehicleInsurance) => (
                  <span className="font-mono">{formatCurrency(row.premium)}</span>
                ),
                className: "text-right",
              },
              { header: "Coverage", accessor: (row: VehicleInsurance) => row.coverageType ?? "-" },
              { header: "Start Date", accessor: (row: VehicleInsurance) => formatDate(row.startDate) },
              { header: "End Date", accessor: (row: VehicleInsurance) => formatDate(row.endDate) },
            ]}
            data={insurance ?? []}
            isLoading={loadingInsurance}
            emptyMessage="No insurance records found"
          />
        </TabsContent>

        <TabsContent value="parking" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isParkingOpen} onOpenChange={setIsParkingOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-parking">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Parking
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Parking</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={parkingForm.handleSubmit((data) =>
                    createParkingMutation.mutate({
                      ...data,
                      vehicleId: vehicle.id,
                      endDate: data.endDate || null,
                    })
                  )}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Location *</label>
                      <Input {...parkingForm.register("location", { required: true })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Monthly Cost (SGD) *</label>
                      <Input
                        type="number"
                        step="0.01"
                        {...parkingForm.register("monthlyCost", { required: true })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Start Date *</label>
                      <Input type="date" {...parkingForm.register("startDate", { required: true })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Date</label>
                      <Input type="date" {...parkingForm.register("endDate")} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsParkingOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createParkingMutation.isPending}>
                      Add
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <DataTable
            columns={[
              { header: "Location", accessor: "location" as const },
              {
                header: "Monthly Cost",
                accessor: (row: VehicleParking) => (
                  <span className="font-mono">{formatCurrency(row.monthlyCost)}</span>
                ),
                className: "text-right",
              },
              { header: "Start Date", accessor: (row: VehicleParking) => formatDate(row.startDate) },
              { header: "End Date", accessor: (row: VehicleParking) => formatDate(row.endDate) },
            ]}
            data={parking ?? []}
            isLoading={loadingParking}
            emptyMessage="No parking records found"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
