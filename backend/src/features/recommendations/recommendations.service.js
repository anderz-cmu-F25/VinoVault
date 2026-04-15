import { moduleHealth } from '../../common/utils/moduleResponse.js'

export function getHealth() {
  return moduleHealth(
    'recommendations',
    'Discovery module owns search, filters, and recommendation orchestration.',
    ['Add search and recommendation controllers here.', 'Keep strategy or ranking logic local to this module.', 'Read shared wine catalog through the database access layer.'],
  )
}
