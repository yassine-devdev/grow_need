import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Icons } from '../../../icons';
import './VideoEditor.css';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { PreviewArea } from './components/PreviewArea';
import { TopBar } from './components/TopBar';
import { Timeline } from './components/Timeline/Timeline';
import { Clip, Track, MediaAsset, ClipType } from './types';

// --- MOCK DATA ---
const initialMediaBin: MediaAsset[] = [
    { id: 'media1', type: 'video', title: 'Cooking Class', duration: 15.2, src: '...', thumbnail: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=200' },
    { id: 'media2', type: 'video', title: 'Strawberry Cake', duration: 8.5, src: '...', thumbnail: 'https://images.unsplash.com/photo-1562440102-3959955b2850?q=80&w=200' },
    { id: 'media3', type: 'video', title: 'Blueberry Garnish', duration: 4.0, src: '...', thumbnail: 'https://images.unsplash.com/photo-1464965911861-746a04b4b4ae?q=80&w=200' },
    { id: 'media4', type: 'image', title: 'Finished Cake', duration: 3.0, src: '...', thumbnail: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=200' },
];

const initialClips: Clip[] = [
    { id: uuidv4(), type: 'video', trackId: 'track1', src: '...', thumbnail: 'https://images.unsplash.com/photo-1593999993959-5c8a3c4c2f4e?q=80&w=200', start: 0, duration: 5.9, title: 'Intro Scene', transform: { x: 0, y: 0, scale: 1, rotation: 0 }, opacity: 100 },
    { id: uuidv4(), type: 'video', trackId: 'track1', src: '...', thumbnail: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=200', start: 5.9, duration: 5.5, title: 'Cooking Prep', transform: { x: 0, y: 0, scale: 1, rotation: 0 }, opacity: 100 },
    { id: uuidv4(), type: 'video', trackId: 'track1', src: '...', thumbnail: 'https://images.unsplash.com/photo-1464965911861-746a04b4b4ae?q=80&w=200', start: 11.4, duration: 4.0, title: 'Garnishing', transform: { x: 0, y: 0, scale: 1, rotation: 0 }, opacity: 100 },
    { id: uuidv4(), type: 'video', trackId: 'track1', src: '...', thumbnail: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=200', start: 15.4, duration: 3.85, title: 'Final Product', transform: { x: 0, y: 0, scale: 1, rotation: 0 }, opacity: 100 },
];

const initialTracks: Track[] = [
    { id: 'track1', type: 'video', title: 'Video' },
];

const VideoEditor: React.FC = () => {
    const [tracks, setTracks] = useState<Track[]>(initialTracks);
    const [clips, setClips] = useState<Clip[]>(initialClips);
    const [selectedClipIds, setSelectedClipIds] = useState<string[]>([]);
    const [playheadPosition, setPlayheadPosition] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [zoom, setZoom] = useState<number>(1);
    const animationFrameRef = useRef<number | null>(null);

    const totalDuration = useMemo(() => {
        const allClips = clips;
        return allClips.reduce((max, clip) => Math.max(max, clip.start + clip.duration), 0);
    }, [clips]);
    
    const selectedClip = useMemo(() => clips.find(c => c.id === selectedClipIds[0]) || null, [clips, selectedClipIds]);

    const handleTogglePlay = useCallback(() => setIsPlaying(prev => !prev), []);
    
    const addClipToTimeline = useCallback((asset: MediaAsset) => {
        const lastClipOnTrack1 = clips.filter(c=>c.trackId === 'track1').sort((a,b)=>b.start - a.start)[0];
        const newClip: Clip = {
            id: uuidv4(),
            type: asset.type,
            trackId: 'track1',
            src: asset.src,
            thumbnail: asset.thumbnail,
            title: asset.title,
            start: lastClipOnTrack1 ? lastClipOnTrack1.start + lastClipOnTrack1.duration : 0,
            duration: asset.duration,
            transform: { x: 0, y: 0, scale: 1, rotation: 0 },
            opacity: 100
        };
        setClips(prev => [...prev, newClip]);
    }, [clips]);
    
     const addElementToTimeline = (type: ClipType, title: string) => {
        const newTrackId = `track-${tracks.length + 1}`;
        const newTrack: Track = { id: newTrackId, type: 'element', title: 'Elements 1' };
        const newClip: Clip = {
            id: uuidv4(),
            type,
            trackId: newTrackId,
            title,
            start: playheadPosition,
            duration: 5,
            transform: { x: 0, y: 0, scale: 1, rotation: 0 },
            opacity: 100,
        };
        setTracks(prev => [...prev, newTrack]);
        setClips(prev => [...prev, newClip]);
    };

    const handleSplitClip = useCallback(() => {
        if (selectedClipIds.length !== 1 || !selectedClip) return;
        const splitTime = playheadPosition;
        if (splitTime <= selectedClip.start || splitTime >= selectedClip.start + selectedClip.duration) return;

        const firstPartDuration = splitTime - selectedClip.start;
        const secondPartDuration = selectedClip.duration - firstPartDuration;

        const firstPart: Clip = { ...selectedClip, id: uuidv4(), duration: firstPartDuration };
        const secondPart: Clip = { ...selectedClip, id: uuidv4(), start: splitTime, duration: secondPartDuration };
        
        setClips(prev => [...prev.filter(c => c.id !== selectedClip.id), firstPart, secondPart].sort((a,b) => a.start - b.start));
        setSelectedClipIds([firstPart.id, secondPart.id]);
    }, [selectedClip, playheadPosition, selectedClipIds]);

     const updateSelectedClip = useCallback((props: Partial<Clip>) => {
        if (!selectedClip) return;
        setClips(prevClips => prevClips.map(c => c.id === selectedClip.id ? { ...c, ...props } : c));
    }, [selectedClip, setClips]);
    
    useEffect(() => {
        if (isPlaying) {
            let lastTime = performance.now();
            const animate = (time: number) => {
                const deltaTime = (time - lastTime) / 1000;
                lastTime = time;
                setPlayheadPosition(prev => {
                    const newPosition = prev + deltaTime;
                    if (newPosition >= totalDuration) {
                        setIsPlaying(false);
                        return totalDuration;
                    }
                    return newPosition;
                });
                animationFrameRef.current = requestAnimationFrame(animate);
            };
            animationFrameRef.current = requestAnimationFrame(animate);
        } else {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        }
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying, totalDuration]);
    
    return (
        <div className="video-editor-layout">
            <TopBar />
            <div className="video-editor-main-content">
                <LeftSidebar 
                    mediaBin={initialMediaBin}
                    addClipToTimeline={addClipToTimeline}
                    addElementToTimeline={addElementToTimeline}
                />
                <PreviewArea selectedClip={selectedClip}/>
                <RightSidebar 
                    selectedClip={selectedClip} 
                    updateSelectedClip={updateSelectedClip}
                    totalDuration={totalDuration}
                />
            </div>
            <Timeline
                tracks={tracks}
                clips={clips}
                setClips={setClips}
                selectedClipIds={selectedClipIds}
                setSelectedClipIds={setSelectedClipIds}
                playheadPosition={playheadPosition}
                setPlayheadPosition={setPlayheadPosition}
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                zoom={zoom}
                onZoomChange={setZoom}
                onSplit={handleSplitClip}
                totalDuration={totalDuration}
            />
        </div>
    );
};

export default VideoEditor;