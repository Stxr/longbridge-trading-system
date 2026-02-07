import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import KLineChart from '../components/KLineChart';

const LiveTradingPage: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [symbol, setSymbol] = useState('700.HK');
  const [quotes, setQuotes] = useState<any[]>([]);
  const [klines, setKlines] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to WS');
    });

    newSocket.on('quote', (quote) => {
      setQuotes((prev) => [quote, ...prev].slice(0, 50));
    });

    newSocket.on('kline', (kline) => {
      setKlines((prev) => {
        const index = prev.findIndex((k) => k.timestamp === kline.timestamp);
        if (index >= 0) {
          const newKlines = [...prev];
          newKlines[index] = kline;
          return newKlines;
        }
        return [...prev, kline].slice(-100);
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSubscribe = () => {
    if (socket && symbol) {
      socket.emit('subscribe', [symbol]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-medium mb-4">实盘订阅</h3>
        <div className="flex gap-4">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
            value={symbol}
            placeholder="例如: 700.HK"
            onChange={(e) => setSymbol(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            onClick={handleSubscribe}
            disabled={!isConnected}
          >
            订阅行情
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          状态: {isConnected ? <span className="text-green-600">已连接</span> : <span className="text-red-600">未连接</span>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-6 rounded shadow">
          <h3 className="text-lg font-medium mb-4">实时图表 ({symbol})</h3>
          <KLineChart data={klines} />
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-medium mb-4">最新成交/报价</h3>
          <div className="space-y-2 max-h-[400px] overflow-auto">
            {quotes.map((q, i) => (
              <div key={i} className="p-2 border-b text-sm flex justify-between">
                <span>{new Date(q.timestamp).toLocaleTimeString()}</span>
                <span className="font-mono font-bold">{q.lastPrice.toFixed(3)}</span>
              </div>
            ))}
            {quotes.length === 0 && <div className="text-gray-400 text-center py-4">等待数据...</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTradingPage;
