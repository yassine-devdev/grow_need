import React, { useState, useCallback } from 'react';
import { Icons } from '../../../icons';
import { CanvasElement, Project, CanvasElementType, DesignState } from './types';
import {
    TemplatesPanel,
    ElementsPanel,
    TextPanel,
    UploadsPanel,
    ProjectsPanel,
    LayersPanel,
    PagesPanel
} from './sidebar-panels';

interface SidebarProps {
  designState: DesignState;
  setDesignState: (fn: (prevState: DesignState) => DesignState, undoable?: boolean) => void;
  addElement: (element: Omit<CanvasElement, 'id' | 'zIndex'>) => void;
  projects: Project[];
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  addPage: () => void;
  selectPage: (id: string) => void;
  duplicatePage: (id: string) => void;
  deletePage: (id: string) => void;
  updateElement: (id: string, props: Partial<CanvasElement>) => void;
  reorderElement: (from: number, to: number) => void;
  duplicateElement: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const { addElement, projects, loadProject, deleteProject, designState, setDesignState, addPage, selectPage, duplicatePage, deletePage, updateElement, reorderElement, duplicateElement } = props;
  const [activePanel, setActivePanel] = useState('layers');

  const handleAddElement = useCallback((options: { type: CanvasElementType } & Partial<Omit<CanvasElement, 'id' | 'zIndex'>>) => {
    addElement({
      isVisible: true,
      isLocked: false,
      x: 150, y: 150, width: 100, height: 100, rotation: 0,
      opacity: 1,
      backgroundColor: '#cccccc', color: '#000000', fontFamily: 'Roboto',
      ...options
    });
  }, [addElement]);

  const sidebarItems = [
    { id: 'layers', name: 'Layers', icon: Icons.Layers },
    { id: 'pages', name: 'Pages', icon: Icons.FilePlus2 },
    { id: 'templates', name: 'Templates', icon: Icons.LayoutTemplate },
    { id: 'elements', name: 'Elements', icon: Icons.Shapes },
    { id: 'text', name: 'Text', icon: Icons.Type },
    { id: 'uploads', name: 'Uploads', icon: Icons.UploadCloud },
    { id: 'projects', name: 'Projects', icon: Icons.Folder },
  ];

  const renderPanel = () => {
    switch (activePanel) {
      case 'layers': return <LayersPanel designState={designState} setDesignState={setDesignState} updateElement={updateElement} reorderElement={reorderElement} duplicateElement={duplicateElement} />;
      case 'pages': return <PagesPanel designState={designState} addPage={addPage} selectPage={selectPage} duplicatePage={duplicatePage} deletePage={deletePage} />;
      case 'templates': return <TemplatesPanel />;
      case 'elements': return <ElementsPanel addElement={handleAddElement} />;
      case 'text': return <TextPanel addElement={handleAddElement} />;
      case 'uploads': return <UploadsPanel addElement={handleAddElement} />;
      case 'projects': return <ProjectsPanel projects={projects} loadProject={loadProject} deleteProject={deleteProject} />;
      default: return null;
    }
  };

  return (
    <div className="design-studio-left-sidebar">
      <div className="design-icon-sidebar">
        {sidebarItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-icon-btn ${activePanel === item.id ? 'active' : ''}`}
            onClick={() => setActivePanel(item.id)}
            title={item.name}
          >
            <item.icon size={24} />
            <span>{item.name}</span>
          </button>
        ))}
      </div>
      <div className="design-panel-container">{renderPanel()}</div>
    </div>
  );
};