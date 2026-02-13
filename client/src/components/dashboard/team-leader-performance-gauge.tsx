import GaugeComponent from 'react-gauge-component';

interface TeamLeaderPerformanceGaugeProps {
  value: number;
  size?: number;
}

export default function TeamLeaderPerformanceGauge({ value, size = 250 }: TeamLeaderPerformanceGaugeProps) {
  // Map value (0-100) to gauge segments
  // STRONG BEAR: 0-16.67, BEAR: 16.67-33.33, BEARISH: 33.33-50, BULLISH: 50-66.67, BULL: 66.67-83.33, STRONG BULL: 83.33-100
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
              limit: 16.67,
              color: '#DC2626', // Red - STRONG BEAR
              showTick: true,
            },
            {
              limit: 33.33,
              color: '#EF4444', // Lighter Red - BEAR
              showTick: true,
            },
            {
              limit: 50,
              color: '#F59E0B', // Orange/Yellow - BEARISH
              showTick: true,
            },
            {
              limit: 66.67,
              color: '#84CC16', // Light Green - BULLISH
              showTick: true,
            },
            {
              limit: 83.33,
              color: '#22C55E', // Green - BULL
              showTick: true,
            },
            {
              limit: 100,
              color: '#16A34A', // Dark Green - STRONG BULL
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
              { value: 16.67 },
              { value: 33.33 },
              { value: 50 },
              { value: 66.67 },
              { value: 83.33 },
              { value: 100 }
            ],
            defaultTickValueConfig: {
              formatTextValue: (value: number) => {
                if (value === 0) return 'STRONG BEAR';
                if (value === 16.67) return 'BEAR';
                if (value === 33.33) return 'BEARISH';
                if (value === 50) return 'BULLISH';
                if (value === 66.67) return 'BULL';
                if (value === 83.33) return 'STRONG BULL';
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

