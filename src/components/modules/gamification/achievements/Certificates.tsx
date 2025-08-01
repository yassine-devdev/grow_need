import React from 'react';
import { Icons } from '../../../icons';
import './Certificates.css';

const mockCertificates = [
  { id: 1, title: "Algebra I Mastery", course: "Mathematics", date: "May 25, 2024", icon: Icons.Calculator },
  { id: 2, title: "Public Speaking", course: "Communication", date: "April 18, 2024", icon: Icons.Megaphone },
  { id: 3, title: "Lab Safety", course: "Science", date: "February 10, 2024", icon: Icons.FlaskConical },
];

const Certificates: React.FC = () => {
    return (
        <div className="certificates-container">
            <div className="gamification-header">
                <div>
                    <h2 className="font-orbitron text-3xl font-bold text-white">Certificates</h2>
                    <p className="text-gray-400">Formal recognition for completing major courses and achievements.</p>
                </div>
            </div>
            <div className="certificates-grid">
                {mockCertificates.map(cert => {
                    const CertIcon = cert.icon;
                    return (
                        <div key={cert.id} className="certificate-card">
                            <div className="cert-header">
                                <div className="cert-icon-wrapper"><CertIcon size={24} /></div>
                                <h3 className="cert-title">{cert.title}</h3>
                            </div>
                            <div className="cert-body">
                                <p className="cert-recipient">Awarded to: [Student Name]</p>
                                <p className="cert-date">Date Issued: {cert.date}</p>
                                <p className="cert-course">Course: {cert.course}</p>
                            </div>
                            <div className="cert-footer">
                                <div className="cert-seal">
                                    <Icons.Award size={32} />
                                </div>
                                <div className="cert-signature">
                                    <p>Official Recognition</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Certificates;