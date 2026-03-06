import React, { useRef, useEffect } from 'react';

interface TiledLayer {
  name: string;
  data: number[];
  width: number;
  height: number;
  opacity: number;
  visible: boolean;
  type: string;
}

interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
}

interface TileMapRendererProps {
  mapData: TiledMap;
  activeAgentPositions?: { x: number; y: number }[];
}

export const DISPATCH_CONSOLE_TILE = { x: 13, y: 2 };

export const TileMapRenderer: React.FC<TileMapRendererProps> = ({ mapData, activeAgentPositions = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const { layers, tilewidth, tileheight } = mapData;

    const drawFrame = (time: number) => {
      if (!canvasRef.current) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      const activeDeskSet = new Set(
        activeAgentPositions.map((pos) => `${Math.floor(pos.x / tilewidth)},${Math.floor(pos.y / tileheight)}`),
      );

      layers.forEach((layer) => {
        if (!layer.visible || layer.type !== 'tilelayer') return;
        ctx.globalAlpha = layer.opacity;

        layer.data.forEach((gid, index) => {
          if (gid === 0) return;

          const tileX = index % layer.width;
          const tileY = Math.floor(index / layer.width);
          const destX = tileX * tilewidth;
          let destY = tileY * tileheight;

          if (gid === 1) {
            ctx.fillStyle = '#8f97a3';
            ctx.fillRect(destX, destY, tilewidth, tileheight);
            ctx.strokeStyle = '#7a818c';
            ctx.lineWidth = 1;
            ctx.strokeRect(destX, destY, tilewidth, tileheight);
          } else if (gid === 2) {
            ctx.fillStyle = '#3f475c';
            ctx.fillRect(destX, destY, tilewidth, tileheight);
            ctx.fillStyle = '#555d73';
            ctx.fillRect(destX + 2, destY + 2, tilewidth - 4, tileheight - 4);
          } else if (gid === 3) {
            const isActiveDesk = activeDeskSet.has(`${tileX},${tileY}`);
            const offsetY = isActiveDesk ? Math.sin(time / 100) * 2 : 0;
            destY += offsetY;

            ctx.fillStyle = '#a66a38';
            ctx.fillRect(destX + 1, destY + 4, tilewidth - 2, tileheight - 6);
            ctx.fillStyle = '#c2854e';
            ctx.fillRect(destX + 1, destY + 4, tilewidth - 2, 2);

            ctx.fillStyle = '#222';
            ctx.fillRect(destX + 3, destY - 2, 10, 8);
            ctx.fillStyle = isActiveDesk ? '#33ff33' : '#445';
            ctx.fillRect(destX + 4, destY - 1, 8, 6);
          } else if (gid === 4) {
            ctx.fillStyle = '#b3b9c2';
            ctx.fillRect(destX + 2, destY + 1, tilewidth - 4, tileheight - 2);
            ctx.fillStyle = '#8f97a3';
            ctx.fillRect(destX + 4, destY + 3, tilewidth - 8, 2);
            ctx.fillRect(destX + 4, destY + 8, tilewidth - 8, 2);
          } else if (gid === 5 || gid === 6) {
            ctx.fillStyle = '#228b22';
            ctx.beginPath();
            ctx.arc(destX + tilewidth / 2, destY + tileheight / 2, 6, 0, Math.PI * 2);
            ctx.fill();
          } else if (gid === 7) {
            const pulse = 0.8 + Math.sin(time / 300) * 0.2;
            ctx.fillStyle = '#2e3e58';
            ctx.fillRect(destX, destY, tilewidth, tileheight);

            ctx.fillStyle = '#101826';
            ctx.fillRect(destX + 1, destY + 1, tilewidth - 2, tileheight - 2);

            ctx.fillStyle = `rgba(65, 255, 189, ${pulse})`;
            ctx.fillRect(destX + 3, destY + 3, tilewidth - 6, tileheight - 6);

            ctx.fillStyle = '#0a111d';
            ctx.fillRect(destX + 6, destY + 5, 4, 1);
            ctx.fillRect(destX + 6, destY + 8, 4, 1);
          }
        });
      });
    };

    const render = (time: number) => {
      drawFrame(time);
      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    };
  }, [mapData, activeAgentPositions]);

  // Fix 2: Pause canvas when tab is not visible
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const { layers, tilewidth, tileheight } = mapData;

    const drawFrame = (time: number) => {
      if (!canvasRef.current) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      const activeDeskSet = new Set(
        activeAgentPositions.map((pos) => `${Math.floor(pos.x / tilewidth)},${Math.floor(pos.y / tileheight)}`),
      );

      layers.forEach((layer) => {
        if (!layer.visible || layer.type !== 'tilelayer') return;
        ctx.globalAlpha = layer.opacity;

        layer.data.forEach((gid, index) => {
          if (gid === 0) return;

          const tileX = index % layer.width;
          const tileY = Math.floor(index / layer.width);
          const destX = tileX * tilewidth;
          let destY = tileY * tileheight;

          if (gid === 1) {
            ctx.fillStyle = '#8f97a3';
            ctx.fillRect(destX, destY, tilewidth, tileheight);
            ctx.strokeStyle = '#7a818c';
            ctx.lineWidth = 1;
            ctx.strokeRect(destX, destY, tilewidth, tileheight);
          } else if (gid === 2) {
            ctx.fillStyle = '#3f475c';
            ctx.fillRect(destX, destY, tilewidth, tileheight);
            ctx.fillStyle = '#555d73';
            ctx.fillRect(destX + 2, destY + 2, tilewidth - 4, tileheight - 4);
          } else if (gid === 3) {
            const isActiveDesk = activeDeskSet.has(`${tileX},${tileY}`);
            const offsetY = isActiveDesk ? Math.sin(time / 100) * 2 : 0;
            destY += offsetY;

            ctx.fillStyle = '#a66a38';
            ctx.fillRect(destX + 1, destY + 4, tilewidth - 2, tileheight - 6);
            ctx.fillStyle = '#c2854e';
            ctx.fillRect(destX + 1, destY + 4, tilewidth - 2, 2);

            ctx.fillStyle = '#222';
            ctx.fillRect(destX + 3, destY - 2, 10, 8);
            ctx.fillStyle = isActiveDesk ? '#33ff33' : '#445';
            ctx.fillRect(destX + 4, destY - 1, 8, 6);
          } else if (gid === 4) {
            ctx.fillStyle = '#b3b9c2';
            ctx.fillRect(destX + 2, destY + 1, tilewidth - 4, tileheight - 2);
            ctx.fillStyle = '#8f97a3';
            ctx.fillRect(destX + 4, destY + 3, tilewidth - 8, 2);
            ctx.fillRect(destX + 4, destY + 8, tilewidth - 8, 2);
          } else if (gid === 5 || gid === 6) {
            ctx.fillStyle = '#228b22';
            ctx.beginPath();
            ctx.arc(destX + tilewidth / 2, destY + tileheight / 2, 6, 0, Math.PI * 2);
            ctx.fill();
          } else if (gid === 7) {
            const pulse = 0.8 + Math.sin(time / 300) * 0.2;
            ctx.fillStyle = '#2e3e58';
            ctx.fillRect(destX, destY, tilewidth, tileheight);

            ctx.fillStyle = '#101826';
            ctx.fillRect(destX + 1, destY + 1, tilewidth - 2, tileheight - 2);

            ctx.fillStyle = `rgba(65, 255, 189, ${pulse})`;
            ctx.fillRect(destX + 3, destY + 3, tilewidth - 6, tileheight - 6);

            ctx.fillStyle = '#0a111d';
            ctx.fillRect(destX + 6, destY + 5, 4, 1);
            ctx.fillRect(destX + 6, destY + 8, 4, 1);
          }
        });
      });
    };

    const render = (time: number) => {
      drawFrame(time);
      requestRef.current = requestAnimationFrame(render);
    };

    const handleVisibility = () => {
      if (document.hidden && requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      } else if (!document.hidden && !requestRef.current) {
        requestRef.current = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    
    // Start the animation
    requestRef.current = requestAnimationFrame(render);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [mapData, activeAgentPositions]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#212529', borderRadius: '12px' }}>
      <canvas
        ref={canvasRef}
        width={mapData.width * mapData.tilewidth}
        height={mapData.height * mapData.tileheight}
        style={{
          border: '8px solid #000',
          imageRendering: 'pixelated',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          width: '100%',
          maxWidth: `${mapData.width * mapData.tilewidth * 3}px`,
          display: 'block',
          margin: '0 auto',
        }}
      />
    </div>
  );
};

