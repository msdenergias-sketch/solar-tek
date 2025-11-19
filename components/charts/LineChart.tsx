import React from 'react';

interface LineChartProps {
    data: number[];
    labels: string[];
    width?: number;
    height?: number;
    color?: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, labels, width = 400, height = 200, color = "#16a34a" }) => {
    if (data.length === 0) return null;

    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    
    const x = (i: number) => padding.left + (i / (data.length - 1)) * chartWidth;
    const y = (value: number) => padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;

    const points = data.map((d, i) => `${x(i)},${y(d)}`).join(' ');
    
    const formatCurrency = (value: number) => {
        if (Math.abs(value) >= 1e3) {
            return `R$ ${(value / 1e3).toFixed(0)}k`;
        }
        return `R$ ${value.toFixed(0)}`;
    };

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="font-sans">
            {/* Y-axis grid lines and labels */}
            {[0, 0.25, 0.5, 0.75, 1].map(tick => {
                const value = minValue + (maxValue - minValue) * tick;
                const yPos = y(value);
                return (
                    <g key={tick}>
                        <line x1={padding.left} y1={yPos} x2={width - padding.right} y2={yPos} stroke="#e2e8f0" strokeWidth="1" />
                        <text x={padding.left - 5} y={yPos + 3} textAnchor="end" fontSize="10" fill="#64748b">
                            {formatCurrency(value)}
                        </text>
                    </g>
                )
            })}
            
            {/* X-axis labels */}
            {labels.map((label, i) => {
                 if (i % 5 === 0) { // Show labels every 5 years to avoid clutter
                     return (
                         <text key={i} x={x(i)} y={height - 10} textAnchor="middle" fontSize="10" fill="#64748b">
                             {label}
                         </text>
                     )
                 }
                 return null;
            })}

            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
            />
            {data.map((d, i) => (
                <circle key={i} cx={x(i)} cy={y(d)} r="3" fill={color} className="transition-all duration-200 hover:r-5">
                     <title>{`Ano ${labels[i]}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d)}`}</title>
                </circle>
            ))}
        </svg>
    );
};

export default LineChart;
