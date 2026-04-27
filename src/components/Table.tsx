import React from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: Error | string | null;
  emptyMessage?: string;
}

const Table = <T extends { id?: string | number }>({
  columns,
  data,
  error,
  loading = false,
  emptyMessage = "No data found",
}: TableProps<T>) => {
  const renderBody = () => {
    // 1. Loading state
    if (loading) {
      return [...Array(5)].map((_, i) => (
        <tr key={`skeleton-${i}`} className="animate-pulse">
          {columns.map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </td>
          ))}
        </tr>
      ));
    }

    // 2. Error state
    if (error) {
      const message = typeof error === "string" ? error : error.message;
      return (
        <tr>
          <td
            colSpan={columns.length}
            className="text-center py-6 text-red-500 dark:text-red-400 font-medium"
          >
            {message}
          </td>
        </tr>
      );
    }

    // 3. Empty state
    if (data.length === 0) {
      return (
        <tr>
          <td
            colSpan={columns.length}
            className="text-center py-6 text-gray-400 dark:text-gray-500"
          >
            {emptyMessage}
          </td>
        </tr>
      );
    }

    // 4. Data rows
    return data.map((row, rowIndex) => (
      <tr
        key={row.id || rowIndex}
        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        {columns.map((col, colIndex) => {
          const value =
            typeof col.accessor === "function"
              ? col.accessor(row)
              : (row[col.accessor] as React.ReactNode);
          return (
            <td
              key={colIndex}
              className={`px-4 py-3 text-gray-900 dark:text-gray-100 ${
                col.className || ""
              }`}
            >
              {value}
            </td>
          );
        })}
      </tr>
    ));
  };

  return (
    <div className="w-full overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3 font-medium ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {renderBody()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
