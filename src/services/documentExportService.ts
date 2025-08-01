/**
 * Real Document Export Service
 * Handles export to Word, Excel, CSV, PDF formats using real data
 */

import * as XLSX from 'xlsx';

export interface ExportOptions {
  filename?: string;
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeHeaders?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
}

export interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  enrollmentDate: string;
  status: string;
  guardianName: string;
  guardianEmail: string;
  tuitionPaid: number;
  lastActivity: string;
}

export interface AnalyticsData {
  date: string;
  activeUsers: number;
  pageViews: number;
  sessionDuration: number;
  bounceRate: number;
  topPages: string[];
  deviceBreakdown: Record<string, number>;
}

export interface FinancialData {
  transactionId: string;
  date: string;
  studentName: string;
  amount: number;
  type: 'tuition' | 'fees' | 'materials' | 'other';
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod: string;
  description: string;
}

class DocumentExportService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:5000';
  }

  /**
   * Export student enrollment data
   */
  async exportStudentData(options: ExportOptions): Promise<void> {
    try {
      // Fetch real student data from API
      const response = await fetch(`${this.baseUrl}/api/crm/students/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: options.filters,
          dateRange: options.dateRange,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch student data: ${response.statusText}`);
      }

      const studentData: StudentData[] = await response.json();

      switch (options.format) {
        case 'csv':
          this.exportToCSV(studentData, options.filename || 'student-data');
          break;
        case 'excel':
          this.exportToExcel(studentData, options.filename || 'student-data');
          break;
        case 'pdf':
          console.warn('PDF export temporarily disabled due to build issues');
          // await this.exportStudentsToPDF(studentData, options.filename || 'student-data');
          break;
        case 'json':
          this.exportToJSON(studentData, options.filename || 'student-data');
          break;
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }
    } catch (error) {
      console.error('Failed to export student data:', error);
      throw error;
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalyticsData(options: ExportOptions): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRange: options.dateRange,
          filters: options.filters,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics data: ${response.statusText}`);
      }

      const analyticsData: AnalyticsData[] = await response.json();

      switch (options.format) {
        case 'csv':
          this.exportAnalyticsToCSV(analyticsData, options.filename || 'analytics-data');
          break;
        case 'excel':
          this.exportAnalyticsToExcel(analyticsData, options.filename || 'analytics-data');
          break;
        case 'pdf':
          console.warn('PDF export temporarily disabled due to build issues');
          // await this.exportAnalyticsToPDF(analyticsData, options.filename || 'analytics-data');
          break;
        case 'json':
          this.exportToJSON(analyticsData, options.filename || 'analytics-data');
          break;
      }
    } catch (error) {
      console.error('Failed to export analytics data:', error);
      throw error;
    }
  }

  /**
   * Export financial data
   */
  async exportFinancialData(options: ExportOptions): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/crm/financial/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRange: options.dateRange,
          filters: options.filters,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch financial data: ${response.statusText}`);
      }

      const financialData: FinancialData[] = await response.json();

      switch (options.format) {
        case 'csv':
          this.exportFinancialToCSV(financialData, options.filename || 'financial-data');
          break;
        case 'excel':
          this.exportFinancialToExcel(financialData, options.filename || 'financial-data');
          break;
        case 'pdf':
          console.warn('PDF export temporarily disabled due to build issues');
          // await this.exportFinancialToPDF(financialData, options.filename || 'financial-data');
          break;
        case 'json':
          this.exportToJSON(financialData, options.filename || 'financial-data');
          break;
      }
    } catch (error) {
      console.error('Failed to export financial data:', error);
      throw error;
    }
  }

  /**
   * Export data to CSV format
   */
  private exportToCSV(data: any[], filename: string): void {
    if (data.length === 0) {
      throw new Error('No data to export');
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  }

  /**
   * Export data to Excel format
   */
  private exportToExcel(data: any[], filename: string): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    // Auto-size columns
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length))
    }));
    worksheet['!cols'] = colWidths;

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    this.downloadBlob(blob, `${filename}.xlsx`);
  }

  /**
   * Export students to PDF
   */
  private async exportStudentsToPDF(data: StudentData[], filename: string): Promise<void> {
    // Dynamic import to avoid SSR issues
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Student Enrollment Report', 20, 20);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Prepare table data
    const tableData = data.map(student => [
      student.firstName + ' ' + student.lastName,
      student.email,
      student.grade,
      student.status,
      student.enrollmentDate,
      `$${student.tuitionPaid.toLocaleString()}`
    ]);

    // Add table
    autoTable(doc, {
      head: [['Name', 'Email', 'Grade', 'Status', 'Enrollment Date', 'Tuition Paid']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    // Generate PDF as blob and download using consistent method
    const pdfBlob = new Blob([doc.output('blob')], { type: 'application/pdf' });
    this.downloadBlob(pdfBlob, `${filename}.pdf`);
  }

  /**
   * Export analytics to CSV
   */
  private exportAnalyticsToCSV(data: AnalyticsData[], filename: string): void {
    const flattenedData = data.map(item => ({
      date: item.date,
      activeUsers: item.activeUsers,
      pageViews: item.pageViews,
      sessionDuration: item.sessionDuration,
      bounceRate: item.bounceRate,
      topPages: item.topPages.join('; '),
      desktopUsers: item.deviceBreakdown.desktop || 0,
      mobileUsers: item.deviceBreakdown.mobile || 0,
      tabletUsers: item.deviceBreakdown.tablet || 0
    }));

    this.exportToCSV(flattenedData, filename);
  }

  /**
   * Export analytics to Excel
   */
  private exportAnalyticsToExcel(data: AnalyticsData[], filename: string): void {
    const workbook = XLSX.utils.book_new();

    // Main analytics sheet
    const mainData = data.map(item => ({
      Date: item.date,
      'Active Users': item.activeUsers,
      'Page Views': item.pageViews,
      'Session Duration (min)': Math.round(item.sessionDuration / 60),
      'Bounce Rate (%)': Math.round(item.bounceRate * 100),
      'Top Pages': item.topPages.join(', ')
    }));

    const mainSheet = XLSX.utils.json_to_sheet(mainData);
    XLSX.utils.book_append_sheet(workbook, mainSheet, 'Analytics Overview');

    // Device breakdown sheet
    const deviceData = data.map(item => ({
      Date: item.date,
      Desktop: item.deviceBreakdown.desktop || 0,
      Mobile: item.deviceBreakdown.mobile || 0,
      Tablet: item.deviceBreakdown.tablet || 0
    }));

    const deviceSheet = XLSX.utils.json_to_sheet(deviceData);
    XLSX.utils.book_append_sheet(workbook, deviceSheet, 'Device Breakdown');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    this.downloadBlob(blob, `${filename}.xlsx`);
  }

  /**
   * Export analytics to PDF
   */
  private async exportAnalyticsToPDF(data: AnalyticsData[], filename: string): Promise<void> {
    // Dynamic import to avoid SSR issues
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Analytics Report', 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Period: ${data[0]?.date} to ${data[data.length - 1]?.date}`, 20, 35);

    // Summary statistics
    const totalUsers = data.reduce((sum, item) => sum + item.activeUsers, 0);
    const avgSessionDuration = data.reduce((sum, item) => sum + item.sessionDuration, 0) / data.length;
    const avgBounceRate = data.reduce((sum, item) => sum + item.bounceRate, 0) / data.length;

    doc.text(`Total Active Users: ${totalUsers.toLocaleString()}`, 20, 45);
    doc.text(`Average Session Duration: ${Math.round(avgSessionDuration / 60)} minutes`, 20, 50);
    doc.text(`Average Bounce Rate: ${Math.round(avgBounceRate * 100)}%`, 20, 55);

    // Table data
    const tableData = data.slice(0, 20).map(item => [
      item.date,
      item.activeUsers.toLocaleString(),
      item.pageViews.toLocaleString(),
      Math.round(item.sessionDuration / 60) + 'm',
      Math.round(item.bounceRate * 100) + '%'
    ]);

    autoTable(doc, {
      head: [['Date', 'Active Users', 'Page Views', 'Session Duration', 'Bounce Rate']],
      body: tableData,
      startY: 65,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    // Generate PDF as blob and download using consistent method
    const pdfBlob = new Blob([doc.output('blob')], { type: 'application/pdf' });
    this.downloadBlob(pdfBlob, `${filename}.pdf`);
  }

  /**
   * Export financial data to CSV
   */
  private exportFinancialToCSV(data: FinancialData[], filename: string): void {
    this.exportToCSV(data, filename);
  }

  /**
   * Export financial data to Excel
   */
  private exportFinancialToExcel(data: FinancialData[], filename: string): void {
    const workbook = XLSX.utils.book_new();

    // Main financial data
    const mainSheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, mainSheet, 'Financial Data');

    // Summary by type
    const summaryByType = data.reduce((acc, transaction) => {
      acc[transaction.type] = (acc[transaction.type] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    const summaryData = Object.entries(summaryByType).map(([type, amount]) => ({
      Type: type,
      'Total Amount': amount,
      'Formatted Amount': `$${amount.toLocaleString()}`
    }));

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary by Type');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    this.downloadBlob(blob, `${filename}.xlsx`);
  }

  /**
   * Export financial data to PDF
   */
  private async exportFinancialToPDF(data: FinancialData[], filename: string): Promise<void> {
    // Dynamic import to avoid SSR issues
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Financial Report', 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);

    // Calculate totals
    const totalAmount = data.reduce((sum, transaction) => sum + transaction.amount, 0);
    const paidAmount = data.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0);
    const pendingAmount = data.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);
    const overdueAmount = data.filter(t => t.status === 'overdue').reduce((sum, t) => sum + t.amount, 0);

    doc.text(`Total Amount: $${totalAmount.toLocaleString()}`, 20, 40);
    doc.text(`Paid: $${paidAmount.toLocaleString()}`, 20, 45);
    doc.text(`Pending: $${pendingAmount.toLocaleString()}`, 20, 50);
    doc.text(`Overdue: $${overdueAmount.toLocaleString()}`, 20, 55);

    // Table data
    const tableData = data.slice(0, 30).map(transaction => [
      transaction.date,
      transaction.studentName,
      transaction.type,
      `$${transaction.amount.toLocaleString()}`,
      transaction.status,
      transaction.paymentMethod
    ]);

    autoTable(doc, {
      head: [['Date', 'Student', 'Type', 'Amount', 'Status', 'Payment Method']],
      body: tableData,
      startY: 65,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    // Generate PDF as blob and download using consistent method
    const pdfBlob = new Blob([doc.output('blob')], { type: 'application/pdf' });
    this.downloadBlob(pdfBlob, `${filename}.pdf`);
  }

  /**
   * Export data to JSON format
   */
  private exportToJSON(data: any[], filename: string): void {
    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
  }

  /**
   * Download file helper
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    this.downloadBlob(blob, filename);
  }

  /**
   * Download blob helper
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const documentExportService = new DocumentExportService();
