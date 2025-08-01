import React, { useRef, DragEvent } from 'react';
import { Icons } from '../../../../icons';
import { CanvasElement, DesignState } from '../types';

interface LayersPanelProps {
    designState: DesignState;
    setDesignState: (fn: (prevState: DesignState) => DesignState, undoable?: boolean) => void;
    updateElement: (id: string, props: Partial<CanvasElement>) => void;
    reorderElement: (from: number, to: number) => void;
    duplicateElement: (id: string) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({ designState, setDesignState, updateElement, reorderElement, duplicateElement }) => {
    const activePage = designState.pages.find(p => p.id === designState.activePageId)!;
    const sortedElements = [...activePage.elements].sort((a,b) => b.zIndex - a.zIndex);
    const dragItem = useRef<number | null>(null);

    const handleDragStart = (e: DragEvent, index: number) => { dragItem.current = index; };
    const handleDragOver = (e: DragEvent) => e.preventDefault();
    const handleDrop = (e: DragEvent, index: number) => {
        if (dragItem.current === null || dragItem.current === index) return;
        reorderElement(dragItem.current, index);
        dragItem.current = null;
    };

    const getIconForElement = (el: CanvasElement) => {
        if (el.type === 'text') return <Icons.Type size={16} />;
        if (el.type === 'image') return <Icons.Image size={16} />;
        if (el.type === 'shape') {
            if (el.shapeType === 'rect') return <Icons.Rectangle size={16} />;
            if (el.shapeType === 'circle') return <Icons.Circle size={16} />;
            if (el.shapeType === 'triangle') return <Icons.Triangle size={16} />;
            if (el.shapeType === 'star') return <Icons.Star size={16} />;
        }
        return <Icons.Shapes size={16} />;
    };

    return (
        <div className="layers-panel design-panel">
            <div className="layer-list">
                {sortedElements.map((el, index) => (
                    <div 
                        key={el.id} 
                        className={`layer-item ${designState.selectedElementIds.includes(el.id) ? 'selected' : ''}`}
                        onClick={() => setDesignState((p: DesignState) => ({...p, selectedElementIds: [el.id]}), true)}
                        draggable
                        onDragStart={(e) => handleDragStart(e as any, index)}
                        onDragOver={(e) => handleDragOver(e as any)}
                        onDrop={(e) => handleDrop(e as any, index)}
                    >
                        <div className="layer-icon">{getIconForElement(el)}</div>
                        <span className="layer-name">{el.type === 'text' ? el.text?.substring(0, 20) : el.shapeType || 'Image'}</span>
                        <div className="layer-actions">
                             <button onClick={(e) => { e.stopPropagation(); duplicateElement(el.id); }}><Icons.Copy size={14} /></button>
                             <button onClick={(e) => { e.stopPropagation(); updateElement(el.id, { isLocked: !el.isLocked }); }}>{el.isLocked ? <Icons.Lock size={14} /> : <Icons.Unlock size={14} />}</button>
                             <button onClick={(e) => { e.stopPropagation(); updateElement(el.id, { isVisible: !el.isVisible }); }}>{el.isVisible ? <Icons.Eye size={14} /> : <Icons.EyeOff size={14} />}</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
