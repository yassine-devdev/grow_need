
import React, { useState, useMemo } from 'react';
import { Icons } from '../icons';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';
import './school-hub-module.css';
import '../ui/tooltip.css';
import { L1_TABS, schoolHubData, L1Tab } from './school-hub/constants';

const SchoolHubModule: React.FC = () => {
  const [activeL1, setActiveL1] = useState<L1Tab>('Teacher');
  const [activeReportId, setActiveReportId] = useState<string>(schoolHubData.Teacher[0].id);

  const handleL1Click = (tabId: L1Tab) => {
    setActiveL1(tabId);
    setActiveReportId(schoolHubData[tabId][0].id);
  };

  const l2Reports = useMemo(() => schoolHubData[activeL1], [activeL1]);

  const ActiveComponent = useMemo(() => {
    return l2Reports.find(r => r.id === activeReportId)?.component || null;
  }, [l2Reports, activeReportId]);
  
  return (
    <GlassmorphicContainer className="school-hub-module-bordered w-full h-full flex flex-col rounded-2xl overflow-hidden">
      {/* Level 1 Header Navigation */}
      <div className="flex items-center gap-2 p-2 shrink-0 school-hub-header-bordered overflow-x-auto">
        {L1_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleL1Click(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shrink-0 ${activeL1 === tab.id ? 'active text-white' : 'text-gray-400'}`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      <div className="school-hub-body">
        {/* Level 2 Icon Sidebar */}
        <div className="school-hub-l2-sidebar">
            {l2Reports.map(report => {
                const Icon = report.icon;
                return (
                    <div key={report.id} className="relative group">
                        <button
                            onClick={() => setActiveReportId(report.id)}
                            className={`school-hub-l2-button ${activeReportId === report.id ? 'active' : ''}`}
                            aria-label={report.name}
                        >
                            <Icon size={24} />
                        </button>
                        <div className="nav-tooltip-bordered absolute start-full ms-4 top-1/2 -translate-y-1/2">
                            {report.name}
                        </div>
                    </div>
                );
            })}
        </div>
        
        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto">
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="flex items-center justify-center h-full text-center text-gray-500">
                <p>Please select a report.</p>
            </div>
          )}
        </main>
      </div>
    </GlassmorphicContainer>
  );
};

export default SchoolHubModule;