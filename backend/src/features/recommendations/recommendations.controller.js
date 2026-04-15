import * as recommendationsService from './recommendations.service.js'

export function getRecommendationsHealth(_req, res) {
  res.json(recommendationsService.getHealth())
}
