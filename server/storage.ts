import {
  customers,
  routes,
  incomeRecords,
  expenseCategories,
  expenses,
  vehicles,
  vehicleInstallments,
  vehicleInsurance,
  vehicleParking,
  employees,
  subcontractors,
  type Customer,
  type InsertCustomer,
  type Route,
  type InsertRoute,
  type IncomeRecord,
  type InsertIncomeRecord,
  type ExpenseCategory,
  type InsertExpenseCategory,
  type Expense,
  type InsertExpense,
  type Vehicle,
  type InsertVehicle,
  type VehicleInstallment,
  type InsertVehicleInstallment,
  type VehicleInsurance,
  type InsertVehicleInsurance,
  type VehicleParking,
  type InsertVehicleParking,
  type Employee,
  type InsertEmployee,
  type Subcontractor,
  type InsertSubcontractor,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<void>;

  // Routes
  getRoutes(): Promise<Route[]>;
  getRoute(id: number): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRoute(id: number, route: Partial<InsertRoute>): Promise<Route | undefined>;
  deleteRoute(id: number): Promise<void>;

  // Income Records
  getIncomeRecords(): Promise<IncomeRecord[]>;
  getIncomeRecord(id: number): Promise<IncomeRecord | undefined>;
  createIncomeRecord(income: InsertIncomeRecord): Promise<IncomeRecord>;
  updateIncomeRecord(id: number, income: Partial<InsertIncomeRecord>): Promise<IncomeRecord | undefined>;
  deleteIncomeRecord(id: number): Promise<void>;

  // Expense Categories
  getExpenseCategories(): Promise<ExpenseCategory[]>;
  getExpenseCategory(id: number): Promise<ExpenseCategory | undefined>;
  createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory>;

  // Expenses
  getExpenses(): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<void>;

  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<void>;

  // Vehicle Installments
  getVehicleInstallments(vehicleId: number): Promise<VehicleInstallment[]>;
  createVehicleInstallment(installment: InsertVehicleInstallment): Promise<VehicleInstallment>;

  // Vehicle Insurance
  getVehicleInsurance(vehicleId: number): Promise<VehicleInsurance[]>;
  createVehicleInsurance(insurance: InsertVehicleInsurance): Promise<VehicleInsurance>;

  // Vehicle Parking
  getVehicleParking(vehicleId: number): Promise<VehicleParking[]>;
  createVehicleParking(parking: InsertVehicleParking): Promise<VehicleParking>;

  // Employees
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<void>;

  // Subcontractors
  getSubcontractors(): Promise<Subcontractor[]>;
  getSubcontractor(id: number): Promise<Subcontractor | undefined>;
  createSubcontractor(subcontractor: InsertSubcontractor): Promise<Subcontractor>;
  updateSubcontractor(id: number, subcontractor: Partial<InsertSubcontractor>): Promise<Subcontractor | undefined>;
  deleteSubcontractor(id: number): Promise<void>;

  // Reports
  getIncomeByPeriod(from: string, to: string): Promise<IncomeRecord[]>;
  getExpensesByPeriod(from: string, to: string): Promise<Expense[]>;
  getAllVehicleInstallments(): Promise<VehicleInstallment[]>;
  getAllVehicleInsurance(): Promise<VehicleInsurance[]>;
  getAllVehicleParking(): Promise<VehicleParking[]>;
}

export class DatabaseStorage implements IStorage {
  // Customers
  async getCustomers(): Promise<Customer[]> {
    return db.select().from(customers).orderBy(customers.name);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updated] = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    return updated;
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Routes
  async getRoutes(): Promise<Route[]> {
    return db.select().from(routes).orderBy(routes.name);
  }

  async getRoute(id: number): Promise<Route | undefined> {
    const [route] = await db.select().from(routes).where(eq(routes.id, id));
    return route;
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const [created] = await db.insert(routes).values(route).returning();
    return created;
  }

  async updateRoute(id: number, route: Partial<InsertRoute>): Promise<Route | undefined> {
    const [updated] = await db.update(routes).set(route).where(eq(routes.id, id)).returning();
    return updated;
  }

  async deleteRoute(id: number): Promise<void> {
    await db.delete(routes).where(eq(routes.id, id));
  }

  // Income Records
  async getIncomeRecords(): Promise<IncomeRecord[]> {
    return db.select().from(incomeRecords).orderBy(desc(incomeRecords.billingPeriod));
  }

  async getIncomeRecord(id: number): Promise<IncomeRecord | undefined> {
    const [income] = await db.select().from(incomeRecords).where(eq(incomeRecords.id, id));
    return income;
  }

  async createIncomeRecord(income: InsertIncomeRecord): Promise<IncomeRecord> {
    const [created] = await db.insert(incomeRecords).values(income).returning();
    return created;
  }

  async updateIncomeRecord(id: number, income: Partial<InsertIncomeRecord>): Promise<IncomeRecord | undefined> {
    const [updated] = await db.update(incomeRecords).set(income).where(eq(incomeRecords.id, id)).returning();
    return updated;
  }

