import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Sidebar } from './design/Sidebar';
import { Toolbar } from './design/Toolbar';
import { Canvas } from './design/Canvas';
import { useHistory } from './design/useHistory';
import { DesignState, Page, CanvasElement, Project } from './design/types';
import { getBoundingBox, reorderArray } from './design/utils';
import { v4 as uuidv4 } from 'uuid';
import './DesignStudio.css';

declare const html2canvas: any;

const LOCAL_STORAGE_KEY = 'design_studio_projects';

const createNewPage = (): Page => ({
  id: uuidv4(),
  name: `Page ${Math.floor(Math.random() * 1000)}`,
  elements: [],
  backgroundColor: '#ffffff',
});

const initialDesignState: DesignState = {
  pages: [createNewPage()],
  activePageId: '',
  selectedElementIds: [],
  zoom: 1,
  pan: { x: 0, y: 0 },
};
// Re-initialize to ensure the first page ID matches
initialDesignState.activePageId = initialDesignState.pages[0].id;

const DesignStudio: React.FC = () => {
  const [designState, setDesignState, history] = useHistory<DesignState>(initialDesignState);
  const [projects, setProjects] = useState<Project[]>([]);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      }
    } catch (e) { console.error("Failed to load projects", e); }
  }, []);

  const saveProject = useCallback(() => {
    const projectName = prompt("Enter project name:", "Untitled Design");
    if (projectName) {
      const newProject: Project = { id: uuidv4(), name: projectName, data: designState, lastModified: new Date().toISOString() };
      setProjects(prev => {
        const updated = [...prev, newProject];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      alert("Project saved!");
    }
  }, [designState]);
  
  const loadProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) setDesignState(project.data);
  }, [projects, setDesignState]);

  const deleteProject = useCallback((projectId: string) => {
      if (window.confirm("Delete this project?")) {
        setProjects(prev => {
            const updated = prev.filter(p => p.id !== projectId);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
      }
  }, []);

  const exportAsPNG = useCallback(async () => {
    if (canvasContainerRef.current) {
        const canvasToRender = canvasContainerRef.current.querySelector('.design-canvas-render-area');
        if (canvasToRender) {
            try {
                const canvas = await html2canvas(canvasToRender as HTMLElement, { backgroundColor: null, scale: 2 });
                const link = document.createElement('a');
                link.download = 'design.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) { console.error("Error exporting canvas:", error); }
        }
    }
  }, []);

  // PAGE ACTIONS
  const addPage = () => setDesignState(prev => ({ ...prev, pages: [...prev.pages, createNewPage()] }));
  const selectPage = (pageId: string) => setDesignState(prev => ({ ...prev, activePageId: pageId, selectedElementIds: [] }));
  const duplicatePage = (pageId: string) => setDesignState(prev => {
      const pageToCopy = prev.pages.find(p => p.id === pageId);
      if (!pageToCopy) return prev;
      const newPage: Page = { ...pageToCopy, id: uuidv4(), name: `${pageToCopy.name} Copy`, elements: pageToCopy.elements.map(el => ({...el, id: uuidv4()})) };
      return { ...prev, pages: [...prev.pages, newPage] };
  });
  const deletePage = (pageId: string) => setDesignState(prev => {
      if (prev.pages.length <= 1) return prev;
      const newPages = prev.pages.filter(p => p.id !== pageId);
      const newActivePageId = prev.activePageId === pageId ? newPages[0].id : prev.activePageId;
      return { ...prev, pages: newPages, activePageId: newActivePageId };
  });

  // ELEMENT & LAYER ACTIONS
  const addElement = useCallback((element: Omit<CanvasElement, 'id' | 'zIndex'>) => {
    setDesignState(prev => {
        const activePage = prev.pages.find(p => p.id === prev.activePageId);
        const maxZIndex = activePage ? Math.max(0, ...activePage.elements.map(el => el.zIndex)) : 0;
        const newElement: CanvasElement = { ...element, id: uuidv4(), zIndex: maxZIndex + 1, isVisible: true, isLocked: false, opacity: 1 };
        return { ...prev, pages: prev.pages.map(p => p.id === prev.activePageId ? { ...p, elements: [...p.elements, newElement] } : p), selectedElementIds: [newElement.id] };
    });
  }, [setDesignState]);

  const updateElement = (elementId: string, props: Partial<CanvasElement>) => setDesignState(prev => ({ ...prev, pages: prev.pages.map(p => p.id === prev.activePageId ? { ...p, elements: p.elements.map(el => el.id === elementId ? { ...el, ...props } : el) } : p) }), true);
  const reorderElement = (fromIndex: number, toIndex: number) => setDesignState(prev => {
      const page = prev.pages.find(p => p.id === prev.activePageId)!;
      const sortedElements = [...page.elements].sort((a,b) => b.zIndex - a.zIndex);
      const reordered = reorderArray(sortedElements, fromIndex, toIndex);
      const finalElements = reordered.reverse().map((el, index) => ({...el, zIndex: index + 1 }));
      return { ...prev, pages: prev.pages.map(p => p.id === prev.activePageId ? { ...p, elements: finalElements } : p) };
  });
  const duplicateElement = (elementId: string) => setDesignState(prev => {
      const page = prev.pages.find(p => p.id === prev.activePageId)!;
      const element = page.elements.find(el => el.id === elementId);
      if (!element) return prev;
      const newElement = { ...element, id: uuidv4(), x: element.x + 10, y: element.y + 10, zIndex: Math.max(...page.elements.map(e => e.zIndex)) + 1 };
      return { ...prev, pages: prev.pages.map(p => p.id === prev.activePageId ? { ...p, elements: [...p.elements, newElement] } : p), selectedElementIds: [newElement.id] };
  });
  
  const moveLayer = (direction: 'forward' | 'backward' | 'front' | 'back') => {
      setDesignState(prev => {
          const page = prev.pages.find(p => p.id === prev.activePageId)!;
          let newElements = [...page.elements].sort((a,b) => a.zIndex - b.zIndex);
          const selected = newElements.filter(el => prev.selectedElementIds.includes(el.id));
          const notSelected = newElements.filter(el => !prev.selectedElementIds.includes(el.id));
          
          if (direction === 'front') newElements = [...notSelected, ...selected];
          else if (direction === 'back') newElements = [...selected, ...notSelected];
          else if (direction === 'forward' || direction === 'backward') {
            const selectedElement = newElements.find(el => prev.selectedElementIds[0] === el.id);
            if (!selectedElement) return prev;
            
            const currentIndex = newElements.indexOf(selectedElement);
            newElements.splice(currentIndex, 1);

            let newIndex = direction === 'forward' ? Math.min(currentIndex + 1, newElements.length) : Math.max(currentIndex - 1, 0);
            newElements.splice(newIndex, 0, selectedElement);
          }
          
          const finalElements = newElements.map((el, index) => ({...el, zIndex: index + 1 }));

          return { ...prev, pages: prev.pages.map(p => p.id === prev.activePageId ? {...p, elements: finalElements} : p) }
      }, true);
  };
  
  const deleteSelectedElements = () => {
    setDesignState(prev => ({ 
        ...prev, 
        pages: prev.pages.map(p => p.id === prev.activePageId ? { ...p, elements: p.elements.filter(el => !prev.selectedElementIds.includes(el.id)) } : p ), 
        selectedElementIds: [] 
    }), true);
  };


   // GROUPING & ALIGNMENT
   const groupElements = () => setDesignState(prev => {
        const groupId = uuidv4();
        return { ...prev, pages: prev.pages.map(p => p.id === prev.activePageId ? { ...p, elements: p.elements.map(el => prev.selectedElementIds.includes(el.id) ? { ...el, groupId } : el) } : p) };
   });
   const ungroupElements = () => setDesignState(prev => {
        const groupId = prev.pages.find(p => p.id === prev.activePageId)?.elements.find(e => prev.selectedElementIds.includes(e.id))?.groupId;
        if (!groupId) return prev;
        return { ...prev, pages: prev.pages.map(p => p.id === prev.activePageId ? { ...p, elements: p.elements.map(el => el.groupId === groupId ? { ...el, groupId: undefined } : el) } : p) };
   });
   const alignElements = (align: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => setDesignState(prev => {
        const page = prev.pages.find(p => p.id === prev.activePageId)!;
        const selected = page.elements.filter(el => prev.selectedElementIds.includes(el.id));
        if (selected.length < 2) return prev;
        const bounds = getBoundingBox(selected);
        const newElements = page.elements.map(el => {
            if (!prev.selectedElementIds.includes(el.id)) return el;
            switch (align) {
                case 'left': return { ...el, x: bounds.minX };
                case 'center': return { ...el, x: bounds.minX + (bounds.width / 2) - (el.width / 2) };
                case 'right': return { ...el, x: bounds.maxX - el.width };
                case 'top': return { ...el, y: bounds.minY };
                case 'middle': return { ...el, y: bounds.minY + (bounds.height / 2) - (el.height / 2) };
                case 'bottom': return { ...el, y: bounds.maxY - el.height };
                default: return el;
            }
        });
        return { ...prev, pages: prev.pages.map(p => p.id === prev.activePageId ? { ...p, elements: newElements } : p) };
   });
  
  return (
    <div className="design-studio-container">
      <Sidebar
        designState={designState}
        setDesignState={setDesignState}
        addElement={addElement} 
        projects={projects} 
        loadProject={loadProject} 
        deleteProject={deleteProject}
        addPage={addPage}
        selectPage={selectPage}
        duplicatePage={duplicatePage}
        deletePage={deletePage}
        updateElement={updateElement}
        reorderElement={reorderElement}
        duplicateElement={duplicateElement}
      />
      <div className="design-studio-main">
        <Toolbar
          designState={designState}
          setDesignState={setDesignState}
          undo={history.undo}
          redo={history.redo}
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          saveProject={saveProject}
          exportAsPNG={exportAsPNG}
          groupElements={groupElements}
          ungroupElements={ungroupElements}
          alignElements={alignElements}
          moveLayer={moveLayer}
          deleteSelectedElements={deleteSelectedElements}
        />
        <Canvas
          designState={designState}
          setDesignState={setDesignState}
          canvasContainerRef={canvasContainerRef}
        />
      </div>
    </div>
  );
};

export default DesignStudio;