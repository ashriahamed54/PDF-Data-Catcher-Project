import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Entry } from "@/types/entry";
import { useState, useEffect, useRef } from "react";
import { X, Edit, Trash2, RefreshCcw, ArrowLeft, Save, Check, AlertCircle, Info, Copy, Calendar, Download } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { deleteEntry, updateEntry } from "@/services/tableService";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";

interface SortConfig {
  key: keyof Entry | 'createdAt';
  direction: 'asc' | 'desc';
}

interface DataTableProps {
  entries: Entry[];
  isFlipped?: boolean;
  lastUpdatedId?: string | null;
  onBack?: () => void;
}

const DataTable = ({ entries: initialEntries, isFlipped, lastUpdatedId }: DataTableProps) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [editMode, setEditMode] = useState(false);
  const [editedEntry, setEditedEntry] = useState<Entry | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("DataTable received entries:", initialEntries.length);
    const sortedEntries = [...initialEntries].sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (sortConfig.direction === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });
    setEntries(sortedEntries);
  }, [initialEntries, sortConfig]);

  const handleSort = (key: keyof Entry | 'createdAt') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRowDoubleClick = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
    setEditMode(false);
    setEditedEntry(null);
  };

  const handleEdit = (entry: Entry) => {
    setEditMode(true);
    setEditedEntry({ ...entry });
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this entry?");
    if (confirmed) {
      try {
        await deleteEntry(id);
        setEntries(entries.filter(entry => entry.id !== id));
        setExpandedRow(null);
        queryClient.invalidateQueries({ queryKey: ['entries'] });
        toast.success("Entry deleted successfully");
      } catch (error) {
        console.error('Error deleting entry:', error);
        toast.error("Failed to delete entry");
      }
    }
  };

  const handleSave = async () => {
    if (editedEntry) {
      try {
        await updateEntry(editedEntry.id as string, editedEntry);
        setEntries(entries.map(entry => 
          entry.id === editedEntry.id ? editedEntry : entry
        ));
        queryClient.invalidateQueries({ queryKey: ['entries'] });
        setEditMode(false);
        setEditedEntry(null);
        toast.success("Entry updated successfully");
      } catch (error) {
        console.error('Error updating entry:', error);
        toast.error("Failed to update entry");
      }
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['entries'] });
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    status = status.toLowerCase();
    if (status.includes('complete') || status.includes('done') || status.includes('finished')) {
      return 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400';
    } else if (status.includes('pending') || status.includes('wait')) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400';
    } else if (status.includes('cancel') || status.includes('reject')) {
      return 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400';
    } else if (status.includes('process') || status.includes('progress')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400';
  };

  const handleDownloadImage = async () => {
    if (detailsRef.current) {
      setIsDownloading(true);
      try {
        const clone = detailsRef.current.cloneNode(true) as HTMLElement;
        
        clone.style.backgroundColor = 'white';
        clone.style.padding = '20px';
        clone.style.borderRadius = '8px';
        clone.style.width = `${detailsRef.current.offsetWidth}px`;
        
        clone.style.position = 'absolute';
        clone.style.top = '-9999px';
        document.body.appendChild(clone);
        
        const canvas = await html2canvas(clone, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
        });
        
        document.body.removeChild(clone);
        
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        const entryId = expandedRow || 'entry';
        a.download = `entry-${entryId}-details.png`;
        a.href = dataUrl;
        a.click();
        
        toast.success("Image downloaded successfully");
      } catch (error) {
        console.error('Error generating image:', error);
        toast.error("Failed to download image");
      } finally {
        setIsDownloading(false);
      }
    }
  };

  if (expandedRow) {
    const entry = entries.find(e => e.id === expandedRow);
    if (!entry) return null;

    return (
      <div className="expanded-row bg-gradient-to-b from-background to-background/95">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-background/95 py-3 px-1 border-b backdrop-blur-sm z-10">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              setExpandedRow(null);
              setEditMode(false);
              setEditedEntry(null);
            }}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <h2 className="text-lg font-semibold flex-1 text-center">Entry Details</h2>
          
          <div className="flex gap-2">
            {!editMode ? (
              <>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleDownloadImage}
                  className="hover:bg-muted"
                  disabled={isDownloading}
                  title="Download as Image"
                >
                  <Download className={`h-4 w-4 ${isDownloading ? 'animate-pulse' : ''}`} />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleEdit(entry)}
                  className="hover:bg-muted"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleDelete(entry.id)}
                  className="hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setEditMode(false);
                  setEditedEntry(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="px-2 sm:px-4 pb-safe" ref={detailsRef}>
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden mb-4">
            <div className="p-4 border-b bg-muted/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{entry.date}</span>
              </div>
              <Badge className={cn("font-normal", getStatusColor(entry.status || ''))}>
                {entry.status}
              </Badge>
            </div>
            <Table>
              <TableBody>
                {Object.entries(entry).map(([key, value]) => (
                  key !== 'id' && key !== 'userId' && key !== 'createdAt' && key !== 'date' && key !== 'status' && (
                    <TableRow key={key} className={cn(
                      editMode ? "hover:bg-muted/30" : "",
                      "border-b border-border/40 last:border-0"
                    )}>
                      <TableCell className="font-medium capitalize bg-muted/10 w-1/3 py-3 text-muted-foreground">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </TableCell>
                      <TableCell className="py-3">
                        {editMode && editedEntry ? (
                          <Input
                            value={editedEntry[key as keyof Entry] as string}
                            onChange={(e) => 
                              setEditedEntry({
                                ...editedEntry,
                                [key]: e.target.value
                              })
                            }
                            className="border-muted-foreground/30 focus:border-primary"
                          />
                        ) : (
                          <div className="py-1 font-medium">
                            {typeof value === 'object' ? JSON.stringify(value) : value || '-'}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                ))}
              </TableBody>
            </Table>
          </div>
          
          {editMode ? (
            <div className="mt-6 flex justify-end gap-3 pb-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditMode(false);
                  setEditedEntry(null);
                }}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="mt-6 bg-muted/20 rounded-lg p-4 text-sm text-muted-foreground border border-muted/30">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground/70 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Actions</h4>
                  <p>You can edit this entry by clicking the edit button above, or return to the table view using the back button.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${isFlipped ? 'flipped-container' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {entries.length} Entries
        </h3>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleRefresh}
          className="flex items-center justify-center"
          disabled={isRefreshing}
          title="Refresh Data"
        >
          <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {entries.length > 0 ? (
        <div className={`${isFlipped ? 'transform-wrapper' : 'table-container'} rounded-lg border shadow-sm overflow-hidden`}>
          <div className={isFlipped ? 'flipped-table' : ''}>
            <Table>
              <TableHeader className="sticky top-0 bg-muted/20 backdrop-blur-sm z-10">
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead 
                    className="whitespace-nowrap font-semibold min-w-[100px] bg-background/80 text-xs uppercase tracking-wider cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleSort('date')}
                  >
                    Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="whitespace-nowrap font-semibold min-w-[80px] bg-background/80 text-xs uppercase tracking-wider cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleSort('passNumber')}
                  >
                    Pass # {sortConfig.key === 'passNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="whitespace-nowrap font-semibold min-w-[100px] bg-background/80 text-xs uppercase tracking-wider cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleSort('cusdecNo')}
                  >
                    CUSDEC {sortConfig.key === 'cusdecNo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="whitespace-nowrap font-semibold min-w-[120px] bg-background/80 text-xs uppercase tracking-wider cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleSort('containerNo')}
                  >
                    Container {sortConfig.key === 'containerNo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="whitespace-nowrap font-semibold min-w-[120px] bg-background/80 text-xs uppercase tracking-wider cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleSort('truckNumber')}
                  >
                    Truck # {sortConfig.key === 'truckNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="whitespace-nowrap font-semibold min-w-[100px] bg-background/80 text-xs uppercase tracking-wider cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleSort('tokenNumber')}
                  >
                    Token # {sortConfig.key === 'tokenNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="whitespace-nowrap font-semibold min-w-[150px] bg-background/80 text-xs uppercase tracking-wider cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="whitespace-nowrap font-semibold min-w-[80px] bg-background/80 text-xs uppercase tracking-wider cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleSort('feet')}
                  >
                    Feet {sortConfig.key === 'feet' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="whitespace-nowrap font-semibold min-w-[100px] bg-background/80 text-xs uppercase tracking-wider cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleSort('item')}
                  >
                    Item {sortConfig.key === 'item' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="whitespace-nowrap font-semibold min-w-[80px] bg-background/80 text-xs uppercase tracking-wider cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow 
                    key={entry.id}
                    onDoubleClick={() => handleRowDoubleClick(entry.id as string)}
                    className={cn(
                      "cursor-pointer hover:bg-muted/40 transition-colors", 
                      entry.id === lastUpdatedId ? 'last-updated-row' : '',
                      "even:bg-muted/5"
                    )}
                  >
                    <TableCell className="whitespace-nowrap font-medium">{entry.date}</TableCell>
                    <TableCell className="whitespace-nowrap">{entry.passNumber}</TableCell>
                    <TableCell className="whitespace-nowrap">{entry.cusdecNo}</TableCell>
                    <TableCell className="whitespace-nowrap">{entry.containerNo}</TableCell>
                    <TableCell className="whitespace-nowrap">{entry.truckNumber}</TableCell>
                    <TableCell className="whitespace-nowrap">{entry.tokenNumber}</TableCell>
                    <TableCell className="whitespace-nowrap">{entry.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{entry.feet}</TableCell>
                    <TableCell className="whitespace-nowrap">{entry.item}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        getStatusColor(entry.status || '')
                      )}>
                        {entry.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground p-8 border rounded-lg text-center bg-card/50 backdrop-blur-sm shadow-sm">
          <p>No entries to display for this destination.</p>
          <Button 
            variant="outline" 
            size="icon"
            className="mt-4"
            onClick={handleRefresh}
            aria-label="Refresh Data"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
