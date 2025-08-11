import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { DesignState } from './types';

export const useFabricCanvas = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  designState: DesignState,
  setDesignState: (update: Partial<DesignState>) => void
) => {
  const fabricCanvas = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasRef.current?.parentElement?.clientWidth,
      height: canvasRef.current?.parentElement?.clientHeight,
      backgroundColor: designState.pages.find(p => p.id === designState.activePageId)?.backgroundColor || '#ffffff',
    });
    fabricCanvas.current = canvas;

    // TODO: Add event listeners for selection, modification, etc.

    return () => {
      canvas.dispose();
      fabricCanvas.current = null;
    };
  }, [canvasRef]);

  // TODO: Add effects to update canvas when designState changes (zoom, pan, elements)

  return fabricCanvas;
};
