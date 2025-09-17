"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Phone, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import {
  registerWithEmail,
  loginWithEmail,
  sendPhoneOTP,
  verifyPhoneOTP,
  forgotPassword,
  clearError,
  clearSuccess,
  clearPhoneAuthState,
} from "../store/slices/authSlice"
import toast from "react-hot-toast"
import { cleanupRecaptcha } from "../config/firebase" // Make sure this is imported

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoading, error, message, isAuthenticated, phoneNumber, confirmationResult, otpSent } = useSelector(
    (state) => state.auth,
  )
  // UI State
  const [activeTab, setActiveTab] = useState("email") // 'email' or 'phone'
  const [mode, setMode] = useState("login") // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  // Email Form State
  const [emailForm, setEmailForm] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  })
  // Phone Form State
  const [phoneForm, setPhoneForm] = useState({
    phoneNumber: "",
    otp: "",
  })
  // OTP Timer
  const [otpTimer, setOtpTimer] = useState(0)
  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState("")
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/"
      navigate(from, { replace: true })
    }
    // Cleanup reCAPTCHA when component unmounts
    return () => {
      cleanupRecaptcha()
    }
  }, [isAuthenticated, navigate, location])
  // Handle success/error messages
  useEffect(() => {
    if (message) {
      toast.success(message)
      dispatch(clearSuccess())
    }
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [message, error, dispatch])
  // OTP Timer Effect
  useEffect(() => {
    let interval = null
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((timer) => timer - 1)
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [otpTimer])
  // Handle Email Form Submit
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (mode === "register") {
      // Validation
      if (!emailForm.name.trim()) {
        toast.error("Name is required")
        return
      }
      if (emailForm.password !== emailForm.confirmPassword) {
        toast.error("Passwords don't match")
        return
      }
      if (emailForm.password.length < 6) {
        toast.error("Password must be at least 6 characters long")
        return
      }
      dispatch(
        registerWithEmail({
          email: emailForm.email,
          password: emailForm.password,
          name: emailForm.name,
        }),
      )
    } else {
      dispatch(
        loginWithEmail({
          email: emailForm.email,
          password: emailForm.password,
        }),
      )
    }
  }
  // Handle Phone Form Submit
  const handlePhoneSubmit = async (e) => {
    e.preventDefault()
    if (!confirmationResult) {
      // Send OTP
      if (!phoneForm.phoneNumber.trim()) {
        toast.error("Phone number is required")
        return
      }
      // Basic phone validation
      const phoneRegex = /^\+[1-9]\d{1,14}$/
      if (!phoneRegex.test(phoneForm.phoneNumber)) {
        toast.error("Please enter a valid phone number including country code (e.g., +1234567890)")
        return
      }
      dispatch(sendPhoneOTP(phoneForm.phoneNumber))
      setOtpTimer(60) // 60 seconds timer
    } else {
      // Verify OTP
      if (!phoneForm.otp.trim()) {
        toast.error("OTP is required")
        return
      }
      if (phoneForm.otp.length !== 6) {
        toast.error("Please enter a valid 6-digit OTP")
        return
      }
      dispatch(
        verifyPhoneOTP({
          confirmationResult,
          otp: phoneForm.otp,
          phoneNumber: phoneForm.phoneNumber, // Pass phoneNumber for backend verification
          name: emailForm.name, // Pass name if registering via phone
        }),
      )
    }
  }
  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!forgotEmail.trim()) {
      toast.error("Email is required")
      return
    }
    dispatch(forgotPassword(forgotEmail))
    setShowForgotPassword(false)
    setForgotEmail("")
  }
  // Resend OTP
  const handleResendOTP = () => {
    if (otpTimer > 0) return
    dispatch(sendPhoneOTP(phoneForm.phoneNumber))
    setOtpTimer(60)
  }
  // Reset forms when switching tabs or modes
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    dispatch(clearPhoneAuthState())
    setEmailForm({ email: "", password: "", name: "", confirmPassword: "" })
    setPhoneForm({ phoneNumber: "", otp: "" })
    setOtpTimer(0)
    cleanupRecaptcha() // Clear reCAPTCHA when switching tabs
  }
  const handleModeChange = (newMode) => {
    setMode(newMode)
    dispatch(clearPhoneAuthState())
    setEmailForm({ email: "", password: "", name: "", confirmPassword: "" })
    setPhoneForm({ phoneNumber: "", otp: "" })
    setOtpTimer(0)
  }
  return (
    <div className="flex  bg-white">
      {/* Left Section: Branding with Image */}
      <div
  className="relative hidden w-1/2 lg:flex"
  // style={{ backgroundColor: "#b80b0c" }}
>
  <img
    src="/02.webp"
    alt="Fashion Model"
    className="absolute inset-0 w-full h-full object-cover
    "
  />
</div>
      {/* Right Section: Login/Register Form */}
      <div className="flex items-center justify-center w-full lg:w-1/2">
        <div className="w-full max-w-md p-10 bg-white shadow-xl rounded-2xl m-2 ">
          {/* Header for mobile */}
          {/* Mode Toggle */}
          <div className="flex p-1 mb-6 bg-gray-100 rounded-lg">
            <button
              onClick={() => handleModeChange("login")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === "login" ? "bg-white text-ksauni-red shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleModeChange("register")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === "register" ? "bg-white text-ksauni-red shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Sign Up
            </button>
          </div>
          {/* Auth Method Tabs */}
          <div className="flex p-1 mb-6 rounded-lg bg-gray-50">
            <button
              onClick={() => handleTabChange("email")}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "email" ? "bg-white text-ksauni-red shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </button>
            <button
              onClick={() => handleTabChange("phone")}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "phone" ? "bg-white text-ksauni-red shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Phone className="w-4 h-4 mr-2" />
              Phone
            </button>
          </div>
          {/* Forms */}
          <AnimatePresence mode="wait">
            {activeTab === "email" && (
              <motion.div
                key="email-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {mode === "register" && (
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Full Name</label>
                      <div className="relative">
                        <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <input
                          type="text"
                          value={emailForm.name}
                          onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                          className="w-full py-3 pl-10 pr-4 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-ksauni-red focus:border-ksauni-red"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                      <input
                        type="email"
                        value={emailForm.email}
                        onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                        className="w-full py-3 pl-10 pr-4 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-ksauni-red focus:border-ksauni-red"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
                    <div className="relative">
                      <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={emailForm.password}
                        onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                        className="w-full py-3 pl-10 pr-12 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-ksauni-red focus:border-ksauni-red"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {mode === "register" && (
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={emailForm.confirmPassword}
                          onChange={(e) => setEmailForm({ ...emailForm, confirmPassword: e.target.value })}
                          className="w-full py-3 pl-10 pr-4 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-ksauni-red focus:border-ksauni-red"
                          placeholder="Confirm your password"
                          required
                        />
                      </div>
                    </div>
                  )}
                  {mode === "login" && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm font-medium text-ksauni-red hover:text-ksauni-dark-red"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center w-full px-4 py-3 font-medium text-white transition-colors rounded-lg bg-ksauni-red hover:bg-ksauni-dark-red focus:ring-2 focus:ring-ksauni-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {mode === "login" ? "Sign In" : "Create Account"}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
            {activeTab === "phone" && (
              <motion.div
                key="phone-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  {!confirmationResult ? (
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <input
                          type="tel"
                          value={phoneForm.phoneNumber}
                          onChange={(e) => setPhoneForm({ ...phoneForm, phoneNumber: e.target.value })}
                          className="w-full py-3 pl-10 pr-4 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-ksauni-red focus:border-ksauni-red"
                          placeholder="+1 (555) 123-4567"
                          required
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Include country code (e.g., +1 for US)</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 text-center">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="mb-1 text-lg font-semibold text-gray-800">Verification Code Sent</h3>
                        <p className="text-sm text-gray-600">
                          We've sent a 6-digit code to
                          <br />
                          <span className="font-medium">{phoneForm.phoneNumber}</span>
                        </p>
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Verification Code</label>
                        <input
                          type="text"
                          value={phoneForm.otp}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                            setPhoneForm({ ...phoneForm, otp: value })
                          }}
                          className="w-full px-4 py-3 font-mono text-2xl tracking-widest text-center transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-ksauni-red focus:border-ksauni-red"
                          placeholder="000000"
                          maxLength={6}
                          required
                        />
                      </div>
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={otpTimer > 0 || isLoading}
                          className="text-sm font-medium text-ksauni-red hover:text-ksauni-dark-red disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          {otpTimer > 0 ? `Resend code in ${otpTimer}s` : isLoading ? "Sending..." : "Resend code"}
                        </button>
                      </div>
                    </>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center w-full px-4 py-3 font-medium text-white transition-colors rounded-lg bg-ksauni-red hover:bg-ksauni-dark-red focus:ring-2 focus:ring-ksauni-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {!confirmationResult ? "Send Code" : "Verify & Continue"}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                  {confirmationResult && (
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(clearPhoneAuthState())
                        setPhoneForm({ phoneNumber: "", otp: "" })
                        setOtpTimer(0)
                      }}
                      className="w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                      Change Phone Number
                    </button>
                  )}
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              By continuing, you agree to our{" "}
              <Link to="/terms" className="font-medium text-ksauni-red hover:text-ksauni-dark-red">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="font-medium text-ksauni-red hover:text-ksauni-dark-red">
                Privacy Policy
              </Link>
            </p>
          </div>
          {/* Forgot Password Modal */}
          <AnimatePresence>
            {showForgotPassword && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
                onClick={() => setShowForgotPassword(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-md p-6 bg-white rounded-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-6 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-ksauni-red/10">
                      <AlertCircle className="w-8 h-8 text-ksauni-red" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-800">Reset Password</h3>
                    <p className="text-sm text-gray-600">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="w-full py-3 pl-10 pr-4 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-ksauni-red focus:border-ksauni-red"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(false)}
                        className="flex-1 px-4 py-3 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center justify-center flex-1 px-4 py-3 font-medium text-white transition-colors rounded-lg bg-ksauni-red hover:bg-ksauni-dark-red disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* reCAPTCHA container for phone auth */}
          <div id="recaptcha-container"></div>
        </div>
      </div>
    </div>
  )
}
export default LoginPage
