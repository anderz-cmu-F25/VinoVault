class RecommendationStrategy {
  async recommend(_input) {
    throw new Error("recommend() must be implemented by a concrete strategy");
  }
}

module.exports = RecommendationStrategy;
