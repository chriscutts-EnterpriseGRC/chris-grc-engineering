import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Shield, AlertTriangle, CheckCircle, TrendingDown,
  Grid, Search, Bell, Settings, User, Menu,
  Activity, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const riskTrend = [
  { month: 'Dec', open: 312, closed: 180, critical: 28 },
  { month: 'Jan', open: 298, closed: 201, critical: 22 },
  { month: 'Feb', open: 276, closed: 219, critical: 18 },
  { month: 'Mar', open: 251, closed: 238, critical: 14 },
  { month: 'Apr', open: 229, closed: 267, critical: 11 },
  { month: 'May', open: 204, closed: 291, critical: 8 },
];

const domainRisks = [
  { domain: 'Access Control', risks: 42, critical: 3 },
  { domain: 'Data Privacy', risks: 38, critical: 5 },
  { domain: 'Third Party', risks: 31, critical: 2 },
  { domain: 'Cloud Security', risks: 27, critical: 4 },
  { domain: 'Endpoint', risks: 24, critical: 1 },
  { domain: 'Identity', risks: 21, critical: 2 },
  { domain: 'Network', risks: 18, critical: 1 },
  { domain: 'Incident Resp.', risks: 15, critical: 0 },
];

const severityData = [
  { name: 'Critical', value: 8, color: '#EF4444' },
  { name: 'High', value: 34, color: '#F97316' },
  { name: 'Medium', value: 89, color: '#EAB308' },
  { name: 'Low', value: 73, color: '#22C55E' },
];

const frameworks = [
  { name: 'SOC 2 Type II', progress: 94, controls: 64, passing: 60, color: '#2563EB', status: 'Certified' },
  { name: 'ISO 27001', progress: 87, controls: 93, passing: 81, color: '#7C3AED', status: 'In Progress' },
  { name: 'GDPR', progress: 91, controls: 47, passing: 43, color: '#0891B2', status: 'Compliant' },
  { name: 'HIPAA', progress: 78, controls: 54, passing: 42, color: '#059669', status: 'In Progress' },
  { name: 'PCI DSS', progress: 83, controls: 89, passing: 74, color: '#D97706', status: 'Compliant' },
  { name: 'NIST CSF', progress: 88, controls: 108, passing: 95, color: '#DC2626', status: 'Compliant' },
];

const riskRegister = [
  { id: 'R-1042', title: 'Privileged Access Without MFA', domain: 'Access Control', severity: 'Critical', status: 'Open', owner: 'J. Martinez', dueDate: '2026-06-15', score: 92 },
  { id: 'R-1039', title: 'Third-party vendor SOC 2 gap', domain: 'Third Party', severity: 'High', status: 'In Review', owner: 'S. Chen', dueDate: '2026-06-30', score: 74 },
  { id: 'R-1037', title: 'Unencrypted PII in S3 buckets', domain: 'Data Privacy', severity: 'Critical', status: 'Open', owner: 'A. Patel', dueDate: '2026-06-10', score: 88 },
  { id: 'R-1035', title: 'Missing cloud security baseline', domain: 'Cloud Security', severity: 'High', status: 'Mitigating', owner: 'K. Thompson', dueDate: '2026-07-01', score: 71 },
  { id: 'R-1033', title: 'Stale service account credentials', domain: 'Identity', severity: 'High', status: 'Open', owner: 'J. Martinez', dueDate: '2026-06-20', score: 68 },
  { id: 'R-1031', title: 'Endpoint patching lag >30 days', domain: 'Endpoint', severity: 'Medium', status: 'Mitigating', owner: 'T. Williams', dueDate: '2026-07-15', score: 55 },
  { id: 'R-1028', title: 'Incident response plan not tested', domain: 'Incident Resp.', severity: 'Medium', status: 'Open', owner: 'S. Chen', dueDate: '2026-08-01', score: 48 },
  { id: 'R-1025', title: 'Network segmentation gaps', domain: 'Network', severity: 'Medium', status: 'In Review', owner: 'A. Patel', dueDate: '2026-07-20', score: 52 },
];

