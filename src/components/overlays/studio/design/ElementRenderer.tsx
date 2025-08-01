import React, { useState, useRef, useEffect } from 'react';
import { CanvasElement, DesignState } from './types';

interface ElementRendererProps {
  element: CanvasElement;
  designState: DesignState;
  setDesignState: (newState: DesignState | ((prevState: DesignState) => DesignState), undoable?: boolean) => void;
}

const renderShape = (el: CanvasElement) => {
    const shapeStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        backgroundColor: el.backgroundColor,
        border: `${el.strokeWidth || 0}px solid ${el.strokeColor || 'transparent'}`,
        borderRadius: `${el.borderRadius || 0}px`,
        boxSizing: 'border-box',
    };
    switch (el.shapeType) {
        case 'circle': return <div style={{ ...shapeStyle, borderRadius: '50%' }} />;
        case 'triangle': return <div style={{ width: 0, height: 0, borderLeft: `${el.width/2}px solid transparent`, borderRight: `${el.width/2}px solid transparent`, borderBottom: `${el.height}px solid ${el.backgroundColor}`, background: 'transparent' }} />;
        case 'star': return <div style={{ ...shapeStyle, clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />;
        case 'rect':
        default:
            return <div style={shapeStyle} />;
    }
};

export const ElementRenderer: React.FC<ElementRendererProps> = ({ element, designState, setDesignState }) => {
  const { selectedElementIds } = designState;
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if(element.isLocked) return;

    if (e.shiftKey) {
        setDesignState(prev => ({
            ...prev,
            selectedElementIds: prev.selectedElementIds.includes(element.id)
                ? prev.selectedElementIds.filter(id => id !== element.id)
                : [...prev.selectedElementIds, element.id]
        }), true);
    } else {
        if (!selectedElementIds.includes(element.id)) {
            setDesignState(prev => ({ ...prev, selectedElementIds: [element.id] }), true);
        }
    }
  };

  const handleDoubleClick = () => {
      if (element.type === 'text' && !element.isLocked) {
        setIsEditing(true);
      }
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
    }
  }, [isEditing]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDesignState(prev => ({
        ...prev,
        pages: prev.pages.map(page => 
            page.id === prev.activePageId 
            ? { ...page, elements: page.elements.map(el => el.id === element.id ? {...el, text: e.target.value} : el) } 
            : page
        )
    }), false); // Not undoable until blur

    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  const handleTextBlur = () => {
      setIsEditing(false);
       if (textareaRef.current) {
          const newHeight = textareaRef.current.scrollHeight;
          setDesignState(prev => ({
            ...prev,
            pages: prev.pages.map(page => 
                page.id === prev.activePageId 
                ? { ...page, elements: page.elements.map(el => el.id === element.id ? {...el, height: newHeight } : el) } 
                : page
            )
        }), true); // Make the final text & height change undoable
       }
  }

  const style: React.CSSProperties = {
    top: `${element.y}px`,
    left: `${element.x}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    transform: `rotate(${element.rotation}deg)`,
    color: element.color,
    fontSize: `${element.fontSize}px`,
    fontFamily: element.fontFamily || 'Roboto',
    fontWeight: element.fontWeight || 'normal',
    textAlign: element.textAlign || 'left',
    zIndex: element.zIndex,
    lineHeight: 1.4,
    opacity: element.opacity,
  };

  if(!element.isVisible) return null;

  return (
    <div
      className={`canvas-element ${element.type === 'text' ? 'text-element' : ''} ${element.isLocked ? 'locked' : ''}`}
      style={style}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing && element.type === 'text' ? (
          <textarea
            ref={textareaRef}
            value={element.text}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            className="canvas-text-editor"
            style={{
                width: style.width,
                height: 'auto',
                color: style.color,
                fontSize: style.fontSize,
                fontFamily: style.fontFamily,
                fontWeight: style.fontWeight,
                textAlign: style.textAlign as any,
                lineHeight: style.lineHeight,
            }}
          />
      ) : (
        <>
            {element.type === 'shape' && renderShape(element)}
            {element.type === 'text' && element.text}
            {element.type === 'image' && <img src={element.src} alt="upload" className="canvas-image" />}
        </>
      )}
    </div>
  );
};