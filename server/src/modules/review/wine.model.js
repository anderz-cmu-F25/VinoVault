const mongoose = require("mongoose");

const wineSchema = new mongoose.Schema(
  {
    wineId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    region: { type: String, default: "" },
    vintage: { type: String, default: "" },
    varietal: { type: String, default: "" },
    regularPrice: { type: Number, default: null },
    salePrice: { type: Number, default: null },
    stock: { type: Number, default: null },
    rating: { type: String, default: "0.0" },
    wineUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

wineSchema.index({ name: "text" });

// Registered under a distinct model name to avoid colliding with the
// inventory module's "Wine" model (different schema). The explicit
// collection name pins this to the shared 200-wine catalog in `wines`.
const ReviewWineModel =
  mongoose.models.ReviewWine ||
  mongoose.model("ReviewWine", wineSchema, "wines");

module.exports = ReviewWineModel;
