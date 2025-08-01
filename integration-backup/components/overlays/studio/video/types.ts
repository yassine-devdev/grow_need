export type ClipType = 'video' | 'image' | 'text' | 'shape' | 'audio';

export interface Transform {
    x: number;
    y: number;
    scale: number;
    rotation: number;
}

export interface Clip {
    id: string;
    type: ClipType;
    trackId: string;
    src?: string;
    thumbnail?: string;
    start: number; // in seconds
    duration: number; // in seconds
    title: string;
    transform: Transform;
    opacity: number;
}

export interface Track {
    id: string;
    type: 'video' | 'audio' | 'element';
    title: string;
}

export interface MediaAsset {
    id: string;
    type: 'video' | 'image';
    src: string;
    thumbnail: string;
    duration: number;
    title: string;
}

export interface InteractionState {
    type: 'none' | 'drag' | 'resize' | 'scrub';
    clipId?: string;
    handle?: 'left' | 'right';
    startX: number;
    initialClips?: Clip[];
    initialTracks?: Track[];
}