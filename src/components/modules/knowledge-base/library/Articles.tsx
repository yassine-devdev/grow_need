
import React, { useState } from 'react';
import { Icons } from '../../../icons';
import FileUploadComponent from '../../../common/FileUploadComponent';
import '../content-styles.css';

const mockContent = [
    { id: 3, title: 'The Causes of World War I', type: 'Article', icon: Icons.FileText, tags: ['History', 'Grade 11'] },
    { id: 8, title: 'Newton\'s Laws of Motion', type: 'Article', icon: Icons.FileText, tags: ['Physics', 'Grade 11'] },
    { id: 13, title: 'Introduction to Renaissance Art', type: 'Article', icon: Icons.FileText, tags: ['Art', 'Grade 11'] },
    { id: 14, title: 'Understanding Data Structures', type: 'Article', icon: Icons.FileText, tags: ['CS', 'Grade 12'] },
];

const Articles: React.FC = () => {
  const [showUpload, setShowUpload] = useState(false);

  const handleUploadComplete = (result: any) => {
    console.log('Article upload completed:', result);
    if (result.success) {
      alert(`Article "${result.filename}" uploaded successfully! Processing stats: ${result.processingStats?.wordCount} words, Reading Level: ${result.processingStats?.readingLevel}`);
    } else {
      alert(`Upload failed: ${result.error}`);
    }
  };
  return (
    <div className="kb-placeholder-container">
        <div className="kb-header">
            <div className="kb-header-icon"><Icons.FileText size={48} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Articles</h2>
                <p className="text-gray-400">Library / Articles</p>
            </div>
        </div>
        
        <div className="kb-filter-bar">
            <div className="kb-search-wrapper">
                <Icons.Search size={18} className="kb-search-icon" />
                <input type="text" placeholder={`Search in Articles...`} className="kb-search-input" />
            </div>
            <div className="kb-filters">
                <select className="kb-filter-select">
                    <option>All Subjects</option>
                </select>
                <button className="kb-filter-btn">
                    <Icons.Filter size={16}/>
                    <span>Filters</span>
                </button>
                <button
                    className="kb-filter-btn"
                    onClick={() => setShowUpload(!showUpload)}
                    style={{
                        marginLeft: '12px',
                        background: showUpload ? '#e53e3e' : '#4299e1',
                        color: 'white'
                    }}
                >
                    <Icons.Upload size={16} />
                    <span>{showUpload ? 'Hide Upload' : 'Upload Articles'}</span>
                </button>
            </div>
        </div>

        {/* File Upload Section */}
        {showUpload && (
            <div style={{ margin: '20px 0', padding: '20px', background: '#f7fafc', borderRadius: '8px' }}>
                <FileUploadComponent
                    onUploadComplete={handleUploadComplete}
                    acceptedTypes={[
                        'text/plain',
                        'text/html',
                        'text/markdown',
                        'application/pdf',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    ]}
                    maxFileSize={25}
                    multiple={true}
                />
            </div>
        )}

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

export default Articles;