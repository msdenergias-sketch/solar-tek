import React from 'react';

interface BarChartData {
    label: string;
    value: number;
    color: string;
}

interface BarChartProps {
    data: BarChartData[];
    height?: number;
    barWidth?: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, height = 150, barWidth = 40 }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    const chartWidth = data.length * (barWidth + 20) + 40; // Add padding

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${chartWidth} ${height}`} className="font-sans">
            <line x1="30" y1={height - 20} x2={chartWidth - 10} y2={height - 20} stroke="#cbd5e1" strokeWidth="1" />
            
            {data.map((item, index) => {
                const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 40) : 0;
                const x = 40 + index * (barWidth + 20);
                const y = height - 20 - barHeight;

                return (
                    <g key={index}>
                        <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            fill={item.color}
                            className="transition-all duration-300 hover:opacity-80"
                        >
                             <title>{`${item.label}: ${formatCurrency(item.value)}`}</title>
                        </rect>
                        <text
                            x={x + barWidth / 2}
                            y={y - 5}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="bold"
                            fill="#475569"
                        >
                            {formatCurrency(item.value)}
                        </text>
                        <text
                            x={x + barWidth / 2}
                            y={height - 5}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#475569"
                        >
                            {item.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

export default BarChart;
