
import React from 'react';
import { Icons } from '../../../icons';
import '../content-styles.css';

const mockContent = [
    { id: 4, title: 'Poetry Analysis Worksheet', type: 'Exam Prep', icon: Icons.ClipboardCheck, tags: ['Languages', 'Grade 10'] },
    { id: 9, title: 'Spanish 101', type: 'Course', icon: Icons.BookCopy, tags: ['Spanish', 'Grade 9'] },
    { id: 10, title: 'French Verb Conjugation', type: 'Video', icon: Icons.Video, tags: ['French', 'All Grades'] },
];

const Languages: React.FC = () => {
  return (
    <div className="kb-placeholder-container">
        <div className="kb-header">
            <div className="kb-header-icon"><Icons.Globe size={48} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Languages</h2>
                <p className="text-gray-400">Subjects / Languages</p>
            </div>
        </div>
        
        <div className="kb-filter-bar">
            <div className="kb-search-wrapper">
                <Icons.Search size={18} className="kb-search-icon" />
                <input type="text" placeholder={`Search in Languages...`} className="kb-search-input" />
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

export default Languages;