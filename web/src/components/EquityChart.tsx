import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts';

interface EquityData {
  timestamp: string;
  equity: number;
}

interface EquityChartProps {
  data: EquityData[];
  markers?: any[];
}

const EquityChart: React.FC<EquityChartProps> = ({ data, markers }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);

  const formatDateTime = (timestamp: number | string) => {
    const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: '#D1D4DC',
      },
      localization: {
        timeFormatter: (time: number) => formatDateTime(time),
      },
      rightPriceScale: {
        borderColor: '#D1D4DC',
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
    });

    const series = chart.addAreaSeries({
      lineColor: '#2196F3',
      topColor: 'rgba(33, 150, 243, 0.4)',
      bottomColor: 'rgba(33, 150, 243, 0.0)',
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      const formattedData = data.map((d) => ({
        time: (Math.floor(new Date(d.timestamp).getTime() / 1000)) as Time,
        value: d.equity,
      })).sort((a, b) => (a.time as number) - (b.time as number));

      const uniqueData = formattedData.filter((d, i) => i === 0 || (d.time as number) > (formattedData[i - 1].time as number));
      seriesRef.current.setData(uniqueData);

      if (markers && markers.length > 0) {
        seriesRef.current.setMarkers(markers);
      }

      chartRef.current?.timeScale().fitContent();
    }
  }, [data, markers]);

  return <div ref={chartContainerRef} className="w-full border rounded overflow-hidden bg-white" />;
};

export default EquityChart;
