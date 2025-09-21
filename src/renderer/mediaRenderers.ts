import * as PIXI from 'pixi.js';
import type { Tile } from '@/types';

// Create video tile
export const createVideoTile = async (tile: Tile): Promise<PIXI.Container> => {
  const container = new PIXI.Container();
  container.x = tile.x;
  container.y = tile.y;
  
  // Create background
  const bg = new PIXI.Graphics();
  bg.beginFill(0x1a1a2e, 0.9);
  bg.drawRoundedRect(0, 0, tile.width, tile.height, 8);
  bg.endFill();
  container.addChild(bg);
  
  try {
    // Create video element
    const video = document.createElement('video');
    video.src = tile.mediaUrl!;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    
    // Create texture from video
    const texture = PIXI.Texture.from(video);
    const sprite = new PIXI.Sprite(texture);
    
    // Scale to fit tile
    sprite.width = tile.width - 4;
    sprite.height = tile.height - 20;
    sprite.x = 2;
    sprite.y = 2;
    
    container.addChild(sprite);
    
    // Add label
    const text = new PIXI.Text(tile.label, {
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0xffffff,
      align: 'center',
    });
    text.anchor.set(0.5);
    text.x = tile.width / 2;
    text.y = tile.height - 8;
    container.addChild(text);
    
    // Start playing
    video.play().catch(console.error);
  } catch (error) {
    console.error('Error loading video:', error);
  }
  
  return container;
};

// Create image tile
export const createImageTile = async (tile: Tile): Promise<PIXI.Container> => {
  const container = new PIXI.Container();
  container.x = tile.x;
  container.y = tile.y;
  
  // Create background
  const bg = new PIXI.Graphics();
  bg.beginFill(0x2a2a3e, 0.9);
  bg.drawRoundedRect(0, 0, tile.width, tile.height, 8);
  bg.endFill();
  container.addChild(bg);
  
  try {
    // Load image texture
    const texture = await PIXI.Assets.load(tile.mediaUrl!);
    const sprite = new PIXI.Sprite(texture);
    
    // Scale to fit tile
    sprite.width = tile.width - 4;
    sprite.height = tile.height - 20;
    sprite.x = 2;
    sprite.y = 2;
    
    container.addChild(sprite);
    
    // Add label
    const text = new PIXI.Text(tile.label, {
      fontFamily: 'Arial',
      fontSize: 10,
      fill: 0xffffff,
      align: 'center',
    });
    text.anchor.set(0.5);
    text.x = tile.width / 2;
    text.y = tile.height - 8;
    container.addChild(text);
  } catch (error) {
    console.error('Error loading image:', error);
  }
  
  return container;
};

// Create audio tile with visualization
export const createAudioTile = (tile: Tile): PIXI.Container => {
  const container = new PIXI.Container();
  container.x = tile.x;
  container.y = tile.y;
  
  // Create background
  const bg = new PIXI.Graphics();
  bg.beginFill(0x3a3a5e, 0.9);
  bg.drawRoundedRect(0, 0, tile.width, tile.height, 8);
  bg.endFill();
  container.addChild(bg);
  
  // Create audio visualization bars
  const barCount = 8;
  const barWidth = (tile.width - 20) / barCount - 2;
  
  for (let i = 0; i < barCount; i++) {
    const bar = new PIXI.Graphics();
    const height = Math.random() * 40 + 10;
    bar.beginFill(0x8b5cf6, 0.8);
    bar.drawRect(
      10 + i * (barWidth + 2),
      tile.height / 2 - height / 2,
      barWidth,
      height
    );
    bar.endFill();
    container.addChild(bar);
    
    // Animate bars
    const animateBar = () => {
      const targetHeight = Math.random() * 40 + 10;
      bar.clear();
      bar.beginFill(0x8b5cf6, 0.8);
      bar.drawRect(
        10 + i * (barWidth + 2),
        tile.height / 2 - targetHeight / 2,
        barWidth,
        targetHeight
      );
      bar.endFill();
    };
    
    setInterval(animateBar, 200 + Math.random() * 300);
  }
  
  // Add play icon
  const playIcon = new PIXI.Graphics();
  playIcon.beginFill(0xffffff, 0.9);
  playIcon.moveTo(tile.width / 2 - 8, tile.height / 2 - 10);
  playIcon.lineTo(tile.width / 2 + 8, tile.height / 2);
  playIcon.lineTo(tile.width / 2 - 8, tile.height / 2 + 10);
  playIcon.closePath();
  playIcon.endFill();
  container.addChild(playIcon);
  
  // Add label
  const text = new PIXI.Text(tile.label, {
    fontFamily: 'Arial',
    fontSize: 10,
    fill: 0xffffff,
    align: 'center',
  });
  text.anchor.set(0.5);
  text.x = tile.width / 2;
  text.y = tile.height - 8;
  container.addChild(text);
  
  // Create hidden audio element
  if (tile.mediaUrl) {
    const audio = new Audio(tile.mediaUrl);
    audio.loop = true;
    audio.volume = 0.3;
    
    container.on('pointerdown', () => {
      if (audio.paused) {
        audio.play().catch(console.error);
        playIcon.alpha = 0.3;
      } else {
        audio.pause();
        playIcon.alpha = 0.9;
      }
    });
  }
  
  return container;
};

// Create color tile (original style)
export const createColorTile = (tile: Tile): PIXI.Container => {
  const container = new PIXI.Container();
  container.x = tile.x;
  container.y = tile.y;
  
  const graphics = new PIXI.Graphics();
  graphics.beginFill(tile.color, 0.8);
  graphics.drawRoundedRect(0, 0, tile.width, tile.height, 8);
  graphics.endFill();
  
  // Border
  graphics.lineStyle(2, 0x475569, 1);
  graphics.drawRoundedRect(0, 0, tile.width, tile.height, 8);
  
  container.addChild(graphics);
  
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
  container.addChild(text);
  
  return container;
};