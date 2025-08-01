import React, { useState } from 'react';
import { Icons } from '../icons';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';

// Import CRM components
import ContentManagement from './crm/ContentManagement';
import UserAdministration from './crm/UserAdministration';
import AIMonitoring from './crm/AIMonitoring';
import SchoolAnalytics from './crm/SchoolAnalytics';
import SystemAdministration from './crm/SystemAdministration';
import CRMDashboard from './crm/CRMDashboard';
import StudentEnrollment from './crm/StudentEnrollment';
import ParentPortal from './crm/ParentPortal';
import CommunicationCenter from './crm/CommunicationCenter';
import FinancialManagement from './crm/FinancialManagement';

const CRMModule: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  // L1 Categories
  const l1Categories = [
    {
      id: 'dashboard',
      name: 'CRM Dashboard',
      icon: Icons.Dashboard,
      description: 'Overview of all school CRM activities and metrics',
      component: CRMDashboard
    },
    {
      id: 'student-enrollment',
      name: 'Student Enrollment',
      icon: Icons.GraduationCap,
      description: 'Manage applications, capacity, and enrollment processes',
      component: StudentEnrollment
    },
    {
      id: 'parent-portal',
      name: 'Parent Portal',
      icon: Icons.Users,
      description: 'Manage parent accounts, communications, and engagement',
      component: ParentPortal
    },
    {
      id: 'communication-center',
      name: 'Communication Center',
      icon: Icons.Chat,
      description: 'Manage messages, templates, and communication campaigns',
      component: CommunicationCenter
    },
    {
      id: 'financial-management',
      name: 'Financial Management',
      icon: Icons.CreditCard,
      description: 'Manage tuition, payments, financial aid, and budgets',
      component: FinancialManagement
    },
    {
      id: 'content-management',
      name: 'Content Management',
      icon: Icons.BookCopy,
      description: 'Approve and manage educational materials',
      component: ContentManagement
    },
    {
      id: 'user-administration',
      name: 'User Administration',
      icon: Icons.UserCog,
      description: 'Manage teachers, students, and roles',
      component: UserAdministration
    },
    {
      id: 'ai-monitoring',
      name: 'AI Monitoring',
      icon: Icons.BrainCircuit,
      description: 'Monitor concierge performance and usage analytics',
      component: AIMonitoring
    },
    {
      id: 'school-analytics',
      name: 'School Analytics',
      icon: Icons.Analytics,
      description: 'Track engagement, popular content, and learning outcomes',
      component: SchoolAnalytics
    },
    {
      id: 'system-administration',
      name: 'System Administration',
      icon: Icons.SystemSettings,
      description: 'Manage vector DB, AI models, and backups',
      component: SystemAdministration
    }
  ];

  const activeCategory = l1Categories.find(cat => cat.id === activeSection);
  const ActiveComponent = activeCategory?.component;

  // Debug logging
  console.log('Active section:', activeSection);
  console.log('Active category:', activeCategory);
  console.log('Active component:', ActiveComponent);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Icons.CRM size={32} className="text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">School CRM Dashboard</h1>
            <p className="text-gray-400">Comprehensive school management system</p>
          </div>
        </div>
        
        {/* Category Navigation */}
        <div className="flex gap-2 overflow-x-auto">
          {l1Categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeSection === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setActiveSection(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-500/20 border border-blue-400/30 text-white' 
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-blue-400' : 'text-gray-400'} />
                <span className="font-medium">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeSection === 'dashboard' && <CRMDashboard />}
        {activeSection === 'student-enrollment' && <StudentEnrollment />}
        {activeSection === 'parent-portal' && <ParentPortal />}
        {activeSection === 'communication-center' && <CommunicationCenter />}
        {activeSection === 'financial-management' && <FinancialManagement />}
        {activeSection === 'content-management' && <ContentManagement />}
        {activeSection === 'user-administration' && <UserAdministration />}
        {activeSection === 'ai-monitoring' && <AIMonitoring />}
        {activeSection === 'school-analytics' && <SchoolAnalytics />}
        {activeSection === 'system-administration' && <SystemAdministration />}
      </div>
    </div>
  );
};

export default CRMModule;
