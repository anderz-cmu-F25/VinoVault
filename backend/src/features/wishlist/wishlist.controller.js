import * as wishlistService from './wishlist.service.js'

export function getWishlistHealth(_req, res) {
  res.json(wishlistService.getHealth())
}
