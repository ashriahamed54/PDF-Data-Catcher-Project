
import { formatEntryForDisplay } from "./utils";
import { Entry } from "@/types/entry";

/**
 * Formats an entry for display in downloaded images
 * Focuses on the most important fields and formats them for professional display
 */
export const prepareEntryForImage = (entry: Entry): Record<string, string> => {
  const formatted = formatEntryForDisplay(entry);
  return formatted;
};

/**
 * Gets a color for the status badge in the downloaded image
 */
export const getStatusStyleForImage = (status: string): { backgroundColor: string, textColor: string } => {
  status = status.toLowerCase();
  if (status === 'in') {
    return { backgroundColor: '#F2FCE2', textColor: '#166534' };
  } else if (status === 'out') {
    return { backgroundColor: '#FEE2E2', textColor: '#B91C1C' };
  }
  return { backgroundColor: '#F3F4F6', textColor: '#1F2937' };
};

/**
 * Gets mobile-optimized styles for the image container
 */
export const getMobileImageStyles = () => ({
  containerStyle: {
    backgroundColor: '#FFFFFF',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
    fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu',
  },
  headerStyle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '2px solid #F3F4F6',
  },
  titleStyle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    margin: '0',
  },
  statusStyle: {
    padding: '8px 16px',
    borderRadius: '9999px',
    fontWeight: '600',
    fontSize: '16px',
  },
  tableStyle: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 4px',
  },
  labelCellStyle: {
    padding: '12px 16px',
    fontWeight: '500',
    width: '140px',
    color: '#4B5563',
    backgroundColor: '#F9FAFB',
    borderRadius: '6px 0 0 6px',
    fontSize: '14px',
  },
  valueCellStyle: {
    padding: '12px 16px',
    color: '#111827',
    backgroundColor: '#F9FAFB',
    borderRadius: '0 6px 6px 0',
    fontSize: '14px',
    fontWeight: '500',
  },
  footerStyle: {
    marginTop: '20px',
    textAlign: 'center',
    color: '#6B7280',
    fontSize: '12px',
  }
});
