import inventoryRouter from '../features/inventory/inventory.routes.js'
import recommendationsRouter from '../features/recommendations/recommendations.routes.js'
import reviewsRouter from '../features/reviews/reviews.routes.js'
import socialRouter from '../features/social/social.routes.js'
import wishlistRouter from '../features/wishlist/wishlist.routes.js'

export function registerFeatureRoutes(app) {
  app.use('/api/inventory', inventoryRouter)
  app.use('/api/recommendations', recommendationsRouter)
  app.use('/api/reviews', reviewsRouter)
  app.use('/api/social', socialRouter)
  app.use('/api/wishlist', wishlistRouter)
}
