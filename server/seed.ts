import { db } from "./db";
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
} from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  console.log("Seeding database with comprehensive sample data...");

  await db.transaction(async (tx) => {
    // Clear existing data in reverse dependency order
    await tx.delete(vehicleParking);
    await tx.delete(vehicleInsurance);
    await tx.delete(vehicleInstallments);
    await tx.delete(incomeRecords);
    await tx.delete(subcontractors);
    await tx.delete(expenses);
    await tx.delete(expenseCategories);
    await tx.delete(routes);
    await tx.delete(employees);
    await tx.delete(vehicles);
    await tx.delete(customers);

    // 1. Customers - 8 diverse customers
    const customerData = [
    { name: "Marina Bay Schools", contactPerson: "David Tan", email: "david@marinabay.edu.sg", phone: "+65 6123 4567", address: "10 Marina Boulevard, Singapore 018983", status: "active" },
    { name: "Jurong Industrial Pte Ltd", contactPerson: "Sarah Lim", email: "sarah@jurong-ind.com.sg", phone: "+65 6234 5678", address: "25 Jurong Port Road, Singapore 619104", status: "active" },
    { name: "Changi Airport Group", contactPerson: "Michael Wong", email: "michael@changiairport.com", phone: "+65 6345 6789", address: "Airport Boulevard, Singapore 819663", status: "active" },
    { name: "NUS Campus Services", contactPerson: "Dr. Lee Wei Ming", email: "weiming@nus.edu.sg", phone: "+65 6456 7890", address: "21 Lower Kent Ridge Road, Singapore 119077", status: "active" },
    { name: "Sentosa Resort World", contactPerson: "Jennifer Ong", email: "jennifer@rwsentosa.com", phone: "+65 6567 8901", address: "8 Sentosa Gateway, Singapore 098269", status: "active" },
    { name: "Tuas Logistics Hub", contactPerson: "Ahmad Hassan", email: "ahmad@tuashub.com.sg", phone: "+65 6678 9012", address: "50 Tuas South Avenue 1, Singapore 637601", status: "active" },
    { name: "Woodlands Town Council", contactPerson: "Mary Ng", email: "mary@woodlandstc.gov.sg", phone: "+65 6789 0123", address: "900 South Woodlands Drive, Singapore 730900", status: "active" },
    { name: "Raffles City Convention", contactPerson: "Peter Goh", email: "peter@rafflescity.com.sg", phone: "+65 6890 1234", address: "252 North Bridge Road, Singapore 179103", status: "inactive" },
  ];
    const insertedCustomers = await tx.insert(customers).values(customerData).returning();

  // 2. Vehicles - 12 vehicles
  const vehicleData = [
    { registrationNumber: "SG1234A", make: "Mercedes-Benz", model: "Sprinter 516", year: 2022, capacity: 20, purchaseDate: "2022-01-15", purchasePrice: "185000", status: "active" },
    { registrationNumber: "SG2345B", make: "Toyota", model: "Coaster", year: 2021, capacity: 29, purchaseDate: "2021-03-20", purchasePrice: "165000", status: "active" },
    { registrationNumber: "SG3456C", make: "Volvo", model: "B8R", year: 2023, capacity: 45, purchaseDate: "2023-02-10", purchasePrice: "320000", status: "active" },
    { registrationNumber: "SG4567D", make: "Hyundai", model: "County", year: 2020, capacity: 25, purchaseDate: "2020-06-05", purchasePrice: "145000", status: "active" },
    { registrationNumber: "SG5678E", make: "Mercedes-Benz", model: "O500", year: 2022, capacity: 45, purchaseDate: "2022-08-12", purchasePrice: "350000", status: "active" },
    { registrationNumber: "SG6789F", make: "Hino", model: "RK8J", year: 2021, capacity: 40, purchaseDate: "2021-11-25", purchasePrice: "280000", status: "active" },
    { registrationNumber: "SG7890G", make: "Toyota", model: "Hiace", year: 2023, capacity: 14, purchaseDate: "2023-04-18", purchasePrice: "95000", status: "active" },
    { registrationNumber: "SG8901H", make: "Volvo", model: "9700", year: 2020, capacity: 53, purchaseDate: "2020-09-30", purchasePrice: "420000", status: "maintenance" },
    { registrationNumber: "SG9012I", make: "Mercedes-Benz", model: "Citaro", year: 2021, capacity: 35, purchaseDate: "2021-05-22", purchasePrice: "290000", status: "active" },
    { registrationNumber: "SG0123J", make: "Yutong", model: "ZK6122H9", year: 2022, capacity: 49, purchaseDate: "2022-07-14", purchasePrice: "260000", status: "active" },
    { registrationNumber: "SG1234K", make: "MAN", model: "Lion's City", year: 2023, capacity: 42, purchaseDate: "2023-01-08", purchasePrice: "380000", status: "active" },
    { registrationNumber: "SG2345L", make: "Scania", model: "Citywide", year: 2019, capacity: 38, purchaseDate: "2019-12-20", purchasePrice: "310000", status: "inactive" },
  ];
    const insertedVehicles = await tx.insert(vehicles).values(vehicleData).returning();

  // 3. Routes - 15 routes
  const routeData = [
    { name: "Marina Bay School AM Route", customerId: insertedCustomers[0].id, monthlyRate: "8500", routeType: "owned", vehicleId: insertedVehicles[0].id, status: "active", description: "Morning pickup for Marina Bay primary school" },
    { name: "Marina Bay School PM Route", customerId: insertedCustomers[0].id, monthlyRate: "8500", routeType: "owned", vehicleId: insertedVehicles[1].id, status: "active", description: "Afternoon dropoff for Marina Bay primary school" },
    { name: "Jurong Factory Shift A", customerId: insertedCustomers[1].id, monthlyRate: "12000", routeType: "owned", vehicleId: insertedVehicles[2].id, status: "active", description: "Morning shift workers transport" },
    { name: "Jurong Factory Shift B", customerId: insertedCustomers[1].id, monthlyRate: "12000", routeType: "subcontracted", subcontractorName: "Quick Bus Services", subcontractorCost: "9000", status: "active", description: "Afternoon shift workers transport" },
    { name: "Changi Staff Shuttle", customerId: insertedCustomers[2].id, monthlyRate: "15000", routeType: "owned", vehicleId: insertedVehicles[4].id, status: "active", description: "Airport staff shuttle service" },
    { name: "NUS Inter-Campus Route 1", customerId: insertedCustomers[3].id, monthlyRate: "9000", routeType: "owned", vehicleId: insertedVehicles[3].id, status: "active", description: "Kent Ridge to Bukit Timah campus" },
    { name: "NUS Inter-Campus Route 2", customerId: insertedCustomers[3].id, monthlyRate: "9000", routeType: "owned", vehicleId: insertedVehicles[5].id, status: "active", description: "Kent Ridge to Outram campus" },
    { name: "Sentosa Resort Shuttle", customerId: insertedCustomers[4].id, monthlyRate: "18000", routeType: "owned", vehicleId: insertedVehicles[8].id, status: "active", description: "HarbourFront to Sentosa resort shuttle" },
    { name: "Tuas Worker Transport", customerId: insertedCustomers[5].id, monthlyRate: "14000", routeType: "subcontracted", subcontractorName: "Island Bus Co", subcontractorCost: "10500", status: "active", description: "Worker dormitory to Tuas industrial area" },
    { name: "Woodlands Community Bus", customerId: insertedCustomers[6].id, monthlyRate: "7500", routeType: "owned", vehicleId: insertedVehicles[6].id, status: "active", description: "Community center circular route" },
    { name: "Changi Cargo Shuttle", customerId: insertedCustomers[2].id, monthlyRate: "11000", routeType: "owned", vehicleId: insertedVehicles[9].id, status: "active", description: "Cargo terminal staff transport" },
    { name: "NUS Weekend Campus Tour", customerId: insertedCustomers[3].id, monthlyRate: "5000", routeType: "subcontracted", subcontractorName: "Tour Express", subcontractorCost: "3500", status: "active", description: "Weekend campus tour for visitors" },
    { name: "Jurong Factory Night Shift", customerId: insertedCustomers[1].id, monthlyRate: "13000", routeType: "owned", vehicleId: insertedVehicles[10].id, status: "active", description: "Night shift workers transport" },
    { name: "Marina Bay Weekend Service", customerId: insertedCustomers[0].id, monthlyRate: "4500", routeType: "owned", vehicleId: insertedVehicles[0].id, status: "inactive", description: "Weekend enrichment classes transport" },
    { name: "Raffles Convention Shuttle", customerId: insertedCustomers[7].id, monthlyRate: "6000", routeType: "owned", vehicleId: insertedVehicles[7].id, status: "inactive", description: "Convention center shuttle - suspended" },
  ];
    const insertedRoutes = await tx.insert(routes).values(routeData).returning();

  // 4. Expense Categories
  const categoryData = [
    { name: "Vehicle Operations", description: "Fuel, maintenance, repairs" },
    { name: "Personnel", description: "Driver wages, training, uniforms" },
    { name: "Office & Admin", description: "Rent, utilities, supplies" },
    { name: "Marketing", description: "Advertising, promotions" },
    { name: "Insurance & Licensing", description: "Vehicle and business insurance, licenses" },
    { name: "Miscellaneous", description: "Other operational expenses" },
  ];
    const insertedCategories = await tx.insert(expenseCategories).values(categoryData).returning();

  // 5. Generate Income Records for last 12 months
  const incomeData = [];
  const currentDate = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    const billingPeriod = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const dueDate = new Date(date.getFullYear(), date.getMonth() + 1, 15).toISOString().split("T")[0];
    const isPaid = i > 1;

    for (const route of insertedRoutes) {
      if (route.status === "active" || i < 3) {
        incomeData.push({
          customerId: route.customerId,
          routeId: route.id,
          amount: route.monthlyRate,
          billingPeriod,
          incomeType: "route",
          description: `${route.name} - ${billingPeriod}`,
          paymentStatus: isPaid ? "paid" : i === 1 ? "pending" : "overdue",
          dueDate,
          paidDate: isPaid ? new Date(date.getFullYear(), date.getMonth() + 1, 10).toISOString().split("T")[0] : null,
        });
      }
    }

    // Add some ad-hoc income
    if (i < 6) {
      incomeData.push({
        customerId: insertedCustomers[Math.floor(Math.random() * 6)].id,
        routeId: null,
        amount: String(2000 + Math.floor(Math.random() * 3000)),
        billingPeriod,
        incomeType: "adhoc",
        description: `Charter service - ${billingPeriod}`,
        paymentStatus: isPaid ? "paid" : "pending",
        dueDate,
        paidDate: isPaid ? new Date(date.getFullYear(), date.getMonth() + 1, 12).toISOString().split("T")[0] : null,
      });
    }
  }
    await tx.insert(incomeRecords).values(incomeData);

  // 6. Generate Expenses for last 12 months
  const expenseData = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    const expenseDate = new Date(date.getFullYear(), date.getMonth(), 15).toISOString().split("T")[0];

    // Fuel expenses for each active vehicle
    for (const vehicle of insertedVehicles.filter(v => v.status !== "inactive")) {
      expenseData.push({
        categoryId: insertedCategories[0].id,
        vehicleId: vehicle.id,
        amount: String(800 + Math.floor(Math.random() * 400)),
        description: `Fuel - ${vehicle.registrationNumber}`,
        expenseDate,
        isRecurring: true,
        recurringFrequency: "monthly",
      });
    }

    // Maintenance expenses (random vehicles)
    for (let j = 0; j < 3; j++) {
      const randomVehicle = insertedVehicles[Math.floor(Math.random() * insertedVehicles.length)];
      expenseData.push({
        categoryId: insertedCategories[0].id,
        vehicleId: randomVehicle.id,
        amount: String(200 + Math.floor(Math.random() * 500)),
        description: `Maintenance - ${randomVehicle.registrationNumber}`,
        expenseDate: new Date(date.getFullYear(), date.getMonth(), 5 + Math.floor(Math.random() * 20)).toISOString().split("T")[0],
        isRecurring: false,
      });
    }

    // Office expenses
    expenseData.push({
      categoryId: insertedCategories[2].id,
      vehicleId: null,
      amount: "3500",
      description: "Office rent",
      expenseDate,
      isRecurring: true,
      recurringFrequency: "monthly",
    });

    expenseData.push({
      categoryId: insertedCategories[2].id,
      vehicleId: null,
      amount: String(400 + Math.floor(Math.random() * 200)),
      description: "Utilities",
      expenseDate,
      isRecurring: true,
      recurringFrequency: "monthly",
    });

    // Quarterly marketing
    if (i % 3 === 0) {
      expenseData.push({
        categoryId: insertedCategories[3].id,
        vehicleId: null,
        amount: String(1500 + Math.floor(Math.random() * 1000)),
        description: "Marketing campaign",
        expenseDate,
        isRecurring: true,
        recurringFrequency: "quarterly",
      });
    }
  }
    await tx.insert(expenses).values(expenseData);

  // 7. Employees - 18 employees (12 local, 6 foreign)
  const employeeData = [
    { employeeId: "EMP001", name: "Tan Ah Kow", position: "Senior Driver", department: "Operations", workerType: "local", salary: "3200", bonus: "500", status: "active", startDate: "2019-03-15", email: "ahkow@transport.sg", phone: "+65 9123 4567" },
    { employeeId: "EMP002", name: "Lim Mei Ling", position: "Driver", department: "Operations", workerType: "local", salary: "2800", bonus: "400", status: "active", startDate: "2020-06-01", email: "meiling@transport.sg", phone: "+65 9234 5678" },
    { employeeId: "EMP003", name: "Wong Wei Ming", position: "Driver", department: "Operations", workerType: "local", salary: "2800", bonus: "400", status: "active", startDate: "2020-08-15", email: "weiming@transport.sg", phone: "+65 9345 6789" },
    { employeeId: "EMP004", name: "Goh Siew Hoon", position: "Driver", department: "Operations", workerType: "local", salary: "2800", bonus: "300", status: "active", startDate: "2021-01-10", email: "siewhoon@transport.sg", phone: "+65 9456 7890" },
    { employeeId: "EMP005", name: "Ng Chee Keong", position: "Driver", department: "Operations", workerType: "local", salary: "2800", bonus: "300", status: "active", startDate: "2021-04-20", email: "cheekeong@transport.sg", phone: "+65 9567 8901" },
    { employeeId: "EMP006", name: "Lee Bee Leng", position: "Senior Driver", department: "Operations", workerType: "local", salary: "3200", bonus: "500", status: "active", startDate: "2018-09-01", email: "beeleng@transport.sg", phone: "+65 9678 9012" },
    { employeeId: "EMP007", name: "Koh Cheng Huat", position: "Driver", department: "Operations", workerType: "local", salary: "2800", bonus: "300", status: "active", startDate: "2022-02-14", email: "chenghuat@transport.sg", phone: "+65 9789 0123" },
    { employeeId: "EMP008", name: "Ong Siew Lian", position: "Admin Executive", department: "Admin", workerType: "local", salary: "3000", bonus: "600", status: "active", startDate: "2019-07-01", email: "siewlian@transport.sg", phone: "+65 9890 1234" },
    { employeeId: "EMP009", name: "Chen Xiao Ming", position: "Accounts Executive", department: "Finance", workerType: "local", salary: "3500", bonus: "700", status: "active", startDate: "2018-03-15", email: "xiaoming@transport.sg", phone: "+65 9901 2345" },
    { employeeId: "EMP010", name: "Yeo Boon Kiat", position: "Operations Manager", department: "Operations", workerType: "local", salary: "5500", bonus: "1500", status: "active", startDate: "2017-01-03", email: "boonkiat@transport.sg", phone: "+65 9012 3456" },
    { employeeId: "EMP011", name: "Tay Swee Heng", position: "Driver", department: "Operations", workerType: "local", salary: "2800", bonus: "300", status: "active", startDate: "2022-06-01", email: "sweeheng@transport.sg", phone: "+65 8123 4567" },
    { employeeId: "EMP012", name: "Ang Bee Hoon", position: "HR Executive", department: "HR", workerType: "local", salary: "3200", bonus: "500", status: "active", startDate: "2020-01-15", email: "beehoon@transport.sg", phone: "+65 8234 5678" },
    { employeeId: "EMP013", name: "Rahman bin Ahmad", position: "Driver", department: "Operations", workerType: "foreign", salary: "2200", foreignWorkerLevy: "450", status: "active", startDate: "2021-08-01", email: "rahman@transport.sg", phone: "+65 8345 6789" },
    { employeeId: "EMP014", name: "Nguyen Van Tuan", position: "Driver", department: "Operations", workerType: "foreign", salary: "2200", foreignWorkerLevy: "450", status: "active", startDate: "2021-10-15", email: "vantuan@transport.sg", phone: "+65 8456 7890" },
    { employeeId: "EMP015", name: "Arjun Krishnan", position: "Driver", department: "Operations", workerType: "foreign", salary: "2200", foreignWorkerLevy: "450", status: "active", startDate: "2022-03-01", email: "arjun@transport.sg", phone: "+65 8567 8901" },
    { employeeId: "EMP016", name: "Suresh Kumar", position: "Driver", department: "Operations", workerType: "foreign", salary: "2200", foreignWorkerLevy: "450", status: "active", startDate: "2022-05-20", email: "suresh@transport.sg", phone: "+65 8678 9012" },
    { employeeId: "EMP017", name: "Aung Kyaw", position: "Cleaner/Helper", department: "Operations", workerType: "foreign", salary: "1800", foreignWorkerLevy: "400", status: "active", startDate: "2023-01-10", email: "aungkyaw@transport.sg", phone: "+65 8789 0123" },
    { employeeId: "EMP018", name: "Mohammad Rafi", position: "Mechanic", department: "Maintenance", workerType: "foreign", salary: "2600", foreignWorkerLevy: "450", status: "active", startDate: "2020-11-01", email: "rafi@transport.sg", phone: "+65 8890 1234" },
  ];
    await tx.insert(employees).values(employeeData);

  // 8. Subcontractors
  const subcontractorData = [
    { name: "Quick Bus Services", customerId: insertedCustomers[1].id, routeId: insertedRoutes[3].id, monthlyCost: "9000", vehicleNumber: "SB1234A", contactPerson: "Johnny Tan", phone: "+65 9111 2222", status: "active" },
    { name: "Island Bus Co", customerId: insertedCustomers[5].id, routeId: insertedRoutes[8].id, monthlyCost: "10500", vehicleNumber: "IB2345B", contactPerson: "Robert Lee", phone: "+65 9222 3333", status: "active" },
    { name: "Tour Express", customerId: insertedCustomers[3].id, routeId: insertedRoutes[11].id, monthlyCost: "3500", vehicleNumber: "TE3456C", contactPerson: "Susan Ong", phone: "+65 9333 4444", status: "active" },
    { name: "City Shuttle Pte Ltd", monthlyCost: "8000", vehicleNumber: "CS4567D", contactPerson: "David Lim", phone: "+65 9444 5555", status: "inactive" },
  ];
    await tx.insert(subcontractors).values(subcontractorData);

  // 9. Vehicle Installments (for financed vehicles)
  const installmentData = [
    { vehicleId: insertedVehicles[2].id, monthlyAmount: "5500", startDate: "2023-02-10", endDate: "2028-02-10", lender: "DBS Bank", notes: "5-year financing @ 3.5% p.a." },
    { vehicleId: insertedVehicles[4].id, monthlyAmount: "6200", startDate: "2022-08-12", endDate: "2027-08-12", lender: "OCBC Bank", notes: "5-year financing @ 3.2% p.a." },
    { vehicleId: insertedVehicles[10].id, monthlyAmount: "6800", startDate: "2023-01-08", endDate: "2028-01-08", lender: "UOB Bank", notes: "5-year financing @ 3.8% p.a." },
    { vehicleId: insertedVehicles[5].id, monthlyAmount: "4800", startDate: "2021-11-25", endDate: "2026-11-25", lender: "Maybank", notes: "5-year financing @ 3.0% p.a." },
  ];
    await tx.insert(vehicleInstallments).values(installmentData);

  // 10. Vehicle Insurance (all active vehicles)
  const insuranceData = insertedVehicles
    .filter(v => v.status !== "inactive")
    .map(vehicle => ({
      vehicleId: vehicle.id,
      provider: ["NTUC Income", "AXA", "AIG", "Great Eastern"][Math.floor(Math.random() * 4)],
      policyNumber: `POL${100000 + Math.floor(Math.random() * 900000)}`,
      premium: String(1800 + Math.floor(Math.random() * 1200)),
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      coverageType: "Comprehensive",
    }));
    await tx.insert(vehicleInsurance).values(insuranceData);

  // 11. Vehicle Parking
  const parkingData = [
    { vehicleId: insertedVehicles[0].id, location: "Toa Payoh Depot", monthlyCost: "350", startDate: "2022-01-01" },
    { vehicleId: insertedVehicles[1].id, location: "Toa Payoh Depot", monthlyCost: "350", startDate: "2021-03-01" },
    { vehicleId: insertedVehicles[2].id, location: "Jurong East Depot", monthlyCost: "400", startDate: "2023-02-01" },
    { vehicleId: insertedVehicles[3].id, location: "Toa Payoh Depot", monthlyCost: "350", startDate: "2020-06-01" },
    { vehicleId: insertedVehicles[4].id, location: "Changi Depot", monthlyCost: "450", startDate: "2022-08-01" },
    { vehicleId: insertedVehicles[5].id, location: "Jurong East Depot", monthlyCost: "400", startDate: "2021-11-01" },
    { vehicleId: insertedVehicles[6].id, location: "Woodlands Depot", monthlyCost: "380", startDate: "2023-04-01" },
    { vehicleId: insertedVehicles[8].id, location: "Sentosa Depot", monthlyCost: "500", startDate: "2021-05-01" },
    { vehicleId: insertedVehicles[9].id, location: "Changi Depot", monthlyCost: "450", startDate: "2022-07-01" },
    { vehicleId: insertedVehicles[10].id, location: "Jurong East Depot", monthlyCost: "400", startDate: "2023-01-01" },
  ];
    await tx.insert(vehicleParking).values(parkingData);
  }); // End transaction

  console.log("Database seeded successfully!");
  console.log("- 8 Customers");
  console.log("- 12 Vehicles");
  console.log("- 15 Routes");
  console.log("- 6 Expense Categories");
  console.log("- 12 months of Income Records");
  console.log("- 12 months of Expenses");
  console.log("- 18 Employees (12 local, 6 foreign)");
  console.log("- 4 Subcontractors");
  console.log("- Vehicle Installments, Insurance, and Parking records");
}
