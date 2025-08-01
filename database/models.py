"""
Real Data Models for CRM System
SQLite-based persistent storage with comprehensive data management
"""

import sqlite3
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import hashlib
import uuid

logger = logging.getLogger(__name__)

@dataclass
class User:
    id: str
    name: str
    email: str
    role: str  # 'teacher', 'student', 'admin', 'parent'
    status: str  # 'active', 'inactive', 'pending', 'suspended'
    department: Optional[str] = None
    grade_level: Optional[str] = None
    created_at: Optional[str] = None
    last_login: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class Content:
    id: str
    title: str
    description: str
    content_type: str  # 'lesson_plan', 'assignment', 'resource', 'assessment'
    subject: str
    grade_level: str
    author_id: str
    status: str  # 'pending', 'approved', 'rejected', 'draft'
    file_path: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None
    rejection_reason: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class AIConversation:
    id: str
    user_id: str
    query: str
    response: str
    model_used: str
    category: str  # 'homework_help', 'technical_support', 'content_creation'
    satisfaction_rating: Optional[int] = None
    response_time_ms: Optional[int] = None
    created_at: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class Analytics:
    id: str
    metric_type: str  # 'user_engagement', 'content_usage', 'ai_performance'
    metric_name: str
    value: float
    unit: str
    user_id: Optional[str] = None
    content_id: Optional[str] = None
    timestamp: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class CRMDatabase:
    """Real CRM Database with SQLite backend"""
    
    def __init__(self, db_path: str = "crm_database.db"):
        self.db_path = db_path
        self.init_database()
        logger.info(f"CRM Database initialized at {db_path}")
    
    def init_database(self):
        """Initialize database tables"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    role TEXT NOT NULL,
                    status TEXT NOT NULL,
                    department TEXT,
                    grade_level TEXT,
                    created_at TEXT NOT NULL,
                    last_login TEXT,
                    metadata TEXT
                )
            """)
            
            # Content table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS content (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    description TEXT,
                    content_type TEXT NOT NULL,
                    subject TEXT NOT NULL,
                    grade_level TEXT NOT NULL,
                    author_id TEXT NOT NULL,
                    status TEXT NOT NULL,
                    file_path TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    approved_by TEXT,
                    approved_at TEXT,
                    rejection_reason TEXT,
                    metadata TEXT,
                    FOREIGN KEY (author_id) REFERENCES users (id)
                )
            """)
            
            # AI Conversations table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ai_conversations (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    query TEXT NOT NULL,
                    response TEXT NOT NULL,
                    model_used TEXT NOT NULL,
                    category TEXT NOT NULL,
                    satisfaction_rating INTEGER,
                    response_time_ms INTEGER,
                    created_at TEXT NOT NULL,
                    metadata TEXT,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            
            # Analytics table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS analytics (
                    id TEXT PRIMARY KEY,
                    metric_type TEXT NOT NULL,
                    metric_name TEXT NOT NULL,
                    value REAL NOT NULL,
                    unit TEXT NOT NULL,
                    user_id TEXT,
                    content_id TEXT,
                    timestamp TEXT NOT NULL,
                    metadata TEXT,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    FOREIGN KEY (content_id) REFERENCES content (id)
                )
            """)
            
            # System logs table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS system_logs (
                    id TEXT PRIMARY KEY,
                    level TEXT NOT NULL,
                    message TEXT NOT NULL,
                    component TEXT,
                    user_id TEXT,
                    timestamp TEXT NOT NULL,
                    metadata TEXT
                )
            """)
            
            conn.commit()
            
        # Create sample data if database is empty
        self._create_sample_data()
    
    def _create_sample_data(self):
        """Create sample data for demonstration"""
        try:
            # Check if we already have data
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM users")
                user_count = cursor.fetchone()[0]
                
                if user_count > 0:
                    return  # Data already exists
            
            # Create sample users
            sample_users = [
                User(
                    id=str(uuid.uuid4()),
                    name="Sarah Johnson",
                    email="sarah.johnson@school.edu",
                    role="teacher",
                    status="active",
                    department="Mathematics",
                    created_at=datetime.now().isoformat(),
                    last_login=(datetime.now() - timedelta(hours=2)).isoformat(),
                    metadata={"courses": 5, "experience_years": 8}
                ),
                User(
                    id=str(uuid.uuid4()),
                    name="Michael Smith",
                    email="michael.smith@school.edu",
                    role="teacher",
                    status="active",
                    department="Science",
                    created_at=datetime.now().isoformat(),
                    last_login=(datetime.now() - timedelta(days=1)).isoformat(),
                    metadata={"courses": 3, "experience_years": 5}
                ),
                User(
                    id=str(uuid.uuid4()),
                    name="Alex Thompson",
                    email="alex.thompson@student.edu",
                    role="student",
                    status="active",
                    grade_level="10th Grade",
                    created_at=datetime.now().isoformat(),
                    last_login=(datetime.now() - timedelta(minutes=30)).isoformat(),
                    metadata={"gpa": 3.8, "enrolled_courses": 6}
                ),
                User(
                    id=str(uuid.uuid4()),
                    name="Admin User",
                    email="admin@school.edu",
                    role="admin",
                    status="active",
                    created_at=datetime.now().isoformat(),
                    last_login=(datetime.now() - timedelta(minutes=15)).isoformat(),
                    metadata={"permissions": ["all"]}
                )
            ]
            
            for user in sample_users:
                self.create_user(user)
            
            # Create sample content
            teacher_id = sample_users[0].id
            sample_content = [
                Content(
                    id=str(uuid.uuid4()),
                    title="Introduction to Quadratic Equations",
                    description="Comprehensive lesson plan covering quadratic equations basics",
                    content_type="lesson_plan",
                    subject="Mathematics",
                    grade_level="9th Grade",
                    author_id=teacher_id,
                    status="approved",
                    created_at=datetime.now().isoformat(),
                    updated_at=datetime.now().isoformat(),
                    approved_by=sample_users[3].id,
                    approved_at=datetime.now().isoformat(),
                    metadata={"duration_minutes": 45, "difficulty": "intermediate"}
                ),
                Content(
                    id=str(uuid.uuid4()),
                    title="Physics Lab: Pendulum Motion",
                    description="Hands-on lab experiment to study pendulum motion",
                    content_type="assignment",
                    subject="Physics",
                    grade_level="11th Grade",
                    author_id=sample_users[1].id,
                    status="pending",
                    created_at=datetime.now().isoformat(),
                    updated_at=datetime.now().isoformat(),
                    metadata={"duration_minutes": 90, "materials_needed": ["pendulum", "stopwatch", "ruler"]}
                )
            ]
            
            for content in sample_content:
                self.create_content(content)
            
            # Create sample AI conversations
            student_id = sample_users[2].id
            sample_conversations = [
                AIConversation(
                    id=str(uuid.uuid4()),
                    user_id=student_id,
                    query="Can you help me understand quadratic equations?",
                    response="I'd be happy to help! Quadratic equations are polynomial equations of degree 2...",
                    model_used="qwen2.5:3b-instruct",
                    category="homework_help",
                    satisfaction_rating=5,
                    response_time_ms=1250,
                    created_at=(datetime.now() - timedelta(minutes=5)).isoformat(),
                    metadata={"tokens_used": 150, "context_retrieved": True}
                ),
                AIConversation(
                    id=str(uuid.uuid4()),
                    user_id=teacher_id,
                    query="How do I upload a new assignment?",
                    response="To upload a new assignment, navigate to the Content Management section...",
                    model_used="qwen2.5:3b-instruct",
                    category="technical_support",
                    satisfaction_rating=4,
                    response_time_ms=890,
                    created_at=(datetime.now() - timedelta(minutes=15)).isoformat(),
                    metadata={"tokens_used": 85, "context_retrieved": False}
                )
            ]
            
            for conversation in sample_conversations:
                self.create_ai_conversation(conversation)
            
            logger.info("Sample data created successfully")
            
        except Exception as e:
            logger.error(f"Failed to create sample data: {e}")
    
    def create_user(self, user: User) -> bool:
        """Create a new user"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO users (id, name, email, role, status, department, grade_level, created_at, last_login, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    user.id, user.name, user.email, user.role, user.status,
                    user.department, user.grade_level, user.created_at or datetime.now().isoformat(),
                    user.last_login, json.dumps(user.metadata) if user.metadata else None
                ))
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to create user: {e}")
            return False
    
    def get_user(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
                row = cursor.fetchone()
                
                if row:
                    return User(
                        id=row[0], name=row[1], email=row[2], role=row[3], status=row[4],
                        department=row[5], grade_level=row[6], created_at=row[7],
                        last_login=row[8], metadata=json.loads(row[9]) if row[9] else None
                    )
                return None
        except Exception as e:
            logger.error(f"Failed to get user: {e}")
            return None

    def get_users(self, role: Optional[str] = None, status: Optional[str] = None, limit: int = 100) -> List[User]:
        """Get users with optional filtering"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                query = "SELECT * FROM users WHERE 1=1"
                params = []

                if role:
                    query += " AND role = ?"
                    params.append(role)
                if status:
                    query += " AND status = ?"
                    params.append(status)

                query += " ORDER BY created_at DESC LIMIT ?"
                params.append(limit)

                cursor.execute(query, params)
                rows = cursor.fetchall()

                users = []
                for row in rows:
                    users.append(User(
                        id=row[0], name=row[1], email=row[2], role=row[3], status=row[4],
                        department=row[5], grade_level=row[6], created_at=row[7],
                        last_login=row[8], metadata=json.loads(row[9]) if row[9] else None
                    ))
                return users
        except Exception as e:
            logger.error(f"Failed to get users: {e}")
            return []

    def update_user(self, user_id: str, updates: Dict[str, Any]) -> bool:
        """Update user data"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                # Build dynamic update query
                set_clauses = []
                params = []

                for key, value in updates.items():
                    if key in ['name', 'email', 'role', 'status', 'department', 'grade_level', 'last_login']:
                        set_clauses.append(f"{key} = ?")
                        params.append(value)
                    elif key == 'metadata':
                        set_clauses.append("metadata = ?")
                        params.append(json.dumps(value) if value else None)

                if not set_clauses:
                    return False

                query = f"UPDATE users SET {', '.join(set_clauses)} WHERE id = ?"
                params.append(user_id)

                cursor.execute(query, params)
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Failed to update user: {e}")
            return False

    def delete_user(self, user_id: str) -> bool:
        """Delete user (soft delete by setting status to 'deleted')"""
        try:
            return self.update_user(user_id, {'status': 'deleted'})
        except Exception as e:
            logger.error(f"Failed to delete user: {e}")
            return False

    def create_content(self, content: Content) -> bool:
        """Create new content"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO content (id, title, description, content_type, subject, grade_level,
                                       author_id, status, file_path, created_at, updated_at,
                                       approved_by, approved_at, rejection_reason, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    content.id, content.title, content.description, content.content_type,
                    content.subject, content.grade_level, content.author_id, content.status,
                    content.file_path, content.created_at or datetime.now().isoformat(),
                    content.updated_at or datetime.now().isoformat(), content.approved_by,
                    content.approved_at, content.rejection_reason,
                    json.dumps(content.metadata) if content.metadata else None
                ))
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to create content: {e}")
            return False

    def get_content(self, content_id: str) -> Optional[Content]:
        """Get content by ID"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM content WHERE id = ?", (content_id,))
                row = cursor.fetchone()

                if row:
                    return Content(
                        id=row[0], title=row[1], description=row[2], content_type=row[3],
                        subject=row[4], grade_level=row[5], author_id=row[6], status=row[7],
                        file_path=row[8], created_at=row[9], updated_at=row[10],
                        approved_by=row[11], approved_at=row[12], rejection_reason=row[13],
                        metadata=json.loads(row[14]) if row[14] else None
                    )
                return None
        except Exception as e:
            logger.error(f"Failed to get content: {e}")
            return None

    def get_content_list(self, status: Optional[str] = None, author_id: Optional[str] = None,
                        content_type: Optional[str] = None, limit: int = 100) -> List[Content]:
        """Get content list with optional filtering"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                query = "SELECT * FROM content WHERE 1=1"
                params = []

                if status:
                    query += " AND status = ?"
                    params.append(status)
                if author_id:
                    query += " AND author_id = ?"
                    params.append(author_id)
                if content_type:
                    query += " AND content_type = ?"
                    params.append(content_type)

                query += " ORDER BY created_at DESC LIMIT ?"
                params.append(limit)

                cursor.execute(query, params)
                rows = cursor.fetchall()

                content_list = []
                for row in rows:
                    content_list.append(Content(
                        id=row[0], title=row[1], description=row[2], content_type=row[3],
                        subject=row[4], grade_level=row[5], author_id=row[6], status=row[7],
                        file_path=row[8], created_at=row[9], updated_at=row[10],
                        approved_by=row[11], approved_at=row[12], rejection_reason=row[13],
                        metadata=json.loads(row[14]) if row[14] else None
                    ))
                return content_list
        except Exception as e:
            logger.error(f"Failed to get content list: {e}")
            return []

    def update_content(self, content_id: str, updates: Dict[str, Any]) -> bool:
        """Update content data"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                # Build dynamic update query
                set_clauses = []
                params = []

                for key, value in updates.items():
                    if key in ['title', 'description', 'content_type', 'subject', 'grade_level',
                              'status', 'file_path', 'approved_by', 'approved_at', 'rejection_reason']:
                        set_clauses.append(f"{key} = ?")
                        params.append(value)
                    elif key == 'metadata':
                        set_clauses.append("metadata = ?")
                        params.append(json.dumps(value) if value else None)

                # Always update the updated_at timestamp
                set_clauses.append("updated_at = ?")
                params.append(datetime.now().isoformat())

                if len(set_clauses) <= 1:  # Only updated_at was added
                    return False

                query = f"UPDATE content SET {', '.join(set_clauses)} WHERE id = ?"
                params.append(content_id)

                cursor.execute(query, params)
                conn.commit()
                return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Failed to update content: {e}")
            return False

    def approve_content(self, content_id: str, approved_by: str) -> bool:
        """Approve content"""
        return self.update_content(content_id, {
            'status': 'approved',
            'approved_by': approved_by,
            'approved_at': datetime.now().isoformat()
        })

    def reject_content(self, content_id: str, reason: str) -> bool:
        """Reject content"""
        return self.update_content(content_id, {
            'status': 'rejected',
            'rejection_reason': reason
        })

    def create_ai_conversation(self, conversation: AIConversation) -> bool:
        """Create new AI conversation record"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO ai_conversations (id, user_id, query, response, model_used, category,
                                                satisfaction_rating, response_time_ms, created_at, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    conversation.id, conversation.user_id, conversation.query, conversation.response,
                    conversation.model_used, conversation.category, conversation.satisfaction_rating,
                    conversation.response_time_ms, conversation.created_at or datetime.now().isoformat(),
                    json.dumps(conversation.metadata) if conversation.metadata else None
                ))
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to create AI conversation: {e}")
            return False

    def get_ai_conversations(self, user_id: Optional[str] = None, category: Optional[str] = None,
                           limit: int = 100) -> List[AIConversation]:
        """Get AI conversations with optional filtering"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                query = "SELECT * FROM ai_conversations WHERE 1=1"
                params = []

                if user_id:
                    query += " AND user_id = ?"
                    params.append(user_id)
                if category:
                    query += " AND category = ?"
                    params.append(category)

                query += " ORDER BY created_at DESC LIMIT ?"
                params.append(limit)

                cursor.execute(query, params)
                rows = cursor.fetchall()

                conversations = []
                for row in rows:
                    conversations.append(AIConversation(
                        id=row[0], user_id=row[1], query=row[2], response=row[3],
                        model_used=row[4], category=row[5], satisfaction_rating=row[6],
                        response_time_ms=row[7], created_at=row[8],
                        metadata=json.loads(row[9]) if row[9] else None
                    ))
                return conversations
        except Exception as e:
            logger.error(f"Failed to get AI conversations: {e}")
            return []

    def create_analytics_record(self, analytics: Analytics) -> bool:
        """Create new analytics record"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO analytics (id, metric_type, metric_name, value, unit, user_id,
                                         content_id, timestamp, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    analytics.id, analytics.metric_type, analytics.metric_name, analytics.value,
                    analytics.unit, analytics.user_id, analytics.content_id,
                    analytics.timestamp or datetime.now().isoformat(),
                    json.dumps(analytics.metadata) if analytics.metadata else None
                ))
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to create analytics record: {e}")
            return False

    def get_analytics(self, metric_type: Optional[str] = None, start_date: Optional[str] = None,
                     end_date: Optional[str] = None, limit: int = 1000) -> List[Analytics]:
        """Get analytics records with optional filtering"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                query = "SELECT * FROM analytics WHERE 1=1"
                params = []

                if metric_type:
                    query += " AND metric_type = ?"
                    params.append(metric_type)
                if start_date:
                    query += " AND timestamp >= ?"
                    params.append(start_date)
                if end_date:
                    query += " AND timestamp <= ?"
                    params.append(end_date)

                query += " ORDER BY timestamp DESC LIMIT ?"
                params.append(limit)

                cursor.execute(query, params)
                rows = cursor.fetchall()

                analytics_list = []
                for row in rows:
                    analytics_list.append(Analytics(
                        id=row[0], metric_type=row[1], metric_name=row[2], value=row[3],
                        unit=row[4], user_id=row[5], content_id=row[6], timestamp=row[7],
                        metadata=json.loads(row[8]) if row[8] else None
                    ))
                return analytics_list
        except Exception as e:
            logger.error(f"Failed to get analytics: {e}")
            return []

    def get_user_stats(self) -> Dict[str, Any]:
        """Get user statistics"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                # Total users by role
                cursor.execute("SELECT role, COUNT(*) FROM users WHERE status != 'deleted' GROUP BY role")
                role_counts = dict(cursor.fetchall())

                # Active users (logged in within last 7 days)
                week_ago = (datetime.now() - timedelta(days=7)).isoformat()
                cursor.execute("SELECT COUNT(*) FROM users WHERE last_login >= ? AND status = 'active'", (week_ago,))
                active_users = cursor.fetchone()[0]

                # Pending account requests
                cursor.execute("SELECT COUNT(*) FROM users WHERE status = 'pending'")
                pending_requests = cursor.fetchone()[0]

                return {
                    'total_teachers': role_counts.get('teacher', 0),
                    'total_students': role_counts.get('student', 0),
                    'total_admins': role_counts.get('admin', 0),
                    'total_parents': role_counts.get('parent', 0),
                    'active_users': active_users,
                    'pending_requests': pending_requests,
                    'total_users': sum(role_counts.values())
                }
        except Exception as e:
            logger.error(f"Failed to get user stats: {e}")
            return {}

    def get_content_stats(self) -> Dict[str, Any]:
        """Get content statistics"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                # Content by status
                cursor.execute("SELECT status, COUNT(*) FROM content GROUP BY status")
                status_counts = dict(cursor.fetchall())

                # Content by type
                cursor.execute("SELECT content_type, COUNT(*) FROM content GROUP BY content_type")
                type_counts = dict(cursor.fetchall())

                # Content by subject
                cursor.execute("SELECT subject, COUNT(*) FROM content GROUP BY subject")
                subject_counts = dict(cursor.fetchall())

                return {
                    'pending_count': status_counts.get('pending', 0),
                    'approved_count': status_counts.get('approved', 0),
                    'rejected_count': status_counts.get('rejected', 0),
                    'draft_count': status_counts.get('draft', 0),
                    'total_content': sum(status_counts.values()),
                    'by_type': type_counts,
                    'by_subject': subject_counts
                }
        except Exception as e:
            logger.error(f"Failed to get content stats: {e}")
            return {}

    def get_ai_stats(self) -> Dict[str, Any]:
        """Get AI conversation statistics"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                # Total conversations
                cursor.execute("SELECT COUNT(*) FROM ai_conversations")
                total_conversations = cursor.fetchone()[0]

                # Average satisfaction rating
                cursor.execute("SELECT AVG(satisfaction_rating) FROM ai_conversations WHERE satisfaction_rating IS NOT NULL")
                avg_satisfaction = cursor.fetchone()[0] or 0

                # Average response time
                cursor.execute("SELECT AVG(response_time_ms) FROM ai_conversations WHERE response_time_ms IS NOT NULL")
                avg_response_time = cursor.fetchone()[0] or 0

                # Conversations by category
                cursor.execute("SELECT category, COUNT(*) FROM ai_conversations GROUP BY category")
                category_counts = dict(cursor.fetchall())

                # Recent conversations (last 24 hours)
                yesterday = (datetime.now() - timedelta(days=1)).isoformat()
                cursor.execute("SELECT COUNT(*) FROM ai_conversations WHERE created_at >= ?", (yesterday,))
                recent_conversations = cursor.fetchone()[0]

                return {
                    'total_conversations': total_conversations,
                    'avg_satisfaction': round(avg_satisfaction, 2),
                    'avg_response_time_ms': round(avg_response_time, 0),
                    'recent_conversations': recent_conversations,
                    'by_category': category_counts
                }
        except Exception as e:
            logger.error(f"Failed to get AI stats: {e}")
            return {}

    def get_system_health(self) -> Dict[str, Any]:
        """Get system health metrics"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                # Database size
                cursor.execute("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()")
                db_size = cursor.fetchone()[0]

                # Recent activity (last hour)
                hour_ago = (datetime.now() - timedelta(hours=1)).isoformat()
                cursor.execute("SELECT COUNT(*) FROM ai_conversations WHERE created_at >= ?", (hour_ago,))
                recent_ai_activity = cursor.fetchone()[0]

                cursor.execute("SELECT COUNT(*) FROM content WHERE updated_at >= ?", (hour_ago,))
                recent_content_activity = cursor.fetchone()[0]

                return {
                    'database_size_bytes': db_size,
                    'database_size_mb': round(db_size / (1024 * 1024), 2),
                    'recent_ai_activity': recent_ai_activity,
                    'recent_content_activity': recent_content_activity,
                    'last_updated': datetime.now().isoformat()
                }
        except Exception as e:
            logger.error(f"Failed to get system health: {e}")
            return {}

    def log_system_event(self, level: str, message: str, component: str = None,
                        user_id: str = None, metadata: Dict[str, Any] = None) -> bool:
        """Log system events"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO system_logs (id, level, message, component, user_id, timestamp, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    str(uuid.uuid4()), level, message, component, user_id,
                    datetime.now().isoformat(), json.dumps(metadata) if metadata else None
                ))
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"Failed to log system event: {e}")
            return False

    def cleanup_old_data(self, days_to_keep: int = 90) -> Dict[str, int]:
        """Clean up old data to maintain performance"""
        try:
            cutoff_date = (datetime.now() - timedelta(days=days_to_keep)).isoformat()

            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                # Clean old system logs
                cursor.execute("DELETE FROM system_logs WHERE timestamp < ?", (cutoff_date,))
                logs_deleted = cursor.rowcount

                # Clean old analytics records (keep only aggregated data)
                cursor.execute("DELETE FROM analytics WHERE timestamp < ? AND metric_type = 'raw_event'", (cutoff_date,))
                analytics_deleted = cursor.rowcount

                # Clean old AI conversations (keep only those with ratings)
                cursor.execute("DELETE FROM ai_conversations WHERE created_at < ? AND satisfaction_rating IS NULL", (cutoff_date,))
                conversations_deleted = cursor.rowcount

                conn.commit()

                return {
                    'logs_deleted': logs_deleted,
                    'analytics_deleted': analytics_deleted,
                    'conversations_deleted': conversations_deleted
                }
        except Exception as e:
            logger.error(f"Failed to cleanup old data: {e}")
            return {}

    def backup_database(self, backup_path: str = None) -> str:
        """Create database backup"""
        try:
            if not backup_path:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                backup_path = f"crm_backup_{timestamp}.db"

            # Create backup directory if it doesn't exist
            backup_dir = Path(backup_path).parent
            backup_dir.mkdir(parents=True, exist_ok=True)

            # Copy database file
            import shutil
            shutil.copy2(self.db_path, backup_path)

            self.log_system_event('INFO', f'Database backup created: {backup_path}', 'CRMDatabase')
            return backup_path
        except Exception as e:
            logger.error(f"Failed to backup database: {e}")
            raise
