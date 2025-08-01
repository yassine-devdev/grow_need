import React, { useState } from 'react';
import { Icons } from '../../../icons';
import './Badges.css';

// Mock Data
const mockBadges = [
  { id: 1, title: 'First Steps', description: 'Complete your first lesson.', icon: Icons.PlayCircle, earned: true },
  { id: 2, title: 'Quiz Master', description: 'Score 100% on any quiz.', icon: Icons.Sparkles, earned: true },
  { id: 3, title: 'Perfect Week', description: 'Log in every day for 7 days.', icon: Icons.CalendarDays, earned: true },
  { id: 4, title: 'Collaborator', description: 'Start or join a study group.', icon: Icons.Users, earned: false },
  { id: 5, title: 'AI Companion', description: 'Use the AI Study Assistant 10 times.', icon: Icons.AIHelper, earned: true },
  { id: 6, title: 'Bookworm', description: 'Read 5 articles from the Knowledge Base.', icon: Icons.BookOpen, earned: false },
  { id: 7, title: 'Math Whiz', description: 'Complete the Algebra I course.', icon: Icons.Calculator, earned: false },
  { id: 8, title: 'Science Explorer', description: 'Finish the Biology 101 module.', icon: Icons.FlaskConical, earned: true },
  { id: 9, title: 'History Buff', description: 'Ace the World History midterm.', icon: Icons.History, earned: false },
  { id: 10, title: 'Creative Mind', description: 'Submit a project in the Studio.', icon: Icons.Design, earned: false },
  { id: 11, title: 'Helping Hand', description: 'Answer a question in the community hub.', icon: Icons.CharityDonations, earned: true },
  { id: 12, title: 'Goal Setter', description: 'Create and complete a personal goal.', icon: Icons.Goal, earned: false },
];

type Filter = 'all' | 'earned' | 'locked';

const Badges: React.FC = () => {
    const [filter, setFilter] = useState<Filter>('all');

    const filteredBadges = mockBadges.filter(badge => {
        if (filter === 'earned') return badge.earned;
        if (filter === 'locked') return !badge.earned;
        return true;
    });

    return (
        <div className="badges-container">
            <div className="badges-header">
                <div>
                    <h2 className="font-orbitron text-3xl font-bold text-white">Badges & Achievements</h2>
                    <p className="text-gray-400">Collect badges by completing tasks and reaching milestones.</p>
                </div>
                <div className="badges-filter-group">
                    <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
                    <button className={filter === 'earned' ? 'active' : ''} onClick={() => setFilter('earned')}>Earned</button>
                    <button className={filter === 'locked' ? 'active' : ''} onClick={() => setFilter('locked')}>Locked</button>
                </div>
            </div>

            <div className="badges-grid">
                {filteredBadges.map(badge => {
                    const BadgeIcon = badge.icon;
                    return (
                        <div key={badge.id} className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}>
                            <div className="badge-icon-wrapper">
                                <BadgeIcon size={48} />
                            </div>
                            <h3 className="badge-title">{badge.title}</h3>
                            <p className="badge-description">{badge.description}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Badges;