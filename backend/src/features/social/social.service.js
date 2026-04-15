import { moduleHealth } from '../../common/utils/moduleResponse.js'

export function getHealth() {
  return moduleHealth(
    'social',
    'Social module owns profiles, friendships, activities, and chat-related endpoints.',
    ['Keep profile, friendship, and activity logic in subservices.', 'Reserve Socket.IO events for real-time chat only.', 'Place relationship-state domain logic inside this module.'],
  )
}
