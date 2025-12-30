import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertCustomerSchema,
  insertRouteSchema,
  insertIncomeRecordSchema,
  insertExpenseCategorySchema,
  insertExpenseSchema,
  insertVehicleSchema,
  insertVehicleInstallmentSchema,
  insertVehicleInsuranceSchema,
  insertVehicleParkingSchema,
  insertEmployeeSchema,
  insertSubcontractorSchema,
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Customers
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const data = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(data);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ error: "Invalid customer data" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, data);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(400).json({ error: "Invalid customer data" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomer(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete customer" });
    }
  });

  // Routes
  app.get("/api/routes", async (req, res) => {
    try {
      const routes = await storage.getRoutes();
      const customers = await storage.getCustomers();
      const vehicles = await storage.getVehicles();
      
      const routesWithRelations = routes.map(route => ({
        ...route,
        customer: customers.find(c => c.id === route.customerId) ?? null,
        vehicle: vehicles.find(v => v.id === route.vehicleId) ?? null,
      }));
      
      res.json(routesWithRelations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch routes" });
    }
  });

  app.post("/api/routes", async (req, res) => {
    try {
      const data = insertRouteSchema.parse(req.body);
      const route = await storage.createRoute(data);
      res.json(route);
    } catch (error) {
      res.status(400).json({ error: "Invalid route data" });
    }
  });

  app.put("/api/routes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertRouteSchema.partial().parse(req.body);
      const route = await storage.updateRoute(id, data);
      if (!route) {
        return res.status(404).json({ error: "Route not found" });
      }
      res.json(route);
    } catch (error) {
      res.status(400).json({ error: "Invalid route data" });
    }
  });

  app.delete("/api/routes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRoute(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete route" });
    }
  });

  // Income Records
  app.get("/api/income", async (req, res) => {
    try {
      const income = await storage.getIncomeRecords();
      const customers = await storage.getCustomers();
      const routes = await storage.getRoutes();
      
      const incomeWithRelations = income.map(record => ({
        ...record,
        customer: customers.find(c => c.id === record.customerId) ?? null,
        route: routes.find(r => r.id === record.routeId) ?? null,
      }));
      
      res.json(incomeWithRelations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch income records" });
    }
  });

  app.post("/api/income", async (req, res) => {
    try {
      const data = insertIncomeRecordSchema.parse(req.body);
      const income = await storage.createIncomeRecord(data);
      res.json(income);
    } catch (error) {
      res.status(400).json({ error: "Invalid income data" });
    }
  });

  app.put("/api/income/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertIncomeRecordSchema.partial().parse(req.body);
      const income = await storage.updateIncomeRecord(id, data);
      if (!income) {
        return res.status(404).json({ error: "Income record not found" });
      }
      res.json(income);
    } catch (error) {
      res.status(400).json({ error: "Invalid income data" });
    }
  });

  app.delete("/api/income/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteIncomeRecord(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete income record" });
    }
  });

  // Expense Categories
  app.get("/api/expense-categories", async (req, res) => {
    try {
      const categories = await storage.getExpenseCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense categories" });
    }
  });

  app.post("/api/expense-categories", async (req, res) => {
    try {
      const data = insertExpenseCategorySchema.parse(req.body);
      const category = await storage.createExpenseCategory(data);
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: "Invalid category data" });
    }
  });

  // Expenses
  app.get("/api/expenses", async (req, res) => {
    try {
      const expensesList = await storage.getExpenses();
      const categories = await storage.getExpenseCategories();
      const vehicles = await storage.getVehicles();
      
      const expensesWithRelations = expensesList.map(expense => ({
        ...expense,
        category: categories.find(c => c.id === expense.categoryId) ?? null,
        vehicle: vehicles.find(v => v.id === expense.vehicleId) ?? null,
      }));
      
      res.json(expensesWithRelations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const data = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(data);
      res.json(expense);
    } catch (error) {
      res.status(400).json({ error: "Invalid expense data" });
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(id, data);
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(400).json({ error: "Invalid expense data" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteExpense(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  // Vehicles
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const data = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(data);
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ error: "Invalid vehicle data" });
    }
  });

  app.put("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(id, data);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ error: "Invalid vehicle data" });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVehicle(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  // Vehicle Installments
  app.get("/api/vehicles/:id/installments", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const installments = await storage.getVehicleInstallments(vehicleId);
      res.json(installments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch installments" });
    }
  });

  app.post("/api/vehicles/:id/installments", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const data = insertVehicleInstallmentSchema.parse({ ...req.body, vehicleId });
      const installment = await storage.createVehicleInstallment(data);
      res.json(installment);
    } catch (error) {
      res.status(400).json({ error: "Invalid installment data" });
    }
  });

  // Vehicle Insurance
  app.get("/api/vehicles/:id/insurance", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const insurance = await storage.getVehicleInsurance(vehicleId);
      res.json(insurance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch insurance" });
    }
  });

  app.post("/api/vehicles/:id/insurance", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const data = insertVehicleInsuranceSchema.parse({ ...req.body, vehicleId });
      const insurance = await storage.createVehicleInsurance(data);
      res.json(insurance);
    } catch (error) {
      res.status(400).json({ error: "Invalid insurance data" });
    }
  });

  // Vehicle Parking
  app.get("/api/vehicles/:id/parking", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const parking = await storage.getVehicleParking(vehicleId);
      res.json(parking);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch parking" });
    }
  });

  app.post("/api/vehicles/:id/parking", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const data = insertVehicleParkingSchema.parse({ ...req.body, vehicleId });
      const parking = await storage.createVehicleParking(data);
      res.json(parking);
    } catch (error) {
      res.status(400).json({ error: "Invalid parking data" });
    }
  });

  // Employees
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const data = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(data);
      res.json(employee);
    } catch (error) {
      res.status(400).json({ error: "Invalid employee data" });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(id, data);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(400).json({ error: "Invalid employee data" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEmployee(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });

  // Subcontractors
  app.get("/api/subcontractors", async (req, res) => {
    try {
      const subcontractors = await storage.getSubcontractors();
      res.json(subcontractors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subcontractors" });
    }
  });

  app.post("/api/subcontractors", async (req, res) => {
    try {
      const data = insertSubcontractorSchema.parse(req.body);
      const subcontractor = await storage.createSubcontractor(data);
      res.json(subcontractor);
    } catch (error) {
      res.status(400).json({ error: "Invalid subcontractor data" });
    }
  });

  app.put("/api/subcontractors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertSubcontractorSchema.partial().parse(req.body);
      const subcontractor = await storage.updateSubcontractor(id, data);
      if (!subcontractor) {
        return res.status(404).json({ error: "Subcontractor not found" });
      }
      res.json(subcontractor);
    } catch (error) {
      res.status(400).json({ error: "Invalid subcontractor data" });
    }
  });

  app.delete("/api/subcontractors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSubcontractor(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subcontractor" });
    }
  });

  // CSV Export endpoints
  app.get("/api/customers/export", async (req, res) => {
    try {
      const data = await storage.getCustomers();
      const headers = ["name", "contactPerson", "email", "phone", "address", "status"];
      const csv = [
        headers.join(","),
        ...data.map(row => headers.map(h => `"${(row[h as keyof typeof row] ?? "").toString().replace(/"/g, '""')}"`).join(","))
      ].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=customers.csv");
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export customers" });
    }
  });

  app.get("/api/routes/export", async (req, res) => {
    try {
      const data = await storage.getRoutes();
      const customers = await storage.getCustomers();
      const vehicles = await storage.getVehicles();
      const headers = ["name", "customerName", "monthlyRate", "routeType", "subcontractorName", "subcontractorCost", "vehicleNumber", "status", "description"];
      const csv = [
        headers.join(","),
        ...data.map(row => {
          const customer = customers.find(c => c.id === row.customerId);
          const vehicle = vehicles.find(v => v.id === row.vehicleId);
          return [
            `"${row.name}"`,
            `"${customer?.name ?? ""}"`,
            `"${row.monthlyRate}"`,
            `"${row.routeType}"`,
            `"${row.subcontractorName ?? ""}"`,
            `"${row.subcontractorCost ?? ""}"`,
            `"${vehicle?.registrationNumber ?? ""}"`,
            `"${row.status}"`,
            `"${(row.description ?? "").replace(/"/g, '""')}"`
          ].join(",");
        })
      ].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=routes.csv");
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export routes" });
    }
  });

  app.get("/api/vehicles/export", async (req, res) => {
    try {
      const data = await storage.getVehicles();
      const headers = ["registrationNumber", "make", "model", "year", "capacity", "purchaseDate", "purchasePrice", "status"];
      const csv = [
        headers.join(","),
        ...data.map(row => headers.map(h => `"${(row[h as keyof typeof row] ?? "").toString().replace(/"/g, '""')}"`).join(","))
      ].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=vehicles.csv");
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export vehicles" });
    }
  });

  app.get("/api/employees/export", async (req, res) => {
    try {
      const data = await storage.getEmployees();
      const headers = ["employeeId", "name", "position", "department", "workerType", "salary", "bonus", "foreignWorkerLevy", "status", "startDate", "endDate", "email", "phone"];
      const csv = [
        headers.join(","),
        ...data.map(row => headers.map(h => `"${(row[h as keyof typeof row] ?? "").toString().replace(/"/g, '""')}"`).join(","))
      ].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=employees.csv");
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export employees" });
    }
  });

  app.get("/api/subcontractors/export", async (req, res) => {
    try {
      const data = await storage.getSubcontractors();
      const customers = await storage.getCustomers();
      const routes = await storage.getRoutes();
      const headers = ["name", "customerName", "routeName", "monthlyCost", "vehicleNumber", "contactPerson", "phone", "status"];
      const csv = [
        headers.join(","),
        ...data.map(row => {
          const customer = customers.find(c => c.id === row.customerId);
          const route = routes.find(r => r.id === row.routeId);
          return [
            `"${row.name}"`,
            `"${customer?.name ?? ""}"`,
            `"${route?.name ?? ""}"`,
            `"${row.monthlyCost ?? ""}"`,
            `"${row.vehicleNumber ?? ""}"`,
            `"${row.contactPerson ?? ""}"`,
            `"${row.phone ?? ""}"`,
            `"${row.status}"`
          ].join(",");
        })
      ].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=subcontractors.csv");
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export subcontractors" });
    }
  });

  // CSV Import endpoints
  app.post("/api/customers/import", async (req, res) => {
    try {
      const { data } = req.body;
      if (!Array.isArray(data)) {
        return res.status(400).json({ error: "Invalid data format" });
      }
      const parsed = data.map((row: Record<string, string>) => ({
        name: row.name,
        contactPerson: row.contactPerson || null,
        email: row.email || null,
        phone: row.phone || null,
        address: row.address || null,
        status: row.status || "active",
      }));
      await storage.bulkReplaceCustomers(parsed);
      res.json({ success: true, count: parsed.length });
    } catch (error) {
      res.status(400).json({ error: "Failed to import customers" });
    }
  });

  app.post("/api/routes/import", async (req, res) => {
    try {
      const { data } = req.body;
      if (!Array.isArray(data)) {
        return res.status(400).json({ error: "Invalid data format" });
      }
      const customers = await storage.getCustomers();
      const vehicles = await storage.getVehicles();
      const parsed = data.map((row: Record<string, string>) => {
        const customer = customers.find(c => c.name === row.customerName);
        const vehicle = vehicles.find(v => v.registrationNumber === row.vehicleNumber);
        return {
          name: row.name,
          customerId: customer?.id || null,
          monthlyRate: row.monthlyRate,
          routeType: row.routeType || "owned",
          subcontractorName: row.subcontractorName || null,
          subcontractorCost: row.subcontractorCost || null,
          vehicleId: vehicle?.id || null,
          status: row.status || "active",
          description: row.description || null,
        };
      });
      await storage.bulkReplaceRoutes(parsed);
      res.json({ success: true, count: parsed.length });
    } catch (error) {
      res.status(400).json({ error: "Failed to import routes" });
    }
  });

  app.post("/api/vehicles/import", async (req, res) => {
    try {
      const { data } = req.body;
      if (!Array.isArray(data)) {
        return res.status(400).json({ error: "Invalid data format" });
      }
      const parsed = data.map((row: Record<string, string>) => ({
        registrationNumber: row.registrationNumber,
        make: row.make,
        model: row.model,
        year: row.year ? parseInt(row.year) : null,
        capacity: row.capacity ? parseInt(row.capacity) : null,
        purchaseDate: row.purchaseDate || null,
        purchasePrice: row.purchasePrice || null,
        status: row.status || "active",
      }));
      await storage.bulkReplaceVehicles(parsed);
      res.json({ success: true, count: parsed.length });
    } catch (error) {
      res.status(400).json({ error: "Failed to import vehicles" });
    }
  });

  app.post("/api/employees/import", async (req, res) => {
    try {
      const { data } = req.body;
      if (!Array.isArray(data)) {
        return res.status(400).json({ error: "Invalid data format" });
      }
      const parsed = data.map((row: Record<string, string>) => ({
        employeeId: row.employeeId,
        name: row.name,
        position: row.position || null,
        department: row.department || null,
        workerType: row.workerType || "local",
        salary: row.salary,
        bonus: row.bonus || null,
        foreignWorkerLevy: row.foreignWorkerLevy || null,
        status: row.status || "active",
        startDate: row.startDate || null,
        endDate: row.endDate || null,
        email: row.email || null,
        phone: row.phone || null,
      }));
      await storage.bulkReplaceEmployees(parsed);
      res.json({ success: true, count: parsed.length });
    } catch (error) {
      res.status(400).json({ error: "Failed to import employees" });
    }
  });

  app.post("/api/subcontractors/import", async (req, res) => {
    try {
      const { data } = req.body;
      if (!Array.isArray(data)) {
        return res.status(400).json({ error: "Invalid data format" });
      }
      const customers = await storage.getCustomers();
      const routes = await storage.getRoutes();
      const parsed = data.map((row: Record<string, string>) => {
        const customer = customers.find(c => c.name === row.customerName);
        const route = routes.find(r => r.name === row.routeName);
        return {
          name: row.name,
          customerId: customer?.id || null,
          routeId: route?.id || null,
          monthlyCost: row.monthlyCost || null,
          vehicleNumber: row.vehicleNumber || null,
          contactPerson: row.contactPerson || null,
          phone: row.phone || null,
          status: row.status || "active",
        };
      });
      await storage.bulkReplaceSubcontractors(parsed);
      res.json({ success: true, count: parsed.length });
    } catch (error) {
      res.status(400).json({ error: "Failed to import subcontractors" });
    }
  });

  // Dashboard Stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const yearStart = `${now.getFullYear()}-01`;

      const income = await storage.getIncomeRecords();
      const expenses = await storage.getExpenses();
      const routes = await storage.getRoutes();
      const employees = await storage.getEmployees();

      // Monthly totals
      const monthlyIncome = income
        .filter(i => i.billingPeriod === currentMonth)
        .reduce((sum, i) => sum + parseFloat(i.amount), 0);

      const monthlyExpenses = expenses
        .filter(e => e.expenseDate.startsWith(currentMonth))
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);

      // YTD totals
      const ytdIncome = income
        .filter(i => i.billingPeriod >= yearStart && i.billingPeriod <= currentMonth)
        .reduce((sum, i) => sum + parseFloat(i.amount), 0);

      const ytdExpenses = expenses
        .filter(e => e.expenseDate >= `${now.getFullYear()}-01-01`)
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);

      // Active routes
      const activeRoutes = routes.filter(r => r.status === "active").length;

      // Monthly employee costs
      const monthlyEmployeeCosts = employees
        .filter(e => e.status === "active")
        .reduce((sum, e) => {
          const salary = parseFloat(e.salary);
          const levy = e.foreignWorkerLevy ? parseFloat(e.foreignWorkerLevy) : 0;
          const cpf = e.workerType === "local" ? salary * 0.17 : 0;
          return sum + salary + (e.workerType === "local" ? cpf : levy);
        }, 0);

      // Recent income and expenses
      const recentIncome = income.slice(0, 5);
      const recentExpenses = expenses.slice(0, 5);

      // Monthly trend (last 6 months)
      const monthlyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const monthLabel = date.toLocaleDateString("en-SG", { month: "short" });
        
        const monthIncome = income
          .filter(inc => inc.billingPeriod === month)
          .reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
        
        const monthExpenses = expenses
          .filter(exp => exp.expenseDate.startsWith(month))
          .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        
        monthlyTrend.push({
          month: monthLabel,
          income: monthIncome,
          expenses: monthExpenses + monthlyEmployeeCosts,
        });
      }

      res.json({
        totalIncomeMonth: monthlyIncome,
        totalIncomeYTD: ytdIncome,
        totalExpensesMonth: monthlyExpenses + monthlyEmployeeCosts,
        totalExpensesYTD: ytdExpenses,
        netProfitMonth: monthlyIncome - monthlyExpenses - monthlyEmployeeCosts,
        netProfitYTD: ytdIncome - ytdExpenses,
        activeRoutes,
        recentIncome,
        recentExpenses,
        monthlyTrend,
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // P&L Report
  app.get("/api/reports/pnl", async (req, res) => {
    try {
      const from = req.query.from as string || `${new Date().getFullYear()}-01-01`;
      const to = req.query.to as string || new Date().toISOString().split("T")[0];

      const income = await storage.getIncomeByPeriod(from, to);
      const expenses = await storage.getExpensesByPeriod(from, to);
      const customers = await storage.getCustomers();
      const routes = await storage.getRoutes();
      const employees = await storage.getEmployees();
      const categories = await storage.getExpenseCategories();

      // Calculate months in period for pro-rating
      const fromDate = new Date(from);
      const toDate = new Date(to);
      const monthsInPeriod = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + 
        (toDate.getMonth() - fromDate.getMonth()) + 1;

      // Income by type
      const routeIncome = income
        .filter(i => i.incomeType === "route")
        .reduce((sum, i) => sum + parseFloat(i.amount), 0);
      const adhocIncome = income
        .filter(i => i.incomeType === "adhoc")
        .reduce((sum, i) => sum + parseFloat(i.amount), 0);

      // Income by customer
      const incomeByCustomer = customers.map(c => ({
        name: c.name,
        amount: income
          .filter(i => i.customerId === c.id)
          .reduce((sum, i) => sum + parseFloat(i.amount), 0),
      })).filter(c => c.amount > 0);

      // Expenses by category
      const expensesByCategory = categories.map(cat => ({
        name: cat.name,
        amount: expenses
          .filter(e => e.categoryId === cat.id)
          .reduce((sum, e) => sum + parseFloat(e.amount), 0),
      })).filter(c => c.amount > 0);

      // Uncategorized expenses
      const uncategorizedExpenses = expenses
        .filter(e => !e.categoryId)
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);
      if (uncategorizedExpenses > 0) {
        expensesByCategory.push({ name: "Uncategorized", amount: uncategorizedExpenses });
      }

      // Subcontractor costs (pro-rated)
      const subcontractorCosts = routes
        .filter(r => r.routeType === "subcontracted" && r.status === "active" && r.subcontractorCost)
        .reduce((sum, r) => sum + parseFloat(r.subcontractorCost!) * monthsInPeriod, 0);

      // Employee costs (pro-rated)
      const employeeCosts = employees
        .filter(e => e.status === "active")
        .reduce((sum, e) => {
          const salary = parseFloat(e.salary);
          const levy = e.foreignWorkerLevy ? parseFloat(e.foreignWorkerLevy) : 0;
          const cpf = e.workerType === "local" ? salary * 0.17 : 0;
          return sum + (salary + (e.workerType === "local" ? cpf : levy)) * monthsInPeriod;
        }, 0);

      // Vehicle costs (placeholder - would need more complex calculation)
      const vehicleCosts = 0;

      const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0) +
        subcontractorCosts + employeeCosts + vehicleCosts;

      res.json({
        period: { from, to },
        income: {
          routeIncome,
          adhocIncome,
          totalIncome: routeIncome + adhocIncome,
          byCustomer: incomeByCustomer,
        },
        expenses: {
          byCategory: expensesByCategory,
          subcontractorCosts,
          employeeCosts,
          vehicleCosts,
          totalExpenses,
        },
        netProfit: routeIncome + adhocIncome - totalExpenses,
      });
    } catch (error) {
      console.error("P&L report error:", error);
      res.status(500).json({ error: "Failed to generate P&L report" });
    }
  });

  // Cash Flow Forecast
  app.get("/api/reports/cashflow", async (req, res) => {
    try {
      const periodMonths = parseInt(req.query.period as string) || 6;

      const routes = await storage.getRoutes();
      const employees = await storage.getEmployees();
      const installments = await storage.getAllVehicleInstallments();
      const insurance = await storage.getAllVehicleInsurance();
      const parking = await storage.getAllVehicleParking();
      const expenses = await storage.getExpenses();

      const now = new Date();
      const months = [];
      let cumulativeBalance = 0;

      for (let i = 0; i < periodMonths; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const monthStr = date.toLocaleDateString("en-SG", { month: "short", year: "2-digit" });
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        // Inflows: Route income from active routes
        const routeIncome = routes
          .filter(r => r.status === "active")
          .reduce((sum, r) => sum + parseFloat(r.monthlyRate), 0);

        // Outflows
        const vehicleInstallments = installments
          .filter(inst => {
            const start = new Date(inst.startDate);
            const end = new Date(inst.endDate);
            return date >= start && date <= end;
          })
          .reduce((sum, inst) => sum + parseFloat(inst.monthlyAmount), 0);

        const vehicleInsurance = insurance
          .filter(ins => {
            const start = new Date(ins.startDate);
            const end = new Date(ins.endDate);
            return date >= start && date <= end;
          })
          .reduce((sum, ins) => {
            // Pro-rate annual premium to monthly
            const start = new Date(ins.startDate);
            const end = new Date(ins.endDate);
            const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
            return sum + parseFloat(ins.premium) / months;
          }, 0);

        const vehicleParking = parking
          .filter(p => {
            const start = new Date(p.startDate);
            const end = p.endDate ? new Date(p.endDate) : new Date(9999, 11, 31);
            return date >= start && date <= end;
          })
          .reduce((sum, p) => sum + parseFloat(p.monthlyCost), 0);

        const employeeCosts = employees
          .filter(e => e.status === "active")
          .reduce((sum, e) => {
            const salary = parseFloat(e.salary);
            const levy = e.foreignWorkerLevy ? parseFloat(e.foreignWorkerLevy) : 0;
            const cpf = e.workerType === "local" ? salary * 0.17 : 0;
            return sum + salary + (e.workerType === "local" ? cpf : levy);
          }, 0);

        const subcontractorCosts = routes
          .filter(r => r.routeType === "subcontracted" && r.status === "active" && r.subcontractorCost)
          .reduce((sum, r) => sum + parseFloat(r.subcontractorCost!), 0);

        const recurringExpenses = expenses
          .filter(e => e.isRecurring && e.recurringFrequency === "monthly")
          .reduce((sum, e) => sum + parseFloat(e.amount), 0);

        const totalInflows = routeIncome;
        const totalOutflows = vehicleInstallments + vehicleInsurance + vehicleParking + 
          employeeCosts + subcontractorCosts + recurringExpenses;
        const netFlow = totalInflows - totalOutflows;
        cumulativeBalance += netFlow;

        months.push({
          month: monthStr,
          inflows: totalInflows,
          outflows: totalOutflows,
          netFlow,
          cumulativeBalance,
          details: {
            routeIncome,
            expectedPayments: 0,
            vehicleInstallments,
            vehicleInsurance,
            vehicleParking,
            employeeCosts,
            subcontractorCosts,
            recurringExpenses,
          },
        });
      }

      const totalInflows = months.reduce((sum, m) => sum + m.inflows, 0);
      const totalOutflows = months.reduce((sum, m) => sum + m.outflows, 0);

      res.json({
        months,
        summary: {
          totalInflows,
          totalOutflows,
          netCashFlow: totalInflows - totalOutflows,
          endingBalance: cumulativeBalance,
        },
      });
    } catch (error) {
      console.error("Cash flow forecast error:", error);
      res.status(500).json({ error: "Failed to generate cash flow forecast" });
    }
  });

  // Seed Database
  app.post("/api/seed", async (req, res) => {
    try {
      const { seedDatabase } = await import("./seed");
      await seedDatabase();
      res.json({ success: true, message: "Database seeded successfully" });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });

  return httpServer;
}
