
import { formatEntryForDisplay } from "./utils";
import { Entry } from "@/types/entry";

/**
 * Formats an entry for display in downloaded images
 * Focuses on the most important fields and formats them for professional display
 */
export const prepareEntryForImage = (entry: Entry): Record<string, string> => {
  const formatted = formatEntryForDisplay(entry);
  
  // Add any specific formatting for image display
  // For example, we could format dates or enhance certain fields
  
  return formatted;
};

/**
 * Gets a color for the status badge in the downloaded image
 */
export const getStatusStyleForImage = (status: string): { backgroundColor: string, textColor: string } => {
  status = status.toLowerCase();
  if (status.includes('complete') || status.includes('done') || status.includes('finished')) {
    return { backgroundColor: '#d1fae5', textColor: '#065f46' };
  } else if (status.includes('pending') || status.includes('wait')) {
    return { backgroundColor: '#fef3c7', textColor: '#92400e' };
  } else if (status.includes('cancel') || status.includes('reject')) {
    return { backgroundColor: '#fee2e2', textColor: '#b91c1c' };
  } else if (status.includes('process') || status.includes('progress')) {
    return { backgroundColor: '#dbeafe', textColor: '#1e40af' };
  } else if (status === 'in') {
    return { backgroundColor: '#d1fae5', textColor: '#065f46' };
  } else if (status === 'out') {
    return { backgroundColor: '#fee2e2', textColor: '#b91c1c' };
  }
  return { backgroundColor: '#f3f4f6', textColor: '#1f2937' };
};

