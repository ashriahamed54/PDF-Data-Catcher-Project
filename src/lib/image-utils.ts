
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
  },
  headerStyle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    paddingBottom: '16px',
    borderBottom: '2px solid #F3F4F6',
  },
  titleStyle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1A1F2C',
    margin: '0',
  },
  statusStyle: {
    padding: '12px 24px',
    borderRadius: '999px',
    fontWeight: '700',
    fontSize: '20px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableStyle: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
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

/**
 * Gets professional table styles for the downloaded table image
 */
export const getTableImageStyles = () => ({
  containerStyle: {
    backgroundColor: "#fff",
    padding: "32px 32px 36px 32px",
    width: "1200px",
    minHeight: "550px",
    margin: "0 auto",
    fontFamily: "Inter, system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    boxSizing: "border-box",
    borderRadius: "18px",
    boxShadow: "0 0 24px 2px #ece6f6",
    position: "relative"
  },
  headerStyle: {
    display: "flex",
    alignItems: "center",
    borderBottom: "2px solid #ece6f6",
    paddingBottom: "16px",
    marginBottom: "4px",
    gap: "16px"
  },
  titleStyle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1A1F2C",
    margin: "0 12px 0 0",
    letterSpacing: ".02em"
  },
  tableStyle: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    fontWeight: 500,
    fontSize: "15px",
    color: "#000",
  },
  thStyle: {
    padding: "16px 8px",
    background: "#F1F0FB",
    fontWeight: "700",
    fontSize: "16px",
    color: "#6E59A5",
    borderRadius: "8px 8px 0 0",
    letterSpacing: "0.04em",
    textAlign: "center",
    border: "1px solid #edeaf8"
  },
  tdStyle: {
    padding: "14px 8px",
    color: "#1A1F2C",
    fontSize: "15px",
    background: "#fff",
    border: "1px solid #edeaf8",
    fontWeight: "500",
    textAlign: "center",
    verticalAlign: "middle",
    maxWidth: "220px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  statusBadge: {
    padding: "0 24px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "16px",
    textTransform: "uppercase",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: "41px",
    minWidth: "66px",
    height: "41px",
    margin: "0 auto"
  }
});
