
import React from 'react';
import { Icons } from '../../../icons';
import '../content-styles.css';

const mockContent = [
    { id: 1, title: 'Introduction to Algebra', type: 'Course', icon: Icons.BookCopy, tags: ['Math', 'Grade 9'] },
    { id: 5, title: 'Basics of JavaScript', type: 'Course', icon: Icons.BookCopy, tags: ['CS', 'Grade 11'] },
    { id: 7, title: 'The Periodic Table', type: 'Course', icon: Icons.BookCopy, tags: ['Chemistry', 'Grade 10'] },
    { id: 9, title: 'Spanish 101', type: 'Course', icon: Icons.BookCopy, tags: ['Spanish', 'Grade 9'] },
    { id: 11, title: 'American Revolution', type: 'Course', icon: Icons.BookCopy, tags: ['History', 'Grade 10'] },
    { id: 12, title: 'Music Theory Fundamentals', type: 'Course', icon: Icons.BookCopy, tags: ['Music', 'All Grades'] },
];

const AllCourses: React.FC = () => {
  return (
    <div className="kb-placeholder-container">
        <div className="kb-header">
            <div className="kb-header-icon"><Icons.BookCopy size={48} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">All Courses</h2>
                <p className="text-gray-400">Courses / All Courses</p>
            </div>
        </div>
        
        <div className="kb-filter-bar">
            <div className="kb-search-wrapper">
                <Icons.Search size={18} className="kb-search-icon" />
                <input type="text" placeholder={`Search in All Courses...`} className="kb-search-input" />
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
                    <option>All Subjects</option>
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

export default AllCourses;