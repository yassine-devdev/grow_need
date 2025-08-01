import React, { useRef, useCallback, useMemo } from 'react';
import { Clip, Track } from '../../types';
import { useTimelineInteraction } from '../../hooks/useTimelineInteraction';
import { TimelineControls } from './TimelineControls';
import { Ruler } from './Ruler';
import { Track as TrackComponent } from './Track';
import { Playhead } from './Playhead';
import { Icons } from '../../../../../icons';

interface TimelineProps {
    tracks: Track[];
    clips: Clip[];
    setClips: React.Dispatch<React.SetStateAction<Clip[]>>;
    selectedClipIds: string[];
    setSelectedClipIds: React.Dispatch<React.SetStateAction<string[]>>;
    playheadPosition: number;
    setPlayheadPosition: React.Dispatch<React.SetStateAction<number>>;
    isPlaying: boolean;
    onTogglePlay: () => void;
    zoom: number;
    onZoomChange: (zoom: number) => void;
    onSplit: () => void;
    totalDuration: number;
}

export const Timeline: React.FC<TimelineProps> = (props) => {
    const { tracks, clips, setClips, selectedClipIds, setSelectedClipIds, playheadPosition, setPlayheadPosition, isPlaying, onTogglePlay, zoom, onZoomChange, onSplit, totalDuration } = props;
    
    const timelineContentRef = useRef<HTMLDivElement>(null);
    const PIXELS_PER_SECOND_BASE = 60;
    const pixelsPerSecond = PIXELS_PER_SECOND_BASE * zoom;

    const { onClipPointerDown, onHandlePointerDown } = useTimelineInteraction({
        clips,
        setClips,
        tracks,
        zoom,
        pixelsPerSecond,
        setSelectedClipIds
    });
    
    const onRulerScrub = useCallback((e: React.MouseEvent) => {
        if (timelineContentRef.current) {
            const timelineRect = timelineContentRef.current.getBoundingClientRect();
            const onScrub = (moveEvent: MouseEvent) => {
                 const newX = moveEvent.clientX - timelineRect.left;
                 const newTime = Math.max(0, newX / pixelsPerSecond);
                 setPlayheadPosition(newTime);
            }
            onScrub(e.nativeEvent as MouseEvent);

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onScrub);
                document.removeEventListener('mouseup', onMouseUp);
            };
            document.addEventListener('mousemove', onScrub);
            document.addEventListener('mouseup', onMouseUp);
        }
    }, [pixelsPerSecond, setPlayheadPosition]);

    const onPlayheadScrub = onRulerScrub; // Same logic for now

    const timelineWidth = useMemo(() => (totalDuration + 20) * pixelsPerSecond, [totalDuration, pixelsPerSecond]);

    return (
        <div className="ve-timeline-area">
            <TimelineControls {...props} />
            <div className="ve-timeline-main">
                <div className="ve-timeline-header">
                    <div className="ve-timeline-header-left">
                        <button className="ve-top-bar-btn ve-add-track-btn" title="Add Track"><Icons.AddTrack size={20} /></button>
                    </div>
                    <div className="ve-timeline-header-right" ref={timelineContentRef}>
                        <Ruler 
                            duration={totalDuration + 20} 
                            pixelsPerSecond={pixelsPerSecond} 
                            onScrub={onRulerScrub} 
                            width={timelineWidth}
                        />
                    </div>
                </div>
                <div className="ve-tracks-container" onClick={() => setSelectedClipIds([])}>
                    <div className="ve-timeline-content" style={{ width: timelineWidth }}>
                        {tracks.map(track => (
                            <TrackComponent
                                key={track.id}
                                track={track}
                                clips={clips.filter(c => c.trackId === track.id)}
                                pixelsPerSecond={pixelsPerSecond}
                                selectedClipIds={selectedClipIds}
                                onClipPointerDown={onClipPointerDown}
                                onHandlePointerDown={onHandlePointerDown}
                            />
                        ))}
                         <Playhead 
                            position={playheadPosition * pixelsPerSecond}
                            onScrub={onPlayheadScrub}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};