const recentActivity = [
  { time: '2h ago', action: 'Risk R-1042 escalated to Critical', type: 'alert' },
  { time: '4h ago', action: 'SOC 2 evidence collection completed', type: 'success' },
  { time: '6h ago', action: '12 new risks identified via AI scan', type: 'info' },
  { time: '1d ago', action: 'ISO 27001 audit scheduled for July 14', type: 'info' },
  { time: '1d ago', action: 'Risk R-1019 closed — controls verified', type: 'success' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function KPICard({ title, value, delta, deltaType, icon: Icon, color, subtitle }) {
  const isUp = deltaType === 'up';
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg`} style={{ background: color + '15' }}>
          <Icon size={20} style={{ color }} />
        </div>
        {delta && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${isUp ? 'text-red-500' : 'text-emerald-500'}`}>
            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {delta}
          </span>
        )}
      </div>
      <div className="mt-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-700 mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const styles = {
    Critical: 'bg-red-50 text-red-700 border border-red-200',
    High: 'bg-orange-50 text-orange-700 border border-orange-200',
    Medium: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    Low: 'bg-green-50 text-green-700 border border-green-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${styles[severity] || styles.Low}`}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Open: 'bg-red-50 text-red-600',
    'In Review': 'bg-blue-50 text-blue-600',
    Mitigating: 'bg-amber-50 text-amber-700',
    Closed: 'bg-green-50 text-green-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.Open}`}>
      {status}
    </span>
  );
}

