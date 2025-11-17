import GaugeComponent from 'react-gauge-component';

interface PerformanceGaugeProps {
  value: number;
  size?: number;
}

export default function PerformanceGauge({ value, size = 200 }: PerformanceGaugeProps) {
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
              limit: 50,
              color: '#EF4444',
              showTick: true,
              tooltip: {
                text: 'Poor Performance'
              }
            },
            {
              limit: 75,
              color: '#F97316',
              showTick: true,
              tooltip: {
                text: 'Needs Improvement'
              }
            },
            {
              limit: 90,
              color: '#84CC16',
              showTick: true,
              tooltip: {
                text: 'Good Performance'
              }
            },
            {
              limit: 100,
              color: '#16A34A',
              showTick: true,
              tooltip: {
                text: 'Excellent'
              }
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
            formatTextValue: (value: number) => value.toFixed(1) + '%',
            style: {
              fontSize: '28px',
              fill: '#1F2937',
              textShadow: 'none'
            }
          },
          tickLabels: {
            type: 'outer',
            ticks: [
              { value: 0 },
              { value: 50 },
              { value: 75 },
              { value: 90 },
              { value: 100 }
            ],
            defaultTickValueConfig: {
              formatTextValue: (value: number) => value + '%',
              style: {
                fontSize: '10px',
                fill: '#6B7280'
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
