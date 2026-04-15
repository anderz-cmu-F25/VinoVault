import { Router } from 'express'
import { getWishlistHealth } from './wishlist.controller.js'

const router = Router()

router.get('/health', getWishlistHealth)

export default router
