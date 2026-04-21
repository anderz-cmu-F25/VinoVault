const CellarEntryModel = require("./cellarEntry.model");
const WineModel = require("./wine.model");

async function findAllByUserId(userId) {
  return CellarEntryModel.find({ userId }).sort({ createdAt: -1 });
}

async function findEntryById(entryId) {
  return CellarEntryModel.findById(entryId);
}

async function createEntry(data) {
  return CellarEntryModel.create(data);
}

async function updateEntry(entryId, userId, data) {
  return CellarEntryModel.findOneAndUpdate(
    { _id: entryId, userId },
    data,
    { new: true }
  );
}

async function deleteEntry(entryId, userId) {
  return CellarEntryModel.findOneAndDelete({ _id: entryId, userId });
}

async function findOrCreateWine(wineData) {
  const { wineName, winery, vintage } = wineData;
  const query = { wineName: wineName.trim() };
  if (winery) query.winery = winery.trim();
  if (vintage) query.vintage = vintage;

  const existing = await WineModel.findOne(query);
  if (existing) return existing;

  return WineModel.create({
    wineName: wineName.trim(),
    winery: winery ? winery.trim() : undefined,
    type: wineData.type,
    region: wineData.region,
    grapes: wineData.grapes,
    vintage: wineData.vintage,
  });
}

async function searchWines(query) {
  return WineModel.find({
    wineName: { $regex: query, $options: "i" },
  })
    .limit(10)
    .sort({ wineName: 1 });
}

module.exports = {
  findAllByUserId,
  findEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  findOrCreateWine,
  searchWines,
};
