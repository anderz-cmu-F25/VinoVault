const wineMetadataConnector = require("../connectors/wineMetadataConnector");

/**
 * Template Method base class for the Wine Review pipeline.
 *
 * The pipeline runs the same four steps for every flow:
 *   1. parseInput         — extract & validate request data         (subclass overrides)
 *   2. executeDbOperation — insert / query / update / delete        (subclass overrides)
 *   3. fetchWineMetadata  — look up wine info                       (shared concrete hook)
 *   4. assembleResponse   — shape the HTTP response                 (subclass overrides)
 *
 * Subclasses must implement the three abstract steps. The metadata step
 * is identical across flows and lives here to prevent duplication.
 */
class AbstractReviewHandler {
  async handleRequest(req) {
    const parsed = await this.parseInput(req);
    const dbResult = await this.executeDbOperation(parsed);
    const wineId = this.resolveWineId(parsed, dbResult);
    const wineMeta = await this.fetchWineMetadata(wineId);
    return this.assembleResponse(dbResult, wineMeta, parsed);
  }

  // --- abstract steps (subclasses must override) ---

  async parseInput(_req) {
    throw new Error("AbstractReviewHandler.parseInput must be overridden");
  }

  async executeDbOperation(_data) {
    throw new Error("AbstractReviewHandler.executeDbOperation must be overridden");
  }

  assembleResponse(_dbResult, _wineMeta, _parsed) {
    throw new Error("AbstractReviewHandler.assembleResponse must be overridden");
  }

  // --- concrete hook (shared across all flows) ---

  async fetchWineMetadata(wineId) {
    if (!wineId) return null;
    return wineMetadataConnector.getWineDetails(wineId);
  }

  // --- small extension point used by most subclasses ---

  resolveWineId(parsed, dbResult) {
    if (parsed && parsed.wineId) return parsed.wineId;
    if (dbResult && dbResult.wineId) return dbResult.wineId;
    return null;
  }
}

module.exports = AbstractReviewHandler;
