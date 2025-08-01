
import React from 'react';
import { Icons } from '../../../icons';
import '../content-styles.css';

const mockContent = [
    { id: 2, title: 'Cellular Respiration Explained', type: 'Video', icon: Icons.Video, tags: ['Science', 'Grade 10'] },
    { id: 6, title: 'Photosynthesis Simulation', type: 'Interactive', icon: Icons.MousePointer2, tags: ['Science', 'Grade 9'] },
    { id: 7, title: 'The Periodic Table', type: 'Course', icon: Icons.BookCopy, tags: ['Chemistry', 'Grade 10'] },
    { id: 8, title: 'Newton\'s Laws of Motion', type: 'Article', icon: Icons.FileText, tags: ['Physics', 'Grade 11'] },
];

const Science: React.FC = () => {
  return (
    <div className="kb-placeholder-container">
        <div className="kb-header">
            <div className="kb-header-icon"><Icons.FlaskConical size={48} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Science</h2>
                <p className="text-gray-400">Subjects / Science</p>
            </div>
        </div>
        
        <div className="kb-filter-bar">
            <div className="kb-search-wrapper">
                <Icons.Search size={18} className="kb-search-icon" />
                <input type="text" placeholder={`Search in Science...`} className="kb-search-input" />
            </div>
            <div className="kb-filters">
                <select className="kb-filter-select">
                    <option>All Grade Levels</option>
                    <option>Grade 9</option>
                    <option>Grade 10</option>
                    <option>Grade 11</option>
                    <option>Grade 12</option>
                </select>
                <select className="kb-filter-select">
                    <option>All Content Types</option>
                    <option>Course</option>
                    <option>Video</option>
                    <option>Article</option>
                    <option>Exam Prep</option>
                </select>
                <button className="kb-filter-btn">
                    <Icons.Filter size={16}/>
                    <span>Filters</span>
                </button>
            </div>
        </div>

        <div className="kb-content-grid">
            {mockContent.map(item => {
                const ContentIcon = item.icon;
                return (
                    <div key={item.id} className="kb-content-card">
                        <div className="kb-card-icon-wrapper">
                            <ContentIcon size={24} />
                        </div>
                        <h4 className="kb-card-title">{item.title}</h4>
                        <p className="kb-card-type">{item.type}</p>
                        <div className="kb-card-tags">
                            {item.tags.map(tag => <span key={tag} className="kb-card-tag">{tag}</span>)}
                        </div>
                        <div className="kb-card-footer">
                            <button className="kb-card-action-btn view">View</button>
                            <button className="kb-card-action-btn save"><Icons.Bookmark size={14}/></button>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default Science;