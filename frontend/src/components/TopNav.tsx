import type { FeatureDefinition, FeatureKey } from '../config/features'

type TopNavProps = {
  tabs: FeatureDefinition[]
  activeTab: FeatureKey
  onTabChange: (feature: FeatureKey) => void
}

export function TopNav({ tabs, activeTab, onTabChange }: TopNavProps) {
  return (
    <nav className="top-nav" aria-label="Feature navigation">
      <div className="brand-block">
        <h1>VinoVault</h1>
        <p>Modular starter aligned to your five feature teams</p>
      </div>
      <div className="tab-row">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={tab.key === activeTab ? 'nav-tab active' : 'nav-tab'}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
