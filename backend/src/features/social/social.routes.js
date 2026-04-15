import { Router } from 'express'
import { getSocialHealth } from './social.controller.js'

const router = Router()

router.get('/health', getSocialHealth)

export default router
