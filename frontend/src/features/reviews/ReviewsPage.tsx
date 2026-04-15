import { FeatureShell } from '../../components/FeatureShell'

export function ReviewsPage() {
  return (
    <FeatureShell
      title="Wine Review"
      ownerHint="One teammate can own review creation, review list, and wine metadata display"
      endpoint="/api/reviews"
    >
      <h3>Suggested module boundaries</h3>
      <ul>
        <li>Split create-review UI from review-list UI inside this feature.</li>
        <li>Upload, tasting notes, and rating widgets stay private to the reviews module.</li>
        <li>GoPuff metadata is backend-connected so UI stays stable if vendor logic changes.</li>
      </ul>
    </FeatureShell>
  )
}
