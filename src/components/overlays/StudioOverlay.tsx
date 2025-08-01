import React, { useState, useMemo } from 'react';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';
import { Icons } from '../icons';
import './StudioOverlay.css';
import StudioPlaceholder from './studio/Placeholder';
import DesignStudio from './studio/DesignStudio';
import VideoEditor from './studio/video/VideoEditor';

type L1Tab = 'Design' | 'Video' | 'Coder' | 'Office';
interface L2Item {
  id: string;
  name: string;
  icon: React.ElementType;
  component: React.ComponentType<any>;
}

const studioData: Record<L1Tab, L2Item[]> = {
  Design: [
    { id: 'design.main', name: 'Design Studio', icon: Icons.Design, component: DesignStudio }
  ],
  Video: [
    { id: 'video.main', name: 'Video Editor', icon: Icons.VideoL1, component: VideoEditor }
  ],
  Coder: [
    { id: 'coder.main', name: 'Code Editor', icon: Icons.CoderL1, component: () => <StudioPlaceholder appName="Code Editor" /> }
  ],
  Office: [
     { id: 'office.word', name: 'Word Processor', icon: Icons.Word, component: () => <StudioPlaceholder appName="Word Processor" /> },
     { id: 'office.excel', name: 'Spreadsheet', icon: Icons.Excel, component: () => <StudioPlaceholder appName="Spreadsheet" /> },
     { id: 'office.powerpoint', name: 'Presentation', icon: Icons.PowerPoint, component: () => <StudioPlaceholder appName="Presentation" /> },
     { id: 'office.diagram', name: 'Diagram Tool', icon: Icons.Diagram, component: () => <StudioPlaceholder appName="Diagram Tool" /> },
  ],
};


const L1_TABS: { id: L1Tab; name: string; icon: React.ElementType }[] = [
  { id: 'Design', name: 'Design', icon: Icons.Design },
  { id: 'Video', name: 'Video', icon: Icons.VideoL1 },
  { id: 'Coder', name: 'Coder', icon: Icons.CoderL1 },
  { id: 'Office', name: 'Office', icon: Icons.OfficeL1 },
];

interface StudioOverlayProps {
  onClose: () => void;
  onMinimize: () => void;
}

const StudioOverlay: React.FC<StudioOverlayProps> = ({ onClose, onMinimize }) => {
  const [activeL1, setActiveL1] = useState<L1Tab>('Design');
  const [activeL2Id, setActiveL2Id] = useState<string>(studioData.Design[0].id);

  const handleL1Click = (tabId: L1Tab) => {
    setActiveL1(tabId);
    setActiveL2Id(studioData[tabId][0].id);
  };
  
  const l2Items = useMemo(() => studioData[activeL1], [activeL1]);

  const ActiveComponent = useMemo(() => {
    return l2Items.find(item => item.id === activeL2Id)?.component || null;
  }, [l2Items, activeL2Id]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <GlassmorphicContainer className="studio-overlay-bordered w-full h-full rounded-2xl flex flex-col overflow-hidden">
        <header className="studio-header">
          <div className="studio-l1-nav">
            {L1_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleL1Click(tab.id)}
                className={`studio-l1-btn ${activeL1 === tab.id ? 'active' : ''}`}
              >
                <tab.icon size={18} />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
          <div className="studio-window-controls">
            <button onClick={onMinimize} className="studio-control-btn" aria-label="Minimize">
                <Icons.Minimize size={20} />
            </button>
            <button onClick={onClose} className="studio-control-btn close" aria-label="Close">
                <Icons.Close size={20} />
            </button>
          </div>
        </header>
        <div className="studio-body">
            {l2Items.length > 1 && (
              <div className="studio-l2-sidebar">
                  {l2Items.map(item => {
                      const Icon = item.icon;
                      return (
                          <div key={item.id} className="relative group">
                              <button
                                  onClick={() => setActiveL2Id(item.id)}
                                  className={`studio-l2-button ${activeL2Id === item.id ? 'active' : ''}`}
                                  aria-label={item.name}
                              >
                                  <Icon size={24} />
                              </button>
                              <div className="nav-tooltip-bordered absolute left-full ml-4 top-1/2 -translate-y-1/2">
                                  {item.name}
                              </div>
                          </div>
                      );
                  })}
              </div>
            )}
            <main className="studio-content-pane">
                {ActiveComponent ? <ActiveComponent /> : <StudioPlaceholder appName="Studio" />}
            </main>
        </div>
      </GlassmorphicContainer>
    </div>
  );
};

export default StudioOverlay;