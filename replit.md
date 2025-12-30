# Transport Company Accounting System

## Overview

A comprehensive accrual accounting system for a Singapore-based transport company providing bus routes. The application manages customers, routes, vehicles, employees, income, expenses, and generates financial reports including P&L statements and cash flow forecasting.

The system handles Singapore-specific requirements including CPF (Central Provident Fund) calculations for local workers and foreign worker levy tracking, with all financial figures in SGD.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query for server state, React hooks for local state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for theming (light/dark mode support)
- **Charts**: Recharts for data visualization on dashboard and reports
- **Forms**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful JSON API under `/api/*` routes
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Schema Validation**: Zod schemas generated from Drizzle schema using drizzle-zod
- **Build System**: Vite for frontend, esbuild for server bundling

### Data Model
Core entities with relationships:
- **Customers**: Companies contracting transport services
- **Routes**: Bus routes linked to customers with monthly rates, supports owned and subcontracted types
- **Income Records**: Monthly income from customers, tracks billing periods (YYYY-MM format) and payment status
- **Expense Categories**: Hierarchical expense categorization
- **Expenses**: One-time or recurring expenses, optionally linked to vehicles
- **Vehicles**: Fleet management with sub-modules for installments, insurance, and parking
- **Employees**: HR management with local/foreign worker distinction for CPF/levy calculations

### Project Structure
```
client/           # React frontend
  src/
    components/   # Reusable UI components
    pages/        # Route-based page components
    hooks/        # Custom React hooks
    lib/          # Utilities and query client
server/           # Express backend
  routes.ts       # API route definitions
  storage.ts      # Database operations interface
  db.ts           # Database connection
shared/           # Shared code between client/server
  schema.ts       # Drizzle database schema and types
```

### Key Design Decisions
- **Monorepo Structure**: Single repository with shared types between frontend and backend via `@shared/*` path alias
- **Type Safety**: End-to-end type safety from database schema to API to frontend using Drizzle-Zod
- **Component Architecture**: Atomic design with reusable components (DataTable, StatCard, PageHeader) following Material Design patterns for enterprise applications
- **Currency Handling**: Decimal precision (12,2) for all financial fields, formatted as SGD

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema management and query building
- **drizzle-kit**: Database migrations with `db:push` command

### Third-Party Libraries
- **@tanstack/react-query**: API data fetching and caching
- **react-hook-form**: Form state management
- **zod**: Runtime type validation
- **date-fns**: Date manipulation for billing periods and reports
- **recharts**: Financial charts and visualizations
- **lucide-react**: Icon library

### Development Tools
- **Vite**: Frontend dev server and build tool
- **tsx**: TypeScript execution for server
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Pre-built accessible component primitives

## Recent Changes

### December 2025
- Implemented complete frontend with all pages: Dashboard, Customers, Routes, Income, Expenses, Vehicles (with tabbed sub-modules), Employees, P&L Report, Cash Flow Forecast
- Added comprehensive backend API with CRUD operations for all entities
- Implemented vehicle sub-modules: Installments, Insurance, Parking
- Added CPF calculation (17%) for local workers and foreign worker levy support
- Created financial reports: P&L Statement and Cash Flow Forecast
- Fixed SelectItem empty value issue across all forms
- All currency formatted as SGD (S$ X,XXX.XX format)

## API Endpoints

### Core Entities
- `GET/POST /api/customers` - Customer management
- `GET/POST /api/routes` - Route management with customer/vehicle relations
- `GET/POST /api/income` - Income tracking with billing periods
- `GET/POST /api/expenses` - Expense management with categories
- `GET/POST /api/expense-categories` - Expense categorization
- `GET/POST /api/vehicles` - Vehicle fleet management
- `GET/POST /api/employees` - Employee/HR management

### Vehicle Sub-modules
- `GET/POST /api/vehicles/:id/installments` - Vehicle installments
- `GET/POST /api/vehicles/:id/insurance` - Vehicle insurance
- `GET/POST /api/vehicles/:id/parking` - Vehicle parking

### Reports
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/reports/pnl?from=YYYY-MM-DD&to=YYYY-MM-DD` - P&L statement
- `GET /api/reports/cashflow?period=6` - Cash flow forecast (months)