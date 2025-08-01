import React from 'react';
import { Icons } from '../../../../icons';
import { Project } from '../types';

interface ProjectsPanelProps {
    projects: Project[];
    loadProject: (id: string) => void;
    deleteProject: (id: string) => void;
}

export const ProjectsPanel: React.FC<ProjectsPanelProps> = ({ projects, loadProject, deleteProject }) => (
    <div className="design-panel">
        <h3 className="panel-subtitle">Saved Projects</h3>
        <div className="projects-list">
            {projects.length === 0 ? (
                <p className="empty-text">No saved projects.</p>
            ) : (
                projects.map(p => (
                    <div key={p.id} className="project-item">
                        <span>{p.name}</span>
                        <div className="project-actions">
                            <button onClick={() => loadProject(p.id)}>Load</button>
                            <button onClick={() => deleteProject(p.id)} className="delete"><Icons.Trash2 size={14} /></button>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);
