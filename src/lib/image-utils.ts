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
    return { backgroundColor: '#E5DEFF', textColor: '#6E59A5' };
  } else if (status === 'out') {
    return { backgroundColor: '#FFDEE2', textColor: '#B91C1C' };
  }
  return { backgroundColor: '#F3F4F6', textColor: '#1F2937' };
};

/**
 * Gets mobile-optimized styles for the image container
 */
export const getMobileImageStyles = () => ({
  containerStyle: {
    backgroundColor: '#FFFFFF',
    padding: '32px 24px',
    width: '480px', // Fixed width for 9:16 aspect ratio
    height: '853px', // 9:16 aspect ratio based on width
    margin: '0 auto',
    fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    boxSizing: 'border-box',
    borderRadius: '30px',
    boxShadow: '0 0 24px 2px #ece6f6',
  },
  headerStyle: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '8px',
    paddingBottom: '16px',
    borderBottom: '2px solid #F3F4F6',
  },
  titleStyle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1A1F2C',
    margin: '0',
    letterSpacing: '.02em',
    flex: '1',
    textAlign: 'center'
  },
  statusStyle: {
    padding: '0 24px',
    borderRadius: '999px',
    fontWeight: '700',
    fontSize: '20px',
    minWidth: '66px',
    height: '41px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    textAlign: 'center',
    boxSizing: 'border-box',
    lineHeight: '41px',
  },
  tableStyle: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
    backgroundColor: '#fff',
    fontWeight: 500,
    fontSize: '15px',
    color: '#000',
    marginBottom: '18px',
  },
  labelCellStyle: {
    padding: '16px',
    fontWeight: '600',
    width: '140px',
    color: '#6B7280',
    backgroundColor: '#F9FAFB',
    borderRadius: '12px 0 0 12px',
    fontSize: '16px',
    letterSpacing: '0.025em',
  },
  valueCellStyle: {
    padding: '16px',
    color: '#111827',
    backgroundColor: '#F9FAFB',
    borderRadius: '0 12px 12px 0',
    fontSize: '16px',
    fontWeight: '600',
    letterSpacing: '0.025em',
  },
  footerStyle: {
    marginTop: 'auto',
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: '14px',
    paddingTop: '24px',
    borderTop: '1px solid #F3F4F6',
  }
});
