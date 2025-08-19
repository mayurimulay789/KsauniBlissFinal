"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Facebook, Instagram, Twitter, Youtube } from "lucide-react"

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

  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak directly with our customer service team",
      value: "+919211891719",
      action: "+919211891719",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us an email and we'll respond within 24 hours",
      value: "ksaunibliss@gmail.com",
      action: "mailto:ksaunibliss@gmail.com",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with us in real-time for instant support",
      value: "Start Chat",
      action: "#",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      value: "Ground Floor, Nawada Housing Complex,Dwarka More, Delhi -110059",
      action: "#",
      color: "bg-red-100 text-red-600",
    },
  ]

  const supportCategories = [
    { value: "general", label: "General Inquiry" },
    { value: "order", label: "Order Support" },
    { value: "returns", label: "Returns & Exchanges" },
    { value: "technical", label: "Technical Issue" },
    { value: "feedback", label: "Feedback & Suggestions" },
    { value: "partnership", label: "Business Partnership" },
  ]

  const faqItems = [
    {
      question: "What are your shipping charges?",
      answer: "We offer free shipping on orders above ₹999. For orders below ₹999, shipping charges are ₹99.",
    },
    {
      question: "How long does delivery take?",
      answer: "Standard delivery takes 5-7 business days. Express delivery (1-2 days) is available in select cities.",
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy. Items must be unused, with tags attached, in original packaging.",
    },
    {
      question: "Do you offer international shipping?",
      answer: "Currently, we ship within India only. International shipping will be available soon.",
    },
  ]

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook", color: "hover:text-blue-600" },
    { icon: Instagram, href: "#", label: "Instagram", color: "hover:text-pink-600" },
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-blue-400" },
    { icon: Youtube, href: "#", label: "YouTube", color: "hover:text-red-600" },
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

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
              We're here to help! Reach out to us through any of the channels below and we'll get back to you as soon as
              possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method, index) => (
              <motion.a
                key={method.title}
                href={method.action}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="p-6 text-center transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl group"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${method.color} mb-4 group-hover:scale-110 transition-transform`}
                >
                  <method.icon className="w-8 h-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800">{method.title}</h3>
                <p className="mb-3 text-sm text-gray-600">{method.description}</p>
                <div className="font-medium text-red-500">{method.value}</div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="p-8 bg-white shadow-lg rounded-xl"
            >
              <h2 className="mb-6 text-3xl font-bold text-gray-800">Send us a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      {supportCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter the subject"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter your message..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center w-full py-3 space-x-2 font-semibold text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              

              {/* Quick FAQ */}
              <div className="p-6 bg-white shadow-lg rounded-xl">
                <h3 className="mb-4 text-xl font-semibold text-gray-800">Quick FAQ</h3>
                <div className="space-y-4">
                  {faqItems.map((faq, index) => (
                    <div key={index} className="pb-3 border-b border-gray-100 last:border-b-0">
                      <h4 className="mb-1 font-medium text-gray-800">{faq.question}</h4>
                      <p className="text-sm text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="mt-4 text-sm font-medium text-red-500 hover:text-red-600"
                >
                  View All FAQs →
                </motion.button>
              </div>

              {/* Social Media */}
              <div className="p-6 bg-white shadow-lg rounded-xl">
                <h3 className="mb-4 text-xl font-semibold text-gray-800">Follow Us</h3>
                <p className="mb-4 text-gray-600">
                  Stay connected with us on social media for the latest updates, fashion tips, and exclusive offers.
                </p>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`bg-gray-100 p-3 rounded-full text-gray-600 ${social.color} transition-colors`}
                    >
                      <social.icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-gray-800">Visit Our Store</h2>
            <p className="max-w-2xl mx-auto text-gray-600">
              Come visit our flagship store in Mumbai for a personalized shopping experience
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="overflow-hidden bg-gray-200 shadow-lg rounded-xl"
            style={{ height: "400px" }}
          >
            {/* Placeholder for Google Maps */}
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-red-100 to-red-100">
              <div className="text-center">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h3 className="mb-2 text-xl font-semibold text-gray-800">Kasuni Bliss Flagship Store</h3>
                <p className="text-gray-600">Ground Floor, Nawada Housing Complex,Dwarka More, Delhi -110059
</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-2 mt-4 text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Get Directions
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}

export default ContactUsPage
