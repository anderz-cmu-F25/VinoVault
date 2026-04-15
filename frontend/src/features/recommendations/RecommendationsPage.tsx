import { FeatureShell } from '../../components/FeatureShell'

export function RecommendationsPage() {
  return (
    <FeatureShell
      title="Wine Recommendation & Discovery"
      ownerHint="One teammate can own search, filters, ranking views, and recommendation widgets"
      endpoint="/api/recommendations"
    >
      <h3>Suggested module boundaries</h3>
      <ul>
        <li>Search UI, result cards, and recommendation panels live in this feature folder.</li>
        <li>Recommendation logic is invoked through one backend controller boundary.</li>
        <li>Keep discovery-specific types local unless other modules truly need them.</li>
      </ul>
    </FeatureShell>
  )
}
