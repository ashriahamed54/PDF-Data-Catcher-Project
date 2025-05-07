
import { Button } from '@/components/ui/button';
import { Database, ChevronLeft, RefreshCcw, Download } from 'lucide-react';
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
        const headerRow = document.createElement('tr');
        fields.forEach(field => {
          const th = document.createElement('th');
          // Format field name (camelCase to Title Case)
          th.textContent = field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
          Object.assign(th.style, styles.thStyle);
          headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        
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
          table.appendChild(row);
        });
        
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
        
        // Generate image
        const canvas = await html2canvas(container, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true
        });
        
        // Clean up
        document.body.removeChild(container);
        
        // Download image
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.download = `table-${destination.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        a.href = dataUrl;
        a.click();
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
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-muted-foreground">
          {selectionMode ? (
            <span>
              {selectedTables.length} table(s) selected
            </span>
          ) : (
            <span>
              Long-press or right-click to select tables
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          {selectionMode && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={handleDownloadTables}
                disabled={selectedTables.length === 0 || isDownloading}
                className="flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                {isDownloading ? 'Downloading...' : 'Download'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSelection}
              >
                Cancel
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="flex items-center justify-center"
            disabled={isRefreshing}
            title="Refresh Data"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      {destinationKeys.length > 0 ? (
        destinationKeys.map((destination) => (
          <div
            key={destination}
            className={`
              w-full flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/30 transition-colors
              ${selectionMode && selectedTables.includes(destination) 
                ? 'bg-primary/10 border-primary/30' 
                : 'bg-muted/20 border-border/50'}
            `}
            onClick={() => handleDestinationClick(destination)}
            onContextMenu={(e) => handleContextMenu(e, destination)}
            onTouchStart={() => handleTouchStart(destination)}
            onTouchEnd={handleTouchEnd}
          >
            <span className="flex items-center gap-2 cursor-pointer">
              <Database className={`w-5 h-5 ${selectionMode && selectedTables.includes(destination) ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="truncate">{destination || 'Unnamed Destination'}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">({destinations[destination].length} entries)</span>
            </span>
            <ChevronLeft className="w-4 h-4 rotate-180 flex-shrink-0 ml-auto" />
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
