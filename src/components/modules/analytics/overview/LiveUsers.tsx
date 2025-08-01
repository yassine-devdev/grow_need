import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Icons } from '../../../icons';
import { analyticsDataService, LiveUsersData } from '../services/analyticsDataService';
import '../shared.css';
import './LiveUsers.css';

const LiveUsers: React.FC = () => {
    const [liveUsersData, setLiveUsersData] = useState<LiveUsersData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLiveUsersData();

        // Set up real-time updates every 30 seconds
        const interval = setInterval(() => {
            fetchLiveUsersData();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchLiveUsersData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await analyticsDataService.getLiveUsersData();
            setLiveUsersData(data);
        } catch (err) {
            setError('Failed to load live users data');
            console.error('Error fetching live users data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !liveUsersData) {
        return (
            <div className="analytics-content-pane">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="analytics-content-pane">
                <div className="flex items-center justify-center h-64">
                    <div className="text-red-400 text-center">
                        <p>{error}</p>
                        <button
                            onClick={fetchLiveUsersData}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!liveUsersData) return null;
    
  return (
    <div className="analytics-content-pane">
        {/* Header with refresh button */}
        <div className="flex items-center justify-between mb-4">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Icons.Users size={24} />
                    Live Users
                </h2>
                <p className="text-gray-400 text-sm">Real-time user activity (Updated: {new Date().toLocaleTimeString()})</p>
            </div>
            <button
                onClick={fetchLiveUsersData}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                disabled={loading}
            >
                {loading ? 'Refreshing...' : 'Refresh'}
            </button>
        </div>

        <div className="live-users-grid">
            <div className="analytics-widget live-count-widget">
                <p className="live-count-label">Users right now</p>
                <p className="live-count-value">{liveUsersData.currentUsers.toLocaleString()}</p>
                <div className="live-indicator">
                    <span className="live-dot"></span>
                    LIVE
                </div>
            </div>

            <div className="analytics-widget device-widget">
                 <h4 className="analytics-widget-title">Device Breakdown</h4>
                 <div className="device-chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={liveUsersData.deviceBreakdown} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0}}>
                            <XAxis type="number" hide />
                            <YAxis type="category" width={70} dataKey="name" tickLine={false} axisLine={false} tick={{fill: '#9ca3af'}} />
                            <Bar dataKey="value" barSize={20} radius={[0, 8, 8, 0]}>
                                {liveUsersData.deviceBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
            </div>

            <div className="analytics-widget live-chart-widget">
                <h4 className="analytics-widget-title">Users in last 30 minutes</h4>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={liveUsersData.timeSeriesData}>
                        <XAxis dataKey="time" tick={{ fill: '#9ca3af' }} fontSize={12} />
                        <YAxis tick={{ fill: '#9ca3af' }} domain={['dataMin - 20', 'dataMax + 20']}/>
                        <Line type="monotone" dataKey="users" stroke="#00ff88" strokeWidth={2} dot={false} isAnimationActive={false}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
            <div className="analytics-widget top-pages-widget">
                 <h4 className="analytics-widget-title">Top Active Pages</h4>
                 <div className="analytics-table-container">
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th>Page</th>
                                <th>Users</th>
                                <th>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {liveUsersData.topPages.map(page => (
                                <tr key={page.page}>
                                    <td>{page.page}</td>
                                    <td className="text-right font-semibold">{page.users.toLocaleString()}</td>
                                    <td className="text-right text-gray-400">{page.percentage}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default LiveUsers;
