import { moduleHealth } from '../../common/utils/moduleResponse.js'

export function getHealth() {
  return moduleHealth(
    'wishlist',
    'Wishlist module owns wishlist CRUD and future price-tracking coordination.',
    ['Keep wishlist CRUD separate from price polling jobs.', 'Publish future alerts through the shared notification module.', 'Add observer-style tracking logic without changing other modules.'],
  )
}
