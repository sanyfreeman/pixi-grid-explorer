import type { Tile, TileType } from '@/types';

const GRID_COLS = 5;
const GRID_ROWS = 4;
const TILE_SIZE = 120;
const TILE_GAP = 20;

// Generate random colors for tiles
const generateRandomColor = () => {
  const colors = [
    0x3b82f6, // blue
    0x8b5cf6, // purple
    0x06b6d4, // cyan
    0x10b981, // emerald
    0xf59e0b, // amber
    0xef4444, // red
    0xec4899, // pink
    0x6366f1, // indigo
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Sample media URLs
const MEDIA_URLS = {
  videos: [
    'https://pixijs.com/assets/video.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  ],
  images: [
    'https://picsum.photos/200/200?random=1',
    'https://picsum.photos/200/200?random=2',
    'https://picsum.photos/200/200?random=3',
    'https://picsum.photos/200/200?random=4',
    'https://picsum.photos/200/200?random=5',
    'https://picsum.photos/200/200?random=6',
  ],
  audio: [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  ]
};

// Generate tiles with mixed media types
export const generateTiles = (): Tile[] => {
  const tiles: Tile[] = [];
  let id = 0;
  
  // Define media distribution
  const mediaDistribution: { type: TileType; count: number }[] = [
    { type: 'video', count: 4 },
    { type: 'image', count: 6 },
    { type: 'audio', count: 3 },
    { type: 'color', count: 7 },
  ];
  
  let mediaIndex = 0;
  let currentTypeCount = 0;
  let currentType = mediaDistribution[0];
  
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      // Get current tile type
      let tileType = currentType.type;
      let mediaUrl: string | undefined;
      
      // Assign media URL based on type
      switch (tileType) {
        case 'video':
          mediaUrl = MEDIA_URLS.videos[id % MEDIA_URLS.videos.length];
          break;
        case 'image':
          mediaUrl = MEDIA_URLS.images[id % MEDIA_URLS.images.length];
          break;
        case 'audio':
          mediaUrl = MEDIA_URLS.audio[0];
          break;
      }
      
      tiles.push({
        id: `tile-${id}`,
        x: col * (TILE_SIZE + TILE_GAP),
        y: row * (TILE_SIZE + TILE_GAP),
        width: TILE_SIZE,
        height: TILE_SIZE,
        color: generateRandomColor(),
        label: `${tileType.charAt(0).toUpperCase() + tileType.slice(1)} ${id + 1}`,
        type: tileType,
        mediaUrl,
      });
      
      // Update distribution counter
      currentTypeCount++;
      if (currentTypeCount >= currentType.count && mediaIndex < mediaDistribution.length - 1) {
        mediaIndex++;
        currentType = mediaDistribution[mediaIndex];
        currentTypeCount = 0;
      }
      
      id++;
    }
  }
  
  return tiles;
};