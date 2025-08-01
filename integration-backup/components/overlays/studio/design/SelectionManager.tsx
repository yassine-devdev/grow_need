import React, { useState, useRef } from 'react';
import { DesignState, CanvasElement } from './types';
import { getBoundingBox } from './utils';
import { getCenter, rotatePoint } from './geometry';

interface SelectionManagerProps {
  designState: DesignState;
  setDesignState: (newState: DesignState | ((prevState: DesignState) => DesignState), undoable?: boolean) => void;
}

export const SelectionManager: React.FC<SelectionManagerProps> = ({ designState, setDesignState }) => {
    const { pages, activePageId, selectedElementIds, zoom } = designState;
    const activePage = pages.find(p => p.id === activePageId)!;
    
    const [interactionState, setInteractionState] = useState({
        action: 'none' as 'none' | 'drag' | 'resize' | 'rotate',
        startPoint: { x: 0, y: 0 },
        initialElements: [] as CanvasElement[],
        initialBounds: { minX:0, minY:0, width:0, height:0},
        resizeDirection: ''
    });

    const selectedElements = activePage.elements.filter(el => selectedElementIds.includes(el.id) && !(el.isLocked));
    
    if (selectedElements.length === 0) {
        return null;
    }
    
    const boundingBox = getBoundingBox(selectedElements);

    const handlePointerDown = (e: React.PointerEvent, action: 'drag' | 'resize' | 'rotate', resizeDirection: string = '') => {
        e.stopPropagation();
        e.preventDefault();
        
        const startPoint = { x: e.clientX / zoom, y: e.clientY / zoom };
        
        setInteractionState({
            action,
            startPoint,
            initialElements: JSON.parse(JSON.stringify(selectedElements)), // Deep copy
            initialBounds: getBoundingBox(selectedElements),
            resizeDirection
        });

        const handlePointerMove = (moveEvent: PointerEvent) => {
            const currentPoint = { x: moveEvent.clientX / zoom, y: moveEvent.clientY / zoom };
            const dx = currentPoint.x - startPoint.x;
            const dy = currentPoint.y - startPoint.y;

            setDesignState(prev => {
                 const newPages = prev.pages.map(page => {
                    if (page.id !== prev.activePageId) return page;
                    
                    const newElements = page.elements.map(el => {
                        const initialEl = interactionState.initialElements.find(iel => iel.id === el.id);
                        if (!initialEl) return el;
                        
                        if (action === 'drag') {
                            return { ...el, x: initialEl.x + dx, y: initialEl.y + dy };
                        } else if (action === 'resize') {
                            const { initialBounds } = interactionState;
                            let newWidth = initialBounds.width;
                            let newHeight = initialBounds.height;
                            let newX = initialBounds.minX;
                            let newY = initialBounds.minY;

                            if (resizeDirection.includes('r')) newWidth = Math.max(10, initialBounds.width + dx);
                            if (resizeDirection.includes('l')) { newWidth = Math.max(10, initialBounds.width - dx); newX = initialBounds.minX + dx; }
                            if (resizeDirection.includes('b')) newHeight = Math.max(10, initialBounds.height + dy);
                            if (resizeDirection.includes('t')) { newHeight = Math.max(10, initialBounds.height - dy); newY = initialBounds.minY + dy; }

                            const scaleX = newWidth / (initialBounds.width || 1);
                            const scaleY = newHeight / (initialBounds.height || 1);
                            
                            const relativeX = initialEl.x - initialBounds.minX;
                            const relativeY = initialEl.y - initialBounds.minY;

                            return { ...el,
                                x: newX + relativeX * scaleX,
                                y: newY + relativeY * scaleY,
                                width: initialEl.width * scaleX,
                                height: initialEl.height * scaleY
                            };
                        } else if (action === 'rotate') {
                            const center = getCenter(interactionState.initialBounds);
                            const startAngle = Math.atan2(startPoint.y - center.y, startPoint.x - center.x);
                            const currentAngle = Math.atan2(currentPoint.y - center.y, currentPoint.x - center.x);
                            const angleDelta = (currentAngle - startAngle) * (180 / Math.PI);
                            
                            const newRotation = (initialEl.rotation + angleDelta);
                            const elCenter = getCenter({minX: initialEl.x, minY: initialEl.y, width: initialEl.width, height: initialEl.height});
                            const rotatedCenter = rotatePoint(elCenter, center, angleDelta);
                            
                            return {...el,
                                rotation: newRotation,
                                x: rotatedCenter.x - initialEl.width / 2,
                                y: rotatedCenter.y - initialEl.height / 2
                            };
                        }
                        return el;
                    });
                    
                    return { ...page, elements: newElements };
                });
                return {...prev, pages: newPages};
            }, false); // Set undoable to false for performance during drag
        };

        const handlePointerUp = () => {
            setDesignState(prev => ({...prev}), true);
            setInteractionState({ action: 'none', startPoint: { x: 0, y: 0 }, initialElements: [], initialBounds: { minX:0, minY:0, width:0, height:0}, resizeDirection: '' });
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);
        };
        
        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
    };

    const selectionBoxStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${boundingBox.minX}px`,
        top: `${boundingBox.minY}px`,
        width: `${boundingBox.width}px`,
        height: `${boundingBox.height}px`,
        zIndex: 10000,
    };

    const resizeHandles = ['tl', 't', 'tr', 'l', 'r', 'bl', 'b', 'br'];

    return (
        <div className="selection-box" style={selectionBoxStyle} onPointerDown={(e) => handlePointerDown(e, 'drag')}>
             {resizeHandles.map(dir => (
                <div key={dir} className={`resize-handle ${dir}`} onPointerDown={(e) => handlePointerDown(e, 'resize', dir)} />
             ))}
             <div className="rotate-handle" onPointerDown={(e) => handlePointerDown(e, 'rotate')} />
        </div>
    );
};