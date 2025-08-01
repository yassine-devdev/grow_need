import React, { useState, useEffect, useRef } from 'react';
import { DesignState } from './types';
import { ElementRenderer } from './ElementRenderer';
import { SelectionManager } from './SelectionManager';
import { Icons } from '../../../icons';

interface CanvasProps {
  designState: DesignState;
  setDesignState: (newState: DesignState | ((prevState: DesignState) => DesignState), undoable?: boolean) => void;
  canvasContainerRef: React.RefObject<HTMLDivElement>;
}

export const Canvas: React.FC<CanvasProps> = ({ designState, setDesignState, canvasContainerRef }) => {
  const { pages, activePageId, zoom, pan } = designState;
  const activePage = pages.find(p => p.id === activePageId) || pages[0];

  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [marquee, setMarquee] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const marqueeStartPoint = useRef({ x: 0, y: 0 });
  const pageRef = useRef<HTMLDivElement>(null);


  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget && (e.target as HTMLElement).closest('.design-page') === null) return;

    if (canvasContainerRef.current?.classList.contains('panning')) {
        setIsPanning(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    } else if ((e.target as HTMLElement).closest('.design-canvas-render-area')) {
        setDesignState(prev => ({...prev, selectedElementIds: []}), true);
        marqueeStartPoint.current = { x: e.clientX, y: e.clientY };
        setMarquee({ x: e.clientX, y: e.clientY, width: 0, height: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setDesignState(prev => ({ ...prev, pan: { x: prev.pan.x + dx, y: prev.pan.y + dy } }), false);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    } else if (marquee) {
        const x = Math.min(e.clientX, marqueeStartPoint.current.x);
        const y = Math.min(e.clientY, marqueeStartPoint.current.y);
        const width = Math.abs(e.clientX - marqueeStartPoint.current.x);
        const height = Math.abs(e.clientY - marqueeStartPoint.current.y);
        setMarquee({ x, y, width, height });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    if (marquee && pageRef.current) {
        const pageRect = pageRef.current.getBoundingClientRect();
        const marqueeRect = {
            x: (marquee.x - pageRect.left) / zoom,
            y: (marquee.y - pageRect.top) / zoom,
            width: marquee.width / zoom,
            height: marquee.height / zoom
        };

        const selectedIds = activePage.elements.filter(el => {
            const elRect = { x: el.x, y: el.y, width: el.width, height: el.height };
            return (
                elRect.x < marqueeRect.x + marqueeRect.width &&
                elRect.x + elRect.width > marqueeRect.x &&
                elRect.y < marqueeRect.y + marqueeRect.height &&
                elRect.y + elRect.height > marqueeRect.y
            );
        }).map(el => el.id);

        if (selectedIds.length > 0) {
            setDesignState(prev => ({ ...prev, selectedElementIds: selectedIds }), true);
        }
    }
    setMarquee(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const newZoom = e.deltaY > 0 ? zoom / zoomFactor : zoom * zoomFactor;
    setDesignState(prev => ({ ...prev, zoom: Math.max(0.1, Math.min(newZoom, 5)) }), false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        (canvasContainerRef.current as HTMLDivElement)?.classList.add('panning');
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        (canvasContainerRef.current as HTMLDivElement)?.classList.remove('panning');
      }
  };

  useEffect(() => {
    document.body.addEventListener('keydown', handleKeyDown);
    document.body.addEventListener('keyup', handleKeyUp);
    return () => {
        document.body.removeEventListener('keydown', handleKeyDown);
        document.body.removeEventListener('keyup', handleKeyUp);
    }
  }, []);

  return (
    <div className="design-canvas-area">
      <div 
        className="canvas-viewport"
        ref={canvasContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div ref={pageRef} className="design-page" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          <div className="design-canvas-render-area" style={{ backgroundColor: activePage.backgroundColor }}>
            {activePage.elements.filter(el => el.isVisible ?? true).sort((a,b) => a.zIndex - b.zIndex).map(el => (
              <ElementRenderer key={el.id} element={el} designState={designState} setDesignState={setDesignState} />
            ))}
            <SelectionManager designState={designState} setDesignState={setDesignState} />
          </div>
        </div>
      </div>

      {marquee && <div className="marquee-box" style={{ left: marquee.x, top: marquee.y, width: marquee.width, height: marquee.height }} />}
      
      <div className="zoom-controls">
        <button className="zoom-btn" onClick={() => setDesignState(p => ({...p, zoom: p.zoom - 0.1}), false)}><Icons.ZoomOut size={20}/></button>
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        <button className="zoom-btn" onClick={() => setDesignState(p => ({...p, zoom: p.zoom + 0.1}), false)}><Icons.ZoomIn size={20}/></button>
        <button className="zoom-btn" onClick={() => setDesignState(p => ({...p, zoom: 1, pan: {x: 0, y: 0}}), false)}><Icons.Expand size={20}/></button>
      </div>

    </div>
  );
};