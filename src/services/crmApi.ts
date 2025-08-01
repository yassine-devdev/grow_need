// CRM API Service for real data integration
export interface CRMApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StudentEnrollmentData {
  applications: Array<{
    id: string;
    student_name: string;
    grade: string;
    status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
    application_date: string;
    parent_contact: string;
    documents_complete: boolean;
    interview_scheduled: boolean;
    priority_score: number;
  }>;
  enrollment_stats: {
    total_applications: number;
    pending_review: number;
    approved: number;
    rejected: number;
    waitlisted: number;
    capacity_by_grade: Array<{grade: string; capacity: number; enrolled: number; available: number}>;
  };
  upcoming_deadlines: Array<{
    type: string;
    date: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface ParentPortalData {
  parent_accounts: Array<{
    id: string;
    parent_name: string;
    email: string;
    phone: string;
    students: Array<{name: string; grade: string; class: string}>;
    last_login: string;
    account_status: 'active' | 'inactive' | 'pending';
    communication_preferences: {
      email: boolean;
      sms: boolean;
      app_notifications: boolean;
    };
    engagement_score: number;
  }>;
  portal_stats: {
    total_parents: number;
    active_users: number;
    pending_activation: number;
    monthly_logins: number;
    avg_engagement: number;
  };
  recent_activities: Array<{
    parent_name: string;
    activity: string;
    timestamp: string;
    type: 'login' | 'message' | 'document' | 'payment' | 'event';
  }>;
  communication_logs: Array<{
    id: string;
    parent_name: string;
    subject: string;
    type: 'email' | 'sms' | 'notification';
    status: 'sent' | 'delivered' | 'read' | 'failed';
    sent_date: string;
  }>;
}

export interface CommunicationData {
  messages: Array<{
    id: string;
    sender: string;
    recipient: string;
    subject: string;
    message: string;
    timestamp: string;
    type: 'email' | 'sms' | 'notification' | 'announcement';
    status: 'sent' | 'delivered' | 'read' | 'failed';
    priority: 'high' | 'medium' | 'low';
    category: 'academic' | 'administrative' | 'emergency' | 'event' | 'general';
  }>;
  templates: Array<{
    id: string;
    name: string;
    subject: string;
    content: string;
    type: 'email' | 'sms' | 'notification';
    category: string;
    usage_count: number;
    last_used: string;
  }>;
  campaigns: Array<{
    id: string;
    name: string;
    type: 'email' | 'sms' | 'mixed';
    status: 'draft' | 'scheduled' | 'sending' | 'completed';
    recipients: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    scheduled_date: string;
  }>;
  stats: {
    total_messages: number;
    messages_today: number;
    delivery_rate: number;
    open_rate: number;
    response_rate: number;
  };
}

export interface FinancialData {
  tuition_payments: Array<{
    id: string;
    student_name: string;
    parent_name: string;
    amount: number;
    due_date: string;
    status: 'paid' | 'pending' | 'overdue' | 'partial';
    payment_method: string;
    transaction_id?: string;
    payment_date?: string;
  }>;
  financial_stats: {
    total_revenue: number;
    monthly_revenue: number;
    outstanding_balance: number;
    collection_rate: number;
    overdue_payments: number;
    total_students: number;
  };
  payment_plans: Array<{
    id: string;
    student_name: string;
    plan_type: 'monthly' | 'quarterly' | 'annual';
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    next_due_date: string;
    status: 'active' | 'completed' | 'defaulted';
  }>;
  financial_aid: Array<{
    id: string;
    student_name: string;
    aid_type: 'scholarship' | 'grant' | 'discount' | 'work_study';
    amount: number;
    percentage: number;
    status: 'approved' | 'pending' | 'denied';
    academic_year: string;
  }>;
  expense_categories: Array<{
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentage_used: number;
  }>;
}

export interface DashboardData {
  overview_stats: {
    total_students: number;
    total_parents: number;
    pending_applications: number;
    active_communications: number;
    monthly_revenue: number;
    overdue_payments: number;
    content_pending_approval: number;
    ai_interactions_today: number;
  };
  recent_activities: Array<{
    id: string;
    type: 'enrollment' | 'payment' | 'communication' | 'content' | 'ai_interaction';
    description: string;
    timestamp: string;
    user: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  quick_stats: {
    enrollment_rate: number;
    payment_collection_rate: number;
    parent_engagement: number;
    content_approval_rate: number;
    ai_satisfaction: number;
  };
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: string;
    action_required: boolean;
  }>;
  upcoming_deadlines: Array<{
    id: string;
    title: string;
    date: string;
    type: 'enrollment' | 'payment' | 'event' | 'report';
    priority: 'high' | 'medium' | 'low';
  }>;
}

class CRMApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  }

  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<CRMApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`CRM API Error (${endpoint}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Student Enrollment API
  async getStudentEnrollmentData(): Promise<CRMApiResponse<StudentEnrollmentData>> {
    return this.makeRequest<StudentEnrollmentData>('/crm/student-enrollment');
  }

  async createApplication(applicationData: any): Promise<CRMApiResponse<any>> {
    return this.makeRequest('/crm/student-enrollment/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async updateApplicationStatus(applicationId: string, status: string): Promise<CRMApiResponse<any>> {
    return this.makeRequest(`/crm/student-enrollment/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Parent Portal API
  async getParentPortalData(): Promise<CRMApiResponse<ParentPortalData>> {
    return this.makeRequest<ParentPortalData>('/crm/parent-portal');
  }

