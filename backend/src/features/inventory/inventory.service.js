import { moduleHealth } from '../../common/utils/moduleResponse.js'

export function getHealth() {
  return moduleHealth(
    'inventory',
    'Inventory module is isolated for cellar entry workflows and reminder preferences.',
    ['Add inventory DTOs and validation here.', 'Keep manual add and cellar entry logic inside this module.', 'Call notifications later through the shared notification service.'],
  )
}
