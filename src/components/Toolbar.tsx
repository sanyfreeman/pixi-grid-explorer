import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotateCcw, Grid3x3, Layers } from 'lucide-react';
import { useStore } from '@/state/store';
import type { DetailLevel } from '@/types';

export const Toolbar = () => {
  const { detailLevel, setDetailLevel, resetCamera, selectedTileId } = useStore();

  return (
    <div className="h-16 bg-card border-b border-border px-4 flex items-center justify-between backdrop-blur-lg bg-opacity-95">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Grid3x3 className="w-5 h-5 text-primary" />
          Canvas Editor
        </h1>
        
        <div className="h-8 w-px bg-border" />
        
        <Button
          onClick={resetCamera}
          variant="secondary"
          size="sm"
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset View
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {selectedTileId && (
          <div className="text-sm text-muted-foreground">
            Selected: <span className="text-primary font-medium">{selectedTileId}</span>
          </div>
        )}
        
        <div className="h-8 w-px bg-border" />
        
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <label htmlFor="detail-select" className="text-sm text-muted-foreground">
            Detail Level:
          </label>
          <Select
            value={detailLevel}
            onValueChange={(value) => setDetailLevel(value as DetailLevel)}
          >
            <SelectTrigger id="detail-select" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};