import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../../icons';
import { applyDesign } from './theme-utils';
import './shared.css';
import './Design.css';

const defaultDesign = {
    '--border-radius-global': '1.5rem',
    '--header-height': '4rem',
    '--main-nav-width': '72px',
    '--main-nav-icon-size': '28px',
    '--stat-card-padding': '1rem',
    '--stat-card-title-font-size': '14px',
    '--stat-card-value-font-size': '36px',
    '--stat-card-icon-size': '32px',
};

const SliderControl = ({ label, value, onChange, min, max, step, unit }) => {
    return (
        <div className="control-item">
            <label>{label}</label>
            <div className="slider-input-wrapper">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={parseFloat(value)}
                    onChange={e => onChange(`${e.target.value}${unit}`)}
                    aria-label={label}
                />
                <span className="slider-value">{value}</span>
            </div>
        </div>
    );
};

const Design: React.FC = () => {
    const [design, setDesign] = useState(() => {
        const savedDesign = localStorage.getItem('aura-design');
        return savedDesign ? JSON.parse(savedDesign) : defaultDesign;
    });

    useEffect(() => {
        applyDesign(design);
    }, [design]);

    const handleDesignChange = useCallback((key: string, value: string) => {
        setDesign(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleSave = () => {
        localStorage.setItem('aura-design', JSON.stringify(design));
        alert('Design settings saved!');
    };

    const handleReset = () => {
        localStorage.removeItem('aura-design');
        setDesign(defaultDesign);
    };

    return (
        <div className="settings-pane-container">
            <div className="settings-header">
                <Icons.Design size={40} className="text-cyan-400" />
                <div>
                    <h2 className="font-orbitron text-3xl font-bold text-white">Design</h2>
                    <p className="text-gray-400">Customize the application's layout, spacing, and sizing.</p>
                </div>
            </div>
            <div className="settings-card">
                 <div className="settings-card-header">
                    <div>
                        <h3 className="settings-card-title">Layout & Sizing</h3>
                        <p className="settings-card-description">Adjust key metrics of the UI. Changes are applied live.</p>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="design-accordion-section">
                        <h4 className="design-accordion-header">Global Styles</h4>
                        <div className="design-accordion-content">
                            <SliderControl label="Border Radius" value={design['--border-radius-global']} onChange={v => handleDesignChange('--border-radius-global', v)} min={0} max={4} step={0.1} unit="rem" />
                        </div>
                    </div>
                    <div className="design-accordion-section">
                         <h4 className="design-accordion-header">Navigation</h4>
                        <div className="design-accordion-content">
                             <SliderControl label="Header Height" value={design['--header-height']} onChange={v => handleDesignChange('--header-height', v)} min={3} max={6} step={0.1} unit="rem" />
                             <SliderControl label="Main Nav Width" value={design['--main-nav-width']} onChange={v => handleDesignChange('--main-nav-width', v)} min={60} max={100} step={1} unit="px" />
                             <SliderControl label="Main Nav Icon Size" value={design['--main-nav-icon-size']} onChange={v => handleDesignChange('--main-nav-icon-size', v)} min={24} max={40} step={1} unit="px" />
                        </div>
                    </div>
                     <div className="design-accordion-section">
                         <h4 className="design-accordion-header">Cards</h4>
                        <div className="design-accordion-content">
                             <SliderControl label="Stat Card Padding" value={design['--stat-card-padding']} onChange={v => handleDesignChange('--stat-card-padding', v)} min={0.5} max={2} step={0.1} unit="rem" />
                             <SliderControl label="Stat Card Title Font Size" value={design['--stat-card-title-font-size']} onChange={v => handleDesignChange('--stat-card-title-font-size', v)} min={12} max={18} step={1} unit="px" />
                             <SliderControl label="Stat Card Value Font Size" value={design['--stat-card-value-font-size']} onChange={v => handleDesignChange('--stat-card-value-font-size', v)} min={24} max={48} step={1} unit="px" />
                              <SliderControl label="Stat Card Icon Size" value={design['--stat-card-icon-size']} onChange={v => handleDesignChange('--stat-card-icon-size', v)} min={24} max={48} step={1} unit="px" />
                        </div>
                    </div>
                 </div>
                <div className="settings-card-footer">
                    <div className="flex gap-4">
                        <button onClick={handleReset} className="settings-button"><Icons.Revert size={16}/> Reset</button>
                        <button onClick={handleSave} className="settings-save-button"><Icons.Save size={18}/> Save Design</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Design;
