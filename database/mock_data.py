#!/usr/bin/env python3
"""
Mock data generator for the school management system
Provides realistic test data for all CRM endpoints
"""

from datetime import datetime, timedelta
import random
from typing import Dict, List, Any

def generate_school_analytics_data() -> Dict[str, Any]:
    """Generate mock school analytics data"""
    return {
        "user_demographics": {
            "total_users": 1247,
            "students": 892,
            "teachers": 156,
            "parents": 734,
            "administrators": 23,
            "age_distribution": {
                "under_18": 892,
                "18_25": 45,
                "26_35": 234,
                "36_45": 456,
                "46_55": 234,
                "over_55": 123
            }
        },
        "engagement_metrics": {
            "daily_active_users": 680,
            "weekly_active_users": 1100,
            "monthly_active_users": 1200,
            "content_interactions": 2800,
            "average_session_duration": 24.5,
            "bounce_rate": 0.23
        },
        "academic_performance": {
            "average_grade": 85.4,
            "passing_rate": 0.94,
            "attendance_rate": 0.91,
            "completion_rate": 0.88
        },
        "traffic_sources": {
            "direct": 45.2,
            "organic_search": 32.1,
            "social_media": 12.8,
            "referrals": 7.3,
            "email": 2.6
        }
    }

def generate_financial_data() -> Dict[str, Any]:
    """Generate mock financial management data"""
    return {
        "tuition_payments": [
            {
                "id": "PAY001",
                "student_name": "Emma Johnson",
                "parent_name": "Sarah Johnson",
                "amount": 2500.00,
                "due_date": "2024-02-01",
                "status": "paid",
                "payment_method": "Credit Card",
                "transaction_id": "TXN123456",
                "payment_date": "2024-01-28"
            },
            {
                "id": "PAY002", 
                "student_name": "Michael Chen",
                "parent_name": "David Chen",
                "amount": 2500.00,
                "due_date": "2024-02-01",
                "status": "pending",
                "payment_method": "Bank Transfer"
            },
            {
                "id": "PAY003",
                "student_name": "Sofia Rodriguez",
                "parent_name": "Maria Rodriguez", 
                "amount": 1250.00,
                "due_date": "2024-01-15",
                "status": "overdue",
                "payment_method": "Check"
            }
        ],
        "financial_stats": {
            "total_revenue": 2250000.00,
            "monthly_revenue": 187500.00,
            "outstanding_balance": 45000.00,
            "collection_rate": 0.94,
            "overdue_payments": 8,
            "total_students": 892
        },
        "budget_overview": {
            "total_budget": 2500000.00,
            "spent": 1875000.00,
            "remaining": 625000.00,
            "categories": {
                "salaries": 1200000.00,
                "facilities": 400000.00,
                "technology": 200000.00,
                "supplies": 75000.00
            }
        }
    }

def generate_communication_data() -> Dict[str, Any]:
    """Generate mock communication center data"""
    return {
        "messages": [
            {
                "id": "MSG001",
                "sender": "Principal Office",
                "recipient": "All Parents - Grade 9",
                "subject": "Parent-Teacher Conference Schedule",
                "message": "Dear parents, we are pleased to announce the upcoming parent-teacher conferences...",
                "timestamp": "2024-01-20 14:30",
                "status": "sent",
                "read_count": 234,
                "response_count": 45
            },
            {
                "id": "MSG002",
                "sender": "Athletics Department",
                "recipient": "Sports Teams Parents",
                "subject": "Winter Sports Schedule Update",
                "message": "Important updates regarding the winter sports schedule...",
                "timestamp": "2024-01-19 09:15",
                "status": "sent",
                "read_count": 156,
                "response_count": 23
            }
        ],
        "campaigns": [
            {
                "id": "CAM001",
                "name": "Spring Enrollment Drive",
                "status": "active",
                "target_audience": "Prospective Parents",
                "sent": 1200,
                "opened": 840,
                "clicked": 234,
                "scheduled_date": "2024-02-01"
            }
        ],
        "stats": {
            "total_messages": 1456,
            "messages_today": 23,
            "delivery_rate": 0.98,
            "open_rate": 0.72,
            "response_rate": 0.34
        }
    }

