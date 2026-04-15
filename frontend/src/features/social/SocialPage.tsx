import { FeatureShell } from '../../components/FeatureShell'

export function SocialPage() {
  return (
    <FeatureShell
      title="Profile & Social Management"
      ownerHint="One teammate can own profile forms, friendship flows, and chat screens"
      endpoint="/api/social"
    >
      <h3>Suggested module boundaries</h3>
      <ul>
        <li>Profile UI, friend UI, and chat UI can each be subfolders under features/social.</li>
        <li>HTTP is used for profile and social actions; Socket.IO is reserved for chat.</li>
        <li>Friendship state logic belongs in backend domain code, not React condition chains.</li>
      </ul>
    </FeatureShell>
  )
}
