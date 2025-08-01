

import React, { useState, useMemo } from 'react';
import { Icons } from '../../../icons';
import GlassmorphicContainer from '../../../ui/GlassmorphicContainer';
import './school-hub-module.css';
import '../../ui/tooltip.css';

// Import all existing components
// School
import SchoolOverview from './school/Overview';
import Announcements from './school/Announcements';
import Calendar from './school/Calendar';
import Branding from './school/Branding';
// Administration
import StaffManagement from './administration/StaffManagement';
import Admissions from './administration/Admissions';
import SystemPrompts from './administration/SystemPrompts';
import UsageAnalytics from './administration/UsageAnalytics';
// Teacher
import TeacherHome from './teacher/Home'; // NEW
import MyClasses from './teacher/MyClasses';
import Gradebook from './teacher/Gradebook';
import Assignments from './teacher/Assignments';
import Attendance from './teacher/Attendance';
// Finance
import TuitionAndFees from './finance/TuitionAndFees';
import Invoicing from './finance/Invoicing';
import Payroll from './finance/Payroll';
import Budgeting from './finance/Budgeting';
// Marketing
import Campaigns from './marketing/Campaigns';
import LeadManagement from './marketing/LeadManagement';
import WebsiteAnalytics from './marketing/WebsiteAnalytics';
// Student
import StudentHome from './student/Home'; 
import MyProfile from './student/MyProfile';
import MyGrades from './student/MyGrades';
import MySchedule from './student/MySchedule';
import LibraryAccess from './student/LibraryAccess';
// Parent
import ParentHome from './parent/Home'; 
import LearningPulseTracker from './parent/LearningPulseTracker';
import ParentCommunication from './parent/ParentCommunication';
import Billing from './parent/Billing';
import SchoolEvents from './parent/SchoolEvents';

