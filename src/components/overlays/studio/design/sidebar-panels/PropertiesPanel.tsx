import React from 'react';
import { CanvasElement, DesignState } from '../types';

interface PropertiesPanelProps {
    designState: DesignState;
    updateElement: (id: string, props: Partial<CanvasElement>) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ designState, updateElement }) => {
    const { pages, activePageId, selectedElementIds } = designState;
    const activePage = pages.find(p => p.id === activePageId);
    const selectedElement = activePage?.elements.find(el => selectedElementIds.includes(el.id));

    if (!selectedElement) {
        return <div className="properties-panel design-panel">Select an element to see its properties.</div>;
    }

    const handleFilterToggle = (filterName: string) => {
        const currentFilters = selectedElement.filters || [];
        const newFilters = currentFilters.includes(filterName)
            ? currentFilters.filter(f => f !== filterName)
            : [...currentFilters, filterName];
        updateElement(selectedElement.id, { filters: newFilters });
    };

    return (
        <div className="properties-panel design-panel">
            <h4>Element Properties</h4>
            <div>
                <label>X</label>
                <input
                    type="number"
                    value={selectedElement.x}
                    onChange={(e) => updateElement(selectedElement.id, { x: parseInt(e.target.value) })}
                />
            </div>
            <div>
                <label>Y</label>
                <input
                    type="number"
                    value={selectedElement.y}
                    onChange={(e) => updateElement(selectedElement.id, { y: parseInt(e.target.value) })}
                />
            </div>
            <div>
                <label>Width</label>
                <input
                    type="number"
                    value={selectedElement.width}
                    onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })}
                />
            </div>
            <div>
                <label>Height</label>
                <input
                    type="number"
                    value={selectedElement.height}
                    onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) })}
                />
            </div>

            {selectedElement.type === 'image' && (
                <div className="image-filters">
                    <h4>Filters</h4>
                    <button
                        className={`filter-btn ${selectedElement.filters?.includes('grayscale') ? 'active' : ''}`}
                        onClick={() => handleFilterToggle('grayscale')}
                    >
                        Grayscale
                    </button>
                    <button
                        className={`filter-btn ${selectedElement.filters?.includes('sepia') ? 'active' : ''}`}
                        onClick={() => handleFilterToggle('sepia')}
                    >
                        Sepia
                    </button>
                </div>
            )}
        </div>
    );
};
