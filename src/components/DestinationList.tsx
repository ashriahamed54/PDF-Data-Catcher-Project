
import { Button } from '@/components/ui/button';
import { Database, ChevronLeft, RefreshCcw } from 'lucide-react';
import { Entry } from '@/types/entry';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';

interface DestinationListProps {
  destinations: Record<string, Entry[]>;
  onSelect: (destination: string) => void;
}

const DestinationList = ({ destinations, onSelect }: DestinationListProps) => {
  const queryClient = useQueryClient();
  const destinationKeys = Object.keys(destinations);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
  
  return (
    <div className="grid gap-4 mt-4">
      <div className="flex justify-end mb-2">
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
      
      {destinationKeys.length > 0 ? (
        destinationKeys.map((destination) => (
          <Button
            key={destination}
            variant="outline"
            className="w-full flex items-center justify-between p-4 text-foreground hover:text-foreground/80"
            onClick={() => onSelect(destination)}
          >
            <span className="flex items-center gap-2">
              <Database className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{destination || 'Unnamed Destination'}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">({destinations[destination].length} entries)</span>
            </span>
            <ChevronLeft className="w-4 h-4 rotate-180 flex-shrink-0 ml-2" />
          </Button>
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