// Import all NEW feature components
// School
import PolicyGenerator from './school/PolicyGenerator';
import CommunityFeedbackAI from './school/CommunityFeedbackAI';
import EquityHeatmaps from './school/EquityHeatmaps';
import CultureClimateAnalysis from './school/CultureClimateAnalysis';
import InnovationEffectiveness from './school/InnovationEffectiveness';
import CurriculumAudit from './school/CurriculumAudit';
import InterventionTracker from './school/InterventionTracker';
import TeacherDevelopmentHub from './school/TeacherDevelopmentHub';
import PartnershipManagement from './school/PartnershipManagement';
import ScenarioPlanning from './school/ScenarioPlanning';
import GlobalScorecard from './school/GlobalScorecard';
import StaffWellness from './school/StaffWellness';
import LongTermPlanning from './school/LongTermPlanning';
import LeadershipHub from './school/LeadershipHub';
import DecisionSimulator from './school/DecisionSimulator';
import AlumniOutcomes from './school/AlumniOutcomes';
// Administration
import AcademicHealthMonitor from './administration/AcademicHealthMonitor';
import StaffLoadBalancer from './administration/StaffLoadBalancer';
import PredictiveAnalytics from './administration/PredictiveAnalytics';
import CrisisManagementHub from './administration/CrisisManagementHub';
import StudentManagement from './administration/StudentManagement';
import FacilityManagement from './administration/FacilityManagement';
import ComplianceReporting from './administration/ComplianceReporting';
import StrategicPlanning from './administration/StrategicPlanning';
import PolicyManagement from './administration/PolicyManagement';
import SchoolOperations from './administration/SchoolOperations';
import FinancialOversight from './administration/FinancialOversight';
import SecurityDashboard from './administration/SecurityDashboard';
// Teacher
import AIGrading from './teacher/AIGrading';
import SmartGapDetector from './teacher/SmartGapDetector';
import ContentGenerator from './teacher/ContentGenerator';
import CollaborationBoard from './teacher/CollaborationBoard';
import AutoRemediationPlans from './teacher/AutoRemediationPlans';
import LearningTargetTracker from './teacher/LearningTargetTracker';
import BehaviorDashboard from './teacher/BehaviorDashboard';
import IEPSupport from './teacher/IEPSupport';
import AssessmentBuilder from './teacher/AssessmentBuilder';
import ResourceHub from './teacher/ResourceHub';
import ExamGenerator from './teacher/ExamGenerator';
import StudentFeedbackAnalysis from './teacher/StudentFeedbackAnalysis';
import ClassroomTools from './teacher/ClassroomTools';
import PeerFeedback from './teacher/PeerFeedback';
import TeacherWellness from './teacher/TeacherWellness';
import SubstitutePortal from './teacher/SubstitutePortal';
import GlobalTeacherNetwork from './teacher/GlobalTeacherNetwork';
// Finance
import PredictiveBudgeting from './finance/PredictiveBudgeting';
import GrantManagement from './finance/GrantManagement';
import ComprehensiveExpenseManagement from './finance/ComprehensiveExpenseManagement';
import CostEfficiencyAISuggestions from './finance/CostEfficiencyAISuggestions';
import ProgramGrantROIAnalysis from './finance/ProgramGrantROIAnalysis';
import AdvancedFinancialForecasting from './finance/AdvancedFinancialForecasting';
import AuditComplianceMonitor from './finance/AuditComplianceMonitor';
import IntegratedFinancialAid from './finance/IntegratedFinancialAid';
import GrantWritingAssistant from './finance/GrantWritingAssistant';
import FundraisingPlatform from './finance/FundraisingPlatform';
import InvestmentTracker from './finance/InvestmentTracker';
import FinancialImpactAnalysis from './finance/FinancialImpactAnalysis';
// Marketing
import SocialMediaAI from './marketing/SocialMediaAI';
import EnrollmentForecasting from './marketing/EnrollmentForecasting';
import PersonaBasedCampaigns from './marketing/PersonaBasedCampaigns';
import SocialProofStream from './marketing/SocialProofStream';
import CampaignROITracker from './marketing/CampaignROITracker';
import GeoTargetedInsights from './marketing/GeoTargetedInsights';
import OmnichannelComms from './marketing/OmnichannelComms';
import LeadNurturing from './marketing/LeadNurturing';
import ReputationMonitoring from './marketing/ReputationMonitoring';
import CampaignSuccessPredictor from './marketing/CampaignSuccessPredictor';
import VirtualAdmissions from './marketing/VirtualAdmissions';
import AutomatedFollowUp from './marketing/AutomatedFollowUp';
import AITestimonialCuration from './marketing/AITestimonialCuration';
import CompetitiveIntelligence from './marketing/CompetitiveIntelligence';
import ARMarketing from './marketing/ARMarketing';
import AIEventPlanner from './marketing/AIEventPlanner';
import ClassroomRecordings from './marketing/ClassroomRecordings';
import VirtualFieldTrips from './marketing/VirtualFieldTrips';
import DocumentaryStreaming from './marketing/DocumentaryStreaming';
import EventRecordings from './marketing/EventRecordings';
import SportsHighlights from './marketing/SportsHighlights';
import PerformanceRecordings from './marketing/PerformanceRecordings';
import GraduationFootage from './marketing/GraduationFootage';
import PhotoGallery from './marketing/PhotoGallery';
// Student
import PersonalizedLearning from './student/PersonalizedLearning';
import AIStudyAssistant from './student/AIStudyAssistant';
import GrowthJournal from './student/GrowthJournal';
import GoalTracking from './student/GoalTracking';
import CommunityHubs from './student/CommunityHubs';
import CourseEnrollment from './student/CourseEnrollment';
import AssignmentTracking from './student/AssignmentTracking';
import ProgressMonitoring from './student/ProgressMonitoring';
import MyAttendance from './student/MyAttendance';
import Certificates from './student/Certificates';
import Exams from './student/Exams';
import StudyGroups from './student/StudyGroups';
import AcademicCalendar from './student/AcademicCalendar';
import ResourceRecommendations from './student/ResourceRecommendations';
import ProgressAnalytics from './student/ProgressAnalytics';
// Parent
import DailyDigest from './parent/DailyDigest';
import WellnessAlerts from './parent/WellnessAlerts';
import HomeworkSupport from './parent/HomeworkSupport';
import OpenFeedbackLoop from './parent/OpenFeedbackLoop';
import LiveConferences from './parent/LiveConferences';
import ParentalLearningHub from './parent/ParentalLearningHub';
import ParentAICoach from './parent/ParentAICoach';
import EmotionalHealthInsights from './parent/EmotionalHealthInsights';
import ChildSafety from './parent/ChildSafety';
import ParentCommunityHub from './parent/ParentCommunityHub';
import VolunteerHub from './parent/VolunteerHub';
import CafeteriaMenu from './parent/CafeteriaMenu';
import SchoolHandbook from './parent/SchoolHandbook';
import FinancialAid from './parent/FinancialAid';