def generate_enrollment_data() -> Dict[str, Any]:
    """Generate mock student enrollment data"""
    return {
        "applications": [
            {
                "id": "APP001",
                "student_name": "Alex Thompson",
                "parent_name": "Jennifer Thompson",
                "grade": "9",
                "application_date": "2024-01-15",
                "status": "pending_review",
                "documents_complete": True,
                "interview_scheduled": False
            },
            {
                "id": "APP002",
                "student_name": "Zoe Martinez",
                "parent_name": "Carlos Martinez",
                "grade": "10",
                "application_date": "2024-01-12",
                "status": "approved",
                "documents_complete": True,
                "interview_scheduled": True
            }
        ],
        "enrollment_stats": {
            "total_applications": 156,
            "pending_review": 23,
            "approved": 98,
            "rejected": 12,
            "waitlisted": 23,
            "current_enrollment": 892,
            "capacity": 1000,
            "enrollment_rate": 0.89
        },
        "grade_distribution": {
            "grade_9": 234,
            "grade_10": 223,
            "grade_11": 218,
            "grade_12": 217
        }
    }

def generate_parent_portal_data() -> Dict[str, Any]:
    """Generate mock parent portal data"""
    return {
        "student_progress": [
            {
                "student_id": "STU001",
                "student_name": "Emma Johnson",
                "grade": "10",
                "gpa": 3.8,
                "attendance_rate": 0.95,
                "recent_grades": [
                    {"subject": "Mathematics", "grade": "A-", "date": "2024-01-20"},
                    {"subject": "English", "grade": "B+", "date": "2024-01-18"},
                    {"subject": "Science", "grade": "A", "date": "2024-01-15"}
                ]
            }
        ],
        "upcoming_events": [
            {
                "id": "EVT001",
                "title": "Parent-Teacher Conferences",
                "date": "2024-02-15",
                "time": "18:00",
                "location": "Main Auditorium",
                "type": "academic"
            },
            {
                "id": "EVT002",
                "title": "Science Fair",
                "date": "2024-03-01",
                "time": "10:00",
                "location": "Gymnasium",
                "type": "extracurricular"
            }
        ],
        "announcements": [
            {
                "id": "ANN001",
                "title": "New Lunch Menu Available",
                "content": "We're excited to introduce our new healthy lunch options...",
                "date": "2024-01-22",
                "priority": "medium"
            }
        ],
        "portal_stats": {
            "active_parents": 734,
            "login_rate": 0.82,
            "engagement_score": 0.76
        }
    }

def generate_dashboard_data() -> Dict[str, Any]:
    """Generate mock dashboard data"""
    return {
        "overview_stats": {
            "total_students": 1247,
            "total_parents": 892,
            "pending_applications": 23,
            "active_communications": 156,
            "monthly_revenue": 125000,
            "overdue_payments": 8,
            "content_pending_approval": 12,
            "ai_interactions_today": 342
        },
        "recent_activities": [
            {
                "id": "ACT001",
                "type": "enrollment",
                "description": "New application submitted by Jennifer Thompson",
                "timestamp": "2024-01-22 14:30",
                "user": "System",
                "priority": "medium"
            },
            {
                "id": "ACT002",
                "type": "payment",
                "description": "Payment received from Sarah Johnson - $2,500",
                "timestamp": "2024-01-22 11:15",
                "user": "Finance Dept",
                "priority": "low"
            }
        ],
        "quick_stats": {
            "enrollment_rate": 0.89,
            "payment_collection_rate": 0.94,
            "parent_engagement": 0.76,
            "content_approval_rate": 0.88,
            "ai_satisfaction": 0.92
        },
        "alerts": [
            {
                "id": "ALT001",
                "type": "warning",
                "title": "Overdue Payments",
                "message": "8 payments are currently overdue",
                "timestamp": "2024-01-22 09:00",
                "action_required": True
            }
        ],
        "upcoming_deadlines": [
            {
                "id": "DL001",
                "title": "Q2 Report Due",
                "date": "2024-02-01",
                "type": "report",
                "priority": "high"
            }
        ]
    }
