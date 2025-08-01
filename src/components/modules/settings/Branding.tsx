import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../../icons';
import { applyTheme } from './theme-utils';
import './shared.css';
import './Branding.css';

const defaultTheme = {
  '--main-background-style': 'radial-gradient(ellipse 80% 80% at 50% -20%,rgba(120,119,198,0.3), hsla(0,0%,100%,0))',
  '--main-background-color': '#1e1935',
  '--header-background': 'rgba(30, 25, 53, 0.5)',
  '--header-border': '1px solid rgba(96, 165, 250, 0.4)',
  '--header-box-shadow': '0 4px 30px rgba(0, 0, 0, 0.1)',
  '--header-text': '#f3f4f6',
  '--dock-background': 'rgba(30, 25, 53, 0.5)',
  '--dock-border': '1px solid rgba(96, 165, 250, 0.4)',
  '--dock-box-shadow': '0 -4px 30px rgba(0, 0, 0, 0.1)',
  '--main-nav-background': 'rgba(30, 25, 53, 0.4)',
  '--main-nav-border': '1px solid rgba(192, 132, 252, 0.3)',
  '--main-nav-box-shadow': '0 4px 30px rgba(0, 0, 0, 0.2)',
  '--contextual-nav-background': 'rgba(30, 25, 53, 0.4)',
  '--contextual-nav-border': '1px solid rgba(192, 132, 252, 0.3)',
  '--contextual-nav-box-shadow': '0 4px 30px rgba(0, 0, 0, 0.2)',
  '--card-background': 'rgba(255, 255, 255, 0.05)',
  '--card-border': '1px solid rgba(96, 165, 250, 0.2)',
  '--card-box-shadow': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  '--card-primary-text': '#ffffff',
  '--card-secondary-text': '#d1d5db',
  '--card-icon-color': '#c084fc',
  '--l1-nav-active-background': 'rgba(192, 132, 252, 0.5)',
  '--l1-nav-active-text': '#ffffff',
  '--l2-nav-active-background': '#a855f7',
  '--l2-nav-active-text': '#ffffff',
  '--l2-nav-active-shadow': '0 0 10px rgba(168, 85, 247, 0.5)',
  '--search-input-background': 'rgba(0, 0, 0, 0.2)',
  '--search-input-border': '1px solid rgba(255, 255, 255, 0.1)',
  '--search-input-box-shadow': 'none',
  '--search-input-text': '#ffffff',
  '--search-input-focus-border': '1px solid rgba(168, 85, 247, 0.6)',
  '--search-input-focus-box-shadow': '0 0 10px rgba(168, 85, 247, 0.5)',
};

const cyberpunkTheme = {
    ...defaultTheme,
    '--main-background-color': '#0d0221',
    '--main-background-style': 'radial-gradient(ellipse 80% 80% at 50% -20%,rgba(240, 0, 255, 0.2), hsla(0,0%,100%,0))',
    '--header-border': '1px solid rgba(240, 0, 255, 0.4)',
    '--dock-border': '1px solid rgba(240, 0, 255, 0.4)',
    '--main-nav-border': '1px solid rgba(0, 255, 255, 0.3)',
    '--contextual-nav-border': '1px solid rgba(0, 255, 255, 0.3)',
    '--card-border': '1px solid rgba(0, 255, 255, 0.2)',
    '--card-icon-color': '#f000ff',
    '--l1-nav-active-background': 'rgba(0, 255, 255, 0.3)',
    '--l2-nav-active-background': '#f000ff',
    '--l2-nav-active-shadow': '0 0 15px rgba(240, 0, 255, 0.7)',
    '--search-input-focus-border': '1px solid rgba(0, 255, 255, 0.6)',
    '--search-input-focus-box-shadow': '0 0 10px rgba(0, 255, 255, 0.5)',
};

