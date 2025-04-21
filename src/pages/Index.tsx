import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DataEntryForm from '@/components/DataEntryForm';
import PDFUploader from '@/components/PDFUploader';
import DataTable from '@/components/DataTable';
import Header from '@/components/Header';
import DestinationList from '@/components/DestinationList';
import PageBackground from '@/components/PageBackground';
import { Entry } from '@/types/entry';
import { toast } from 'sonner';
import { ChevronLeft, Table as TableIcon, FlipHorizontal, Download } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { saveEntry, getRecentEntries } from '@/services/tableService';
import { useQuery } from '@tanstack/react-query';
import html2canvas from "html2canvas";
import { getMobileImageStyles, getStatusStyleForImage } from "@/lib/image-utils";
import { Checkbox } from "@/components/ui/checkbox";

const Index = () => {
  const [pdfData, setPdfData] = useState<Omit<Entry, 'id'> | undefined>();
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [lastUpdatedId, setLastUpdatedId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [isDownloadTablesLoading, setIsDownloadTablesLoading] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const { data: entries = [], refetch, isLoading, error } = useQuery({
    queryKey: ['entries', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      console.log('Fetching entries for user ID:', user.uid);
      try {
        const result = await getRecentEntries(user.uid);
        console.log('Entries fetched successfully:', result.length);
        return result;
      } catch (err) {
        console.error('Error in queryFn:', err);
        toast.error('Failed to load entries');
        return [];
      }
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (error) {
      console.error('Query error:', error);
      toast.error('Failed to load entries. Please try again.');
    }
  }, [error]);

  const handleAddEntry = async (entry: Omit<Entry, 'id'>) => {
    if (!user) {
      toast.error('You must be logged in to add entries');
      return;
    }
    
    try {
      await saveEntry(entry, user.uid);
      await refetch();
      setPdfData(undefined);
      toast.success('Entry added successfully', {
        position: "top-center",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save entry. Please try again.');
    }
  };

  const handlePDFData = (extractedEntries: Omit<Entry, 'id'>[], url: string) => {
    if (extractedEntries.length > 0) {
      setPdfData(extractedEntries[0]);
      setPdfUrl(url);
      toast.success('PDF data loaded into form', {
        position: "top-center",
        duration: 3000,
      });
    }
  };

  const handleFlipTable = () => {
    setIsFlipped(!isFlipped);
    toast.success(`Table orientation ${isFlipped ? 'vertical' : 'horizontal'}`, {
      position: "top-center",
      duration: 2000,
    });
  };

  const handleViewPDF = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      toast.error('No PDF available to view', {
        position: "top-center",
        duration: 2000,
      });
    }
  };

  const handleBack = () => {
    setSelectedDestination(null);
    setIsFlipped(false);
  };

  const toggleTable = (destination: string) => {
    setSelectedTables((prev) =>
      prev.includes(destination)
        ? prev.filter((d) => d !== destination)
        : [...prev, destination]
    );
  };

  const handleDownloadSelectedTables = async () => {
    if (!selectedTables.length) {
      toast.error("Please select at least one table to download!");
      return;
    }
    setIsDownloadTablesLoading(true);
    try {
      for (const dest of selectedTables) {
        const entriesList = entriesByDestination[dest] || [];
        const container = document.createElement("div");

        const styles = {
          containerStyle: {
            backgroundColor: "#fff",
            padding: "32px 32px 36px 32px",
            width: "1200px",
            minHeight: "550px",
            margin: "0 auto",
            fontFamily: 'Inter, system-ui, sans-serif',
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
        };

        Object.assign(container.style, styles.containerStyle);

        const heading = document.createElement("div");
        Object.assign(heading.style, styles.headerStyle);

        const svgIcon = document.createElement("span");
        svgIcon.innerHTML = `
          <svg width="32" height="32" viewBox="0 0 24 24" stroke="#6E59A5" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="13" rx="2"/><path d="M6 7V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/>
          </svg>
        `;
        svgIcon.style.display = "inline-flex";
        svgIcon.style.alignItems = "center";
        heading.appendChild(svgIcon);

        const title = document.createElement("h2");
        title.textContent = dest;
        Object.assign(title.style, styles.titleStyle);
        heading.appendChild(title);

        heading.appendChild(document.createElement("div"));

        container.appendChild(heading);

        const table = document.createElement("table");
        Object.assign(table.style, styles.tableStyle);

        const allFields =
          entriesList.length > 0
            ? Object.keys(entriesList[0]).filter(
                (k) => !["id", "userId", "createdAt"].includes(k)
              )
            : [];

        const headerRow = document.createElement("tr");
        allFields.forEach((key) => {
          const th = document.createElement("th");
          th.textContent = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
          Object.assign(th.style, styles.thStyle);
          headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        entriesList.forEach((entry) => {
          const row = document.createElement("tr");
          allFields.forEach((key) => {
            const cell = document.createElement("td");
            let value = entry[key as keyof typeof entry] ?? "-";
            if (key === "status") {
              const badge = document.createElement("span");
              const statusStyle = getStatusStyleForImage(String(value));
              badge.textContent = String(value).toUpperCase();
              Object.assign(badge.style, {
                ...styles.statusBadge,
                background: statusStyle.backgroundColor,
                color: statusStyle.textColor
              });
              cell.appendChild(badge);
            } else {
              cell.textContent = typeof value === "string" ? value : JSON.stringify(value);
            }
            Object.assign(cell.style, styles.tdStyle);
            row.appendChild(cell);
          });
          table.appendChild(row);
        });

        container.appendChild(table);

        const footer = document.createElement("div");
        footer.textContent = `Exported: ${new Date().toLocaleString()}`;
        footer.style.marginTop = "24px";
        footer.style.textAlign = "right";
        footer.style.fontSize = "13px";
        footer.style.color = "#8E9196";
        container.appendChild(footer);

        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "0";
        container.style.zIndex = "-1";
        document.body.appendChild(container);

        const canvas = await html2canvas(container, {
          scale: 2,
          width: 1200,
          height: container.offsetHeight,
          backgroundColor: "#fff",
          useCORS: true,
          logging: false,
        });
        document.body.removeChild(container);

        const dataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.download = `table-${dest.replace(/[^a-zA-Z0-9]/g, "_")}.png";
        a.href = dataUrl;
        a.click();
      }
      toast.success("Tables downloaded as professional images!", {
        position: "top-center",
      });
    } catch (e) {
      console.error("Bulk table download failed:", e);
      toast.error("Something went wrong while downloading tables.");
    } finally {
      setIsDownloadTablesLoading(false);
    }
  };

  const handleDestinationRowContextMenu = (dest: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedTables([dest]);
    } else {
      toggleTable(dest);
    }
  };

  const handleDestinationRowTouchStart = (dest: string) => {
    if (longPressTimer) clearTimeout(longPressTimer);
    const timer = setTimeout(() => {
      setSelectionMode(true);
      setSelectedTables([dest]);
    }, 600);
    setLongPressTimer(timer);
  };

  const handleDestinationRowTouchEnd = () => {
    if (longPressTimer) clearTimeout(longPressTimer);
  };

  const resetSelectionMode = () => {
    setSelectionMode(false);
    setSelectedTables([]);
  };

  const entriesByDestination = (entries || []).reduce((acc, entry) => {
    if (!entry.destination) return acc;
    
    const destination = entry.destination;
    if (!acc[destination]) {
      acc[destination] = [];
    }
    acc[destination].push(entry);
    return acc;
  }, {} as Record<string, Entry[]>);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[100dvh] bg-background p-4 pt-safe pb-safe relative">
      <PageBackground />
      
      <div className="max-w-lg mx-auto space-y-6 relative">
        <Header onViewPDF={handleViewPDF} />
        
        <Card className="p-5 bg-card/95 backdrop-blur-sm shadow-lg border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col space-y-1 mb-4">
            <h2 className="text-lg font-semibold">PDF Upload</h2>
            <p className="text-sm text-muted-foreground">Upload your container pass documents</p>
          </div>
          <PDFUploader onDataExtracted={handlePDFData} />
        </Card>
        
        <Card className="p-5 bg-card/95 backdrop-blur-sm shadow-lg border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col space-y-1 mb-4">
            <h2 className="text-lg font-semibold">Manual Entry</h2>
            <p className="text-sm text-muted-foreground">Enter container details manually</p>
          </div>
          <DataEntryForm onSubmit={handleAddEntry} pdfData={pdfData} />
        </Card>

        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-300" size="lg">
              <span className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 flex-shrink-0" />
                View Tables
              </span>
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[100dvh] w-screen p-0 max-w-none pt-safe pb-safe">
            <div className="h-full flex flex-col">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="h-4 w-32 bg-muted rounded"></div>
                  </div>
                </div>
              ) : selectedDestination ? (
                <div className={`h-full ${isFlipped ? 'flipped-view' : ''}`}>
                  <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-50 p-4 border-b shadow-sm">
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="ghost" 
                        onClick={handleBack}
                        size="icon"
                        className="hover:bg-muted/50"
                        aria-label="Go Back"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <h3 className="text-lg font-medium text-center">{selectedDestination}</h3>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleFlipTable}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={isFlipped ? "Vertical Table" : "Horizontal Table"}
                      >
                        <FlipHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto p-2 sm:p-4 pb-safe">
                    <DataTable 
                      entries={entriesByDestination[selectedDestination] || []} 
                      isFlipped={isFlipped}
                      lastUpdatedId={lastUpdatedId}
                      onBack={handleBack}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <SheetHeader className="flex items-center justify-between">
                    <SheetTitle className="text-center w-full text-xl font-semibold">Container Data Tables</SheetTitle>
                  </SheetHeader>
                  {selectionMode && (
                    <div className="flex items-center gap-2 mb-4 animate-fade-in">
                      <Button
                        onClick={handleDownloadSelectedTables}
                        disabled={isDownloadTablesLoading || selectedTables.length === 0}
                        className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold text-base"
                        size="lg"
                      >
                        <Download className="w-5 h-5" />
                        {isDownloadTablesLoading ? "Downloading..." : "Download Tables"}
                      </Button>
                      <Button
                        onClick={resetSelectionMode}
                        variant="ghost"
                        className="ml-2"
                        size="sm"
                      >Cancel</Button>
                      <span className="text-xs text-muted-foreground ml-2">
                        {selectedTables.length} selected
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col gap-2 mt-4 mb-6">
                    {Object.keys(entriesByDestination).length === 0 && (
                      <div className="text-muted-foreground text-center p-6">
                        No destination tables to display.
                      </div>
                    )}
                    {Object.entries(entriesByDestination).map(([dest, entries]) => (
                      <div
                        key={dest}
                        className={
                          "flex items-center gap-3 bg-muted/20 px-4 py-3 rounded-lg border hover:bg-muted/30 transition-colors shadow-sm mb-1 group relative"
                        }
                        onContextMenu={e => handleDestinationRowContextMenu(dest, e)}
                        onTouchStart={() => handleDestinationRowTouchStart(dest)}
                        onTouchEnd={handleDestinationRowTouchEnd}
                      >
                        {selectionMode && (
                          <input
                            type="checkbox"
                            checked={selectedTables.includes(dest)}
                            onChange={() => toggleTable(dest)}
                            className="accent-primary h-5 w-5 rounded border border-primary focus:ring-2 focus:ring-primary mr-3 transition-all duration-150"
                            style={{
                              marginLeft: 0,
                            }}
                          />
                        )}
                        <div
                          className="flex items-center gap-2 w-full cursor-pointer"
                          onClick={() => {
                            if (selectionMode) {
                              toggleTable(dest);
                            } else {
                              setSelectedDestination(dest);
                            }
                          }}
                          style={{ userSelect: "none" }}
                        >
                          <TableIcon className="w-5 h-5 text-primary/80 flex-shrink-0" />
                          <span className="font-medium text-base">{dest}</span>
                          <span className="ml-2 bg-secondary/70 text-xs rounded-full px-2 py-0.5">{entries.length} entries</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {!selectionMode && (
                    <span className="text-xs text-muted-foreground ml-2">
                      Long-press (mobile) or right-click (desktop) a table to enable multi-select & download
                    </span>
                  )}
                  <DestinationList
                    destinations={entriesByDestination}
                    onSelect={setSelectedDestination}
                  />
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Index;
