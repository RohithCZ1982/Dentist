import { useState } from 'react'
import Header from './components/Header'
import AnalysisModule from './components/AnalysisModule'

const TABS = [
  {
    id: 'cavity',
    label: 'Cavity Detector',
    icon: '🦷',
    endpoint: 'cavity',
    description: 'Detect caries, interproximal decay, and bone loss in bitewing X-rays',
    accentColor: '#ef4444',
    badgeClass: 'bg-red-900/60 text-red-300 border-red-800',
    activeTab: 'border-red-500 text-red-400',
  },
  {
    id: 'second-opinion',
    label: 'Second Opinion',
    icon: '🔬',
    endpoint: 'second-opinion',
    description: 'Differential diagnosis ranked by AI confidence score',
    accentColor: '#3b82f6',
    badgeClass: 'bg-blue-900/60 text-blue-300 border-blue-800',
    activeTab: 'border-blue-500 text-blue-400',
  },
  {
    id: 'periapical',
    label: 'Periapical Analysis',
    icon: '🩻',
    endpoint: 'periapical',
    description: 'Periapical infection, abscess, root resorption, bone rarefaction',
    accentColor: '#f59e0b',
    badgeClass: 'bg-amber-900/60 text-amber-300 border-amber-800',
    activeTab: 'border-amber-500 text-amber-400',
  },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('cavity')

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#080c14', color: '#e6edf3' }}>
      <Header />

      {/* Tab Navigation */}
      <div
        className="border-b sticky top-0 z-20"
        style={{ backgroundColor: '#0d1117', borderColor: '#21262d' }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-3.5 text-sm font-medium
                  border-b-2 transition-all duration-200 whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? tab.activeTab
                      : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {TABS.map(
          (tab) =>
            activeTab === tab.id && <AnalysisModule key={tab.id} tab={tab} />
        )}
      </main>
    </div>
  )
}
