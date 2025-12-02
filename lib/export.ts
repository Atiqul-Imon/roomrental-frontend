/**
 * Export data to CSV format
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: Record<keyof T, string>
) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object or use provided headers
  const keys = Object.keys(data[0]) as Array<keyof T>;
  const headerLabels = headers || ({} as Record<keyof T, string>);

  // Create CSV content
  const csvHeaders = keys.map((key) => headerLabels[key] || String(key));
  const csvRows = data.map((row) =>
    keys.map((key) => {
      const value = row[key];
      // Handle null, undefined, and objects
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      // Escape quotes and wrap in quotes if contains comma or newline
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    })
  );

  const csvContent = [
    csvHeaders.join(','),
    ...csvRows.map((row) => row.join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to Excel format (XLSX) using a simple approach
 * Note: For full Excel support, consider using a library like xlsx
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: Record<keyof T, string>
) {
  // For now, we'll export as CSV with .xlsx extension
  // In production, use a library like 'xlsx' for proper Excel format
  exportToCSV(data, filename, headers);
  
  // TODO: Implement proper Excel export using xlsx library
  // import * as XLSX from 'xlsx';
  // const ws = XLSX.utils.json_to_sheet(data);
  // const wb = XLSX.utils.book_new();
  // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  // XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export data to JSON format
 */
export function exportToJSON<T>(data: T[], filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

