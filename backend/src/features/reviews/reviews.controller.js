import * as reviewsService from './reviews.service.js'

export function getReviewsHealth(_req, res) {
  res.json(reviewsService.getHealth())
}
