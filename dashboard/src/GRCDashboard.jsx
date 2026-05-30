// GRCDashboard.jsx
import React, { useState } from 'react';

export default function GRCDashboard() {
  const [activeTab, setActiveTab] = useState('architecture');

  const tabs = [
    { id: 'architecture', label: '📐 Architecture', icon: '📐' },
    { id: 'domains', label: '🔍 Domains', icon: '🔍' },
    { id: 'health', label: '🏥 Health Score', icon: '🏥' },
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
  ];

  const diagramPath = (filename) => `/diagrams/${filename}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 font-sans">
      <header className="bg-white/10 backdrop-blur-lg p-8 text-center text-white border-b border-white/20">
        <h1 className="text-4xl font-bold mb-2">Risk GRC Engineering</h1>
        <p className="text-lg opacity-90">Domain-Driven Risk Orchestration with Claude AI</p>
      </header>

      <div className="max-w-7xl mx-auto p-8">
        {/* Tab Navigation */}
        <nav className="flex gap-4 mb-8 flex-wrap justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-8 py-4 rounded-xl flex items-center gap-2 text-base font-medium transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-white text-purple-600 shadow-lg' 
                  : 'bg-white/10 backdrop-blur-lg border-2 border-white/30 text-white hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-lg'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl min-h-[600px]">
          {activeTab === 'architecture' && (
            <div className="animate-in fade-in slide-in-from-top-10 duration-300">
              <h2 className="text-3xl text-gray-800 mb-2">Risk Signal Flow Architecture</h2>
              <p className="text-gray-600 mb-6">How signals flow through orchestrator → domain reviewers → dashboard</p>
              <iframe 
                src={diagramPath('risk-architecture-diagram.html')}
                title="Architecture Diagram"
                className="w-full h-[500px] border-none rounded-xl bg-gray-50"
              />
            </div>
          )}

          {activeTab === 'domains' && (
            <div className="animate-in fade-in slide-in-from-top-10 duration-300">
              <h2 className="text-3xl text-gray-800 mb-2">12-Domain Reviewer Taxonomy</h2>
              <p className="text-gray-600 mb-6">Parallel domain-driven risk analysis</p>
              <iframe 
                src={diagramPath('domain-taxonomy.html')}
                title="Domain Taxonomy"
                className="w-full h-[500px] border-none rounded-xl bg-gray-50"
              />
            </div>
          )}

          {activeTab === 'health' && (
            <div className="animate-in fade-in slide-in-from-top-10 duration-300">
              <h2 className="text-3xl text-gray-800 mb-2">Health Score Algorithm</h2>
              <p className="text-gray-600 mb-6">4-component health score formula (0-100 scale)</p>
              <iframe 
                src={diagramPath('health-score-algorithm.html')}
                title="Health Score"
                className="w-full h-[500px] border-none rounded-xl bg-gray-50"
              />
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-top-10 duration-300">
              <h2 className="text-3xl text-gray-800 mb-2">Portfolio Dashboard Views</h2>
              <p className="text-gray-600 mb-6">7 views for 4 personas (Director, VP, Analyst, Compliance)</p>
              <iframe 
                src={diagramPath('dashboard-views.html')}
                title="Dashboard Views"
                className="w-full h-[500px] border-none rounded-xl bg-gray-50"
              />
            </div>
          )}
        </div>

        {/* Metrics Bar */}
        <div className="flex gap-8 mt-8 flex-wrap justify-center">
          <div className="bg-white/10 backdrop-blur-lg border-2 border-white/30 p-6 rounded-xl text-center text-white min-w-[150px]">
            <span className="block text-4xl font-bold mb-2">14K+</span>
            <span className="block text-sm opacity-90">Risks Managed</span>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border-2 border-white/30 p-6 rounded-xl text-center text-white min-w-[150px]">
            <span className="block text-4xl font-bold mb-2">20+</span>
            <span className="block text-sm opacity-90">Per Week</span>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border-2 border-white/30 p-6 rounded-xl text-center text-white min-w-[150px]">
            <span className="block text-4xl font-bold mb-2">30%</span>
            <span className="block text-sm opacity-90">Time Savings</span>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border-2 border-white/30 p-6 rounded-xl text-center text-white min-w-[150px]">
            <span className="block text-4xl font-bold mb-2">2</span>
            <span className="block text-sm opacity-90">Team Size</span>
          </div>
        </div>
      </div>

      <footer className="bg-white/10 backdrop-blur-lg p-6 text-center text-white mt-8 border-t border-white/20">
        <p className="m-0 opacity-90">Built at Twilio | 14,000+ risks managed | Production system</p>
      </footer>
    </div>
  );
}
