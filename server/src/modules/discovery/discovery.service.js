const repository = require("./discovery.repository");
const KeywordSearchStrategy = require("./strategies/keywordSearchStrategy");
const FilterRankingStrategy = require("./strategies/filterRankingStrategy");
const PersonalizedRecommendationStrategy = require("./strategies/personalizedRecommendationStrategy");

class DiscoveryService {
  constructor() {
    this.repository = repository;
    this.strategy = new FilterRankingStrategy(this.repository);
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  chooseStrategy(input) {
    const strategyName = String(input.strategy || "").trim();

    if (strategyName === "personalized") {
      return new PersonalizedRecommendationStrategy(this.repository);
    }

    if (strategyName === "keyword" || String(input.search || input.q || "").trim().length >= 2) {
      return new KeywordSearchStrategy(this.repository);
    }

    return new FilterRankingStrategy(this.repository);
  }

  async recommend(input) {
    this.setStrategy(this.chooseStrategy(input));
    const result = await this.strategy.recommend(input);
    const regions = await this.repository.listRegions();
    return {
      ...result,
      meta: {
        ...result.meta,
        regions,
      },
    };
  }
}

module.exports = DiscoveryService;
