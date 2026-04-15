import { Router } from 'express'
import { getRecommendationsHealth } from './recommendations.controller.js'

const router = Router()

router.get('/health', getRecommendationsHealth)

export default router
