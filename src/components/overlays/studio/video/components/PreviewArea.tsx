import React from 'react';
import { Icons } from '../../../../icons';
import { Clip } from '../types';

interface PreviewAreaProps {
    selectedClip: Clip | null;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({ selectedClip }) => (
    <div className="ve-preview-area">
        <div className="ve-preview-window">
             <img src={selectedClip?.thumbnail || "https://images.unsplash.com/photo-1593999993959-5c8a3c4c2f4e?q=80&w=2832&auto=format&fit=crop"} alt="Video preview" />
        </div>
         <div className="ve-preview-toolbar">
            <div className="flex gap-2">
                <button className="ve-top-bar-btn active"><Icons.Ratio size={20}/></button>
            </div>
             <div className="flex-grow"></div>
             <div className="flex gap-2">
                 <button className="ve-top-bar-btn"><Icons.Mic size={20}/></button>
                 <button className="ve-top-bar-btn"><Icons.Split size={20}/></button>
                 <button className="ve-top-bar-btn"><Icons.Fullscreen size={20}/></button>
             </div>
         </div>
    </div>
);