import React from 'react';
import { Icons } from '../../../../../icons';
import { formatTime } from '../../utils';

interface TimelineControlsProps {
    onSplit: () => void;
    selectedClipIds: string[];
    onTogglePlay: () => void;
    isPlaying: boolean;
    playheadPosition: number;
    totalDuration: number;
    onZoomChange: (zoom: number) => void;
    zoom: number;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
    onSplit,
    selectedClipIds,
    onTogglePlay,
    isPlaying,
    playheadPosition,
    totalDuration,
    onZoomChange,
    zoom
}) => (
    <div className="ve-timeline-controls">
        <div className="ve-timeline-controls-left">
            <button className="ve-top-bar-btn" onClick={onSplit} disabled={selectedClipIds.length !== 1} title="Split Clip">
                <Icons.Split size={20}/>
            </button>
        </div>
        <div className="ve-timeline-controls-center">
            <button className="ve-top-bar-btn"><Icons.Rewind size={20}/></button>
            <button className="play-btn" onClick={onTogglePlay}>
                {isPlaying ? <Icons.Pause size={20} /> : <Icons.Play size={20}/>}
            </button>
            <button className="ve-top-bar-btn"><Icons.FastForward size={20}/></button>
            <span className="ve-timeline-timecode">{formatTime(playheadPosition)} | {formatTime(totalDuration)}</span>
        </div>
         <div className="ve-timeline-controls-right">
            <button className="ve-top-bar-btn" onClick={() => onZoomChange(Math.max(0.2, zoom - 0.2))}><Icons.ZoomOut size={20}/></button>
             <span>{Math.round(zoom * 100)}%</span>
            <button className="ve-top-bar-btn" onClick={() => onZoomChange(Math.min(5, zoom + 0.2))}><Icons.ZoomIn size={20}/></button>
        </div>
    </div>
);