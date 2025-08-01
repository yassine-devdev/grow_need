import React, { useState } from 'react';
import { Icons } from '../../icons';
import GlassmorphicContainer from '../../ui/GlassmorphicContainer';

const SystemAdministration: React.FC = () => {
  const [activeL2, setActiveL2] = useState<string>('vector-database');

  // L2 Sub-categories for System Administration
  const l2Categories = [
    { id: 'vector-database', name: 'Vector Database', icon: Icons.Database, count: 0 },
    { id: 'ai-models', name: 'AI Models', icon: Icons.Cpu, count: 3 },
    { id: 'system-backups', name: 'System Backups', icon: Icons.HardDrive, count: 7 },
    { id: 'system-health', name: 'System Health', icon: Icons.Activity, count: 0 },
    { id: 'api-monitoring', name: 'API Monitoring', icon: Icons.Wifi, count: 0 },
    { id: 'maintenance-logs', name: 'Maintenance Logs', icon: Icons.FileText, count: 45 }
  ];

  const renderL2Content = () => {
    const currentL2 = l2Categories.find(item => item.id === activeL2);
    if (!currentL2) return null;

    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <currentL2.icon size={32} className="text-blue-400" />
          <div>
            <h3 className="text-xl font-semibold text-white">{currentL2.name}</h3>
            <p className="text-gray-400">
              {currentL2.count > 0 ? `${currentL2.count} items` : 'System management'}
            </p>
          </div>
        </div>

        {/* Content based on selected L2 category */}
        {activeL2 === 'vector-database' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <h4 className="text-lg font-semibold text-white mb-4">Vector Database Management</h4>
              
              {/* Database Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Total Documents', value: '2,847', icon: Icons.FileText, status: 'healthy' },
                  { label: 'Collections', value: '5', icon: Icons.FolderOpen, status: 'healthy' },
                  { label: 'Storage Used', value: '1.2 GB', icon: Icons.HardDrive, status: 'healthy' }
                ].map((metric, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <metric.icon size={20} className="text-blue-400" />
                      <span className="text-gray-400 text-sm">{metric.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-white">{metric.value}</p>
                      <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Collections Overview */}
              <div>
                <h5 className="text-white font-medium mb-3">Collections Status</h5>
                <div className="space-y-3">
                  {[
                    { name: 'educational_content', documents: 1247, size: '456 MB', lastUpdate: '2 hours ago' },
                    { name: 'lesson_plans', documents: 892, size: '234 MB', lastUpdate: '4 hours ago' },
                    { name: 'student_work', documents: 456, size: '189 MB', lastUpdate: '1 day ago' },
                    { name: 'assessments', documents: 234, size: '123 MB', lastUpdate: '3 days ago' },
                    { name: 'parent_communications', documents: 18, size: '12 MB', lastUpdate: '1 week ago' }
                  ].map((collection, index) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h6 className="text-white font-medium">{collection.name}</h6>
                        <div className="flex gap-2">
                          <button className="p-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">
                            <Icons.RefreshCw size={14} />
                          </button>
                          <button className="p-1 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30">
                            <Icons.Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Documents</p>
                          <p className="text-gray-300">{collection.documents.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Size</p>
                          <p className="text-gray-300">{collection.size}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Last Update</p>
                          <p className="text-gray-300">{collection.lastUpdate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Database Actions */}
              <div className="mt-6">
                <h5 className="text-white font-medium mb-3">Database Actions</h5>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">
                    <Icons.RefreshCw size={16} className="inline mr-2" />
                    Refresh Index
                  </button>
                  <button className="px-4 py-2 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30">
                    <Icons.Download size={16} className="inline mr-2" />
                    Backup Now
                  </button>
                  <button className="px-4 py-2 bg-orange-500/20 text-orange-300 rounded hover:bg-orange-500/30">
                    <Icons.Settings size={16} className="inline mr-2" />
                    Optimize
                  </button>
                </div>
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {activeL2 === 'ai-models' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <h4 className="text-lg font-semibold text-white mb-4">AI Models Management</h4>
              
              {/* Active Models */}
              <div className="space-y-4">
                {[
                  { 
                    name: 'qwen2.5:3b-instruct', 
                    type: 'Language Model', 
                    status: 'Running', 
                    memory: '2.1 GB', 
                    cpu: '15%',
                    uptime: '7 days',
                    requests: '45,892'
                  },
                  { 
                    name: 'nomic-embed-text', 
                    type: 'Embedding Model', 
                    status: 'Running', 
                    memory: '512 MB', 
                    cpu: '5%',
                    uptime: '7 days',
                    requests: '12,456'
                  },
                  { 
                    name: 'llama3.2:1b', 
                    type: 'Language Model', 
                    status: 'Stopped', 
                    memory: '0 MB', 
                    cpu: '0%',
                    uptime: '-',
                    requests: '0'
                  }
                ].map((model, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="text-white font-medium">{model.name}</h5>
                        <p className="text-gray-400 text-sm">{model.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          model.status === 'Running' 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-gray-500/20 text-gray-300'
                        }`}>
                          {model.status}
                        </span>
                        <button className="p-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">
                          {model.status === 'Running' ? <Icons.Square size={14} /> : <Icons.Play size={14} />}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Memory</p>
                        <p className="text-gray-300">{model.memory}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">CPU</p>
                        <p className="text-gray-300">{model.cpu}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Uptime</p>
                        <p className="text-gray-300">{model.uptime}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Requests</p>
                        <p className="text-gray-300">{model.requests}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Model Actions */}
              <div className="mt-6">
                <h5 className="text-white font-medium mb-3">Model Management</h5>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">
                    <Icons.Download size={16} className="inline mr-2" />
                    Pull Model
                  </button>
                  <button className="px-4 py-2 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30">
                    <Icons.RefreshCw size={16} className="inline mr-2" />
                    Restart All
                  </button>
                  <button className="px-4 py-2 bg-orange-500/20 text-orange-300 rounded hover:bg-orange-500/30">
                    <Icons.Settings size={16} className="inline mr-2" />
                    Configure
                  </button>
                </div>
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {activeL2 === 'system-backups' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">System Backups</h4>
                <button className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">
                  <Icons.Plus size={16} className="inline mr-1" />
                  Create Backup
                </button>
              </div>

              {/* Backup Schedule */}
              <div className="mb-6">
                <h5 className="text-white font-medium mb-3">Backup Schedule</h5>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Automatic Daily Backup</p>
                      <p className="text-gray-400 text-sm">Every day at 2:00 AM</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">Active</span>
                      <button className="p-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">
                        <Icons.Settings size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Backups */}
              <div>
                <h5 className="text-white font-medium mb-3">Recent Backups</h5>
                <div className="space-y-3">
                  {[
                    { 
                      name: 'backup_20250131_020000', 
                      type: 'Automatic', 
                      size: '2.4 GB', 
                      created: '6 hours ago',
                      status: 'Complete'
                    },
                    { 
                      name: 'backup_20250130_020000', 
                      type: 'Automatic', 
                      size: '2.3 GB', 
                      created: '1 day ago',
                      status: 'Complete'
                    },
                    { 
                      name: 'backup_20250129_143000', 
                      type: 'Manual', 
                      size: '2.3 GB', 
                      created: '2 days ago',
                      status: 'Complete'
                    },
                    { 
                      name: 'backup_20250129_020000', 
                      type: 'Automatic', 
                      size: '2.2 GB', 
                      created: '2 days ago',
                      status: 'Complete'
                    },
                    { 
                      name: 'backup_20250128_020000', 
                      type: 'Automatic', 
                      size: '2.1 GB', 
                      created: '3 days ago',
                      status: 'Complete'
                    }
                  ].map((backup, index) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="text-white font-medium">{backup.name}</h6>
                          <p className="text-gray-400 text-sm">{backup.type} backup • {backup.size} • {backup.created}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                            {backup.status}
                          </span>
                          <button className="p-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">
                            <Icons.Download size={16} />
                          </button>
                          <button className="p-2 bg-orange-500/20 text-orange-300 rounded hover:bg-orange-500/30">
                            <Icons.RotateCcw size={16} />
                          </button>
                          <button className="p-2 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30">
                            <Icons.Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {activeL2 === 'system-health' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <h4 className="text-lg font-semibold text-white mb-4">System Health Monitor</h4>
              
              {/* Health Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Overall Health', value: '98%', status: 'excellent', icon: Icons.Heart },
                  { label: 'Uptime', value: '99.9%', status: 'excellent', icon: Icons.Clock },
                  { label: 'Response Time', value: '1.2s', status: 'good', icon: Icons.Zap },
                  { label: 'Error Rate', value: '0.1%', status: 'excellent', icon: Icons.AlertTriangle }
                ].map((metric, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <metric.icon size={20} className={
                        metric.status === 'excellent' ? 'text-green-400' : 
                        metric.status === 'good' ? 'text-yellow-400' : 'text-red-400'
                      } />
                      <span className="text-gray-400 text-sm">{metric.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                  </div>
                ))}
              </div>

              {/* Service Status */}
              <div>
                <h5 className="text-white font-medium mb-3">Service Status</h5>
                <div className="space-y-3">
                  {[
                    { service: 'React Application', status: 'Healthy', uptime: '99.9%', port: '5174' },
                    { service: 'Ollama API', status: 'Healthy', uptime: '99.8%', port: '11434' },
                    { service: 'Vector Database', status: 'Healthy', uptime: '99.9%', port: '5000' },
                    { service: 'Enhanced AI Service', status: 'Healthy', uptime: '99.7%', port: 'Internal' }
                  ].map((service, index) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="text-white font-medium">{service.service}</h6>
                          <p className="text-gray-400 text-sm">Port: {service.port} • Uptime: {service.uptime}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                          <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                            {service.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {activeL2 === 'maintenance-logs' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Maintenance Logs</h4>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">
                    <Icons.Filter size={16} className="inline mr-1" />
                    Filter
                  </button>
                  <button className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded hover:bg-gray-500/30">
                    <Icons.Download size={16} className="inline mr-1" />
                    Export
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { 
                    type: 'System Update', 
                    message: 'Vector database optimized successfully', 
                    timestamp: '2025-01-31 14:30:00',
                    severity: 'info',
                    duration: '5 minutes'
                  },
                  { 
                    type: 'Backup', 
                    message: 'Automatic backup completed', 
                    timestamp: '2025-01-31 02:00:00',
                    severity: 'success',
                    duration: '12 minutes'
                  },
                  { 
                    type: 'Model Update', 
                    message: 'AI model restarted due to memory optimization', 
                    timestamp: '2025-01-30 16:45:00',
                    severity: 'warning',
                    duration: '2 minutes'
                  },
                  { 
                    type: 'Security Scan', 
                    message: 'Weekly security scan completed - no issues found', 
                    timestamp: '2025-01-30 03:00:00',
                    severity: 'success',
                    duration: '45 minutes'
                  },
                  { 
                    type: 'Database Cleanup', 
                    message: 'Removed 156 expired temporary files', 
                    timestamp: '2025-01-29 23:30:00',
                    severity: 'info',
                    duration: '8 minutes'
                  }
                ].map((log, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    log.severity === 'success' ? 'bg-green-500/10 border-green-500/20' :
                    log.severity === 'warning' ? 'bg-orange-500/10 border-orange-500/20' :
                    log.severity === 'error' ? 'bg-red-500/10 border-red-500/20' :
                    'bg-blue-500/10 border-blue-500/20'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.severity === 'success' ? 'bg-green-500/20 text-green-300' :
                          log.severity === 'warning' ? 'bg-orange-500/20 text-orange-300' :
                          log.severity === 'error' ? 'bg-red-500/20 text-red-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {log.type}
                        </span>
                        <span className="text-white font-medium">{log.message}</span>
                      </div>
                      <span className="text-gray-400 text-sm">{log.duration}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{log.timestamp}</p>
                  </div>
                ))}
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {(activeL2 === 'api-monitoring') && (
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
        <h3 className="text-lg font-semibold text-white mb-4">System Administration</h3>
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

export default SystemAdministration;
