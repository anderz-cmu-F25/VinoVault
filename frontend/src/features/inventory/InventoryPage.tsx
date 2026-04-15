import { FeatureShell } from '../../components/FeatureShell'

export function InventoryPage() {
  return (
    <FeatureShell
      title="Wine Inventory & Reminder"
      ownerHint="One teammate can own inventory forms, manual-add flow, and reminder settings"
      endpoint="/api/inventory"
    >
      <h3>Suggested module boundaries</h3>
      <ul>
        <li>Inventory page components stay inside features/inventory.</li>
        <li>Only shared UI goes into src/components.</li>
        <li>Use catalog IDs for shared wine records and separate user cellar entries.</li>
        <li>Reminder scheduling stays backend-side and out of the React page.</li>
      </ul>
    </FeatureShell>
  )
}
