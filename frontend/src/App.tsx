import { useMemo, useState } from 'react'
import { TopNav } from './components/TopNav'
import { FEATURE_TABS, type FeatureKey } from './config/features'
import { InventoryPage } from './features/inventory/InventoryPage'
import { RecommendationsPage } from './features/recommendations/RecommendationsPage'
import { ReviewsPage } from './features/reviews/ReviewsPage'
import { SocialPage } from './features/social/SocialPage'
import { WishlistPage } from './features/wishlist/WishlistPage'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState<FeatureKey>('inventory')

  const page = useMemo(() => {
    switch (activeTab) {
      case 'inventory':
        return <InventoryPage />
      case 'recommendations':
        return <RecommendationsPage />
      case 'reviews':
        return <ReviewsPage />
      case 'social':
        return <SocialPage />
      case 'wishlist':
        return <WishlistPage />
      default:
        return null
    }
  }, [activeTab])

  return (
    <div className="app-shell">
      <TopNav tabs={FEATURE_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="content-shell">
        <section className="intro-card">
          <p className="eyebrow">Architecture-aligned starter</p>
          <h2>One tab per feature, one backend module per feature</h2>
          <p>
            This starter keeps frontend feature code and backend modules separated so each teammate can
            build mostly inside one folder without touching shared files often.
          </p>
        </section>
        {page}
      </main>
    </div>
  )
}

export default App
