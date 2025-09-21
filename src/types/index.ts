export type TileType = 'color' | 'video' | 'image' | 'audio';

export interface Tile {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  label: string;
  type: TileType;
  mediaUrl?: string;
  pixiContainer?: any; // PIXI.Container reference
}

export interface CameraState {
  x: number;
  y: number;
  scale: number;
}

export type DetailLevel = 'Low' | 'Medium' | 'High';

export interface AppState {
  selectedTileId: string | null;
  detailLevel: DetailLevel;
  tiles: Tile[];
  cameraState: CameraState;
  setSelectedTileId: (id: string | null) => void;
  setDetailLevel: (level: DetailLevel) => void;
  setTiles: (tiles: Tile[]) => void;
  setCameraState: (state: CameraState) => void;
  resetCamera: () => void;
}