import { useEffect, useRef, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { useStore } from '@/state/store';
import type { Tile } from '@/types';

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

// Generate tiles data
const generateTiles = (): Tile[] => {
  const tiles: Tile[] = [];
  let id = 0;
  
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      tiles.push({
        id: `tile-${id}`,
        x: col * (TILE_SIZE + TILE_GAP),
        y: row * (TILE_SIZE + TILE_GAP),
        width: TILE_SIZE,
        height: TILE_SIZE,
        color: generateRandomColor(),
        label: `Item ${id + 1}`,
      });
      id++;
    }
  }
  
  return tiles;
};

export const PixiCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const viewportRef = useRef<Viewport | null>(null);
  const tilesGraphicsRef = useRef<Map<string, PIXI.Graphics>>(new Map());
  
  const { 
    selectedTileId, 
    setSelectedTileId, 
    setTiles, 
    setCameraState,
    cameraState,
    tiles 
  } = useStore();

  // Reset camera when requested
  useEffect(() => {
    if (viewportRef.current && cameraState.x === 0 && cameraState.y === 0 && cameraState.scale === 1) {
      viewportRef.current.moveCenter(0, 0);
      viewportRef.current.setZoom(1, true);
    }
  }, [cameraState]);

  const handleTileClick = useCallback((tile: Tile) => {
    console.log(`Tile clicked: ${tile.id}`);
    setSelectedTileId(tile.id);
  }, [setSelectedTileId]);

  const handleTileHover = useCallback((tile: Tile, isHovering: boolean) => {
    const graphics = tilesGraphicsRef.current.get(tile.id);
    if (graphics) {
      graphics.clear();
      
      // Draw tile background
      graphics.beginFill(tile.color, 0.8);
      graphics.drawRoundedRect(0, 0, tile.width, tile.height, 8);
      graphics.endFill();
      
      // Draw border (highlight on hover or selection)
      const isSelected = selectedTileId === tile.id;
      const borderColor = isSelected ? 0xa855f7 : (isHovering ? 0x3b82f6 : 0x475569);
      const borderWidth = isSelected || isHovering ? 3 : 2;
      
      graphics.lineStyle(borderWidth, borderColor, 1);
      graphics.drawRoundedRect(0, 0, tile.width, tile.height, 8);
    }
  }, [selectedTileId]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize PIXI Application
    const app = new PIXI.Application({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      backgroundColor: 0x0f1117,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    containerRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    // Create viewport for panning and zooming
    const viewport = new Viewport({
      screenWidth: app.screen.width,
      screenHeight: app.screen.height,
      worldWidth: 2000,
      worldHeight: 2000,
      ticker: app.ticker,
      events: app.renderer.events,
      passiveWheel: false,
    });

    // Add viewport to stage
    app.stage.addChild(viewport as any);
    viewportRef.current = viewport;

    // Enable viewport interactions
    viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate();

    // Update camera state on viewport change
    const handleViewportMove = () => {
      setCameraState({
        x: viewport.center.x,
        y: viewport.center.y,
        scale: viewport.scaled,
      });
    };
    
    // Add listener for viewport changes
    viewport.on('moved', handleViewportMove);
    viewport.on('zoomed', handleViewportMove);

    // Generate and render tiles
    const tilesData = generateTiles();
    setTiles(tilesData);

    // Create container for all tiles
    const tilesContainer = new PIXI.Container();
    (viewport as any).addChild(tilesContainer);

    // Center the tiles grid
    const gridWidth = GRID_COLS * (TILE_SIZE + TILE_GAP) - TILE_GAP;
    const gridHeight = GRID_ROWS * (TILE_SIZE + TILE_GAP) - TILE_GAP;
    tilesContainer.x = -gridWidth / 2;
    tilesContainer.y = -gridHeight / 2;

    // Render tiles
    tilesData.forEach((tile) => {
      const graphics = new PIXI.Graphics();
      graphics.x = tile.x;
      graphics.y = tile.y;
      
      // Initial draw
      graphics.beginFill(tile.color, 0.8);
      graphics.drawRoundedRect(0, 0, tile.width, tile.height, 8);
      graphics.endFill();
      
      // Border
      graphics.lineStyle(2, 0x475569, 1);
      graphics.drawRoundedRect(0, 0, tile.width, tile.height, 8);
      
      // Make interactive
      graphics.eventMode = 'static';
      graphics.cursor = 'pointer';
      
      // Add text label
      const text = new PIXI.Text(tile.label, {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffffff,
        align: 'center',
      });
      text.anchor.set(0.5);
      text.x = tile.width / 2;
      text.y = tile.height / 2;
      graphics.addChild(text);
      
      // Store reference
      tilesGraphicsRef.current.set(tile.id, graphics);
      
      // Add event listeners
      graphics.on('pointerdown', () => handleTileClick(tile));
      graphics.on('pointerover', () => handleTileHover(tile, true));
      graphics.on('pointerout', () => handleTileHover(tile, false));
      
      tilesContainer.addChild(graphics);
    });

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current && app) {
        app.renderer.resize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
        viewport.resize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
    };
  }, []);

  // Update tiles when selection changes
  useEffect(() => {
    tiles.forEach((tile) => {
      handleTileHover(tile, false);
    });
  }, [selectedTileId, tiles, handleTileHover]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-canvas-bg"
      style={{ touchAction: 'none' }}
    />
  );
};