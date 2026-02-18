// LocalStorage service for development/offline mode
const STORAGE_KEYS = {
  SHEETS: 'nte_sheets',
  TEST: 'nte_active_test',
}

// Helper to trigger storage events for cross-tab sync
function triggerStorageEvent(key, data) {
  window.dispatchEvent(new StorageEvent('storage', {
    key,
    newValue: JSON.stringify(data),
    url: window.location.href,
    storageArea: localStorage
  }))
}

export const localStorageService = {
  // ===== SHEETS =====

  getAllSheets() {
    const data = localStorage.getItem(STORAGE_KEYS.SHEETS)
    return data ? JSON.parse(data) : []
  },

  getSheet(playerName) {
    const sheets = this.getAllSheets()
    return sheets.find(s => s.playerName === playerName) || null
  },

  saveSheet(playerName, sheetData) {
    const sheets = this.getAllSheets()
    const index = sheets.findIndex(s => s.playerName === playerName)

    const newSheet = {
      id: playerName,
      playerName,
      ...sheetData,
      updatedAt: Date.now()
    }

    if (index >= 0) {
      sheets[index] = newSheet
    } else {
      sheets.push(newSheet)
    }

    localStorage.setItem(STORAGE_KEYS.SHEETS, JSON.stringify(sheets))
    triggerStorageEvent(STORAGE_KEYS.SHEETS, sheets)

    return newSheet
  },

  deleteSheet(playerName) {
    const sheets = this.getAllSheets().filter(s => s.playerName !== playerName)
    localStorage.setItem(STORAGE_KEYS.SHEETS, JSON.stringify(sheets))
    triggerStorageEvent(STORAGE_KEYS.SHEETS, sheets)
  },

  subscribeToSheets(callback) {
    // Initial call
    callback(this.getAllSheets())

    // Listen for changes
    const handler = (e) => {
      if (e.key === STORAGE_KEYS.SHEETS) {
        callback(this.getAllSheets())
      }
    }

    window.addEventListener('storage', handler)

    // Also listen to custom events for same-tab updates
    const customHandler = () => callback(this.getAllSheets())
    window.addEventListener('storage', customHandler)

    return () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener('storage', customHandler)
    }
  },

  subscribeToSheet(playerName, callback) {
    // Initial call
    callback(this.getSheet(playerName))

    // Listen for changes
    const handler = () => {
      callback(this.getSheet(playerName))
    }

    window.addEventListener('storage', handler)

    return () => {
      window.removeEventListener('storage', handler)
    }
  },

  // ===== TESTS =====

  getActiveTest() {
    const data = localStorage.getItem(STORAGE_KEYS.TEST)
    return data ? JSON.parse(data) : null
  },

  saveTest(testData) {
    if (testData === null) {
      localStorage.removeItem(STORAGE_KEYS.TEST)
    } else {
      localStorage.setItem(STORAGE_KEYS.TEST, JSON.stringify(testData))
    }
    triggerStorageEvent(STORAGE_KEYS.TEST, testData)
  },

  clearTest() {
    localStorage.removeItem(STORAGE_KEYS.TEST)
    triggerStorageEvent(STORAGE_KEYS.TEST, null)
  },

  subscribeToTest(callback) {
    // Initial call
    callback(this.getActiveTest())

    // Listen for changes
    const handler = () => {
      callback(this.getActiveTest())
    }

    window.addEventListener('storage', handler)

    return () => {
      window.removeEventListener('storage', handler)
    }
  }
}