const solarizedTheme = {
    ...defaultTheme,
    '--main-background-color': '#002b36',
    '--main-background-style': 'none',
    '--header-background': 'rgba(7, 54, 66, 0.5)',
    '--header-text': '#93a1a1',
    '--header-border': '1px solid rgba(38, 139, 210, 0.4)',
    '--dock-background': 'rgba(7, 54, 66, 0.5)',
    '--dock-border': '1px solid rgba(38, 139, 210, 0.4)',
    '--main-nav-background': 'rgba(7, 54, 66, 0.4)',
    '--contextual-nav-background': 'rgba(7, 54, 66, 0.4)',
    '--card-background': 'rgba(7, 54, 66, 0.7)',
    '--card-border': '1px solid rgba(38, 139, 210, 0.2)',
    '--card-primary-text': '#eee8d5',
    '--card-secondary-text': '#839496',
    '--card-icon-color': '#2aa198',
    '--l1-nav-active-background': 'rgba(38, 139, 210, 0.5)',
    '--l1-nav-active-text': '#eee8d5',
    '--l2-nav-active-background': '#cb4b16',
    '--l2-nav-active-text': '#eee8d5',
    '--l2-nav-active-shadow': '0 0 15px rgba(203, 75, 22, 0.5)',
    '--search-input-background': 'rgba(0,0,0,0.3)',
    '--search-input-text': '#eee8d5',
    '--search-input-focus-border': '1px solid rgba(38, 139, 210, 0.6)',
    '--search-input-focus-box-shadow': '0 0 10px rgba(38, 139, 210, 0.5)',
};

const skeuomorphismTheme = {
    ...defaultTheme,
    '--main-background-color': '#3d2c25',
    '--main-background-style': 'linear-gradient(rgba(255,255,255,0.05), rgba(0,0,0,0.05)), radial-gradient(circle at top left, #5a4238, #3d2c25)',
    '--header-background': 'rgba(40, 29, 24, 0.7)',
    '--header-text': '#f5eeda',
    '--header-border': '1px solid #775c4f',
    '--dock-background': 'rgba(40, 29, 24, 0.7)',
    '--dock-border': '1px solid #775c4f',
    '--card-background': 'rgba(61, 44, 37, 0.8)',
    '--card-border': '1px solid #775c4f',
    '--card-box-shadow': 'inset 0 1px 1px rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.5)',
    '--card-primary-text': '#f5eeda',
    '--card-secondary-text': '#d1c7b8',
    '--card-icon-color': '#e59400',
    '--l1-nav-active-background': 'rgba(229, 148, 0, 0.4)',
    '--l2-nav-active-background': '#e59400',
    '--l2-nav-active-shadow': '0 0 15px rgba(229, 148, 0, 0.6)',
};

const neomorphismTheme = {
    ...defaultTheme,
    '--main-background-color': '#2c2f38',
    '--main-background-style': 'none',
    '--header-background': 'rgba(44, 47, 56, 0.5)',
    '--header-text': '#c1c8e4',
    '--header-border': '1px solid rgba(255,255,255,0.05)',
    '--dock-background': 'rgba(44, 47, 56, 0.5)',
    '--dock-border': '1px solid rgba(255,255,255,0.05)',
    '--card-background': '#2c2f38',
    '--card-border': '1px solid rgba(255,255,255,0.05)',
    '--card-box-shadow': '8px 8px 16px #202228, -8px -8px 16px #383c48',
    '--card-primary-text': '#c1c8e4',
    '--card-secondary-text': '#828bb4',
    '--card-icon-color': '#c1c8e4',
    '--l1-nav-active-background': '#2c2f38',
    '--l1-nav-active-text': '#c1c8e4',
    '--l2-nav-active-background': '#353943',
    '--l2-nav-active-text': '#c1c8e4',
    '--l2-nav-active-shadow': 'inset 6px 6px 12px #202228, inset -6px -6px 12px #383c48',
};

const presets = [
    { name: "Aura Default", theme: defaultTheme },
    { name: "Cyberpunk", theme: cyberpunkTheme },
    { name: "Solarized", theme: solarizedTheme },
    { name: "Skeuomorphism", theme: skeuomorphismTheme },
    { name: "Neomorphism", theme: neomorphismTheme },
];

const AccordionSection = ({ title, children, isOpen, onToggle }) => (
  <div className="accordion-section">
    <button onClick={onToggle} className="accordion-header">
      <span>{title}</span>
      <Icons.ChevronRight className={`accordion-icon ${isOpen ? 'open' : ''}`} />
    </button>
    {isOpen && <div className="accordion-content">{children}</div>}
  </div>
);

