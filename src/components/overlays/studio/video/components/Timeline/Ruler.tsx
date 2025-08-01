import React, { useMemo } from 'react';
import { formatTime } from '../../utils';

interface RulerProps {
    duration: number;
    pixelsPerSecond: number;
    onScrub: (e: React.MouseEvent) => void;
    width: number;
}

export const Ruler: React.FC<RulerProps> = ({ duration, pixelsPerSecond, onScrub, width }) => {
    const markers = useMemo(() => {
        const markerList = [];
        const interval = pixelsPerSecond > 80 ? 1 : (pixelsPerSecond > 40 ? 5 : 10);
        for (let i = 0; i < duration; i += interval) {
            markerList.push(
                <div key={i} className="ve-ruler-marker" style={{ width: interval * pixelsPerSecond }}>
                    {formatTime(i).slice(0, 5)}
                </div>
            );
        }
        return markerList;
    }, [duration, pixelsPerSecond]);
    
    return (
        <div className="ve-ruler-container" onMouseDown={onScrub}>
            <div className="ve-timeline-ruler" style={{ width }}>
                {markers}
            </div>
        </div>
    );
};