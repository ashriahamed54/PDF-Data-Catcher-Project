
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Entry } from "@/types/entry"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats an entry object for display, handling null values and formatting
 */
export function formatEntryForDisplay(entry: Entry): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  Object.entries(entry).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'userId' && key !== 'createdAt') {
      formatted[key] = typeof value === 'object' ? JSON.stringify(value) : value?.toString() || '-';
    }
  });
  
  return formatted;
}
