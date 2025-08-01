import React from 'react';
import { Icons } from '../../../../icons';

export const TopBar: React.FC = () => (
    <div className="ve-top-bar">
       <div className="ve-top-bar-left">
           <h2 className="ve-project-name">Dessert Video Project</h2>
       </div>
       <div className="ve-top-bar-right">
           <button className="ve-top-bar-btn" disabled><Icons.Undo size={20}/></button>
           <button className="ve-top-bar-btn" disabled><Icons.Redo size={20}/></button>
           <button className="ve-export-btn">Export</button>
       </div>
   </div>
);