import { FeatureShell } from '../../components/FeatureShell'

export function WishlistPage() {
  return (
    <FeatureShell
      title="Wishlist & Price Tracking"
      ownerHint="One teammate can own wishlist CRUD, target price input, and alert history views"
      endpoint="/api/wishlist"
    >
      <h3>Suggested module boundaries</h3>
      <ul>
        <li>Wishlist CRUD remains separate from asynchronous price-tracking jobs.</li>
        <li>Notification dispatch is centralized in the backend notification module.</li>
        <li>Future observers or alert types can be added without touching the page shell.</li>
      </ul>
    </FeatureShell>
  )
}
