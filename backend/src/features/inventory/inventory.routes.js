import { Router } from 'express'
import { getInventoryHealth } from './inventory.controller.js'

const router = Router()

router.get('/health', getInventoryHealth)

export default router
