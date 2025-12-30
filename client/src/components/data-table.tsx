import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileX, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  sortKey?: keyof T | ((row: T) => string | number | Date | null);
}

type SortDirection = "asc" | "desc" | null;

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: number | string }>({
  columns,
  data,
  isLoading,
  emptyMessage = "No data found",
  emptyAction,
  onRowClick,
}: DataTableProps<T>) {
  const [sortColumnIndex, setSortColumnIndex] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (columnIndex: number) => {
    const column = columns[columnIndex];
    if (!column.sortKey) return;

    if (sortColumnIndex === columnIndex) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortColumnIndex(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortColumnIndex(columnIndex);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (sortColumnIndex === null || sortDirection === null) {
      return data;
    }

    const column = columns[sortColumnIndex];
    if (!column.sortKey) return data;

    const getValue = (row: T): string | number | Date | null => {
      if (typeof column.sortKey === "function") {
        return column.sortKey(row);
      }
      const value = row[column.sortKey as keyof T];
      if (value === null || value === undefined) return null;
      if (typeof value === "string" || typeof value === "number") return value;
      if (value instanceof Date) return value;
      return String(value);
    };

    return [...data].sort((a, b) => {
      const aVal = getValue(a);
      const bVal = getValue(b);

      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return sortDirection === "asc" ? 1 : -1;
      if (bVal === null) return sortDirection === "asc" ? -1 : 1;

      let comparison = 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        comparison = aVal.localeCompare(bVal);
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        comparison = Number(aVal) - Number(bVal);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, columns, sortColumnIndex, sortDirection]);

  const renderSortIcon = (columnIndex: number) => {
    const column = columns[columnIndex];
    if (!column.sortKey) return null;

    if (sortColumnIndex === columnIndex) {
      if (sortDirection === "asc") {
        return <ArrowUp className="ml-1 h-4 w-4 inline" />;
      } else if (sortDirection === "desc") {
        return <ArrowDown className="ml-1 h-4 w-4 inline" />;
      }
    }
    return <ArrowUpDown className="ml-1 h-4 w-4 inline opacity-50" />;
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileX className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-4">{emptyMessage}</p>
          {emptyAction}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, i) => (
              <TableHead
                key={i}
                className={`${col.className || ""} ${col.sortKey ? "cursor-pointer select-none hover-elevate" : ""}`}
                onClick={() => col.sortKey && handleSort(i)}
                data-testid={col.sortKey ? `sort-${col.header.toLowerCase().replace(/\s+/g, "-")}` : undefined}
              >
                {col.header}
                {renderSortIcon(i)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row) => (
            <TableRow
              key={row.id}
              className={onRowClick ? "cursor-pointer hover-elevate" : ""}
              onClick={() => onRowClick?.(row)}
              data-testid={`row-${row.id}`}
            >
              {columns.map((col, i) => (
                <TableCell key={i} className={col.className}>
                  {typeof col.accessor === "function"
                    ? col.accessor(row)
                    : (row[col.accessor] as React.ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
