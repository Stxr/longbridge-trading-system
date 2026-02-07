import React, { useState, useEffect } from 'react';
import axios from 'axios';
import KLineChart from '../components/KLineChart';
import EquityChart from '../components/EquityChart';

interface StrategyParam {
  name: string;
  type: string;
  default: any;
  message: string;
}

interface Strategy {
  name: string;
  className: string;
  description: string;
  params: StrategyParam[];
}

const BacktestPage: React.FC = () => {
  const getInitialConfig = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const saved = localStorage.getItem('lbt_backtest_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 自动将结束日期更新为今天
        return { ...parsed, end: today };
      } catch (e) {
        console.error('Failed to parse saved config', e);
      }
    }
    
    return {
      symbol: '700.HK',
      start: lastWeek,
      end: today,
      initialCash: 1000000,
      period: '1d',
    };
  };

  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategyName, setSelectedStrategyName] = useState<string>('');
  const [config, setConfig] = useState(getInitialConfig());
  const [strategyParams, setStrategyParams] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [backtestResult, setBacktestResult] = useState<any>(null);
  const [chartMarkers, setChartMarkers] = useState<any[]>([]);

  const periods = [
    { label: '1 分钟', value: '1m' },
    { label: '5 分钟', value: '5m' },
    { label: '15 分钟', value: '15m' },
    { label: '30 分钟', value: '30m' },
    { label: '1 小时', value: '1h' },
    { label: '日线', value: '1d' },
    { label: '周线', value: '1w' },
    { label: '月线', value: '1mo' },
  ];

  // 持久化存储配置
  useEffect(() => {
    localStorage.setItem('lbt_backtest_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/strategies').then((res) => {
      setStrategies(res.data);
      if (res.data.length > 0) {
        handleStrategyChange(res.data[0].name, res.data);
      }
    });
  }, []);

  const handleStrategyChange = (name: string, allStrategies = strategies) => {
    setSelectedStrategyName(name);
    const strategy = allStrategies.find(s => s.name === name);
    if (strategy) {
      const defaultParams: Record<string, any> = {};
      strategy.params.forEach(p => {
        defaultParams[p.name] = p.default;
      });
      setStrategyParams(defaultParams);
    }
  };

  const pollResult = (taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/backtest/${taskId}`);
        if (res.data.status === 'completed') {
          clearInterval(interval);
          setBacktestResult(res.data.result);
          processMarkers(res.data.result.orders);
          setLoading(false);
        } else if (res.data.status === 'failed') {
          clearInterval(interval);
          alert('Backtest failed: ' + res.data.error);
          setLoading(false);
        }
      } catch (error) {
        clearInterval(interval);
        console.error('Polling error:', error);
        setLoading(false);
      }
    }, 1000);
  };

  const processMarkers = (orders: any[]) => {
    const markers = orders.map((order) => ({
      time: Math.floor(new Date(order.updatedAt || order.submittedAt).getTime() / 1000),
      position: order.side === 'Buy' ? 'belowBar' : 'aboveBar',
      color: order.side === 'Buy' ? '#26a69a' : '#ef5350',
      shape: order.side === 'Buy' ? 'arrowUp' : 'arrowDown',
      text: `${order.side} @ ${order.price}`,
    }));
    setChartMarkers(markers);
  };

  const handleRunBacktest = async () => {
    setLoading(true);
    setBacktestResult(null);
    setChartMarkers([]);
    try {
      const res = await axios.post('http://localhost:3000/api/backtest', {
        strategyName: selectedStrategyName,
        ...config,
        params: strategyParams,
      });
      pollResult(res.data.taskId);
    } catch (error) {
      console.error('Failed to run backtest:', error);
      setLoading(false);
    }
  };

  const selectedStrategy = strategies.find(s => s.name === selectedStrategyName);

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-medium mb-4">回测配置</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">核心配置</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700">策略</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                value={selectedStrategyName}
                onChange={(e) => handleStrategyChange(e.target.value)}
              >
                {strategies.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} - {s.description}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">交易对 (Symbol)</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={config.symbol}
                onChange={(e) => setConfig({ ...config, symbol: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">K 线周期</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                value={config.period}
                onChange={(e) => setConfig({ ...config, period: e.target.value })}
              >
                {periods.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">初始资金</label>
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={config.initialCash}
                onChange={(e) => setConfig({ ...config, initialCash: parseFloat(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">开始日期</label>
                <input
                  type="date"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={config.start}
                  onChange={(e) => setConfig({ ...config, start: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">结束日期</label>
                <input
                  type="date"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={config.end}
                  onChange={(e) => setConfig({ ...config, end: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-l pl-6">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">策略参数</h4>
            {selectedStrategy?.params.map(param => (
              <div key={param.name}>
                <label className="block text-sm font-medium text-gray-700">{param.message || param.name}</label>
                <input
                  type={param.type === 'number' ? 'number' : 'text'}
                  step="any"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={strategyParams[param.name] ?? ''}
                  onChange={(e) => setStrategyParams({
                    ...strategyParams,
                    [param.name]: param.type === 'number' ? parseFloat(e.target.value) : e.target.value
                  })}
                />
              </div>
            ))}
            {(!selectedStrategy?.params || selectedStrategy.params.length === 0) && (
              <div className="text-sm text-gray-400 italic">该策略无需额外参数</div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <button
            className="w-full bg-blue-600 text-white p-4 rounded-md font-bold text-lg hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
            onClick={handleRunBacktest}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在执行回测... (首次回测会自动从长桥同步数据)
              </span>
            ) : '🚀 运行回测'}
          </button>
        </div>
      </div>

      {backtestResult && (
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-medium mb-4">分析结果</h3>
          <div className="space-y-8">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">K 线与买卖标记</h4>
              <KLineChart data={backtestResult.history} markers={chartMarkers} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">资金曲线 (Equity Curve) 与交易同步</h4>
              <EquityChart data={backtestResult.equityHistory} markers={chartMarkers} />
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">总收益率</div>
              <div className={`text-2xl font-bold ${backtestResult.metrics.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(backtestResult.metrics.totalReturn * 100).toFixed(2)}%
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">胜率</div>
              <div className="text-2xl font-bold text-blue-600">
                {(backtestResult.metrics.winRate * 100).toFixed(2)}%
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">最大回撤</div>
              <div className="text-2xl font-bold text-red-600">
                {(backtestResult.metrics.maxDrawdown * 100).toFixed(2)}%
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">交易笔数</div>
              <div className="text-2xl font-bold text-gray-800">
                {backtestResult.orders.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BacktestPage;