import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Customers - Companies that contract transport services
export const customers = pgTable("customers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  status: text("status").notNull().default("active"), // active, inactive
});

export const customersRelations = relations(customers, ({ many }) => ({
  routes: many(routes),
  incomeRecords: many(incomeRecords),
}));

// Routes - Bus routes linked to customers
export const routes = pgTable("routes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  monthlyRate: decimal("monthly_rate", { precision: 12, scale: 2 }).notNull(),
  routeType: text("route_type").notNull().default("owned"), // owned, subcontracted
  subcontractorName: text("subcontractor_name"),
  subcontractorCost: decimal("subcontractor_cost", { precision: 12, scale: 2 }),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  status: text("status").notNull().default("active"), // active, inactive
  description: text("description"),
});

export const routesRelations = relations(routes, ({ one, many }) => ({
  customer: one(customers, { fields: [routes.customerId], references: [customers.id] }),
  vehicle: one(vehicles, { fields: [routes.vehicleId], references: [vehicles.id] }),
  incomeRecords: many(incomeRecords),
}));

// Income Records
export const incomeRecords = pgTable("income_records", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  customerId: integer("customer_id").references(() => customers.id),
  routeId: integer("route_id").references(() => routes.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  billingPeriod: text("billing_period").notNull(), // YYYY-MM format
  incomeType: text("income_type").notNull().default("route"), // route, adhoc
  description: text("description"),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, overdue
  dueDate: date("due_date"),
  paidDate: date("paid_date"),
});

export const incomeRecordsRelations = relations(incomeRecords, ({ one }) => ({
  customer: one(customers, { fields: [incomeRecords.customerId], references: [customers.id] }),
  route: one(routes, { fields: [incomeRecords.routeId], references: [routes.id] }),
}));

// Expense Categories
export const expenseCategories = pgTable("expense_categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  parentId: integer("parent_id"),
  description: text("description"),
});

export const expenseCategoriesRelations = relations(expenseCategories, ({ one, many }) => ({
  parent: one(expenseCategories, { fields: [expenseCategories.parentId], references: [expenseCategories.id], relationName: "parentChild" }),
  children: many(expenseCategories, { relationName: "parentChild" }),
  expenses: many(expenses),
}));

// Expenses
export const expenses = pgTable("expenses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  categoryId: integer("category_id").references(() => expenseCategories.id),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  expenseDate: date("expense_date").notNull(),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurringFrequency: text("recurring_frequency"), // monthly, quarterly, yearly
});

export const expensesRelations = relations(expenses, ({ one }) => ({
  category: one(expenseCategories, { fields: [expenses.categoryId], references: [expenseCategories.id] }),
  vehicle: one(vehicles, { fields: [expenses.vehicleId], references: [vehicles.id] }),
}));

// Vehicles
export const vehicles = pgTable("vehicles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  registrationNumber: text("registration_number").notNull().unique(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year"),
  capacity: integer("capacity"),
  purchaseDate: date("purchase_date"),
  purchasePrice: decimal("purchase_price", { precision: 12, scale: 2 }),
  status: text("status").notNull().default("active"), // active, inactive, maintenance
});

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  routes: many(routes),
  expenses: many(expenses),
  installments: many(vehicleInstallments),
  insurance: many(vehicleInsurance),
  parking: many(vehicleParking),
}));

// Vehicle Installments
export const vehicleInstallments = pgTable("vehicle_installments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  monthlyAmount: decimal("monthly_amount", { precision: 12, scale: 2 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  lender: text("lender"),
  notes: text("notes"),
});

export const vehicleInstallmentsRelations = relations(vehicleInstallments, ({ one }) => ({
  vehicle: one(vehicles, { fields: [vehicleInstallments.vehicleId], references: [vehicles.id] }),
}));

// Vehicle Insurance
export const vehicleInsurance = pgTable("vehicle_insurance", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  provider: text("provider").notNull(),
  policyNumber: text("policy_number"),
  premium: decimal("premium", { precision: 12, scale: 2 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  coverageType: text("coverage_type"),
});

export const vehicleInsuranceRelations = relations(vehicleInsurance, ({ one }) => ({
  vehicle: one(vehicles, { fields: [vehicleInsurance.vehicleId], references: [vehicles.id] }),
}));

// Vehicle Parking
export const vehicleParking = pgTable("vehicle_parking", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  location: text("location").notNull(),
  monthlyCost: decimal("monthly_cost", { precision: 12, scale: 2 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
});

export const vehicleParkingRelations = relations(vehicleParking, ({ one }) => ({
  vehicle: one(vehicles, { fields: [vehicleParking.vehicleId], references: [vehicles.id] }),
}));

// Employees
export const employees = pgTable("employees", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  employeeId: text("employee_id").notNull().unique(),
  name: text("name").notNull(),
  position: text("position"),
  department: text("department"),
  workerType: text("worker_type").notNull().default("local"), // local, foreign
  salary: decimal("salary", { precision: 12, scale: 2 }).notNull(),
  bonus: decimal("bonus", { precision: 12, scale: 2 }).default("0"),
  foreignWorkerLevy: decimal("foreign_worker_levy", { precision: 12, scale: 2 }),
  status: text("status").notNull().default("active"), // active, inactive
  startDate: date("start_date"),
  endDate: date("end_date"),
  email: text("email"),
  phone: text("phone"),
});

// Insert Schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
export const insertRouteSchema = createInsertSchema(routes).omit({ id: true });
export const insertIncomeRecordSchema = createInsertSchema(incomeRecords).omit({ id: true });
export const insertExpenseCategorySchema = createInsertSchema(expenseCategories).omit({ id: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true });
export const insertVehicleInstallmentSchema = createInsertSchema(vehicleInstallments).omit({ id: true });
export const insertVehicleInsuranceSchema = createInsertSchema(vehicleInsurance).omit({ id: true });
export const insertVehicleParkingSchema = createInsertSchema(vehicleParking).omit({ id: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true });

// Types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type IncomeRecord = typeof incomeRecords.$inferSelect;
export type InsertIncomeRecord = z.infer<typeof insertIncomeRecordSchema>;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type VehicleInstallment = typeof vehicleInstallments.$inferSelect;
export type InsertVehicleInstallment = z.infer<typeof insertVehicleInstallmentSchema>;
export type VehicleInsurance = typeof vehicleInsurance.$inferSelect;
export type InsertVehicleInsurance = z.infer<typeof insertVehicleInsuranceSchema>;
export type VehicleParking = typeof vehicleParking.$inferSelect;
export type InsertVehicleParking = z.infer<typeof insertVehicleParkingSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

// Extended types with relations
export type RouteWithRelations = Route & {
  customer?: Customer | null;
  vehicle?: Vehicle | null;
};

export type IncomeRecordWithRelations = IncomeRecord & {
  customer?: Customer | null;
  route?: Route | null;
};

export type ExpenseWithRelations = Expense & {
  category?: ExpenseCategory | null;
  vehicle?: Vehicle | null;
};

export type VehicleWithRelations = Vehicle & {
  installments?: VehicleInstallment[];
  insurance?: VehicleInsurance[];
  parking?: VehicleParking[];
};
