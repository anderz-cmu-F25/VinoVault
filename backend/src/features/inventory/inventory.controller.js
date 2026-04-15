import * as inventoryService from './inventory.service.js'

export function getInventoryHealth(_req, res) {
  res.json(inventoryService.getHealth())
}
