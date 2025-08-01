import { useRef, useCallback } from 'react';
import { Clip, Track, InteractionState } from '../types';
import { clamp } from '../utils';

interface UseTimelineInteractionProps {
    clips: Clip[];
    setClips: React.Dispatch<React.SetStateAction<Clip[]>>;
    tracks: Track[];
    zoom: number;
    pixelsPerSecond: number;
    setSelectedClipIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const useTimelineInteraction = ({
    clips,
    setClips,
    tracks,
    zoom,
    pixelsPerSecond,
    setSelectedClipIds
}: UseTimelineInteractionProps) => {
    const interaction = useRef<InteractionState>({ type: 'none', startX: 0 });

    const handlePointerMove = useCallback((e: MouseEvent) => {
        if (interaction.current.type === 'none') return;

        const dx = (e.clientX - interaction.current.startX) / pixelsPerSecond;
        
        setClips(currentClips => {
            if (interaction.current.type === 'drag' && interaction.current.clipId) {
                const initialClip = interaction.current.initialClips!.find(c => c.id === interaction.current.clipId)!;
                const otherClipsOnTrack = interaction.current.initialClips!.filter(c => c.id !== initialClip.id && c.trackId === initialClip.trackId);
                
                const prevClip = otherClipsOnTrack.filter(c => c.start < initialClip.start).sort((a, b) => b.start - a.start)[0];
                const nextClip = otherClipsOnTrack.filter(c => c.start > initialClip.start).sort((a, b) => a.start - b.start)[0];
                
                const minStart = prevClip ? prevClip.start + prevClip.duration : 0;
                const maxStart = nextClip ? nextClip.start - initialClip.duration : Infinity;
                
                const newStart = clamp(initialClip.start + dx, minStart, maxStart);

                return currentClips.map(c => c.id === initialClip.id ? { ...c, start: newStart } : c);
            }
             if (interaction.current.type === 'resize' && interaction.current.clipId && interaction.current.handle) {
                const initialClip = interaction.current.initialClips!.find(c => c.id === interaction.current.clipId)!;
                const otherClipsOnTrack = interaction.current.initialClips!.filter(c => c.id !== initialClip.id && c.trackId === initialClip.trackId);
                
                let newStart = initialClip.start;
                let newDuration = initialClip.duration;

                if (interaction.current.handle === 'right') {
                    const nextClip = otherClipsOnTrack.filter(c => c.start > initialClip.start).sort((a, b) => a.start - b.start)[0];
                    const maxDuration = nextClip ? nextClip.start - initialClip.start : Infinity;
                    newDuration = clamp(initialClip.duration + dx, 0.1, maxDuration);
                } else { // left handle
                    const prevClip = otherClipsOnTrack.filter(c => c.start < initialClip.start).sort((a, b) => b.start - a.start)[0];
                    const minStart = prevClip ? prevClip.start + prevClip.duration : 0;
                    
                    const potentialNewStart = initialClip.start + dx;
                    const maxStart = initialClip.start + initialClip.duration - 0.1;
                    
                    newStart = clamp(potentialNewStart, minStart, maxStart);
                    newDuration = initialClip.duration + (initialClip.start - newStart);
                }
                
                return currentClips.map(c => c.id === initialClip.id ? { ...c, start: newStart, duration: newDuration } : c);
            }
            return currentClips;
        });

    }, [pixelsPerSecond, setClips]);
    
    const handlePointerUp = useCallback(() => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
        interaction.current = { type: 'none', startX: 0 };
    }, [handlePointerMove]);

    const onClipPointerDown = useCallback((e: React.PointerEvent, clip: Clip) => {
        e.stopPropagation();
        if (e.shiftKey) {
            setSelectedClipIds(prev => prev.includes(clip.id) ? prev.filter(id => id !== clip.id) : [...prev, clip.id]);
        } else {
            setSelectedClipIds([clip.id]);
        }
        interaction.current = { type: 'drag', clipId: clip.id, startX: e.clientX, initialClips: clips, initialTracks: tracks };
        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
    }, [clips, tracks, handlePointerMove, handlePointerUp, setSelectedClipIds]);

    const onHandlePointerDown = useCallback((e: React.PointerEvent, clip: Clip, handle: 'left' | 'right') => {
        e.stopPropagation();
        setSelectedClipIds([clip.id]);
        interaction.current = { type: 'resize', clipId: clip.id, handle, startX: e.clientX, initialClips: clips, initialTracks: tracks };
        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
    }, [clips, tracks, handlePointerMove, handlePointerUp, setSelectedClipIds]);

    return { onClipPointerDown, onHandlePointerDown };
};