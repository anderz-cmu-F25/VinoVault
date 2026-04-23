const DiscoveryService = require('./discovery.service')
const repository = require('./discovery.repository')

const service = new DiscoveryService()

async function discoverWines(req, res, next) {
  try {
    const userId = req.auth.userId
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const result = await service.recommend({
      ...req.query,
      userId,
    })

    return res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}

async function getRegions(_req, res, next) {
  try {
    const regions = await repository.listRegions()
    return res.status(200).json({ data: regions })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  discoverWines,
  getRegions,
}
