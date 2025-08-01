import React, { useState } from 'react';
import { Icons } from '../../../../icons';
import { Clip, Transform } from '../types';

interface RightSidebarProps {
    selectedClip: Clip | null;
    updateSelectedClip: (props: Partial<Clip>) => void;
    totalDuration: number;
}

type RightSidebarTab = 'basic' | 'background' | 'animation' | 'speed';

export const RightSidebar: React.FC<RightSidebarProps> = ({ selectedClip, updateSelectedClip, totalDuration }) => {
    const [activeTab, setActiveTab] = useState<RightSidebarTab>('basic');
    
    const handleTransformChange = (key: keyof Transform, value: number) => {
        if (!selectedClip) return;
        const newTransform = { ...selectedClip.transform, [key]: value };
        updateSelectedClip({ transform: newTransform });
    };

    const handleOpacityChange = (value: number) => {
         if (!selectedClip) return;
         updateSelectedClip({ opacity: value });
    };

    if (!selectedClip) {
        return (
            <div className="ve-right-sidebar">
                <div className="ve-right-sidebar-header"><h3>Project</h3></div>
                <div className="ve-right-panel-content">
                    <div className="ve-properties-content">
                        <div className="ve-property-group">
                            <h4>Details</h4>
                            <div className="ve-prop-row">
                                <label>Duration</label>
                                <span>{totalDuration.toFixed(2)}s</span>
                            </div>
                            <div className="ve-prop-row">
                                <label>Aspect Ratio</label>
                                <span>16:9</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="ve-right-sidebar">
            <div className="ve-right-sidebar-header"><h3>Properties</h3></div>
            <div className="ve-right-panel-content">
                <div className="ve-properties-content">
                     <div className="ve-property-group">
                        <h4>Transform</h4>
                        <div className="ve-prop-row">
                            <label><Icons.Position size={16} /> Position</label>
                            <div className="flex gap-2">
                                <input type="number" value={selectedClip.transform.x} onChange={e => handleTransformChange('x', +e.target.value)} className="ve-prop-input" />
                                <input type="number" value={selectedClip.transform.y} onChange={e => handleTransformChange('y', +e.target.value)} className="ve-prop-input" />
                            </div>
                        </div>
                         <div className="ve-prop-row">
                            <label><Icons.ScaleIcon size={16} /> Scale</label>
                             <input type="range" min="0.1" max="4" step="0.01" value={selectedClip.transform.scale} onChange={e => handleTransformChange('scale', +e.target.value)} className="ve-prop-slider" />
                             <span>{selectedClip.transform.scale.toFixed(2)}x</span>
                        </div>
                         <div className="ve-prop-row">
                            <label><Icons.Rotation size={16} /> Rotation</label>
                             <input type="range" min="0" max="360" step="1" value={selectedClip.transform.rotation} onChange={e => handleTransformChange('rotation', +e.target.value)} className="ve-prop-slider" />
                             <span>{selectedClip.transform.rotation}°</span>
                        </div>
                    </div>
                     <div className="ve-property-group">
                        <h4>Appearance</h4>
                         <div className="ve-prop-row">
                            <label><Icons.Eye size={16} /> Opacity</label>
                             <input type="range" min="0" max="100" step="1" value={selectedClip.opacity} onChange={e => handleOpacityChange(+e.target.value)} className="ve-prop-slider" />
                             <span>{selectedClip.opacity}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};