import React, { useRef } from 'react';
import { Icons } from '../../../../icons';
import { CanvasElement } from '../types';

interface UploadsPanelProps {
    addElement: (options: Partial<CanvasElement>) => void;
}

export const UploadsPanel: React.FC<UploadsPanelProps> = ({ addElement }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleUploadClick = () => fileInputRef.current?.click();
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => addElement({ type: 'image', src: e.target?.result as string, width: 200, height: 200 });
            reader.readAsDataURL(file);
        }
    };
    return (
        <div className="design-panel">
            <button className="upload-media-btn" onClick={handleUploadClick}><Icons.UploadCloud size={18} /> Upload Media</button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
        </div>
    );
};
