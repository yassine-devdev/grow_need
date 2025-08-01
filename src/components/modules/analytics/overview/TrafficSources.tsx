import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Icons } from '../../../icons';
import { analyticsDataService, TrafficSourcesData } from '../services/analyticsDataService';
import '../shared.css';

const TrafficSources: React.FC = () => {
  const [trafficData, setTrafficData] = useState<TrafficSourcesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrafficData();
  }, []);

  const fetchTrafficData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsDataService.getTrafficSourcesData();
      setTrafficData(data);
    } catch (err) {
      setError('Failed to load traffic sources data');
      console.error('Error fetching traffic sources data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-content-pane">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (error || !trafficData) {
    return (
      <div className="analytics-content-pane">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400 text-center">
            <p>{error || 'No data available'}</p>
            <button
              onClick={fetchTrafficData}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="analytics-content-pane">
        {/* Header with refresh button */}
        <div className="flex items-center justify-between mb-4">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Icons.PieChart size={24} />
                    Traffic Sources
                </h2>
                <p className="text-gray-400 text-sm">User acquisition channels and performance</p>
            </div>
            <button
                onClick={fetchTrafficData}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                disabled={loading}
            >
                {loading ? 'Refreshing...' : 'Refresh'}
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="analytics-widget">
                 <h3 className="analytics-widget-title"><Icons.PieChart size={20}/> Traffic by Channel</h3>
                 <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                        <Pie
                            data={trafficData.channelBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="channel"
                            label={({ channel, percent }) => `${channel} ${(percent * 100).toFixed(0)}%`}
                        >
                            {trafficData.channelBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #a855f7' }}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
             <div className="analytics-widget">
                <h3 className="analytics-widget-title"><Icons.BarChart3 size={20}/> Detailed Source Metrics</h3>
                <div className="analytics-table-container">
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th>Source</th>
                                <th>Users</th>
                                <th>Sessions</th>
                                <th>Bounce Rate</th>
                                <th>Avg. Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trafficData.sources.map(item => (
                                <tr key={item.source}>
                                    <td className="font-medium">{item.source}</td>
                                    <td>{item.users.toLocaleString()}</td>
                                    <td>{item.sessions.toLocaleString()}</td>
                                    <td className={item.bounceRate > 50 ? 'text-red-400' : 'text-green-400'}>
                                        {item.bounceRate.toFixed(1)}%
                                    </td>
                                    <td>{item.avgSessionDuration}</td>
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

export default TrafficSources;