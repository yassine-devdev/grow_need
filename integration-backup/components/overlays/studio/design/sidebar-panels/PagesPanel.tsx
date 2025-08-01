import React from 'react';
import { Icons } from '../../../../icons';
import { DesignState } from '../types';

interface PagesPanelProps {
    designState: DesignState;
    addPage:()=>void;
    selectPage:(id:string)=>void;
    duplicatePage:(id:string)=>void;
    deletePage:(id:string)=>void;
}

export const PagesPanel: React.FC<PagesPanelProps> = ({ designState, addPage, selectPage, duplicatePage, deletePage }) => (
    <div className="pages-panel design-panel">
        <div className="page-list">
            {designState.pages.map(page => (
                <div key={page.id} className={`page-item ${designState.activePageId === page.id ? 'selected' : ''}`} onClick={() => selectPage(page.id)}>
                    <div className="page-thumbnail-small" style={{backgroundColor: page.backgroundColor}}></div>
                    <span className="page-name">{page.name}</span>
                    <div className="page-actions">
                        <button onClick={(e)=>{e.stopPropagation(); duplicatePage(page.id);}}><Icons.Copy size={14} /></button>
                        <button onClick={(e)=>{e.stopPropagation(); deletePage(page.id);}}><Icons.Trash2 size={14} /></button>
                    </div>
                </div>
            ))}
        </div>
        <div className="pages-panel-footer">
            <button className="add-page-btn" onClick={addPage}><Icons.FilePlus2 size={16}/> Add Page</button>
        </div>
    </div>
);
