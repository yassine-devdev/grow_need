import React, { useState, useEffect } from 'react';
import { Icons } from '../../icons';
import GlassmorphicContainer from '../../ui/GlassmorphicContainer';

interface ContentItem {
  id: string;
  title: string;
  content: string;
  subject: string;
  grade_level: string;
  content_type: string;
  teacher: string;
  uploaded_at: string;
  status: string;
}

interface ContentData {
  pending_approval: ContentItem[];
  approved_content: ContentItem[];
  rejected_content: ContentItem[];
  content_categories: Array<{name: string; count: number; color: string}>;
  stats: {
    pending_count: number;
    approved_count: number;
    rejected_count: number;
    categories_count: number;
  };
}

const ContentManagement: React.FC = () => {
  const [activeL2, setActiveL2] = useState<string>('pending-approval');
  const [contentData, setContentData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load content data from API
  useEffect(() => {
    const fetchContentData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/crm/content-management');
        if (!response.ok) throw new Error('Failed to fetch content data');
        const data = await response.json();
        setContentData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Failed to fetch content data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContentData();
  }, []);

  // L2 Sub-categories for Content Management
  const l2Categories = [
    { id: 'pending-approval', name: 'Pending Approval', icon: Icons.Clock, count: contentData?.stats.pending_count || 0 },
    { id: 'approved-content', name: 'Approved Content', icon: Icons.CheckCircle, count: contentData?.stats.approved_count || 0 },
    { id: 'rejected-content', name: 'Rejected Content', icon: Icons.XCircle, count: contentData?.stats.rejected_count || 0 },
    { id: 'content-categories', name: 'Content Categories', icon: Icons.FolderOpen, count: contentData?.stats.categories_count || 0 },
    { id: 'bulk-operations', name: 'Bulk Operations', icon: Icons.Package, count: 0 },
    { id: 'content-analytics', name: 'Content Analytics', icon: Icons.BarChart, count: 0 }
  ];

  const handleApproveContent = async (contentId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/crm/content/approve/${contentId}`, {
        method: 'POST'
      });
      if (response.ok) {
        // Refresh data
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to approve content:', err);
    }
  };

  const handleRejectContent = async (contentId: string, reason: string = 'Quality issues') => {
    try {
      const response = await fetch(`http://localhost:5000/api/crm/content/reject/${contentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (response.ok) {
        // Refresh data
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to reject content:', err);
    }
  };

  const renderL2Content = () => {
    const currentL2 = l2Categories.find(item => item.id === activeL2);
    if (!currentL2) return null;

    if (loading) {
      return (
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading content data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-300">Error loading content: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!contentData) return null;

    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <currentL2.icon size={32} className="text-blue-400" />
          <div>
            <h3 className="text-xl font-semibold text-white">{currentL2.name}</h3>
            <p className="text-gray-400">
              {currentL2.count > 0 ? `${currentL2.count} items` : 'No items'}
            </p>
          </div>
        </div>

        {/* Content based on selected L2 category */}
        {activeL2 === 'pending-approval' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-white">Recent Submissions</h4>
                <span className="text-sm bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">
                  {currentL2.count} pending
                </span>
              </div>
              <div className="space-y-3">
                {contentData.pending_approval.length > 0 ? (
                  contentData.pending_approval.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <h5 className="text-white font-medium">{item.title}</h5>
                        <p className="text-gray-400 text-sm">by {item.teacher} • {new Date(item.uploaded_at).toLocaleDateString()}</p>
                        <p className="text-gray-500 text-xs">{item.subject} • {item.grade_level}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                          {item.content_type}
                        </span>
                        <button
                          onClick={() => handleApproveContent(item.id)}
                          className="p-2 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30"
                          title="Approve content"
                        >
                          <Icons.CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleRejectContent(item.id)}
                          className="p-2 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30"
                          title="Reject content"
                        >
                          <Icons.XCircle size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Icons.CheckCircle size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
                    <p className="text-gray-400">No content pending approval</p>
                  </div>
                )}
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {activeL2 === 'approved-content' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-white">Approved Educational Content</h4>
                <span className="text-sm bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                  {currentL2.count} approved
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contentData.approved_content.length > 0 ? (
                  contentData.approved_content.slice(0, 9).map((item) => (
                    <div key={item.id} className="p-4 bg-white/5 rounded-lg">
                      <h5 className="text-white font-medium mb-2">{item.title}</h5>
                      <p className="text-gray-400 text-sm mb-1">{item.subject}</p>
                      <p className="text-gray-500 text-xs mb-3">{item.grade_level} • {item.content_type}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">by {item.teacher}</span>
                        <div className="flex items-center gap-1">
                          <Icons.Star size={14} className="text-yellow-400" />
                          <span className="text-gray-300">4.{Math.floor(Math.random() * 9) + 1}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        {new Date(item.uploaded_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <Icons.FolderOpen size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
                    <p className="text-gray-400">No approved content available</p>
                  </div>
                )}
              </div>
              {contentData.approved_content.length > 9 && (
                <div className="text-center mt-4">
                  <button className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">
                    Load More ({contentData.approved_content.length - 9} remaining)
                  </button>
                </div>
              )}
            </GlassmorphicContainer>
          </div>
        )}

        {activeL2 === 'rejected-content' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-white">Rejected Content</h4>
                <span className="text-sm bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                  {currentL2.count} rejected
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { title: 'Incomplete Math Quiz', reason: 'Missing answer key', teacher: 'Mr. Brown', date: '3 days ago' },
                  { title: 'Outdated Science Facts', reason: 'Information not current', teacher: 'Ms. Wilson', date: '1 week ago' }
                ].map((item, index) => (
                  <div key={index} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-white font-medium">{item.title}</h5>
                        <p className="text-red-300 text-sm">Reason: {item.reason}</p>
                        <p className="text-gray-400 text-sm">by {item.teacher} • {item.date}</p>
                      </div>
                      <button className="p-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">
                        <Icons.RotateCcw size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {activeL2 === 'content-categories' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-white">Content Categories</h4>
                <button className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">
                  <Icons.Plus size={16} className="inline mr-1" />
                  Add Category
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contentData.content_categories.length > 0 ? (
                  contentData.content_categories.map((category, index) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-white font-medium">{category.name}</h5>
                        <div className={`w-3 h-3 rounded-full bg-${category.color}-400`}></div>
                      </div>
                      <p className="text-gray-400 text-sm">{category.count} items</p>
                      <div className="mt-2 flex gap-2">
                        <button className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">
                          View
                        </button>
                        <button className="text-xs px-2 py-1 bg-gray-500/20 text-gray-300 rounded hover:bg-gray-500/30">
                          Edit
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <Icons.FolderOpen size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
                    <p className="text-gray-400">No categories found</p>
                    <p className="text-gray-500 text-sm mt-2">Categories will appear as content is uploaded</p>
                  </div>
                )}
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {(activeL2 === 'bulk-operations' || activeL2 === 'content-analytics') && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Icons.Clock size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
                  <p className="text-gray-400">Feature coming soon...</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {currentL2.name} functionality will be implemented here
                  </p>
                </div>
              </div>
            </GlassmorphicContainer>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex">
      {/* L2 Sidebar */}
      <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-4">Content Management</h3>
        <div className="space-y-1">
          {l2Categories.map((subcategory) => {
            const Icon = subcategory.icon;
            const isActive = activeL2 === subcategory.id;
            
            return (
              <button
                key={subcategory.id}
                onClick={() => setActiveL2(subcategory.id)}
                className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-500/20 border border-blue-400/30' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className={isActive ? 'text-blue-400' : 'text-gray-400'} />
                    <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                      {subcategory.name}
                    </span>
                  </div>
                  {subcategory.count > 0 && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                      {subcategory.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {renderL2Content()}
      </div>
    </div>
  );
};

export default ContentManagement;
