
import React from 'react';
import './stat-card.css';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: string;
  trendColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendColor }) => {
  return (
    <div className="stat-card-bordered bg-white/5 backdrop-blur-2xl rounded-3xl flex flex-col justify-between min-w-0 shadow-2xl shadow-black/40 transition-all duration-300 hover:bg-white/10">
      <div className="flex justify-between items-start gap-2">
        <span className="stat-card-title text-gray-300 leading-tight">{title}</span>
        <div className="text-purple-400 shrink-0">
            <Icon className="stat-card-icon" />
        </div>
      </div>
      <div>
        <p className="font-orbitron font-bold text-white stat-card-value leading-tight">{value}</p>
        <p className={`${trendColor} text-[clamp(10px,2vw,14px)] leading-tight`}>{trend}</p>
      </div>
    </div>
  );
};

export default StatCard;