  async deleteIncomeRecord(id: number): Promise<void> {
    await db.delete(incomeRecords).where(eq(incomeRecords.id, id));
  }

  // Expense Categories
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    return db.select().from(expenseCategories).orderBy(expenseCategories.name);
  }

  async getExpenseCategory(id: number): Promise<ExpenseCategory | undefined> {
    const [category] = await db.select().from(expenseCategories).where(eq(expenseCategories.id, id));
    return category;
  }

  async createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory> {
    const [created] = await db.insert(expenseCategories).values(category).returning();
    return created;
  }

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    return db.select().from(expenses).orderBy(desc(expenses.expenseDate));
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [created] = await db.insert(expenses).values(expense).returning();
    return created;
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined> {
    const [updated] = await db.update(expenses).set(expense).where(eq(expenses.id, id)).returning();
    return updated;
  }

  async deleteExpense(id: number): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return db.select().from(vehicles).orderBy(vehicles.registrationNumber);
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [created] = await db.insert(vehicles).values(vehicle).returning();
    return created;
  }

  async updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [updated] = await db.update(vehicles).set(vehicle).where(eq(vehicles.id, id)).returning();
    return updated;
  }

  async deleteVehicle(id: number): Promise<void> {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }

  // Vehicle Installments
  async getVehicleInstallments(vehicleId: number): Promise<VehicleInstallment[]> {
    return db.select().from(vehicleInstallments).where(eq(vehicleInstallments.vehicleId, vehicleId));
  }

  async createVehicleInstallment(installment: InsertVehicleInstallment): Promise<VehicleInstallment> {
    const [created] = await db.insert(vehicleInstallments).values(installment).returning();
    return created;
  }

  async getAllVehicleInstallments(): Promise<VehicleInstallment[]> {
    return db.select().from(vehicleInstallments);
  }

  // Vehicle Insurance
  async getVehicleInsurance(vehicleId: number): Promise<VehicleInsurance[]> {
    return db.select().from(vehicleInsurance).where(eq(vehicleInsurance.vehicleId, vehicleId));
  }

  async createVehicleInsurance(insurance: InsertVehicleInsurance): Promise<VehicleInsurance> {
    const [created] = await db.insert(vehicleInsurance).values(insurance).returning();
    return created;
  }

  async getAllVehicleInsurance(): Promise<VehicleInsurance[]> {
    return db.select().from(vehicleInsurance);
  }

  // Vehicle Parking
  async getVehicleParking(vehicleId: number): Promise<VehicleParking[]> {
    return db.select().from(vehicleParking).where(eq(vehicleParking.vehicleId, vehicleId));
  }

  async createVehicleParking(parking: InsertVehicleParking): Promise<VehicleParking> {
    const [created] = await db.insert(vehicleParking).values(parking).returning();
    return created;
  }

  async getAllVehicleParking(): Promise<VehicleParking[]> {
    return db.select().from(vehicleParking);
  }

  // Employees
  async getEmployees(): Promise<Employee[]> {
    return db.select().from(employees).orderBy(employees.name);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [created] = await db.insert(employees).values(employee).returning();
    return created;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updated] = await db.update(employees).set(employee).where(eq(employees.id, id)).returning();
    return updated;
  }

  async deleteEmployee(id: number): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  // Subcontractors
  async getSubcontractors(): Promise<Subcontractor[]> {
    return db.select().from(subcontractors).orderBy(subcontractors.name);
  }

  async getSubcontractor(id: number): Promise<Subcontractor | undefined> {
    const [subcontractor] = await db.select().from(subcontractors).where(eq(subcontractors.id, id));
    return subcontractor;
  }

  async createSubcontractor(subcontractor: InsertSubcontractor): Promise<Subcontractor> {
    const [created] = await db.insert(subcontractors).values(subcontractor).returning();
    return created;
  }

  async updateSubcontractor(id: number, subcontractor: Partial<InsertSubcontractor>): Promise<Subcontractor | undefined> {
    const [updated] = await db.update(subcontractors).set(subcontractor).where(eq(subcontractors.id, id)).returning();
    return updated;
  }

  async deleteSubcontractor(id: number): Promise<void> {
    await db.delete(subcontractors).where(eq(subcontractors.id, id));
  }

  // Reports
  async getIncomeByPeriod(from: string, to: string): Promise<IncomeRecord[]> {
    return db.select().from(incomeRecords)
      .where(and(
        gte(incomeRecords.billingPeriod, from.substring(0, 7)),
        lte(incomeRecords.billingPeriod, to.substring(0, 7))
      ));
  }

  async getExpensesByPeriod(from: string, to: string): Promise<Expense[]> {
    return db.select().from(expenses)
      .where(and(
        gte(expenses.expenseDate, from),
        lte(expenses.expenseDate, to)
      ));
  }
}

export const storage = new DatabaseStorage();
