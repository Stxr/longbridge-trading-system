import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import BacktestPage from './pages/BacktestPage';
import LiveTradingPage from './pages/LiveTradingPage';

// Placeholder components for pages
const DataManagementPage = () => <div className="bg-white p-6 rounded shadow">数据管理内容 (待实现)</div>;

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<BacktestPage />} />
          <Route path="/live" element={<LiveTradingPage />} />
          <Route path="/data" element={<DataManagementPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;