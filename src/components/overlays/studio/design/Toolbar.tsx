import React from 'react';
import { DesignState } from './types';
import { Icons } from '../../../icons';

interface ToolbarProps {
  designState: DesignState;
  setDesignState: (newState: DesignState | ((prevState: DesignState) => DesignState), undoable?: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveProject: () => void;
  exportAsPNG: () => void;
  groupElements: () => void;
  ungroupElements: () => void;
  alignElements: (align: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  moveLayer: (direction: 'forward' | 'backward' | 'front' | 'back') => void;
  deleteSelectedElements: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  designState, setDesignState,
  undo, redo, canUndo, canRedo, saveProject, exportAsPNG,
  groupElements, ungroupElements, alignElements,
  moveLayer, deleteSelectedElements
}) => {
  const { pages, activePageId, selectedElementIds } = designState;
  const activePage = pages.find(p => p.id === activePageId)!;
  const selectedElements = activePage.elements.filter(el => selectedElementIds.includes(el.id));
  const firstSelected = selectedElements[0];
  const isMultiSelect = selectedElements.length > 1;
  
  const isGroupSelected = firstSelected && firstSelected.groupId && selectedElements.every(el => el.groupId === firstSelected.groupId);

  const updateSelectedElements = (props: any, undoable: boolean = true) => {
    setDesignState(prev => ({
        ...prev,
        pages: prev.pages.map(p => p.id === activePageId ? {
            ...p,
            elements: p.elements.map(el => selectedElementIds.includes(el.id) ? { ...el, ...props } : el)
        } : p)
    }), undoable);
  };
  
  return (
    <div className="design-top-toolbar">
        <div className="toolbar-group">
            <button className="toolbar-btn" onClick={undo} disabled={!canUndo} title="Undo"><Icons.Undo size={18} /></button>
            <button className="toolbar-btn" onClick={redo} disabled={!canRedo} title="Redo"><Icons.Redo size={18} /></button>
        </div>
        <div className="toolbar-divider"></div>
        
        {firstSelected && (
        <>
            {firstSelected.type === 'shape' && (
            <div className="toolbar-group">
                <label htmlFor="bg-color-picker" className="toolbar-btn" title="Fill Color"><div className="color-preview" style={{ backgroundColor: firstSelected.backgroundColor }}></div></label>
                <input id="bg-color-picker" type="color" value={firstSelected.backgroundColor} onChange={(e) => updateSelectedElements({ backgroundColor: e.target.value }, false)} onBlur={() => setDesignState(p=>p, true)}/>
                <div className="toolbar-divider"></div>
                <label htmlFor="stroke-color-picker" className="toolbar-btn" title="Stroke Color"><div className="color-preview" style={{ backgroundColor: firstSelected.strokeColor || '#000000' }}></div></label>
                <input id="stroke-color-picker" type="color" value={firstSelected.strokeColor} onChange={(e) => updateSelectedElements({ strokeColor: e.target.value }, false)} onBlur={() => setDesignState(p=>p, true)} />
                <input className="prop-input" type="number" min="0" value={firstSelected.strokeWidth || 0} onChange={e => updateSelectedElements({strokeWidth: parseInt(e.target.value)})} title="Stroke Width"/>
                <div className="toolbar-divider"></div>
                <Icons.Radius size={16}/>
                <input className="prop-input" type="number" min="0" value={firstSelected.borderRadius || 0} onChange={e => updateSelectedElements({borderRadius: parseInt(e.target.value)})} title="Border Radius"/>
            </div>
            )}

            {firstSelected.type === 'text' && (
            <div className="toolbar-group">
                <select className="font-select" value={firstSelected.fontFamily} onChange={e => updateSelectedElements({fontFamily: e.target.value})}>
                    <option>Roboto</option><option>Orbitron</option><option>Source Code Pro</option>
                </select>
                <input className="font-size-input" type="number" value={firstSelected.fontSize} onChange={e => updateSelectedElements({fontSize: parseInt(e.target.value)})}/>
                <button className="toolbar-btn" onClick={() => updateSelectedElements({fontWeight: firstSelected.fontWeight === 'bold' ? 'normal' : 'bold'})}><Icons.Bold size={18}/></button>
                <label htmlFor="color-picker" className="toolbar-btn" title="Text Color"><div className="color-preview" style={{ backgroundColor: firstSelected.color }}></div></label>
                <input id="color-picker" type="color" value={firstSelected.color} onChange={(e) => updateSelectedElements({ color: e.target.value })}/>
            </div>
            )}
            <div className="toolbar-divider"></div>
             <div className="toolbar-group">
                <button className="toolbar-btn" title="Bring Forward" onClick={() => moveLayer('forward')}><Icons.Layers size={18}/></button>
                <button className="toolbar-btn" title="Send Backward" onClick={() => moveLayer('backward')}><Icons.Layers size={18} style={{transform: 'scaleY(-1)'}}/></button>
                 <button className="toolbar-btn" title="Bring to Front" onClick={() => moveLayer('front')}><Icons.bringToFront size={18}/></button>
                <button className="toolbar-btn" title="Send to Back" onClick={() => moveLayer('back')}><Icons.sendToBack size={18}/></button>
                <div className="toolbar-divider"></div>
                <button className="toolbar-btn" title="Opacity"><Icons.Eye size={18} /></button>
                <input className="prop-input" type="number" min="0" max="1" step="0.1" value={firstSelected.opacity} onChange={e => updateSelectedElements({opacity: parseFloat(e.target.value)})}/>
             </div>
             <div className="toolbar-divider"></div>
             <button className="toolbar-btn" onClick={deleteSelectedElements}><Icons.Trash2 size={18} /></button>
        </>
        )}

        {isMultiSelect && (
            <>
            <div className="toolbar-divider"></div>
            <div className="toolbar-group">
                <button className="toolbar-btn" onClick={groupElements} disabled={isGroupSelected} title="Group"><Icons.Group size={18}/></button>
                <button className="toolbar-btn" onClick={ungroupElements} disabled={!isGroupSelected} title="Ungroup"><Icons.Ungroup size={18}/></button>
            </div>
            <div className="toolbar-divider"></div>
            <div className="toolbar-group">
                 <button className="toolbar-btn" onClick={() => alignElements('left')} title="Align Left"><Icons.AlignHorizontalJustifyLeft size={18}/></button>
                 <button className="toolbar-btn" onClick={() => alignElements('center')} title="Align Center"><Icons.AlignHorizontalJustifyCenter size={18}/></button>
                 <button className="toolbar-btn" onClick={() => alignElements('right')} title="Align Right"><Icons.AlignHorizontalJustifyRight size={18}/></button>
                 <button className="toolbar-btn" onClick={() => alignElements('top')} title="Align Top"><Icons.AlignVerticalJustifyStart size={18}/></button>
                 <button className="toolbar-btn" onClick={() => alignElements('middle')} title="Align Middle"><Icons.AlignVerticalJustifyCenter size={18}/></button>
                 <button className="toolbar-btn" onClick={() => alignElements('bottom')} title="Align Bottom"><Icons.AlignVerticalJustifyEnd size={18}/></button>
            </div>
            </>
        )}

        <div className="toolbar-group" style={{marginLeft: 'auto'}}>
             <button className="toolbar-btn" onClick={saveProject} title="Save Project"><Icons.Save size={18}/></button>
             <button className="toolbar-btn" onClick={exportAsPNG} title="Export as PNG"><Icons.DownloadCloud size={18}/></button>
        </div>
    </div>
  );
};