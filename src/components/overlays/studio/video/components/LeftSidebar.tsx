import React, { useState } from 'react';
import { Icons } from '../../../../icons';
import { MediaAsset, ClipType } from '../types';

interface LeftSidebarProps {
    mediaBin: MediaAsset[];
    addClipToTimeline: (asset: MediaAsset) => void;
    addElementToTimeline: (type: ClipType, title: string) => void;
}

type LeftSidebarTab = 'media' | 'templates' | 'elements' | 'audio' | 'text' | 'captions' | 'transcript' | 'effects' | 'transitions';

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ mediaBin, addClipToTimeline, addElementToTimeline }) => {
    const [activeTab, setActiveTab] = useState<LeftSidebarTab>('media');

    const tabs: { id: LeftSidebarTab; icon: React.ElementType; label: string }[] = [
        { id: 'media', icon: Icons.Media, label: 'Media' },
        { id: 'templates', icon: Icons.LayoutTemplate, label: 'Templates' },
        { id: 'elements', icon: Icons.Elements, label: 'Elements' },
        { id: 'audio', icon: Icons.Audio, label: 'Audio' },
        { id: 'text', icon: Icons.Text, label: 'Text' },
        { id: 'captions', icon: Icons.Captions, label: 'Captions' },
        { id: 'transcript', icon: Icons.Transcript, label: 'Transcript' },
        { id: 'effects', icon: Icons.Effects, label: 'Effects' },
        { id: 'transitions', icon: Icons.Transitions, label: 'Transitions' },
    ];

    const renderPanelContent = () => {
        switch(activeTab) {
            case 'media':
                return (
                    <>
                        <h4 className="ve-panel-title">Project Media</h4>
                        <div className="ve-media-grid">
                            {mediaBin.map(asset => (
                                <div key={asset.id} className="ve-media-item" onClick={() => addClipToTimeline(asset)}>
                                    <img src={asset.thumbnail} alt={asset.title} className="ve-media-thumbnail" />
                                    <div className="ve-media-info">
                                        <p className="ve-media-title">{asset.title}</p>
                                        <p className="ve-media-duration">{asset.duration.toFixed(1)}s</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                );
             case 'elements':
                return (
                    <>
                        <h4 className="ve-panel-title">Elements</h4>
                        <div className="ve-elements-grid">
                            <div className="ve-element-item" onClick={() => addElementToTimeline('text', 'New Text')}>
                                <div className="ve-element-icon"><Icons.Text size={20} /></div>
                                <p className="ve-media-title">Add Text</p>
                            </div>
                             <div className="ve-element-item" onClick={() => addElementToTimeline('shape', 'New Shape')}>
                                <div className="ve-element-icon"><Icons.Rectangle size={20} /></div>
                                <p className="ve-media-title">Add Shape</p>
                            </div>
                        </div>
                    </>
                );
            default:
                return <div className="p-4 text-slate-400">{tabs.find(t=>t.id === activeTab)?.label} panel coming soon.</div>
        }
    }
    
    return (
        <div className="ve-left-sidebar">
            <div className="ve-icon-tabs">
                {tabs.map(tab => (
                    <button key={tab.id} className={`ve-icon-tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                        <tab.icon size={24} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
             <div className="ve-left-panel">
                <div className="ve-panel-content">
                    <input type="search" placeholder="Search..." className="ve-search-bar" />
                    {renderPanelContent()}
                </div>
            </div>
        </div>
    );
};