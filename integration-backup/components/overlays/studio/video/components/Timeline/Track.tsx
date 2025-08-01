import React from 'react';
import { Icons } from '../../../../../icons';
import { Clip, Track as TrackType } from '../../types';
import { Clip as ClipComponent } from './Clip';

interface TrackProps {
    track: TrackType;
    clips: Clip[];
    pixelsPerSecond: number;
    selectedClipIds: string[];
    onClipPointerDown: (e: React.PointerEvent, clip: Clip) => void;
    onHandlePointerDown: (e: React.PointerEvent, clip: Clip, handle: 'left' | 'right') => void;
}

export const Track: React.FC<TrackProps> = ({ track, clips, pixelsPerSecond, selectedClipIds, onClipPointerDown, onHandlePointerDown }) => {
    return (
        <div className="ve-timeline-track">
            <div className="ve-track-header">
                {track.type === 'video' && <Icons.Video size={20} />}
                {track.type === 'element' && <Icons.Shapes size={20} />}
            </div>
            <div className="ve-track-clips">
                {clips.map(clip => (
                    <ClipComponent
                        key={clip.id}
                        clip={clip}
                        pixelsPerSecond={pixelsPerSecond}
                        isSelected={selectedClipIds.includes(clip.id)}
                        onClipPointerDown={onClipPointerDown}
                        onHandlePointerDown={onHandlePointerDown}
                    />
                ))}
            </div>
        </div>
    );
};