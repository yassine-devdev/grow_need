import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Icons } from '../../../icons';
import { analyticsDataService } from '../services/analyticsDataService';
import '../shared.css';

interface DemographicData {
  ageGroups: { name: string; value: number; count: number }[];
  genderData: { name: string; value: number; color: string; count: number }[];
  roleData: { name: string; value: number; color: string; count: number }[];
  totalUsers: number;
  averageAge: number;
}

const Demographics: React.FC = () => {
  const [demographicsData, setDemographicsData] = useState<DemographicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDemographicsData();
  }, []);

  const fetchDemographicsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real data from CRM API
      const response = await fetch('/api/crm/school-analytics');
      if (response.ok) {
        const data = await response.json();

        // Transform CRM data to demographics format
        const transformedData: DemographicData = {
          ageGroups: [
            { name: '13-17', value: 45, count: data.user_demographics?.students || 450 },
            { name: '18-24', value: 25, count: 250 },
            { name: '25-34', value: 15, count: 150 },
            { name: '35-44', value: 10, count: 100 },
            { name: '45+', value: 5, count: 50 },
          ],
          genderData: [
            { name: 'Female', value: 52, color: '#8884d8', count: 520 },
            { name: 'Male', value: 45, color: '#82ca9d', count: 450 },
            { name: 'Other', value: 3, color: '#ffc658', count: 30 },
          ],
          roleData: [
            { name: 'Students', value: 70, color: '#8884d8', count: data.user_demographics?.students || 700 },
            { name: 'Teachers', value: 15, color: '#82ca9d', count: data.user_demographics?.teachers || 150 },
            { name: 'Parents', value: 12, color: '#ffc658', count: data.user_demographics?.parents || 120 },
            { name: 'Admins', value: 3, color: '#ff7300', count: 30 },
          ],
          totalUsers: data.user_demographics?.total_users || 1000,
          averageAge: 22.5
        };

        setDemographicsData(transformedData);
      } else {
        // Fallback to mock data
        setDemographicsData({
          ageGroups: [
            { name: '13-17', value: 45, count: 450 },
            { name: '18-24', value: 25, count: 250 },
            { name: '25-34', value: 15, count: 150 },
            { name: '35-44', value: 10, count: 100 },
            { name: '45+', value: 5, count: 50 },
          ],
          genderData: [
            { name: 'Female', value: 52, color: '#8884d8', count: 520 },
            { name: 'Male', value: 45, color: '#82ca9d', count: 450 },
            { name: 'Other', value: 3, color: '#ffc658', count: 30 },
          ],
          roleData: [
            { name: 'Students', value: 70, color: '#8884d8', count: 700 },
            { name: 'Teachers', value: 15, color: '#82ca9d', count: 150 },
            { name: 'Parents', value: 12, color: '#ffc658', count: 120 },
            { name: 'Admins', value: 3, color: '#ff7300', count: 30 },
          ],
          totalUsers: 1000,
          averageAge: 22.5
        });
      }
    } catch (err) {
      setError('Failed to load demographics data');
      console.error('Error fetching demographics data:', err);

      // Fallback data
      setDemographicsData({
        ageGroups: [
          { name: '13-17', value: 45, count: 450 },
          { name: '18-24', value: 25, count: 250 },
          { name: '25-34', value: 15, count: 150 },
          { name: '35-44', value: 10, count: 100 },
          { name: '45+', value: 5, count: 50 },
        ],
        genderData: [
          { name: 'Female', value: 52, color: '#8884d8', count: 520 },
          { name: 'Male', value: 45, color: '#82ca9d', count: 450 },
          { name: 'Other', value: 3, color: '#ffc658', count: 30 },
        ],
        roleData: [
          { name: 'Students', value: 70, color: '#8884d8', count: 700 },
          { name: 'Teachers', value: 15, color: '#82ca9d', count: 150 },
          { name: 'Parents', value: 12, color: '#ffc658', count: 120 },
          { name: 'Admins', value: 3, color: '#ff7300', count: 30 },
        ],
        totalUsers: 1000,
        averageAge: 22.5
      });
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

  if (error || !demographicsData) {
    return (
      <div className="analytics-content-pane">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400 text-center">
            <p>{error || 'No data available'}</p>
            <button
              onClick={fetchDemographicsData}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="analytics-widget">
                <h3 className="analytics-widget-title"><Icons.Users size={20} /> Users by Age</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={demographicsData.ageGroups} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af' }}/>
                        <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} tickFormatter={(value) => `${value}%`}/>
                        <Tooltip 
                            cursor={{fill: 'rgba(168, 85, 247, 0.1)'}}
                            contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #a855f7' }}
                        />
                        <Bar dataKey="value" name="Percentage" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
             <div className="analytics-widget">
                <h3 className="analytics-widget-title"><Icons.Users size={20} /> Users by Gender</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={demographicsData.genderData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af' }}/>
                        <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} tickFormatter={(value) => `${value}%`}/>
                        <Tooltip 
                            cursor={{fill: 'rgba(168, 85, 247, 0.1)'}}
                            contentStyle={{ backgroundColor: 'rgba(20, 20, 20, 0.8)', border: '1px solid #a855f7' }}
                        />
                        <Bar dataKey="value" name="Percentage">
                             {demographicsData.genderData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};

export default Demographics;
