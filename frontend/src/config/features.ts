export type FeatureKey =
  | 'inventory'
  | 'recommendations'
  | 'reviews'
  | 'social'
  | 'wishlist'

export type FeatureDefinition = {
  key: FeatureKey
  label: string
  description: string
  endpoint: string
}

export const FEATURE_TABS: FeatureDefinition[] = [
  {
    key: 'inventory',
    label: 'Inventory & Reminder',
    description: 'Manage cellar entries and future reminder workflows.',
    endpoint: '/api/inventory',
  },
  {
    key: 'recommendations',
    label: 'Discovery',
    description: 'Search wines and fetch recommendations.',
    endpoint: '/api/recommendations',
  },
  {
    key: 'reviews',
    label: 'Reviews',
    description: 'Create and browse wine reviews.',
    endpoint: '/api/reviews',
  },
  {
    key: 'social',
    label: 'Profile & Social',
    description: 'Profile editing, friendships, chat, and activities.',
    endpoint: '/api/social',
  },
  {
    key: 'wishlist',
    label: 'Wishlist & Tracking',
    description: 'Wishlist CRUD and future price-drop workflows.',
    endpoint: '/api/wishlist',
  },
]
