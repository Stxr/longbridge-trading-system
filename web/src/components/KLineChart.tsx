import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, Time, CandlestickData } from 'lightweight-charts';

interface KLineData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface KLineChartProps {
  data: KLineData[];
  markers?: any[];
}

const KLineChart: React.FC<KLineChartProps> = ({ data, markers }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  
  const [hoveredData, setHoveredData] = useState<CandlestickData | null>(null);
  const [hoveredTime, setHoveredTime] = useState<string | null>(null);

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
      height: 400,
    });

    const series = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point || param.point.x < 0) {
        setHoveredData(null);
        setHoveredTime(null);
      } else {
        const data = param.seriesData.get(series);
        if (data) {
          setHoveredData(data as CandlestickData);
          setHoveredTime(formatDateTime(param.time as number));
        }
      }
    });

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
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      })).sort((a, b) => (a.time as number) - (b.time as number));

      const uniqueData = formattedData.filter((d, i) => i === 0 || (d.time as number) > (formattedData[i - 1].time as number));
      seriesRef.current.setData(uniqueData);

      if (markers && markers.length > 0) {
        seriesRef.current.setMarkers(markers);
      }
      
      chartRef.current?.timeScale().fitContent();
    }
  }, [data, markers]);

  return (
    <div className="relative w-full border rounded overflow-hidden bg-white">
      <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-sm p-2 rounded text-[10px] font-mono shadow-md pointer-events-none border border-gray-100 min-w-[200px]">
        {hoveredData ? (
          <div className="space-y-1">
            <div className="text-blue-600 font-bold border-b pb-1 mb-1">{hoveredTime}</div>
            <div className="grid grid-cols-2 gap-x-4">
              <div className="flex justify-between"><span className="text-gray-500">O:</span><span className="font-bold">{hoveredData.open.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">H:</span><span className="font-bold text-green-600">{hoveredData.high.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">L:</span><span className="font-bold text-red-600">{hoveredData.low.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">C:</span><span className={`font-bold ${hoveredData.close >= hoveredData.open ? 'text-green-600' : 'text-red-600'}`}>{hoveredData.close.toFixed(2)}</span></div>
            </div>
          </div>
        ) : data.length > 0 ? (
           <div className="text-gray-400">移动鼠标查看详细数据 ({data.length} 条记录)</div>
        ) : null}
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};

export default KLineChart;