  async createParentAccount(parentData: any): Promise<CRMApiResponse<any>> {
    return this.makeRequest('/crm/parent-portal/accounts', {
      method: 'POST',
      body: JSON.stringify(parentData),
    });
  }

  async updateParentAccount(parentId: string, updateData: any): Promise<CRMApiResponse<any>> {
    return this.makeRequest(`/crm/parent-portal/accounts/${parentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async sendParentInvitation(parentId: string): Promise<CRMApiResponse<any>> {
    return this.makeRequest(`/crm/parent-portal/accounts/${parentId}/invite`, {
      method: 'POST',
    });
  }

  // Communication Center API
  async getCommunicationData(): Promise<CRMApiResponse<CommunicationData>> {
    return this.makeRequest<CommunicationData>('/crm/communication-center');
  }

  async sendMessage(messageData: any): Promise<CRMApiResponse<any>> {
    return this.makeRequest('/crm/communication-center/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async createTemplate(templateData: any): Promise<CRMApiResponse<any>> {
    return this.makeRequest('/crm/communication-center/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  }

  async createCampaign(campaignData: any): Promise<CRMApiResponse<any>> {
    return this.makeRequest('/crm/communication-center/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async launchCampaign(campaignId: string): Promise<CRMApiResponse<any>> {
    return this.makeRequest(`/crm/communication-center/campaigns/${campaignId}/launch`, {
      method: 'POST',
    });
  }

  // Financial Management API
  async getFinancialData(): Promise<CRMApiResponse<FinancialData>> {
    return this.makeRequest<FinancialData>('/crm/financial-management');
  }

  async recordPayment(paymentData: any): Promise<CRMApiResponse<any>> {
    return this.makeRequest('/crm/financial-management/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async createPaymentPlan(planData: any): Promise<CRMApiResponse<any>> {
    return this.makeRequest('/crm/financial-management/payment-plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async processFinancialAid(aidData: any): Promise<CRMApiResponse<any>> {
    return this.makeRequest('/crm/financial-management/financial-aid', {
      method: 'POST',
      body: JSON.stringify(aidData),
    });
  }

  async updateBudget(budgetData: any): Promise<CRMApiResponse<any>> {
    return this.makeRequest('/crm/financial-management/budget', {
      method: 'PATCH',
      body: JSON.stringify(budgetData),
    });
  }

  // Dashboard API
  async getDashboardData(): Promise<CRMApiResponse<DashboardData>> {
    return this.makeRequest<DashboardData>('/crm/dashboard');
  }

  async refreshDashboard(): Promise<CRMApiResponse<DashboardData>> {
    return this.makeRequest<DashboardData>('/crm/dashboard/refresh', {
      method: 'POST',
    });
  }

  async exportReport(reportType: string, filters?: any): Promise<CRMApiResponse<any>> {
    return this.makeRequest(`/crm/reports/${reportType}/export`, {
      method: 'POST',
      body: JSON.stringify(filters || {}),
    });
  }

  // Generic CRUD operations
  async create(endpoint: string, data: any): Promise<CRMApiResponse<any>> {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(endpoint: string, data: any): Promise<CRMApiResponse<any>> {
    return this.makeRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string): Promise<CRMApiResponse<any>> {
    return this.makeRequest(endpoint, {
      method: 'DELETE',
    });
  }

  async get<T>(endpoint: string): Promise<CRMApiResponse<T>> {
    return this.makeRequest<T>(endpoint);
  }
}

// Export singleton instance
export const crmApi = new CRMApiService();
export default crmApi;
