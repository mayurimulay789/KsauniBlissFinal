"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    category: "general",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success("Message sent successfully! We'll get back to you within 24 hours.")
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        category: "general",
      })
    } catch (error) {
      toast.error("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-red-50 to-red-50">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="mb-6 text-4xl font-bold text-gray-800 md:text-5xl">
              Get in <span className="text-red-500">Touch</span>
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              We're here to help! Reach out to us and we'll get back to you as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Map / Contact Form Section (placeholder) */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto text-center">
          <p className="text-gray-600 text-lg">
            You can add a contact form or Google Maps here.
          </p>
        </div>
      </section>

    </div>
  )
}

export default ContactUsPage
