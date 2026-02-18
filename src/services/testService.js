import { doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'
import { localStorageService } from './localStorageService'

const TEST_DOC_ID = 'activeTest'
const USE_FIREBASE = isFirebaseConfigured

const persistTest = async (testData) => {
  if (!USE_FIREBASE) {
    localStorageService.saveTest(testData)
    return
  }
  await setDoc(doc(db, 'tests', TEST_DOC_ID), testData)
}

export const testService = {
  // Apply a new test
  async applyTest(playerName, difficulty, helpers = [], hasConfusionComplication = false) {
    const now = Date.now()
    const redHexes = Array.from({ length: difficulty.redHexes }, (_, i) => ({
      id: `red-${i}-${now}`,
      color: 'red',
      drawn: false
    }))

    // Hidden hexes from Confusion complication: random color, invisible to player until drawn
    const confusionHexes = hasConfusionComplication
      ? Array.from({ length: 4 }, (_, i) => ({
          id: `hidden-${i}-${now}`,
          color: Math.random() < 0.5 ? 'green' : 'red',
          drawn: false,
          hidden: true
        }))
      : []

    const testData = {
      playerName,
      difficulty: difficulty.label,
      difficultyValue: difficulty.value,
      redCount: difficulty.redHexes,
      hexes: [...redHexes, ...confusionHexes],
      drawnHexes: [],
      shuffled: false,
      helpers,
      createdAt: now
    }

    await persistTest(testData)
  },

  // Add misfortune complication hexes to the bag (tagged with misfortune name)
  async addMisfortuneComplications(currentTest, misfortune) {
    const count = misfortune.complications || 0
    if (count <= 0) return

    const now = Date.now()
    const newHexes = Array.from({ length: count }, (_, i) => ({
      id: `complication-${now}-${i}`,
      color: 'red',
      drawn: false,
      label: misfortune.text || ''
    }))

    await persistTest({
      ...currentTest,
      hexes: [...currentTest.hexes, ...newHexes]
    })
  },

  // Add one green hex to the bag
  async addGreenHex(currentTest) {
    const greenHex = {
      id: `green-${currentTest.hexes.length}-${Date.now()}`,
      color: 'green',
      drawn: false
    }
    await persistTest({
      ...currentTest,
      hexes: [...currentTest.hexes, greenHex]
    })
  },

  // Add two green hexes at once (bonus from placed success hex)
  async addGreenHexDouble(currentTest) {
    const now = Date.now()
    const newHexes = [
      { id: `green-bonus-0-${now}`, color: 'green', drawn: false },
      { id: `green-bonus-1-${now + 1}`, color: 'green', drawn: false },
    ]
    await persistTest({
      ...currentTest,
      hexes: [...currentTest.hexes, ...newHexes]
    })
  },

  // Remove a hex from drawnHexes (when dragged to character sheet)
  async removeFromDrawn(currentTest, hexId) {
    await persistTest({
      ...currentTest,
      drawnHexes: currentTest.drawnHexes.filter(h => h.id !== hexId)
    })
  },

  // Shuffle the bag (lock adding hexes)
  async shuffle(currentTest) {
    await persistTest({ ...currentTest, shuffled: true })
  },

  // Draw a random hex from the bag; hidden hexes are revealed on draw
  async drawHex(currentTest) {
    const availableHexes = currentTest.hexes.filter(h => !h.drawn)
    if (availableHexes.length === 0) return

    const randomIndex = Math.floor(Math.random() * availableHexes.length)
    const drawnHex = availableHexes[randomIndex]

    // Mark as drawn and reveal if hidden
    const updatedHexes = currentTest.hexes.map(h =>
      h.id === drawnHex.id ? { ...h, drawn: true, hidden: false } : h
    )

    // Reveal actual color when added to drawnHexes
    const revealedHex = { ...drawnHex, hidden: false }

    await persistTest({
      ...currentTest,
      hexes: updatedHexes,
      drawnHexes: [...currentTest.drawnHexes, revealedHex]
    })
  },

  // Clear the test
  async clearTest() {
    if (!USE_FIREBASE) {
      localStorageService.clearTest()
      return
    }
    await deleteDoc(doc(db, 'tests', TEST_DOC_ID))
  },

  // Subscribe to test updates
  subscribeToTest(callback) {
    if (!USE_FIREBASE) {
      return localStorageService.subscribeToTest(callback)
    }

    return onSnapshot(
      doc(db, 'tests', TEST_DOC_ID),
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data())
        } else {
          callback(null)
        }
      },
      (error) => {
        console.error('Error subscribing to test:', error)
        callback(null)
      }
    )
  }
}
