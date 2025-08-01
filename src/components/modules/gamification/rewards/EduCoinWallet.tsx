import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Icons } from '../../../icons';
import './EduCoinWallet.css';

const mockWalletData = {
    balance: 2850,
    history: [
        { date: '2024-10-28', description: 'Daily Login Bonus', amount: 10 },
        { date: '2024-10-27', description: 'Quiz Master Badge', amount: 50 },
        { date: '2024-10-27', description: 'Redeemed: School Hoodie', amount: -500 },
        { date: '2024-10-26', description: 'Perfect Week Achievement', amount: 100 },
        { date: '2024-10-25', description: 'Daily Login Bonus', amount: 10 },
    ],
    chartData: [
        { name: 'Mon', earnings: 50 },
        { name: 'Tue', earnings: 10 },
        { name: 'Wed', earnings: 110 },
        { name: 'Thu', earnings: 10 },
        { name: 'Fri', earnings: 60 },
        { name: 'Sat', earnings: 10 },
        { name: 'Sun', earnings: 10 },
    ]
};

const EduCoinWallet: React.FC = () => {
    return (
        <div className="wallet-container">
             <div className="gamification-header">
                <div>
                    <h2 className="font-orbitron text-3xl font-bold text-white">EduCoin Wallet</h2>
                    <p className="text-gray-400">Your balance and transaction history.</p>
                </div>
            </div>
            <div className="wallet-main-grid">
                <div className="balance-card">
                    <p className="balance-label">Current Balance</p>
                    <p className="balance-amount">
                        <Icons.EduCoinWallet size={32} />
                        {mockWalletData.balance.toLocaleString()}
                    </p>
                    <div className="balance-actions">
                        <button>Send</button>
                        <button>Request</button>
                    </div>
                </div>
                <div className="earnings-chart-card">
                    <h4 className="earnings-title">Earnings This Week</h4>
                     <ResponsiveContainer width="100%" height={120}>
                        <AreaChart data={mockWalletData.chartData}>
                             <defs>
                                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(30,25,53,0.8)', border: '1px solid #facc15' }} />
                            <Area type="monotone" dataKey="earnings" stroke="#facc15" strokeWidth={2} fill="url(#colorEarnings)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                 <div className="transaction-history-card">
                    <h3 className="transaction-title">Transaction History</h3>
                    <div className="transaction-list">
                        {mockWalletData.history.map((tx, index) => (
                            <div key={index} className="transaction-item">
                                <div className={`transaction-icon ${tx.amount > 0 ? 'income' : 'expense'}`}>
                                    {tx.amount > 0 ? <Icons.Plus size={16}/> : <Icons.Minus size={16}/>}
                                </div>
                                <div>
                                    <p className="transaction-description">{tx.description}</p>
                                    <p className="transaction-date">{tx.date}</p>
                                </div>
                                <p className={`transaction-amount ${tx.amount > 0 ? 'income' : 'expense'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EduCoinWallet;