# Design Guidelines: Transport Company Accounting System

## Design Approach
**Selected System:** Material Design with Carbon Design influences for data-dense enterprise applications

**Rationale:** This is a utility-focused, information-dense business application requiring stability, efficiency, and learnability. Standard enterprise patterns will serve users better than visual experimentation.

## Typography
- **Primary Font:** Inter (Google Fonts)
- **Monospace Font:** JetBrains Mono for financial figures, IDs, dates
- **Hierarchy:**
  - Page Titles: text-3xl font-semibold
  - Section Headers: text-xl font-semibold
  - Card/Table Headers: text-sm font-medium uppercase tracking-wide
  - Body Text: text-sm
  - Financial Figures: text-base font-mono tabular-nums
  - Labels/Metadata: text-xs

## Layout System
**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 or p-6
- Section spacing: gap-6 or gap-8
- Card spacing: p-6
- Form field gaps: gap-4
- Table cell padding: px-4 py-3

**Grid Structure:**
- Fixed sidebar: w-64 (desktop), collapsible on mobile
- Main content: max-w-7xl mx-auto px-6 py-8
- Dashboard widgets: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
- Forms: max-w-2xl for single-column, max-w-4xl for two-column layouts
- Tables: Full-width with horizontal scroll on mobile

## Component Library

**Navigation:**
- Fixed left sidebar with company logo at top
- Hierarchical menu with icons (Heroicons)
- Active state: filled background with left border accent
- Grouped sections: Customers, Routes, Finances, Fleet, Employees, Reports

**Dashboard Cards:**
- Metric cards with large numbers (text-3xl font-mono), labels below
- Border treatment, slight elevation shadow
- Icon in top-right corner
- Recent transactions: compact list with alternating row treatment

**Data Tables:**
- Sticky headers with subtle border-bottom
- Alternating row treatment for readability
- Right-align numeric columns (text-right font-mono)
- Action buttons in rightmost column (icon-only for compact display)
- Pagination controls at bottom-right
- Search/filter bar above table
- Empty states with illustration and call-to-action

**Forms:**
- Two-column layout for desktop (grid-cols-2 gap-6)
- Full-width labels above inputs
- Required field indicators (asterisk)
- Helper text below inputs (text-xs)
- Section dividers with headers
- Sticky footer with Cancel/Save buttons (right-aligned)
- Inline validation errors below fields

**Charts (Recharts):**
- Bar charts for P&L, cash flow comparisons
- Line charts for trends, cumulative balances
- Minimal grid lines, clear axis labels
- Tooltips with detailed breakdowns
- Legend below chart
- Responsive height: h-80

**Financial Displays:**
- Currency always prefixed with "S$"
- Tabular numbers alignment
- Profit/positive values: no special treatment (rely on context)
- Loss/negative values in parentheses: (S$ 1,234.56)
- Subtotals with top border
- Grand totals with double top border and bold weight

**Modals/Dialogs:**
- Max-width: max-w-2xl
- Header with title and close button
- Content area with p-6
- Footer with action buttons (right-aligned)

**Status Badges:**
- Pill-shaped badges (rounded-full px-3 py-1 text-xs font-medium)
- Active/Paid/Success context
- Inactive/Pending neutral context
- Overdue/Error warning context

**Import/Export:**
- File upload dropzone with dashed border
- Import summary table showing success/error counts
- Download button with CSV icon (Heroicons: arrow-down-tray)

## Vehicle Sub-modules
Tab navigation within vehicle detail view:
- Tabs: Overview, Installments, Insurance, Parking
- Each tab shows relevant data table
- Add new entry button in top-right of each tab

## Reports Layout
**P&L Statement:**
- Date range selector at top (from/to date pickers)
- Single-column layout with clear section breaks
- Indented sub-categories
- Print button (top-right) triggers browser print dialog

**Cash Flow Forecast:**
- Period selector (3/6/12/24 months dropdown)
- Charts section: two side-by-side charts (grid-cols-2)
- Monthly breakdown table below charts
- Running balance column with right-alignment

## Mobile Responsiveness
- Sidebar collapses to hamburger menu
- Dashboard metrics stack vertically (grid-cols-1)
- Tables scroll horizontally
- Forms become single-column
- Charts maintain aspect ratio
- Sticky mobile header with menu toggle

## Data Density
- Compact spacing throughout (prefer p-4 over p-6 in tight spaces)
- Tables with minimal row height padding
- Multi-column forms on desktop
- Collapsed/expandable sections for deep hierarchies
- No hero sections or marketing elements