const ColorControl = ({ label, value, onChange }) => {
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };
    
    const colorPickerValue = (value.match(/#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)/) || ['#000000'])[0];

    return (
        <div className="control-item">
            <label>{label}</label>
            <div className="color-input-wrapper">
                <input type="color" value={colorPickerValue} onChange={handleColorChange} />
                <input type="text" value={value} onChange={handleTextChange} className="color-text-input" />
            </div>
        </div>
    );
};

const Branding: React.FC = () => {
    const [themeColors, setThemeColors] = useState(() => {
        const savedTheme = localStorage.getItem('aura-theme');
        return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
    });
    const [activePreset, setActivePreset] = useState('Aura Default');
    const [openAccordion, setOpenAccordion] = useState<string | null>('layout');

    useEffect(() => {
        applyTheme(themeColors);
    }, [themeColors]);

    const handleColorChange = useCallback((key: string, value: string) => {
        setThemeColors(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleSave = () => {
        localStorage.setItem('aura-theme', JSON.stringify(themeColors));
        alert('Theme saved!');
    };
    
    const handleReset = () => {
        localStorage.removeItem('aura-theme');
        setThemeColors(defaultTheme);
        setActivePreset('Aura Default');
    };

    const handlePreset = (preset) => {
        setThemeColors(preset.theme);
        setActivePreset(preset.name);
    };

    const themeGroups = {
        layout: ['--main-background-color', '--main-background-style'],
        header: ['--header-background', '--header-border', '--header-box-shadow', '--header-text'],
        dock: ['--dock-background', '--dock-border', '--dock-box-shadow'],
        navigation: [
            '--main-nav-background', '--main-nav-border', '--main-nav-box-shadow',
            '--contextual-nav-background', '--contextual-nav-border', '--contextual-nav-box-shadow',
            '--l1-nav-active-background', '--l1-nav-active-text',
            '--l2-nav-active-background', '--l2-nav-active-text', '--l2-nav-active-shadow'
        ],
        cards: ['--card-background', '--card-border', '--card-box-shadow', '--card-primary-text', '--card-secondary-text', '--card-icon-color'],
        ui: [
            '--search-input-background', '--search-input-border', '--search-input-box-shadow', '--search-input-text',
            '--search-input-focus-border', '--search-input-focus-box-shadow'
        ]
    };
  
  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            <Icons.Branding size={40} className="text-cyan-400"/>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Branding</h2>
                <p className="text-gray-400">Customize your application's colors and appearance.</p>
            </div>
        </div>
        
        <div className="theme-editor-layout">
            <div className="theme-controls-wrapper">
                <div className="theme-presets">
                    {presets.map(p => (
                        <button key={p.name} onClick={() => handlePreset(p)} className={`preset-btn ${activePreset === p.name ? 'active' : ''}`} style={{ background: p.theme['--main-background-color'], border: `1px solid ${p.theme['--l2-nav-active-background']}` }}>
                            {p.name}
                        </button>
                    ))}
                </div>
                
                <div className="theme-controls-actions">
                     <button onClick={handleReset} className="settings-button"><Icons.Revert size={16}/> Reset to Default</button>
                     <button onClick={handleSave} className="settings-save-button"><Icons.Save size={18}/> Save Theme</button>
                </div>
                
                {Object.entries(themeGroups).map(([key, value]) => (
                     <AccordionSection key={key} title={key.charAt(0).toUpperCase() + key.slice(1)} isOpen={openAccordion === key} onToggle={() => setOpenAccordion(openAccordion === key ? null : key)}>
                        {value.map(cssVar => (
                             <ColorControl key={cssVar} label={cssVar.replace(/--|-/g, ' ')} value={themeColors[cssVar] || ''} onChange={(val) => handleColorChange(cssVar, val)} />
                        ))}
                    </AccordionSection>
                ))}
            </div>

            <div className="live-preview-wrapper">
                <h3 className="live-preview-title">Live Preview</h3>
                <div className="live-preview-area">
                    <div className="stat-card-preview">
                        <span className="stat-card-secondary-text">Sample Stat Card</span>
                        <p className="font-orbitron text-3xl font-bold stat-card-primary-text">1,284</p>
                        <Icons.Students size={24} className="stat-card-icon" />
                    </div>
                    <div className="nav-preview-container">
                        <div className="l1-nav-preview-active"><Icons.School size={16}/> L1 Active</div>
                        <div className="l2-nav-preview-active"><Icons.Users size={16}/> L2 Active</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Branding;
