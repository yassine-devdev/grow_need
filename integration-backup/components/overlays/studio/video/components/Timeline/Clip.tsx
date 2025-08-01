import React from 'react';
import { Icons } from '../../../../../icons';
import { Clip as ClipType } from '../../types';

interface ClipProps {
    clip: ClipType;
    pixelsPerSecond: number;
    isSelected: boolean;
    onClipPointerDown: (e: React.PointerEvent, clip: ClipType) => void;
    onHandlePointerDown: (e: React.PointerEvent, clip: ClipType, handle: 'left' | 'right') => void;
}

export const Clip: React.FC<ClipProps> = ({ clip, pixelsPerSecond, isSelected, onClipPointerDown, onHandlePointerDown }) => {
    return (
        <div
            className={`ve-timeline-clip ${isSelected ? 'selected' : ''} type-${clip.type}`}
            style={{ 
                left: clip.start * pixelsPerSecond, 
                width: clip.duration * pixelsPerSecond 
            }}
            onPointerDown={(e) => onClipPointerDown(e, clip)}
        >
            <div className="ve-clip-handle left" onPointerDown={(e) => onHandlePointerDown(e, clip, 'left')}>
                <Icons.ResizeHandle size={14}/>
            </div>

            {clip.thumbnail && <img className="ve-clip-thumbnail" src={clip.thumbnail} alt={clip.title} />}
            <span className="ve-clip-title">{clip.title}</span>

            <div className="ve-clip-handle right" onPointerDown={(e) => onHandlePointerDown(e, clip, 'right')}>
                <Icons.ResizeHandle size={14}/>
            </div>
        </div>
    );
};