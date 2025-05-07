import { Button } from '@/components/ui/button';
import { Database, ChevronLeft, RefreshCcw, Download, X as CloseIcon, Check } from 'lucide-react';
import { Entry } from '@/types/entry';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { getTableImageStyles, getStatusStyleForImage } from '@/lib/image-utils';

interface DestinationListProps {
  destinations: Record<string, Entry[]>;
  onSelect: (destination: string) => void;
}

const DestinationList = ({ destinations, onSelect }: DestinationListProps) => {
  const queryClient = useQueryClient();
  const destinationKeys = Object.keys(destinations);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Clean up any timers when component unmounts
  useEffect(() => {
    return () => {
      if (longPressTimer) clearTimeout(longPressTimer);
    };
  }, [longPressTimer]);
  
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      // Invalidate the cached data
      await queryClient.invalidateQueries({ queryKey: ['entries'] });
      // Force refetch the data
      await queryClient.refetchQueries({ queryKey: ['entries'] });
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleDestinationClick = (destination: string) => {
    if (selectionMode) {
      toggleTableSelection(destination);
    } else {
      onSelect(destination);
    }
  };
  
  const toggleTableSelection = (destination: string) => {
    setSelectedTables((prev) =>
      prev.includes(destination) 
        ? prev.filter(d => d !== destination) 
        : [...prev, destination]
    );
  };
  
  const handleTouchStart = (destination: string) => {
    if (longPressTimer) clearTimeout(longPressTimer);
    
    const timer = setTimeout(() => {
      setSelectionMode(true);
      setSelectedTables([destination]);
      // Provide haptic feedback on mobile if available
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }, 600); // 600ms is a good duration for long press
    
    setLongPressTimer(timer);
  };
  
  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };
  
  const handleContextMenu = (e: React.MouseEvent, destination: string) => {
    // Prevent default browser context menu
    e.preventDefault();
    
    // Start selection mode
    setSelectionMode(true);
    
    // Add to selected tables if not already there
    if (!selectedTables.includes(destination)) {
      setSelectedTables([...selectedTables, destination]);
    }
  };
  
  const resetSelection = () => {
    setSelectionMode(false);
    setSelectedTables([]);
  };
  
  const handleDownloadTables = async () => {
    if (selectedTables.length === 0) {
      toast.error('Please select at least one table to download');
      return;
    }
    
    setIsDownloading(true);
    try {
      for (const destination of selectedTables) {
        const entriesList = destinations[destination] || [];
        
        // Create a container for the export
        const container = document.createElement('div');
        const styles = getTableImageStyles();
        
        // Apply container styles
        Object.assign(container.style, styles.containerStyle);
        
        // Create header
        const header = document.createElement('div');
        Object.assign(header.style, styles.headerStyle);
        
        // Add icon
        const svgIcon = document.createElement('span');
        svgIcon.innerHTML = `
          <svg width="32" height="32" viewBox="0 0 24 24" stroke="#6E59A5" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="13" rx="2"/><path d="M6 7V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/>
          </svg>
        `;
        svgIcon.style.display = "inline-flex";
        svgIcon.style.alignItems = "center";
        header.appendChild(svgIcon);
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = destination;
        Object.assign(title.style, styles.titleStyle);
        header.appendChild(title);
        
        // Add spacer
        header.appendChild(document.createElement('div'));
        
        // Add header to container
        container.appendChild(header);
        
        // Create table element
        const table = document.createElement('table');
        Object.assign(table.style, styles.tableStyle);
        
        // Get fields excluding internal ones
        const fields = entriesList.length > 0 
          ? Object.keys(entriesList[0]).filter(k => !['id', 'userId', 'createdAt'].includes(k))
          : [];
        
        // Create table header row
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        fields.forEach(field => {
          const th = document.createElement('th');
          // Format field name (camelCase to Title Case)
          th.textContent = field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
          Object.assign(th.style, styles.thStyle);
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        // Create table rows
        entriesList.forEach(entry => {
          const row = document.createElement('tr');
          fields.forEach(field => {
            const cell = document.createElement('td');
            const value = entry[field as keyof typeof entry] ?? '-';
            
            if (field === 'status') {
              // Special formatting for status field
              const badge = document.createElement('span');
              const statusStyle = getStatusStyleForImage(String(value));
              badge.textContent = String(value).toUpperCase();
              Object.assign(badge.style, {
                ...styles.statusBadge,
                backgroundColor: statusStyle.backgroundColor,
                color: statusStyle.textColor
              });
              cell.appendChild(badge);
            } else {
              // Regular text cell
              cell.textContent = typeof value === 'string' ? value : JSON.stringify(value);
            }
            
            Object.assign(cell.style, styles.tdStyle);
            row.appendChild(cell);
          });
          tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        
        // Add table to container
        container.appendChild(table);
        
        // Add footer with date
        const footer = document.createElement('div');
        footer.textContent = `Exported on ${new Date().toLocaleString()}`;
        footer.style.marginTop = '24px';
        footer.style.textAlign = 'right';
        footer.style.fontSize = '13px';
        footer.style.color = '#8E9196';
        container.appendChild(footer);
        
        // Position off-screen for rendering
        document.body.appendChild(container);
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.zIndex = '-1';
        
        // Generate image with better quality options
        const canvas = await html2canvas(container, {
          scale: 2, // Higher scale for better resolution
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
          allowTaint: true,
          width: container.offsetWidth,
          height: container.offsetHeight,
          windowWidth: container.scrollWidth + 100, // Add extra width to ensure all columns render
          windowHeight: container.scrollHeight
        });
        
        // Clean up
        document.body.removeChild(container);
        
        // Download image
        const dataUrl = canvas.toDataURL('image/png', 1.0); // Use maximum quality
        const a = document.createElement('a');
        a.download = `table-${destination.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        a.href = dataUrl;
        a.click();
        
        // Small delay between downloads if multiple tables
        if (selectedTables.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      toast.success('Tables downloaded successfully!');
      // Reset selection after download
      resetSelection();
    } catch (error) {
      console.error('Error downloading tables:', error);
      toast.error('Failed to download tables. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <div className="grid gap-4 mt-4">
      {selectionMode && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-3 px-1 -mt-4 -mx-4 mb-2 flex items-center justify-between border-b shadow-sm">
          <div className="text-sm font-medium ml-3">
            {selectedTables.length} table{selectedTables.length !== 1 ? 's' : ''} selected
          </div>
          
          <div className="flex gap-3 items-center">
            <Button
              variant="default"
              size="sm"
              onClick={handleDownloadTables}
              disabled={selectedTables.length === 0 || isDownloading}
              className="flex items-center gap-2 px-5 h-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSelection}
              className="flex items-center justify-center h-10 w-10 rounded-full p-0 hover:bg-muted/50"
              aria-label="Cancel Selection"
            >
              <CloseIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
      
      {!selectionMode && (
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs text-muted-foreground">
            <span>
              Long-press or right-click to select tables
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="flex items-center justify-center h-9 w-9 rounded-md"
            disabled={isRefreshing}
            title="Refresh Data"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}
      
      {destinationKeys.length > 0 ? (
        destinationKeys.map((destination) => (
          <div
            key={destination}
            className={`
              relative w-full flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 active:bg-muted/40
              ${selectionMode && selectedTables.includes(destination) 
                ? 'bg-primary/10 border-primary shadow-md' 
                : 'hover:bg-muted/30 bg-muted/10 border-border/50'}
            `}
            onClick={() => handleDestinationClick(destination)}
            onContextMenu={(e) => handleContextMenu(e, destination)}
            onTouchStart={() => handleTouchStart(destination)}
            onTouchEnd={handleTouchEnd}
          >
            <span className="flex items-center gap-2 cursor-pointer flex-1">
              <Database 
                className={`w-6 h-6 ${
                  selectionMode && selectedTables.includes(destination) 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`}
              />
              <span className="truncate font-medium text-base">{destination || 'Unnamed Destination'}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">({destinations[destination].length} entries)</span>
            </span>
            
            {/* Selection indicator */}
            {selectionMode && selectedTables.includes(destination) && (
              <div className="absolute right-4 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground shadow-sm">
                <Check className="w-4 h-4" />
              </div>
            )}
            
            {/* Navigate arrow (only show when not in selection mode) */}
            {!selectionMode && (
              <ChevronLeft className="w-5 h-5 rotate-180 flex-shrink-0 ml-auto text-muted-foreground/70" />
            )}
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg">
          <Database className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No entries found. Add some data first or refresh the page.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh Data"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default DestinationList;
