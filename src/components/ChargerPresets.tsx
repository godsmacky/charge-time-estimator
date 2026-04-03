interface Preset {
  label: string;
  sublabel: string;
  power: number;
}

const PRESETS: Preset[] = [
  { label: 'Level 1', sublabel: '1.4 kW', power: 1.4 },
  { label: 'Level 2', sublabel: '7.2 kW', power: 7.2 },
  { label: 'DC Fast', sublabel: '50 kW', power: 50 },
  { label: 'DC Fast', sublabel: '150 kW', power: 150 },
];

interface ChargerPresetsProps {
  currentPower: number;
  onSelect: (power: number) => void;
}

export function ChargerPresets({ currentPower, onSelect }: ChargerPresetsProps) {
  return (
    <div className="presets">
      <span className="presets-label">Quick select charger:</span>
      <div className="presets-buttons">
        {PRESETS.map((preset) => (
          <button
            key={preset.power}
            type="button"
            className={`preset-btn${currentPower === preset.power ? ' active' : ''}`}
            onClick={() => onSelect(preset.power)}
            aria-pressed={currentPower === preset.power}
          >
            <span className="preset-name">{preset.label}</span>
            <span className="preset-power">{preset.sublabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
