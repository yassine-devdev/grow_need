import React from 'react';
import { CanvasElement } from '../types';

interface TextPanelProps {
    addElement: (options: Partial<CanvasElement>) => void;
}

export const TextPanel: React.FC<TextPanelProps> = ({ addElement }) => (
    <div className="design-panel">
        <div className="text-options">
            <button className="text-option-btn heading" onClick={() => addElement({ type: 'text', text: 'Add a heading', fontSize: 48, fontWeight: 'bold', width: 350, height: 60 })}>Add a heading</button>
            <button className="text-option-btn subheading" onClick={() => addElement({ type: 'text', text: 'Add a subheading', fontSize: 28, fontWeight: '500', width: 300, height: 40 })}>Add a subheading</button>
            <button className="text-option-btn body" onClick={() => addElement({ type: 'text', text: 'Add a little bit of body text', fontSize: 16, width: 250, height: 50 })}>Add a little bit of body text</button>
        </div>
    </div>
);
