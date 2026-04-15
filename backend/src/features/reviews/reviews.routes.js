import { Router } from 'express'
import { getReviewsHealth } from './reviews.controller.js'

const router = Router()

router.get('/health', getReviewsHealth)

export default router
