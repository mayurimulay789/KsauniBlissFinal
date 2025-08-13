// Environment validation utility
export const validateEnvironment = () => {
  const requiredEnvVars = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_API_URL",
  ]

  const missingVars = requiredEnvVars.filter((varName) => {
    const value = import.meta.env[varName]
    return !value || value === "undefined"
  })

  if (missingVars.length > 0) {
    console.error("❌ Missing environment variables:", missingVars)
    console.log("📝 Please check your .env file and ensure these variables are set:")
    missingVars.forEach((varName) => {
      console.log(`   ${varName}=your_value_here`)
    })
    return false
  }

  console.log("✅ All required environment variables are set")
  return true
}

// Debug function to log all environment variables (development only)
export const debugEnvironment = () => {
  if (import.meta.env.MODE === "development") {
    console.log("🔧 Environment Variables Debug:")
    console.log("Mode:", import.meta.env.MODE)
    console.log("API URL:", import.meta.env.VITE_API_URL)
    console.log("Firebase Project ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID)
    console.log("Use Emulator:", import.meta.env.VITE_USE_FIREBASE_EMULATOR)
  }
}
