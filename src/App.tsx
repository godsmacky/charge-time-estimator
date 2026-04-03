import { useState, useEffect, useCallback } from 'react';
import { calculate, encodeParams, decodeParams } from './utils/calculator';
import type { CalcInputs } from './utils/calculator';
import { ChargerPresets } from './components/ChargerPresets';
import { ResultsCard } from './components/ResultsCard';
import { ShareButton } from './components/ShareButton';
import { DarkModeToggle } from './components/DarkModeToggle';
import './App.css';

const DEFAULTS: CalcInputs = {
  batteryCapacity: 75,
  currentSoc: 20,
  targetSoc: 80,
  chargerPower: 7.2,
  efficiency: 90,
  electricityPrice: 0.13,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [inputs, setInputs] = useState<CalcInputs>(() => {
    const fromUrl = decodeParams(window.location.search);
    return { ...DEFAULTS, ...fromUrl };
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CalcInputs, string>>>({});

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const validate = useCallback((vals: CalcInputs): Partial<Record<keyof CalcInputs, string>> => {
    const e: Partial<Record<keyof CalcInputs, string>> = {};
    if (vals.batteryCapacity <= 0) e.batteryCapacity = 'Must be > 0';
    if (vals.currentSoc < 0 || vals.currentSoc > 100) e.currentSoc = 'Must be 0–100';
    if (vals.targetSoc < 0 || vals.targetSoc > 100) e.targetSoc = 'Must be 0–100';
    if (vals.targetSoc < vals.currentSoc) e.targetSoc = 'Must be ≥ current SOC';
    if (vals.chargerPower <= 0) e.chargerPower = 'Must be > 0';
    if (vals.efficiency < 50 || vals.efficiency > 100) e.efficiency = 'Must be 50–100';
    if (vals.electricityPrice < 0) e.electricityPrice = 'Must be ≥ 0';
    return e;
  }, []);

  const handleChange = (field: keyof CalcInputs, raw: string) => {
    const num = parseFloat(raw);
    const updated = { ...inputs, [field]: isNaN(num) ? inputs[field] : num };
    setInputs(updated);
    setErrors(validate(updated));
  };

  const handlePreset = (power: number) => {
    const updated = { ...inputs, chargerPower: power };
    setInputs(updated);
    setErrors(validate(updated));
  };

  const hasErrors = Object.keys(errors).length > 0;
  const results = hasErrors ? null : calculate(inputs);

  const getShareUrl = useCallback(() => {
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}?${encodeParams(inputs)}`;
  }, [inputs]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <span className="header-icon" aria-hidden="true">⚡</span>
            <h1>EV Charge Estimator</h1>
          </div>
          <div className="header-actions">
            <ShareButton getShareUrl={getShareUrl} />
            <DarkModeToggle darkMode={darkMode} onToggle={() => setDarkMode((d) => !d)} />
          </div>
        </div>
      </header>

      <main className="app-main">
        <form
          className="calc-form"
          onSubmit={(e) => e.preventDefault()}
          aria-label="EV charging calculator"
          noValidate
        >
          <section className="form-section" aria-label="Battery settings">
            <h2 className="section-title">Battery</h2>
            <div className="form-row">
              <div className="field">
                <label htmlFor="batteryCapacity">Battery Capacity (kWh)</label>
                <input
                  id="batteryCapacity"
                  type="number"
                  min="1"
                  step="0.1"
                  value={inputs.batteryCapacity}
                  onChange={(e) => handleChange('batteryCapacity', e.target.value)}
                  aria-describedby={errors.batteryCapacity ? 'err-cap' : undefined}
                  aria-invalid={!!errors.batteryCapacity}
                />
                {errors.batteryCapacity && (
                  <span id="err-cap" className="field-error" role="alert">
                    {errors.batteryCapacity}
                  </span>
                )}
              </div>
            </div>

            <div className="form-row two-col">
              <div className="field">
                <label htmlFor="currentSoc">Current SOC (%)</label>
                <input
                  id="currentSoc"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={inputs.currentSoc}
                  onChange={(e) => handleChange('currentSoc', e.target.value)}
                  aria-describedby={errors.currentSoc ? 'err-cur' : undefined}
                  aria-invalid={!!errors.currentSoc}
                />
                {errors.currentSoc && (
                  <span id="err-cur" className="field-error" role="alert">
                    {errors.currentSoc}
                  </span>
                )}
              </div>

              <div className="field">
                <label htmlFor="targetSoc">Target SOC (%)</label>
                <input
                  id="targetSoc"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={inputs.targetSoc}
                  onChange={(e) => handleChange('targetSoc', e.target.value)}
                  aria-describedby={errors.targetSoc ? 'err-tgt' : undefined}
                  aria-invalid={!!errors.targetSoc}
                />
                {errors.targetSoc && (
                  <span id="err-tgt" className="field-error" role="alert">
                    {errors.targetSoc}
                  </span>
                )}
              </div>
            </div>

            {/* SOC visual bar */}
            <div className="soc-bar-container" aria-hidden="true">
              <div className="soc-bar">
                <div
                  className="soc-bar-fill current"
                  style={{ width: `${clamp(inputs.currentSoc, 0, 100)}%` }}
                />
                <div
                  className="soc-bar-fill target"
                  style={{
                    left: `${clamp(inputs.currentSoc, 0, 100)}%`,
                    width: `${clamp(inputs.targetSoc - inputs.currentSoc, 0, 100)}%`,
                  }}
                />
              </div>
              <div className="soc-bar-labels">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </section>

          <section className="form-section" aria-label="Charger settings">
            <h2 className="section-title">Charger</h2>
            <ChargerPresets currentPower={inputs.chargerPower} onSelect={handlePreset} />

            <div className="form-row two-col">
              <div className="field">
                <label htmlFor="chargerPower">Charger Power (kW)</label>
                <input
                  id="chargerPower"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={inputs.chargerPower}
                  onChange={(e) => handleChange('chargerPower', e.target.value)}
                  aria-describedby={errors.chargerPower ? 'err-pwr' : undefined}
                  aria-invalid={!!errors.chargerPower}
                />
                {errors.chargerPower && (
                  <span id="err-pwr" className="field-error" role="alert">
                    {errors.chargerPower}
                  </span>
                )}
              </div>

              <div className="field">
                <label htmlFor="efficiency">Charging Efficiency (%)</label>
                <input
                  id="efficiency"
                  type="number"
                  min="50"
                  max="100"
                  step="1"
                  value={inputs.efficiency}
                  onChange={(e) => handleChange('efficiency', e.target.value)}
                  aria-describedby={errors.efficiency ? 'err-eff' : undefined}
                  aria-invalid={!!errors.efficiency}
                />
                {errors.efficiency && (
                  <span id="err-eff" className="field-error" role="alert">
                    {errors.efficiency}
                  </span>
                )}
              </div>
            </div>
          </section>

          <section className="form-section" aria-label="Cost settings">
            <h2 className="section-title">Cost</h2>
            <div className="form-row">
              <div className="field">
                <label htmlFor="electricityPrice">Electricity Price ($/kWh)</label>
                <input
                  id="electricityPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={inputs.electricityPrice}
                  onChange={(e) => handleChange('electricityPrice', e.target.value)}
                  aria-describedby={errors.electricityPrice ? 'err-pri' : undefined}
                  aria-invalid={!!errors.electricityPrice}
                />
                {errors.electricityPrice && (
                  <span id="err-pri" className="field-error" role="alert">
                    {errors.electricityPrice}
                  </span>
                )}
              </div>
            </div>
          </section>
        </form>

        {results && <ResultsCard results={results} />}

        {hasErrors && (
          <div className="error-summary" role="alert">
            Please fix the highlighted errors to see results.
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Estimates only. Actual charge times may vary based on vehicle, charger, and conditions.
        </p>
      </footer>
    </div>
  );
}
