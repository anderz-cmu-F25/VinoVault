import { moduleHealth } from '../../common/utils/moduleResponse.js'

export function getHealth() {
  return moduleHealth(
    'reviews',
    'Reviews module owns create and list review workflows plus wine metadata enrichment.',
    ['Separate create and list handlers inside this module.', 'Add GoPuff connector calls behind one service boundary.', 'Keep review-specific schemas here to avoid cross-feature changes.'],
  )
}
