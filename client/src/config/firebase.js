import { initializeApp } from "firebase/app"
import { getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getStorage, connectStorageEmulator } from "firebase/storage"

// Firebase configuration using Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Debug: Log environment variables (remove in production)
console.log("🔧 Firebase Config Debug:", {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? "✅ Set" : "❌ Missing",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? "✅ Set" : "❌ Missing",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? "✅ Set" : "❌ Missing",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? "✅ Set" : "❌ Missing",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? "✅ Set" : "❌ Missing",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ? "✅ Set" : "❌ Missing",
  mode: import.meta.env.MODE,
  useEmulator: import.meta.env.VITE_USE_FIREBASE_EMULATOR,
})

// Validate required Firebase configuration
const requiredConfig = ["VITE_FIREBASE_API_KEY", "VITE_FIREBASE_AUTH_DOMAIN", "VITE_FIREBASE_PROJECT_ID"]

const missingConfig = requiredConfig.filter((key) => !import.meta.env[key])

if (missingConfig.length > 0) {
  console.error("❌ Missing Firebase configuration:", missingConfig)
  throw new Error(`Missing required Firebase configuration: ${missingConfig.join(", ")}`)
}

// Initialize Firebase
let app
try {
  app = initializeApp(firebaseConfig)
  console.log("✅ Firebase initialized successfully")
} catch (error) {
  console.error("❌ Firebase initialization failed:", error)
  throw error
}

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Configure auth settings
auth.languageCode = "en"

// Set auth persistence
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Auth persistence set to local")
  })
  .catch((error) => {
    console.error("❌ Failed to set auth persistence:", error)
  })

// Connect to Firebase emulators in development (only if explicitly enabled)
if (import.meta.env.MODE === "development" && import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true") {
  try {
    // Check if emulators are already connected
    const authEmulatorConnected = auth.config?.emulator
    const firestoreEmulatorConnected = db._delegate?._databaseId?.projectId?.includes("demo-")

    if (!authEmulatorConnected) {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
      console.log("🔥 Connected to Auth emulator")
    }

    if (!firestoreEmulatorConnected) {
      connectFirestoreEmulator(db, "localhost", 8080)
      console.log("🔥 Connected to Firestore emulator")
    }

    connectStorageEmulator(storage, "localhost", 9199)
    console.log("🔥 Connected to Storage emulator")
  } catch (error) {
    console.warn("⚠️ Firebase emulators connection failed:", error.message)
    console.log("📝 Make sure Firebase emulators are running: firebase emulators:start")
  }
} else {
  console.log("🌐 Using Firebase production services")
}

// Function to clean up reCAPTCHA
export const cleanupRecaptcha = () => {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear()
      console.log("🧹 reCAPTCHA cleaned up")
    } catch (error) {
      console.log("⚠️ Error cleaning reCAPTCHA:", error)
    }
    window.recaptchaVerifier = null
  }
}

// Export app instance
export default app
