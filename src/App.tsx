import { useState } from 'react';
import { Activity, BookOpen, Calculator, LineChart } from 'lucide-react';
import { OptionsCalculator } from './components/OptionsCalculator';
import { TradeJournal } from './components/TradeJournal';
const Dashboard = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="glass-panel rounded-2xl p-6 md:p-8 text-center">
      <div className="w-16 h-16 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/20 border border-brand-500/30">
        <Activity className="w-8 h-8 text-brand-400" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">Trading Dashboard</h2>
      <p className="text-gray-400 max-w-lg mx-auto mb-8">
        Welcome to Trade Helpers. Use the navigation above to access the Options Target & SL Calculator or review your Trade Journal.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col items-center">
            <Calculator className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="font-semibold text-white">Target Calculator</h3>
            <p className="text-sm text-gray-500 mt-2">Plan your target exits with Greek and IV awareness.</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col items-center">
            <BookOpen className="w-8 h-8 text-rose-400 mb-3" />
            <h3 className="font-semibold text-white">Setup Journal</h3>
            <p className="text-sm text-gray-500 mt-2">Review historical calculator snapshots to analyze your planning.</p>
        </div>
      </div>
    </div>
  </div>
);


function App() {
  const [activeTab, setActiveTab] = useState<'calc' | 'journal' | 'dashboard'>('calc');

  return (
    <div className="min-h-screen flex flex-col pt-12">
      <header className="fixed top-0 w-full z-50 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <LineChart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              Trade Helpers
            </h1>
          </div>
          
          <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-brand-500 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveTab('calc')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'calc' ? 'bg-brand-500 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Calculator</span>
            </button>
            <button 
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'journal' ? 'bg-brand-500 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Journal</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'calc' && <OptionsCalculator />}
        {activeTab === 'journal' && <TradeJournal />}
      </main>
      
      <footer className="text-center py-6 text-sm text-gray-500 border-t border-white/5 mt-auto">
        <p>Premium Trading Utilities &bull; Keep Risk Under Control</p>
      </footer>
    </div>
  );
}

export default App;
