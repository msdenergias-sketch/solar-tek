import React from 'react';

interface PieChartData {
    label: string;
    value: number;
    color: string;
}

interface PieChartProps {
    data: PieChartData[];
    width?: number;
    height?: number;
}

const PieChart: React.FC<PieChartProps> = ({ data, width = 200, height = 200 }) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    const radius = Math.min(width, height) / 2 - 10;
    const cx = width / 2;
    const cy = height / 2;
    let startAngle = -90;

    const getCoordinatesForPercent = (percent: number) => {
        const x = cx + radius * Math.cos(2 * Math.PI * percent);
        const y = cy + radius * Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="flex flex-col items-center">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <g transform={`translate(${cx}, ${cy})`}>
                    {data.map((item, index) => {
                        const slicePercent = item.value / total;
                        const start = startAngle / 360;
                        const end = (startAngle + slicePercent * 360) / 360;
                        const [startX, startY] = getCoordinatesForPercent(start);
                        const [endX, endY] = getCoordinatesForPercent(end);
                        const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
                        
                        const pathData = [
                            `M ${startX} ${startY}`, // Move
                            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
                            `L 0 0`, // Line to center
                        ].join(' ');

                        startAngle += slicePercent * 360;

                        return (
                            <path key={index} d={pathData} fill={item.color} className="transition-all duration-300 hover:opacity-80">
                                <title>{`${item.label}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)} (${(slicePercent * 100).toFixed(1)}%)`}</title>
                            </path>
                        );
                    })}
                </g>
            </svg>
            <div className="mt-2 text-xs w-full max-w-[200px]">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-0.5">
                        <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: item.color }}></span>
                            <span>{item.label}</span>
                        </div>
                        <span className="font-semibold">{((item.value / total) * 100).toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PieChart;
