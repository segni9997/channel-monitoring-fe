import Papa from "papaparse";
import { format } from "date-fns";

/**
 * Downloads a given array of objects as a CSV file.
 */
export const downloadCSV = (data: any[], filenamePrefix: string = "export") => {
  if (!data || !data.length) return;

  const csvContent = Papa.unparse(data);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
  const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
  const filename = `${filenamePrefix}_${timestamp}.csv`;

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
