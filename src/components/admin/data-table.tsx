import { cn } from "~/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: keyof T | ((item: T) => string);
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField = "id",
  onRowClick,
  emptyMessage = "No data found.",
  loading = false,
}: DataTableProps<T>) {
  const getKey = (item: T): string => {
    if (typeof keyField === "function") return keyField(item);
    return String(item[keyField] ?? "");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-6 w-6 border-2 border-brand-purple border-t-transparent rounded-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white/40 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "text-left py-3 px-4 text-xs font-medium text-white/40 uppercase tracking-wider",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={getKey(item)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "border-b border-white/5 transition-colors",
                onRowClick && "cursor-pointer hover:bg-white/5",
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn("py-3 px-4 text-white/70", col.className)}
                >
                  {col.render
                    ? col.render(item)
                    : String(item[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
