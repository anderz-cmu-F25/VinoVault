import * as socialService from './social.service.js'

export function getSocialHealth(_req, res) {
  res.json(socialService.getHealth())
}