export const mockTiledJson: TiledMap = {
  width: 16,
  height: 12,
  tilewidth: 16,
  tileheight: 16,
  layers: [
    {
      name: 'Floor',
      type: 'tilelayer',
      visible: true,
      opacity: 1,
      width: 16,
      height: 12,
      data: new Array(16 * 12).fill(1),
    },
    {
      name: 'Cubicles',
      type: 'tilelayer',
      visible: true,
      opacity: 1,
      width: 16,
      height: 12,
      data: [
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
        2, 0, 2, 2, 0, 2, 2, 0, 2, 2, 0, 2, 2, 0, 0, 2,
        2, 0, 2, 0, 0, 0, 2, 0, 2, 0, 0, 0, 2, 0, 0, 2,
        2, 0, 2, 0, 0, 0, 2, 0, 2, 0, 0, 0, 2, 0, 0, 2,
        2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
        2, 0, 2, 2, 0, 2, 2, 0, 2, 2, 0, 2, 2, 0, 0, 2,
        2, 0, 2, 0, 0, 0, 2, 0, 2, 0, 0, 0, 2, 0, 0, 2,
        2, 0, 2, 0, 0, 0, 2, 0, 2, 0, 0, 0, 2, 0, 0, 2,
        2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
        2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      ],
    },
    {
      name: 'OfficeFurniture',
      type: 'tilelayer',
      visible: true,
      opacity: 1,
      width: 16,
      height: 12,
      data: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0,
        0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0,
        0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 5, 6,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0,
        0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 5, 6, 0, 0, 5, 6, 0, 0, 5, 6, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
    },
  ],
};

export default TileMapRenderer;
