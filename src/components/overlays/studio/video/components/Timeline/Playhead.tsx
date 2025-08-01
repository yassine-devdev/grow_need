import React from 'react';

interface PlayheadProps {
    position: number;
    onScrub: (e: React.MouseEvent) => void;
}

export const Playhead: React.FC<PlayheadProps> = ({ position, onScrub }) => (
    <div className="ve-playhead" style={{ left: position }}>
        <div className="ve-playhead-handle" onMouseDown={onScrub}></div>
    </div>
);