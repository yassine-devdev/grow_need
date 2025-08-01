
import React from 'react';
import { Icons } from '../../../icons';
import '../content-styles.css';

const mockContent = [
    { id: 1, title: 'Introduction to Algebra', type: 'Course', icon: Icons.BookCopy, tags: ['Math', 'Grade 9'] },
    { id: 2, title: 'Understanding Geometry', type: 'Course', icon: Icons.BookCopy, tags: ['Math', 'Grade 10'] },
    { id: 3, title: 'Calculus Basics', type: 'Video', icon: Icons.Video, tags: ['Math', 'Grade 11'] },
    { id: 4, title: 'Statistics Practice Exam', type: 'Exam Prep', icon: Icons.ClipboardCheck, tags: ['Math', 'Grade 12'] },
    { id: 5, title: 'Trigonometry Explained', type: 'Article', icon: Icons.FileText, tags: ['Math', 'Grade 10'] },
    { id: 6, title: 'Interactive Graphing Tool', type: 'Interactive', icon: Icons.MousePointer2, tags: ['Math', 'All Grades'] },
];

const Mathematics: React.FC = () => {
  return (
    <div className="kb-placeholder-container">
        <div className="kb-header">
            <div className="kb-header-icon"><Icons.Calculator size={48} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Mathematics</h2>
                <p className="text-gray-400">Subjects / Mathematics</p>
            </div>
        </div>
        
        <div className="kb-filter-bar">
            <div className="kb-search-wrapper">
                <Icons.Search size={18} className="kb-search-icon" />
                <input type="text" placeholder={`Search in Mathematics...`} className="kb-search-input" />
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

export default Mathematics;