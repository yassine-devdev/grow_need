import React from 'react';
import { Icons } from '../../../../icons';
import { CanvasElement } from '../types';

interface ElementsPanelProps {
    addElement: (options: Partial<CanvasElement>) => void;
}

export const ElementsPanel: React.FC<ElementsPanelProps> = ({ addElement }) => (
    <div className="design-panel">
        <h3 className="panel-subtitle">Shapes</h3>
        <div className="elements-grid">
            <button className="element-item" onClick={() => addElement({ type: 'shape', shapeType: 'rect' })}><Icons.Rectangle size={32} /></button>
            <button className="element-item" onClick={() => addElement({ type: 'shape', shapeType: 'circle' })}><Icons.Circle size={32} /></button>
            <button className="element-item" onClick={() => addElement({ type: 'shape', shapeType: 'triangle' })}><Icons.Triangle size={32} /></button>
            <button className="element-item" onClick={() => addElement({ type: 'shape', shapeType: 'star' })}><Icons.Star size={32} /></button>
        </div>
    </div>
);
