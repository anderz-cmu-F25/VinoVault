/**
 * Builder interface for CellarEntry construction.
 * All concrete builders must implement these methods.
 */
class Builder {
  reset() {
    throw new Error('reset() not implemented')
  }
  setUser(userId) {
    throw new Error('setUser() not implemented')
  }
  setWineInfo(wineId, name, winery, type, region) {
    throw new Error('setWineInfo() not implemented')
  }
  setVintage(vintage) {
    throw new Error('setVintage() not implemented')
  }
  setQuantity(quantity) {
    throw new Error('setQuantity() not implemented')
  }
  setPurchaseDate(date) {
    throw new Error('setPurchaseDate() not implemented')
  }
  setStorageLocation(location) {
    throw new Error('setStorageLocation() not implemented')
  }
  setStatus(status) {
    throw new Error('setStatus() not implemented')
  }
  setNotes(notes) {
    throw new Error('setNotes() not implemented')
  }
  setNoteImages(images) {
    throw new Error('setNoteImages() not implemented')
  }
  getResult() {
    throw new Error('getResult() not implemented')
  }
}

module.exports = Builder
