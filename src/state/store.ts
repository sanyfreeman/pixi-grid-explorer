import { create } from 'zustand';
import type { AppState } from '@/types';

const initialCameraState = {
  x: 0,
  y: 0,
  scale: 1,
};

export const useStore = create<AppState>((set) => ({
  selectedTileId: null,
  detailLevel: 'Medium',
  tiles: [],
  cameraState: initialCameraState,
  
  setSelectedTileId: (id) => set({ selectedTileId: id }),
  
  setDetailLevel: (level) => {
    console.log(`Detail level changed to: ${level}`);
    set({ detailLevel: level });
  },
  
  setTiles: (tiles) => set({ tiles }),
  
  setCameraState: (state) => set({ cameraState: state }),
  
  resetCamera: () => {
    console.log('Resetting camera to default position');
    set({ cameraState: initialCameraState });
  },
}));