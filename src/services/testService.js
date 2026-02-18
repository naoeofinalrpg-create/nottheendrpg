import { doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'
import { localStorageService } from './localStorageService'

const TEST_DOC_ID = 'activeTest'
const USE_FIREBASE = isFirebaseConfigured

export const testService = {
  // Apply a new test
  async applyTest(playerName, difficulty, helpers = []) {
    const redHexes = Array.from({ length: difficulty.redHexes }, (_, i) => ({
      id: `red-${i}-${Date.now()}`,
      color: 'red',
      drawn: false
    }))

    const testData = {
      playerName,
      difficulty: difficulty.label,
      difficultyValue: difficulty.value,
      redCount: difficulty.redHexes,
      hexes: redHexes,
      drawnHexes: [],
      shuffled: false,
      helpers,
      createdAt: Date.now()
    }

    if (!USE_FIREBASE) {
      localStorageService.saveTest(testData)
      return
    }

    await setDoc(doc(db, 'tests', TEST_DOC_ID), testData)
  },

  // Add misfortune complication hexes to the bag (tagged with misfortune name)
  async addMisfortuneComplications(currentTest, misfortune) {
    const count = misfortune.complications || 0
    if (count <= 0) return

    const newHexes = Array.from({ length: count }, (_, i) => ({
      id: `complication-${Date.now()}-${i}`,
      color: 'red',
      drawn: false,
      label: misfortune.text || ''
    }))

    const updatedTest = {
      ...currentTest,
      hexes: [...currentTest.hexes, ...newHexes]
    }

    if (!USE_FIREBASE) {
      localStorageService.saveTest(updatedTest)
      return
    }

    await setDoc(doc(db, 'tests', TEST_DOC_ID), updatedTest)
  },

  // Add a green hex to the bag
  async addGreenHex(currentTest) {
    const greenHex = {
      id: `green-${currentTest.hexes.length}-${Date.now()}`,
      color: 'green',
      drawn: false
    }

    const updatedTest = {
      ...currentTest,
      hexes: [...currentTest.hexes, greenHex]
    }

    if (!USE_FIREBASE) {
      localStorageService.saveTest(updatedTest)
      return
    }

    await setDoc(doc(db, 'tests', TEST_DOC_ID), updatedTest)
  },

  // Shuffle the bag (lock adding hexes)
  async shuffle(currentTest) {
    const updatedTest = {
      ...currentTest,
      shuffled: true
    }

    if (!USE_FIREBASE) {
      localStorageService.saveTest(updatedTest)
      return
    }

    await setDoc(doc(db, 'tests', TEST_DOC_ID), updatedTest)
  },

  // Draw a random hex from the bag
  async drawHex(currentTest) {
    const availableHexes = currentTest.hexes.filter(h => !h.drawn)
    if (availableHexes.length === 0) return

    // Pick random hex
    const randomIndex = Math.floor(Math.random() * availableHexes.length)
    const drawnHex = availableHexes[randomIndex]

    // Mark as drawn
    const updatedHexes = currentTest.hexes.map(h =>
      h.id === drawnHex.id ? { ...h, drawn: true } : h
    )

    const updatedTest = {
      ...currentTest,
      hexes: updatedHexes,
      drawnHexes: [...currentTest.drawnHexes, drawnHex]
    }

    if (!USE_FIREBASE) {
      localStorageService.saveTest(updatedTest)
      return
    }

    await setDoc(doc(db, 'tests', TEST_DOC_ID), updatedTest)
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