function HealthRing({ score }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 85 ? '#22C55E' : score >= 70 ? '#EAB308' : '#EF4444';
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-3xl font-bold text-gray-900">{score}</span>
        <span className="block text-xs text-gray-400 font-medium">/ 100</span>
      </div>
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────

function Overview() {
  const [animatedScore, setAnimatedScore] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimatedScore(84), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Open Risks" value="204" delta="12%" deltaType="down" icon={AlertTriangle} color="#EF4444" subtitle="vs last month" />
        <KPICard title="Controls Passing" value="353" delta="4%" deltaType="down" icon={CheckCircle} color="#22C55E" subtitle="of 415 total" />
        <KPICard title="Compliance Score" value="88%" delta="2%" deltaType="down" icon={Shield} color="#2563EB" subtitle="across 6 frameworks" />
        <KPICard title="Risks Closed (30d)" value="87" delta="18%" deltaType="down" icon={TrendingDown} color="#7C3AED" subtitle="via AI-assisted review" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Risk Trend</h3>
              <p className="text-xs text-gray-400 mt-0.5">Open vs closed risks over 6 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={riskTrend}>
              <defs>
                <linearGradient id="openGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="closedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="open" name="Open" stroke="#EF4444" strokeWidth={2} fill="url(#openGrad)" />
              <Area type="monotone" dataKey="closed" name="Closed" stroke="#22C55E" strokeWidth={2} fill="url(#closedGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Health Score + Severity */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm text-center">
            <h3 className="font-semibold text-gray-900 mb-1">GRC Health Score</h3>
            <p className="text-xs text-gray-400 mb-3">Composite across all domains</p>
            <HealthRing score={animatedScore} />
            <p className="text-xs text-emerald-600 font-medium mt-2">+3 pts from last quarter</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">By Severity</h3>
            <ResponsiveContainer width="100%" height={110}>
              <PieChart>
                <Pie data={severityData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={3} dataKey="value">
                  {severityData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {severityData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-xs text-gray-500">{d.name}: <strong>{d.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Domain Bar + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-1">Risks by Domain</h3>
          <p className="text-xs text-gray-400 mb-4">Current open risks per risk domain</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={domainRisks} layout="vertical" barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="domain" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: 12 }} />
              <Bar dataKey="risks" name="Total" fill="#2563EB" radius={[0, 4, 4, 0]} opacity={0.85} />
              <Bar dataKey="critical" name="Critical" fill="#EF4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                  item.type === 'alert' ? 'bg-red-500' : item.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="text-xs text-gray-700 leading-snug">{item.action}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskRegister() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortKey, setSortKey] = useState('score');
  const [sortDir, setSortDir] = useState('desc');

  const severities = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const statuses = ['All', 'Open', 'In Review', 'Mitigating', 'Closed'];

  const filtered = riskRegister
    .filter(r =>
      (severityFilter === 'All' || r.severity === severityFilter) &&
      (statusFilter === 'All' || r.status === statusFilter) &&
      (r.title.toLowerCase().includes(search.toLowerCase()) || r.domain.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      const v = sortDir === 'asc' ? 1 : -1;
      return a[sortKey] > b[sortKey] ? v : -v;
    });

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ k }) => (
    <span className={`ml-1 text-gray-300 ${sortKey === k ? 'text-gray-600' : ''}`}>
      {sortKey === k && sortDir === 'asc' ? '↑' : '↓'}
    </span>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="p-5 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Risk Register</h2>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} risks shown</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search risks..."
                className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 w-48"
              />
            </div>
            <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white">
              {severities.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white">
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => toggleSort('title')}>Title <SortIcon k="title" /></th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Domain</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => toggleSort('severity')}>Severity <SortIcon k="severity" /></th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => toggleSort('score')}>Risk Score <SortIcon k="score" /></th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{r.id}</td>
                <td className="px-5 py-3.5 text-gray-800 font-medium max-w-xs">{r.title}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">{r.domain}</span>
                </td>
                <td className="px-5 py-3.5"><SeverityBadge severity={r.severity} /></td>
                <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                <td className="px-5 py-3.5 text-gray-500 text-xs">{r.owner}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full"
                        style={{ width: `${r.score}%`, background: r.score >= 80 ? '#EF4444' : r.score >= 60 ? '#F97316' : '#EAB308' }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{r.score}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs text-gray-400">{r.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Compliance() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {frameworks.map(f => {
          const statusColor = f.status === 'Certified' || f.status === 'Compliant'
            ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50';
          return (
            <div key={f.name} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{f.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{f.passing} / {f.controls} controls passing</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>{f.status}</span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Coverage</span>
                  <span className="font-semibold text-gray-800">{f.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${f.progress}%`, background: f.color }} />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
                <span>{f.controls - f.passing} gaps remaining</span>
                <button className="text-blue-500 hover:text-blue-700 font-medium">View details →</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Framework Coverage Comparison</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={frameworks} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip formatter={v => `${v}%`} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: 12 }} />
            <Bar dataKey="progress" name="Coverage" radius={[4, 4, 0, 0]}>
              {frameworks.map(f => <Cell key={f.name} fill={f.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Diagrams() {
  const [active, setActive] = useState('risk-architecture-diagram');
  const items = [
    { id: 'risk-architecture-diagram', label: 'Risk Architecture' },
    { id: 'domain-taxonomy', label: 'Domain Taxonomy' },
    { id: 'health-score-algorithm', label: 'Health Score' },
    { id: 'dashboard-views', label: 'Dashboard Views' },
  ];
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex border-b border-gray-100">
        {items.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)}
            className={`px-5 py-3.5 text-sm font-medium transition-colors ${active === item.id
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/40'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            {item.label}
          </button>
        ))}
      </div>
      <iframe src={`/diagrams/${active}.html`} title={active} className="w-full border-none" style={{ height: '640px' }} />
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const navItems = [
  { id: 'overview', label: 'Overview', icon: Grid },
  { id: 'risks', label: 'Risk Register', icon: AlertTriangle },
  { id: 'compliance', label: 'Compliance', icon: Shield },
  { id: 'diagrams', label: 'Architecture', icon: Activity },
];

// ─── App Shell ────────────────────────────────────────────────────────────────

export default function GRCDashboard() {
  const [page, setPage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentNav = navItems.find(n => n.id === page);

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} flex-shrink-0 bg-slate-900 flex flex-col transition-all duration-200`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-tight truncate">GRC Platform</p>
              <p className="text-slate-400 text-xs truncate">Chris Cutts</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setPage(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                page === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}>
              <Icon size={16} className="flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>

        <div className="px-2 py-4 border-t border-slate-800 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <Settings size={16} className="flex-shrink-0" />
            {sidebarOpen && <span>Settings</span>}
          </button>
          <button onClick={() => setSidebarOpen(o => !o)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <Menu size={16} className="flex-shrink-0" />
            {sidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="font-semibold text-gray-900">{currentNav?.label}</h1>
            <p className="text-xs text-gray-400">Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {page === 'overview' && <Overview />}
          {page === 'risks' && <RiskRegister />}
          {page === 'compliance' && <Compliance />}
          {page === 'diagrams' && <Diagrams />}
        </main>
      </div>
    </div>
  );
}
