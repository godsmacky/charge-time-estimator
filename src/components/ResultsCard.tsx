import type { CalcResults } from '../utils/calculator';

interface ResultsCardProps {
  results: CalcResults;
}

function formatTime(hours: number, minutes: number): string {
  if (hours === 0 && minutes === 0) return '0 min';
  if (hours === 0) return `${minutes} min`;
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

export function ResultsCard({ results }: ResultsCardProps) {
  const { energyToAdd, energyDrawn, chargeTimeHours, chargeTimeMinutes, cost, effectivePower } =
    results;

  const items = [
    {
      label: 'Energy Added to Battery',
      value: `${energyToAdd.toFixed(2)} kWh`,
      icon: '🔋',
    },
    {
      label: 'Energy Drawn from Wall',
      value: `${energyDrawn.toFixed(2)} kWh`,
      icon: '🔌',
    },
    {
      label: 'Estimated Charge Time',
      value: formatTime(chargeTimeHours, chargeTimeMinutes),
      icon: '⏱️',
      highlight: true,
    },
    {
      label: 'Estimated Cost',
      value: `$${cost.toFixed(2)}`,
      icon: '💲',
      highlight: true,
    },
    {
      label: 'Effective Charging Power',
      value: `${effectivePower.toFixed(2)} kW`,
      icon: '⚡',
    },
  ];

  return (
    <div className="results-card" role="region" aria-label="Calculation results">
      <h2 className="results-title">Results</h2>
      <div className="results-grid">
        {items.map((item) => (
          <div key={item.label} className={`result-item${item.highlight ? ' highlight' : ''}`}>
            <span className="result-icon" aria-hidden="true">
              {item.icon}
            </span>
            <div className="result-content">
              <span className="result-label">{item.label}</span>
              <span className="result-value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
