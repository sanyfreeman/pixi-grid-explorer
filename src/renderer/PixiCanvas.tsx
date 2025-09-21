import { useEffect, useRef, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { useStore } from '@/state/store';
import type { Tile } from '@/types';
import { generateTiles } from './tileGenerator';
import { 
  createVideoTile, 
  createImageTile, 
  createAudioTile, 
  createColorTile 
} from './mediaRenderers';

const GRID_COLS = 5;
const GRID_ROWS = 4;
const TILE_SIZE = 120;
const TILE_GAP = 20;

export const PixiCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const viewportRef = useRef<Viewport | null>(null);
  const tilesContainersRef = useRef<Map<string, PIXI.Container>>(new Map());
  
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
    const container = tilesContainersRef.current.get(tile.id);
    if (container) {
      // Update border on hover/selection
      const border = container.getChildByName('border') as PIXI.Graphics;
      if (border) {
        border.clear();
        const isSelected = selectedTileId === tile.id;
        const borderColor = isSelected ? 0xa855f7 : (isHovering ? 0x3b82f6 : 0x475569);
        const borderWidth = isSelected || isHovering ? 3 : 2;
        
        border.lineStyle(borderWidth, borderColor, 1);
        border.drawRoundedRect(0, 0, tile.width, tile.height, 8);
      }
    }
  }, [selectedTileId]);

  useEffect(() => {
    if (!containerRef.current) return;

    const initPixi = async () => {
      // Initialize PIXI Application with async init for v8
      const app = new PIXI.Application();
      
      // Initialize the app with async method (required for PIXI v8)
      await app.init({
        width: containerRef.current!.clientWidth,
        height: containerRef.current!.clientHeight,
        backgroundColor: 0x0f1117,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      // Append canvas to container (PIXI v8 uses app.canvas)
      containerRef.current!.appendChild(app.canvas);
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

      // Render tiles based on their type
      for (const tile of tilesData) {
        let tileContainer: PIXI.Container;
        
        // Create tile based on type
        switch (tile.type) {
          case 'video':
            tileContainer = await createVideoTile(tile);
            break;
          case 'image':
            tileContainer = await createImageTile(tile);
            break;
          case 'audio':
            tileContainer = createAudioTile(tile);
            break;
          case 'color':
          default:
            tileContainer = createColorTile(tile);
            break;
        }
        
        // Add border for hover/selection
        const border = new PIXI.Graphics();
        border.name = 'border';
        border.lineStyle(2, 0x475569, 1);
        border.drawRoundedRect(0, 0, tile.width, tile.height, 8);
        tileContainer.addChild(border);
        
        // Make interactive
        tileContainer.eventMode = 'static';
        tileContainer.cursor = 'pointer';
        
        // Store reference
        tilesContainersRef.current.set(tile.id, tileContainer);
        
        // Add event listeners
        tileContainer.on('pointerdown', () => handleTileClick(tile));
        tileContainer.on('pointerover', () => handleTileHover(tile, true));
        tileContainer.on('pointerout', () => handleTileHover(tile, false));
        
        tilesContainer.addChild(tileContainer);
      }

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
    };

    initPixi();
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