
import React, { useState } from 'react';
import { Icons } from '../../../icons';
import FileUploadComponent from '../../../common/FileUploadComponent';
import '../content-styles.css';

const mockContent = [
    { id: 2, title: 'Cellular Respiration Explained', type: 'Video', icon: Icons.Video, tags: ['Science', 'Grade 10'] },
    { id: 3, title: 'Calculus Basics', type: 'Video', icon: Icons.Video, tags: ['Math', 'Grade 11'] },
    { id: 10, title: 'French Verb Conjugation', type: 'Video', icon: Icons.Video, tags: ['French', 'All Grades'] },
];

const Videos: React.FC = () => {
  const [showUpload, setShowUpload] = useState(false);

  const handleUploadComplete = (result: any) => {
    console.log('Video metadata upload completed:', result);
    if (result.success) {
      alert(`Video metadata "${result.filename}" uploaded successfully! Topics: ${result.processingStats?.topicCount || 0} identified`);
    } else {
      alert(`Upload failed: ${result.error}`);
    }
  };
  return (
    <div className="kb-placeholder-container">
        <div className="kb-header">
            <div className="kb-header-icon"><Icons.Video size={48} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Videos</h2>
                <p className="text-gray-400">Library / Videos</p>
            </div>
        </div>
        
        <div className="kb-filter-bar">
            <div className="kb-search-wrapper">
                <Icons.Search size={18} className="kb-search-icon" />
                <input type="text" placeholder={`Search in Videos...`} className="kb-search-input" />
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
                    <span>{showUpload ? 'Hide Upload' : 'Upload Video Info'}</span>
                </button>
            </div>
        </div>

        {/* File Upload Section for Video Metadata */}
        {showUpload && (
            <div style={{ margin: '20px 0', padding: '20px', background: '#f7fafc', borderRadius: '8px' }}>
                <div style={{ marginBottom: '15px', padding: '10px', background: '#e6fffa', borderRadius: '6px', border: '1px solid #38b2ac' }}>
                    <p style={{ margin: 0, color: '#2c7a7b', fontSize: '14px' }}>
                        📹 <strong>Video Metadata Upload:</strong> Upload text files containing video descriptions, transcripts, or metadata.
                        Actual video files should be hosted externally (YouTube, Vimeo, etc.) and linked via metadata.
                    </p>
                </div>
                <FileUploadComponent
                    onUploadComplete={handleUploadComplete}
                    acceptedTypes={[
                        'text/plain',
                        'text/csv',
                        'application/json',
                        'text/markdown'
                    ]}
                    maxFileSize={10}
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

export default Videos;