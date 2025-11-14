import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Column {
  key: string;
  label: string;
  accessor?: (item: any) => string;
}

interface DailyDeliveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  rows: any[];
  columns: Column[];
  emptyMessage: string;
  statusClassName?: (status: string) => string;
  testIdPrefix: string;
}

export default function DailyDeliveryModal({
  open,
  onOpenChange,
  title,
  rows,
  columns,
  emptyMessage,
  statusClassName,
  testIdPrefix
}: DailyDeliveryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSearchQuery("");
    }
    onOpenChange(newOpen);
  };

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    
    const query = searchQuery.toLowerCase();
    return rows.filter((row) => {
      return columns.some((col) => {
        const value = col.accessor ? col.accessor(row) : row[col.key];
        return value?.toString().toLowerCase().includes(query);
      });
    });
  }, [rows, searchQuery, columns]);

  const shouldShowScrollbar = filteredRows.length > 6;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {rows.length === 0 ? (
            <div className="text-center py-12" data-testid={`text-no-${testIdPrefix}-items`}>
              <p className="text-gray-500 dark:text-gray-400 text-lg">{emptyMessage}</p>
            </div>
          ) : (
            <>
              {/* Search Bar - Only shown if there's data */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid={`input-${testIdPrefix}-search`}
                  />
                </div>
              </div>

              {/* Table with conditional scroll */}
              <div className={`overflow-x-auto ${shouldShowScrollbar ? 'max-h-72 overflow-y-auto' : ''}`}>
                <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                  <thead className="sticky top-0 bg-gray-200 dark:bg-gray-700 z-10">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length} className="py-8 text-center text-gray-500 dark:text-gray-400">
                          No results found
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((item: any, index: number) => (
                        <tr
                          key={index}
                          className={index % 2 === 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800"}
                          data-testid={`row-${testIdPrefix}-item-${index}`}
                        >
                          {columns.map((col) => {
                            const value = col.accessor ? col.accessor(item) : item[col.key];
                            
                            if (col.key === 'status') {
                              const statusClass = statusClassName 
                                ? statusClassName(value) 
                                : "px-2 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
                              
                              return (
                                <td key={col.key} className="py-3 px-4 text-sm border-b border-gray-100 dark:border-gray-700">
                                  <span className={statusClass}>
                                    {value}
                                  </span>
                                </td>
                              );
                            }
                            
                            const isFontMedium = col.key === 'requirement' || col.key === 'candidate';
                            return (
                              <td
                                key={col.key}
                                className={`py-3 px-4 text-sm ${
                                  isFontMedium
                                    ? 'text-gray-900 dark:text-white font-medium'
                                    : 'text-gray-600 dark:text-gray-400'
                                } border-b border-gray-100 dark:border-gray-700`}
                              >
                                {value}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded"
              data-testid={`button-close-${testIdPrefix}-modal`}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