type L1Tab = 'School' | 'Administration' | 'Teacher' | 'Finance' | 'Marketing' | 'Student' | 'Parent';

interface ReportItem {
  id: string;
  name: string;
  icon: React.ElementType;
  component: React.ComponentType;
}

const schoolHubData: Record<L1Tab, ReportItem[]> = {
  School: [
    { id: 'school.overview', name: 'Overview', icon: Icons.School, component: SchoolOverview },
    { id: 'school.announcements', name: 'Announcements', icon: Icons.News, component: Announcements },
    { id: 'school.calendar', name: 'Calendar', icon: Icons.Time, component: Calendar },
    { id: 'school.equity', name: 'Equity Heatmaps', icon: Icons.EquityHeatmaps, component: EquityHeatmaps },
    { id: 'school.culture', name: 'Culture & Climate Analysis', icon: Icons.CultureClimateAnalysis, component: CultureClimateAnalysis },
    { id: 'school.wellness', name: 'Staff Wellness Indicators', icon: Icons.StaffWellness, component: StaffWellness },
    { id: 'school.scenarioPlanning', name: 'Scenario Planning', icon: Icons.ScenarioPlanning, component: ScenarioPlanning },
    { id: 'school.innovation', name: 'School Innovation Metrics', icon: Icons.InnovationEffectiveness, component: InnovationEffectiveness },
    { id: 'school.longTermPlanning', name: 'Long-Term Program Planning', icon: Icons.LongTermPlanning, component: LongTermPlanning },
    { id: 'school.curriculumAudit', name: 'Curriculum Audit Tools', icon: Icons.CurriculumAudit, component: CurriculumAudit },
    { id: 'school.intervention', name: 'Intervention ROI Tracker', icon: Icons.InterventionTracker, component: InterventionTracker },
    { id: 'school.alumni', name: 'Alumni Outcomes Tracking', icon: Icons.AlumniOutcomes, component: AlumniOutcomes },
    { id: 'school.teacherDev', name: 'Teacher Development Hub', icon: Icons.TeacherDevelopment, component: TeacherDevelopmentHub },
    { id: 'school.decisionSimulator', name: 'Decision-Making Simulator', icon: Icons.DecisionSimulator, component: DecisionSimulator },
    { id: 'school.partnerships', name: 'Strategic Partnerships', icon: Icons.PartnershipManagement, component: PartnershipManagement },
    { id: 'school.leadershipHub', name: 'Intl. Leadership Hub', icon: Icons.LeadershipHub, component: LeadershipHub },
    { id: 'school.scorecard', name: 'Global School Scorecard', icon: Icons.GlobalScorecard, component: GlobalScorecard },
    { id: 'school.branding', name: 'Branding', icon: Icons.Branding, component: Branding },
    { id: 'school.policyGen', name: 'Policy Generator', icon: Icons.PolicyGenerator, component: PolicyGenerator },
    { id: 'school.feedback', name: 'Community Feedback AI', icon: Icons.FeedbackAI, component: CommunityFeedbackAI },
  ],
  Administration: [
    // High-level Dashboards
    { id: 'admin.operations', name: 'School Operations', icon: Icons.SchoolOperations, component: SchoolOperations },
    { id: 'admin.finance', name: 'Financial Oversight', icon: Icons.FinancialOversight, component: FinancialOversight },
    { id: 'admin.security', name: 'Security Dashboard', icon: Icons.SecurityDashboard, component: SecurityDashboard },
    // People Management
    { id: 'admin.staff', name: 'Staff Management', icon: Icons.Users, component: StaffManagement },
    { id: 'admin.students', name: 'Student Management', icon: Icons.StudentManagement, component: StudentManagement },
    { id: 'admin.admissions', name: 'Admissions', icon: Icons.User, component: Admissions },
    // Academic & Performance
    { id: 'admin.healthMonitor', name: 'Academic Health Monitor', icon: Icons.HealthMonitor, component: AcademicHealthMonitor },
    { id: 'admin.loadBalancer', name: 'Staff Load Balancer', icon: Icons.LoadBalancer, component: StaffLoadBalancer },
    // Resources & Planning
    { id: 'admin.facilities', name: 'Facility Management', icon: Icons.FacilityManagement, component: FacilityManagement },
    { id: 'admin.planning', name: 'Strategic Planning', icon: Icons.StrategicPlanning, component: StrategicPlanning },
    // Governance & Safety
    { id: 'admin.policy', name: 'Policy Management', icon: Icons.PolicyManagement, component: PolicyManagement },
    { id: 'admin.reporting', name: 'Compliance Reporting', icon: Icons.ComplianceReporting, component: ComplianceReporting },
    { id: 'admin.crisisHub', name: 'Crisis Management Hub', icon: Icons.CrisisHub, component: CrisisManagementHub },
    // System & Data
    { id: 'admin.analytics', name: 'Usage Analytics', icon: Icons.UsageAnalytics, component: UsageAnalytics },
    { id: 'admin.predictive', name: 'Predictive Analytics', icon: Icons.PredictiveAI, component: PredictiveAnalytics },
    { id: 'admin.prompts', name: 'System Prompts', icon: Icons.SystemPrompts, component: SystemPrompts },
  ],
  Teacher: [
    // Core Tools
    { id: 'teacher.home', name: 'Home', icon: Icons.Home, component: TeacherHome },
    { id: 'teacher.classes', name: 'My Classes', icon: Icons.Curriculum, component: MyClasses },
    { id: 'teacher.assignments', name: 'Assignments', icon: Icons.Office, component: Assignments },
    { id: 'teacher.attendance', name: 'Attendance', icon: Icons.ClipboardCheck, component: Attendance },
    { id: 'teacher.gradebook', name: 'Gradebook', icon: Icons.Curriculum, component: Gradebook },
    // Planning & Content
    { id: 'teacher.contentGen', name: 'Customized Content Generator', icon: Icons.ContentGen, component: ContentGenerator },
    { id: 'teacher.examGenerator', name: 'AI Exam Generator', icon: Icons.ExamGenerator, component: ExamGenerator },
    { id: 'teacher.assessmentBuilder', name: 'Formative Assessment Builder', icon: Icons.AssessmentBuilder, component: AssessmentBuilder },
    { id: 'teacher.learningTargetTracker', name: 'Learning Target Tracker', icon: Icons.LearningTarget, component: LearningTargetTracker },
    // Assessment & Feedback
    { id: 'teacher.aiGrading', name: 'AI-Assisted Grading & Feedback', icon: Icons.AIGrading, component: AIGrading },
    { id: 'teacher.studentFeedbackAnalysis', name: 'Student Feedback Analysis', icon: Icons.FeedbackAnalysis, component: StudentFeedbackAnalysis },
    // Student Support
    { id: 'teacher.gapDetector', name: 'Smart Gap Detector', icon: Icons.GapDetector, component: SmartGapDetector },
    { id: 'teacher.remediationPlans', name: 'Auto-Remediation Plans', icon: Icons.RemediationPlans, component: AutoRemediationPlans },
    { id: 'teacher.behaviorDashboard', name: 'Behavior Dashboard', icon: Icons.BehaviorDashboard, component: BehaviorDashboard },
    { id: 'teacher.iepSupport', name: 'IEP/504 Support', icon: Icons.IEPSupport, component: IEPSupport },
    // Collaboration & Tools
    { id: 'teacher.collabBoard', name: 'Real-Time Collaboration Board', icon: Icons.CollabBoard, component: CollaborationBoard },
    { id: 'teacher.resourceHub', name: 'Shared Resource Hub', icon: Icons.ResourceHub, component: ResourceHub },
    { id: 'teacher.classroomTools', name: 'Interactive Classroom Tools', icon: Icons.ClassroomTools, component: ClassroomTools },
    // Professional Growth
    { id: 'teacher.peerFeedback', name: 'Peer Feedback System', icon: Icons.PeerFeedback, component: PeerFeedback },
    { id: 'teacher.substitutePortal', name: 'Substitute Teacher Portal', icon: Icons.SubstitutePortal, component: SubstitutePortal },
    { id: 'teacher.globalNetwork', name: 'Global Teacher Network', icon: Icons.GlobalTeacherNetwork, component: GlobalTeacherNetwork },
    { id: 'teacher.wellness', name: 'Teacher Wellness Resources', icon: Icons.TeacherWellness, component: TeacherWellness },
  ],
  Finance: [
    { id: 'finance.tuition', name: 'Tuition & Fees', icon: Icons.Finance, component: TuitionAndFees },
    { id: 'finance.invoicing', name: 'Invoicing', icon: Icons.Office, component: Invoicing },
    { id: 'finance.payroll', name: 'Payroll', icon: Icons.Finance, component: Payroll },
    { id: 'finance.budgeting', name: 'Budgeting', icon: Icons.Marketing, component: Budgeting },
    { id: 'finance.predictiveBudgeting', name: 'Predictive Budgeting', icon: Icons.PredictiveBudgeting, component: PredictiveBudgeting },
    { id: 'finance.grants', name: 'Grant Management', icon: Icons.GrantManagement, component: GrantManagement },
    { id: 'finance.expenseManagement', name: 'Expense Management', icon: Icons.ExpenseManagement, component: ComprehensiveExpenseManagement },
    { id: 'finance.costEfficiencyAI', name: 'Cost Efficiency AI', icon: Icons.CostEfficiencyAI, component: CostEfficiencyAISuggestions },
    { id: 'finance.programGrantROI', name: 'Program & Grant ROI', icon: Icons.ProgramGrantROI, component: ProgramGrantROIAnalysis },
    { id: 'finance.financialForecasting', name: 'Advanced Forecasting', icon: Icons.FinancialForecasting, component: AdvancedFinancialForecasting },
    { id: 'finance.auditCompliance', name: 'Audit Compliance', icon: Icons.AuditCompliance, component: AuditComplianceMonitor },
    { id: 'finance.financialAid', name: 'Financial Aid Mgmt', icon: Icons.FinancialAid, component: IntegratedFinancialAid },
    { id: 'finance.grantWriting', name: 'Grant Writing Asst', icon: Icons.GrantWriter, component: GrantWritingAssistant },
    { id: 'finance.fundraising', name: 'Fundraising Platform', icon: Icons.Fundraising, component: FundraisingPlatform },
    { id: 'finance.investmentTracker', name: 'Investment Tracker', icon: Icons.InvestmentTracker, component: InvestmentTracker },
    { id: 'finance.financialImpact', name: 'Financial Impact Tool', icon: Icons.FinancialImpact, component: FinancialImpactAnalysis },
  ],
  Marketing: [
    { id: 'marketing.campaigns', name: 'Campaigns', icon: Icons.Marketing, component: Campaigns },
    { id: 'marketing.leads', name: 'Lead Management', icon: Icons.Users, component: LeadManagement },
    { id: 'marketing.web', name: 'Website Analytics', icon: Icons.Analytics, component: WebsiteAnalytics },
    { id: 'marketing.social', name: 'Social Media AI', icon: Icons.SocialMediaAI, component: SocialMediaAI },
    { id: 'marketing.forecasting', name: 'Enrollment Forecasting', icon: Icons.EnrollmentForecasting, component: EnrollmentForecasting },
    { id: 'marketing.personaEngine', name: 'Persona-Based Engine', icon: Icons.PersonaCampaigns, component: PersonaBasedCampaigns },
    { id: 'marketing.socialProof', name: 'Social Proof Stream', icon: Icons.SocialProof, component: SocialProofStream },
    { id: 'marketing.roiTracker', name: 'Campaign ROI Tracker', icon: Icons.CampaignROI, component: CampaignROITracker },
    { id: 'marketing.geoInsights', name: 'Geo-Targeted Insights', icon: Icons.GeoInsights, component: GeoTargetedInsights },
    { id: 'marketing.omnichannel', name: 'Omnichannel Engine', icon: Icons.Omnichannel, component: OmnichannelComms },
    { id: 'marketing.leadNurturing', name: 'Lead Nurturing', icon: Icons.LeadNurturing, component: LeadNurturing },
    { id: 'marketing.reputation', name: 'Reputation Monitoring', icon: Icons.Reputation, component: ReputationMonitoring },
    { id: 'marketing.predictor', name: 'Success Predictor', icon: Icons.CampaignPredictor, component: CampaignSuccessPredictor },
    { id: 'marketing.virtualEvents', name: 'Virtual Admissions', icon: Icons.VirtualAdmissions, component: VirtualAdmissions },
    { id: 'marketing.followUp', name: 'Automated Follow-Up', icon: Icons.AutomatedFollowUp, component: AutomatedFollowUp },
    { id: 'marketing.testimonials', name: 'AI Testimonial Curation', icon: Icons.AITestimonials, component: AITestimonialCuration },
    { id: 'marketing.intel', name: 'Competitive Intel', icon: Icons.CompetitiveIntel, component: CompetitiveIntelligence },
    { id: 'marketing.ar', name: 'AR Marketing', icon: Icons.ARMarketing, component: ARMarketing },
    { id: 'marketing.eventPlanner', name: 'AI Event Planner', icon: Icons.AIEventPlanner, component: AIEventPlanner },
    { id: 'marketing.classroomRecordings', name: 'Classroom Recordings', icon: Icons.ClassroomRecording, component: ClassroomRecordings },
    { id: 'marketing.virtualTrips', name: 'Virtual Field Trips', icon: Icons.VirtualFieldTrip, component: VirtualFieldTrips },
    { id: 'marketing.streaming', name: 'Documentary Streaming', icon: Icons.DocumentaryStreaming, component: DocumentaryStreaming },
    { id: 'marketing.eventRecordings', name: 'Event Recordings', icon: Icons.EventRecording, component: EventRecordings },
    { id: 'marketing.sports', name: 'Sports Highlights', icon: Icons.SportsHighlights, component: SportsHighlights },
    { id: 'marketing.performances', name: 'Performance Recordings', icon: Icons.PerformanceRecording, component: PerformanceRecordings },
    { id: 'marketing.graduation', name: 'Graduation Footage', icon: Icons.GraduationFootage, component: GraduationFootage },
    { id: 'marketing.gallery', name: 'Photo Gallery', icon: Icons.PhotoGallery, component: PhotoGallery },
  ],
  Student: [
    // Core Academics & Tracking
    { id: 'student.home', name: 'Home', icon: Icons.Home, component: StudentHome },
    { id: 'student.profile', name: 'My Profile', icon: Icons.User, component: MyProfile },
    { id: 'student.schedule', name: 'My Schedule', icon: Icons.CalendarDays, component: MySchedule },
    { id: 'student.calendar', name: 'Academic Calendar', icon: Icons.CalendarDays, component: AcademicCalendar },
    { id: 'student.attendance', name: 'My Attendance', icon: Icons.ClipboardCheck, component: MyAttendance },
    { id: 'student.grades', name: 'My Grades', icon: Icons.GraduationCap, component: MyGrades },
    { id: 'student.progress', name: 'Progress Monitoring', icon: Icons.TrendingUp, component: ProgressMonitoring },
    { id: 'student.analytics', name: 'Progress Analytics', icon: Icons.PieChart, component: ProgressAnalytics },

    // Courses, Assignments & Exams
    { id: 'student.enrollment', name: 'Course Enrollment', icon: Icons.PlusCircle, component: CourseEnrollment },
    { id: 'student.assignments', name: 'Assignments', icon: Icons.ClipboardCheck, component: AssignmentTracking },
    { id: 'student.exams', name: 'Exams & Results', icon: Icons.FileText, component: Exams },
    { id: 'student.certificates', name: 'Certificates', icon: Icons.Award, component: Certificates },
    
    // Learning & Collaboration
    { id: 'student.library', name: 'Library Access', icon: Icons.Library, component: LibraryAccess },
    { id: 'student.aiAssistant', name: 'AI Study Assistant', icon: Icons.AIHelper, component: AIStudyAssistant },
    { id: 'student.resources', name: 'Resource Recommendations', icon: Icons.Lightbulb, component: ResourceRecommendations },
    { id: 'student.learningPath', name: 'Personalized Learning', icon: Icons.LearningPath, component: PersonalizedLearning },
    { id: 'student.groups', name: 'Study Groups', icon: Icons.Users, component: StudyGroups },
    { id: 'student.hubs', name: 'Community Hubs', icon: Icons.CommunityHubs, component: CommunityHubs },

    // Personal Development
    { id: 'student.journal', name: 'Growth Journal', icon: Icons.GrowthJournal, component: GrowthJournal },
    { id: 'student.goals', name: 'Goal Tracking', icon: Icons.Goal, component: GoalTracking },
  ],
  Parent: [
    { id: 'parent.home', name: 'Home', icon: Icons.Home, component: ParentHome },
    { id: 'parent.progress', name: 'Learning Pulse Tracker', icon: Icons.LearningPulseTracker, component: LearningPulseTracker },
    { id: 'parent.communication', name: 'Real-Time Communication', icon: Icons.ParentComms, component: ParentCommunication },
    { id: 'parent.homework', name: 'Homework Support & AI Coach', icon: Icons.HomeworkSupport, component: HomeworkSupport },
    { id: 'parent.wellness', name: 'AI Behavior & Wellness Alerts', icon: Icons.WellnessAlerts, component: WellnessAlerts },
    { id: 'parent.emotionalHealth', name: 'Emotional Health Insights', icon: Icons.EmotionalHealthInsights, component: EmotionalHealthInsights },
    { id: 'parent.safety', name: 'Child Safety & Permissions', icon: Icons.ChildSafety, component: ChildSafety },
    { id: 'parent.billing', name: 'Billing & Payments', icon: Icons.Finance, component: Billing },
    { id: 'parent.events', name: 'School Events', icon: Icons.News, component: SchoolEvents },
    { id: 'parent.liveEvents', name: 'Live Conferences', icon: Icons.LiveConferences, component: LiveConferences },
    { id: 'parent.feedback', name: 'Open Feedback Loop', icon: Icons.OpenFeedbackLoop, component: OpenFeedbackLoop },
    { id: 'parent.learningHub', name: 'Parental Learning Hub', icon: Icons.ParentalLearningHub, component: ParentalLearningHub },
    { id: 'parent.aiCoach', name: 'Parent AI Coach', icon: Icons.ParentAICoach, component: ParentAICoach },
    { id: 'parent.community', name: 'Parenting Community Hub', icon: Icons.Users, component: ParentCommunityHub },
    { id: 'parent.volunteer', name: 'Volunteer Opportunities', icon: Icons.VolunteerHub, component: VolunteerHub },
    { id: 'parent.cafeteria', name: 'Cafeteria Menu & Account', icon: Icons.CafeteriaMenu, component: CafeteriaMenu },
    { id: 'parent.handbook', name: 'School Handbook', icon: Icons.SchoolHandbook, component: SchoolHandbook },
    { id: 'parent.financialAid', name: 'Financial Aid Access', icon: Icons.FinancialAid, component: FinancialAid },
    { id: 'parent.digest', name: 'Daily Digest', icon: Icons.DailyDigest, component: DailyDigest },
  ],
};

const L1_TABS: { id: L1Tab; name: string; icon: React.ReactNode }[] = [
  { id: 'School', name: 'School', icon: <Icons.School size={18} /> },
  { id: 'Administration', name: 'Administration', icon: <Icons.Administration size={18} /> },
  { id: 'Teacher', name: 'Teacher', icon: <Icons.Students size={18} /> },
  { id: 'Finance', name: 'Finance', icon: <Icons.Finance size={18} /> },
  { id: 'Marketing', name: 'Marketing', icon: <Icons.Marketing size={18} /> },
  { id: 'Student', name: 'Student', icon: <Icons.Students size={18} /> },
  { id: 'Parent', name: 'Parent', icon: <Icons.Users size={18} /> },
];

const SchoolHubModule: React.FC = () => {
  const [activeL1, setActiveL1] = useState<L1Tab>('Parent');
  const [activeReportId, setActiveReportId] = useState<string>(schoolHubData.Parent[0].id);

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
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shrink-0 ${activeL1 === tab.id ? 'bg-purple-600/50 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
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
                        <div className="nav-tooltip-bordered absolute left-full ml-4 top-1/2 -translate-y-1/2">
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