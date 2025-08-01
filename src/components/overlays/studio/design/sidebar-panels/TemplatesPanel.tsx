import React from 'react';
import { Icons } from '../../../../icons';

export const TemplatesPanel = () => (
    <div className="design-panel">
        <div className="panel-search-bar"><Icons.Search size={16} /><input type="text" placeholder="Search templates" /></div>
        <div className="template-grid">{[...Array(8)].map((_, i) => <div key={i} className="template-item"></div>)}</div>
    </div>
);
