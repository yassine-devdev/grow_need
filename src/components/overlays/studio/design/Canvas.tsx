import React, { useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import { DesignState, CanvasElement } from './types';
import { Icons } from '../../../icons';

interface CanvasProps {
  designState: DesignState;
  setDesignState: (newState: DesignState | ((prevState: DesignState) => DesignState), undoable?: boolean) => void;
  isDrawingModeActive: boolean;
  addElement: (element: Omit<CanvasElement, 'id' | 'zIndex'>) => void;
}

const mapElementToFabricObject = async (el: CanvasElement): Promise<fabric.Object> => {
  let fabricObject: fabric.Object;
  switch (el.type) {
    case 'text':
      fabricObject = new fabric.IText(el.text || 'Text', {
        fontFamily: el.fontFamily || 'Roboto',
        fontSize: el.fontSize || 16,
        fill: el.color || '#000000',
      });
      break;
    case 'shape':
      switch (el.shapeType) {
        case 'circle':
          fabricObject = new fabric.Circle({
            radius: el.width / 2,
            fill: el.backgroundColor,
            stroke: el.strokeColor,
            strokeWidth: el.strokeWidth,
          });
          break;
        case 'rect':
        default:
          fabricObject = new fabric.Rect({
            width: el.width,
            height: el.height,
            fill: el.backgroundColor,
            stroke: el.strokeColor,
            strokeWidth: el.strokeWidth,
            rx: el.borderRadius,
            ry: el.borderRadius,
          });
          break;
      }
      break;
    case 'image':
        if (el.src) {
            fabricObject = await new Promise((resolve) => {
                fabric.Image.fromURL(el.src, (img) => {
                    if (el.filters?.includes('grayscale')) {
                        img.filters.push(new fabric.Image.filters.Grayscale());
                    }
                    if (el.filters?.includes('sepia')) {
                        img.filters.push(new fabric.Image.filters.Sepia());
                    }
                    img.applyFilters();
                    resolve(img);
                });
            });
        } else {
            fabricObject = new fabric.Rect({ width: el.width, height: el.height, fill: 'grey' });
        }
        break;
    default:
      fabricObject = new fabric.Rect({ width: el.width, height: el.height, fill: 'red' });
  }

  fabricObject.set({
    left: el.x,
    top: el.y,
    angle: el.rotation,
    opacity: el.opacity,
    visible: el.isVisible,
    selectable: !el.isLocked,
    data: { id: el.id }, // Store our own ID
  });

  return fabricObject;
};


export const Canvas = React.forwardRef<fabric.Canvas, CanvasProps>(({ designState, setDesignState, isDrawingModeActive, addElement }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pages, activePageId, zoom } = designState;
  const activePage = pages.find(p => p.id === activePageId) || pages[0];

  useImperativeHandle(ref, () => fabricCanvasRef.current, []);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasRef.current.parentElement?.clientWidth,
      height: canvasRef.current.parentElement?.clientHeight,
      backgroundColor: activePage.backgroundColor,
    });
    fabricCanvasRef.current = canvas;

    const handleSelection = (e: fabric.IEvent) => {
        const selectedIds = e.selected?.map(obj => obj.data.id) || [];
        setDesignState(prev => ({ ...prev, selectedElementIds: selectedIds }), true);
    };

    const handleObjectModified = (e: fabric.IEvent) => {
        if (e.target) {
            const target = e.target;
            const id = target.data.id;
            const newProps = {
                x: target.left,
                y: target.top,
                width: target.width * target.scaleX,
                height: target.height * target.scaleY,
                rotation: target.angle,
            };

            setDesignState(prev => ({
                ...prev,
                pages: prev.pages.map(p => p.id === prev.activePageId ? { ...p, elements: p.elements.map(el => el.id === id ? { ...el, ...newProps } : el) } : p)
            }), true);
        }
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleSelection);
    canvas.on('object:modified', handleObjectModified);

    const handlePathCreated = (e: fabric.IEvent) => {
        const path = e.path;
        if (path) {
            const newElement: Omit<CanvasElement, 'id' | 'zIndex'> = {
                type: 'shape',
                shapeType: 'path',
                x: path.left,
                y: path.top,
                width: path.width,
                height: path.height,
                rotation: path.angle,
                // Fabric paths don't have a simple background color, they have stroke
                strokeColor: path.stroke,
                strokeWidth: path.strokeWidth,
                // We'll need to add path data to our element type if we want to re-create it
            };
            addElement(newElement);
        }
    };

    canvas.on('path:created', handlePathCreated);


    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared', handleSelection);
      canvas.off('object:modified', handleObjectModified);
      canvas.off('path:created', handlePathCreated);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.setZoom(zoom);
    canvas.renderAll();
  }, [zoom]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handlePan = (e: MouseEvent) => {
        if (e.buttons !== 1 || !canvas.isDrawingMode) return;
        const delta = new fabric.Point(e.movementX, e.movementY);
        canvas.relativePan(delta);
    };

    const startPan = (e: KeyboardEvent) => {
        if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
            canvas.isDrawingMode = true;
            canvas.defaultCursor = 'grab';
            canvas.selection = false;
            canvas.on('mouse:move', handlePan);
        }
    };

    const endPan = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            canvas.isDrawingMode = false;
            canvas.defaultCursor = 'default';
            canvas.selection = true;
            canvas.off('mouse:move', handlePan);
        }
    };

    document.addEventListener('keydown', startPan);
    document.addEventListener('keyup', endPan);

    return () => {
        document.removeEventListener('keydown', startPan);
        document.removeEventListener('keyup', endPan);
    }
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.backgroundColor = activePage.backgroundColor;
    canvas.clear();

    const renderElements = async () => {
        const fabricObjects = await Promise.all(activePage.elements.map(mapElementToFabricObject));
        fabricObjects.forEach(obj => canvas.add(obj));
        canvas.renderAll();
    };

    renderElements();

  }, [activePage]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = isDrawingModeActive;
    if (isDrawingModeActive) {
      canvas.freeDrawingBrush.color = 'black';
      canvas.freeDrawingBrush.width = 2;
    }
  }, [isDrawingModeActive]);

  return (
    <div className="design-canvas-area">
      <div className="canvas-viewport">
        <canvas ref={canvasRef} />
      </div>
      
      <div className="zoom-controls">
        <button className="zoom-btn" onClick={() => setDesignState(p => ({...p, zoom: p.zoom - 0.1}), false)}><Icons.ZoomOut size={20}/></button>
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        <button className="zoom-btn" onClick={() => setDesignState(p => ({...p, zoom: p.zoom + 0.1}), false)}><Icons.ZoomIn size={20}/></button>
        <button className="zoom-btn" onClick={() => setDesignState(p => ({...p, zoom: 1, pan: {x: 0, y: 0}}), false)}><Icons.Expand size={20}/></button>
      </div>
    </div>
  );
};