
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
import { ChevronLeft, Table as TableIcon, FlipHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { saveEntry, getRecentEntries } from '@/services/tableService';
import { useQuery } from '@tanstack/react-query';

const Index = () => {
  const [pdfData, setPdfData] = useState<Omit<Entry, 'id'> | undefined>();
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [lastUpdatedId, setLastUpdatedId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
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
