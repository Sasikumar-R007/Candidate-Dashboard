import GaugeComponent from 'react-gauge-component';

interface TeamLeaderPerformanceGaugeProps {
  value: number;
  size?: number;
}

export default function TeamLeaderPerformanceGauge({ value, size = 250 }: TeamLeaderPerformanceGaugeProps) {
  // Map value (0-100) to gauge segments with proper performance names
  // Poor: 0-20, Below Average: 20-40, Average: 40-60, Good: 60-80, Excellent: 80-100
  return (
    <div className="flex flex-col items-center">
      <GaugeComponent
        type="semicircle"
        arc={{
          width: 0.2,
          padding: 0.005,
          cornerRadius: 1,
          subArcs: [
            {
              limit: 20,
              color: '#DC2626', // Red - Poor
              showTick: true,
            },
            {
              limit: 40,
              color: '#EF4444', // Lighter Red - Below Average
              showTick: true,
            },
            {
              limit: 60,
              color: '#F59E0B', // Orange/Yellow - Average
              showTick: true,
            },
            {
              limit: 80,
              color: '#84CC16', // Light Green - Good
              showTick: true,
            },
            {
              limit: 100,
              color: '#22C55E', // Green - Excellent
              showTick: true,
            }
          ]
        }}
        pointer={{
          color: '#1F2937',
          length: 0.80,
          width: 15,
          elastic: true,
        }}
        labels={{
          valueLabel: {
            hide: true, // Hide the center value
          },
          tickLabels: {
            type: 'outer',
            ticks: [
              { value: 0 },
              { value: 20 },
              { value: 40 },
              { value: 60 },
              { value: 80 },
              { value: 100 }
            ],
            defaultTickValueConfig: {
              formatTextValue: (value: number) => {
                if (value === 0) return 'Poor';
                if (value === 20) return 'Below Avg';
                if (value === 40) return 'Average';
                if (value === 60) return 'Good';
                if (value === 80) return 'Excellent';
                return '';
              },
              style: {
                fontSize: '10px',
                fill: '#374151',
                fontWeight: '500'
              }
            }
          }
        }}
        value={value}
        minValue={0}
        maxValue={100}
      />
    </div>
  );
}

