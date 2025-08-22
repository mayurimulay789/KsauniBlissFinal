"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import {
  FileText,
  Shield,
  CreditCard,
  Truck,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Globe,
  ChevronDown,
  Lock,
  Eye,
  Users,
} from "lucide-react"

const PrivacyPage = () => {
  const [expandedSection, setExpandedSection] = useState(null)

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: FileText,
      color: "bg-blue-500",
      content: `By accessing or using the Ksauni Bliss website (www.ksaunibliss.com), you agree to be bound by these Terms of Service and any other terms that may apply. If you do not agree to these terms, please do not use the website or purchase products.`,
    },
    {
      id: "changes",
      title: "Changes to Terms",
      icon: AlertTriangle,
      color: "bg-amber-500",
      content: `Ksauni Bliss reserves the right to update, modify, or change these Terms of Service at any time. Any changes will take effect immediately upon posting on this page. Please check periodically for updates. Your continued use of the site after changes have been made constitutes your acceptance of the revised terms.`,
    },
    {
      id: "eligibility",
      title: "Eligibility",
      icon: Shield,
      color: "bg-green-500",
      content: `You must be at least 18 years of age to use this website and make a purchase. If you are under 18, you must have the consent of a parent or guardian to use the site and place orders.`,
    },
    {
      id: "account",
      title: "Account Responsibility",
      icon: Users,
      color: "bg-purple-500",
      content: `If you create an account on our website, you are responsible for maintaining the confidentiality of your account details, including your username and password. You are also responsible for all activities that occur under your account. If you suspect any unauthorized use of your account, please contact us immediately.`,
    },
    {
      id: "products",
      title: "Product Information",
      icon: FileText,
      color: "bg-indigo-500",
      content: `We make every effort to provide accurate descriptions, images, and information about the products on our website. However, we cannot guarantee that all product descriptions, pricing, or availability are completely accurate or error-free. Prices and availability are subject to change without notice.`,
    },
    {
      id: "orders",
      title: "Orders and Payment",
      icon: CreditCard,
      color: "bg-emerald-500",
      content: `When you place an order, you are making an offer to buy the selected items. We reserve the right to accept or decline your order. All prices are listed in INR, and you are responsible for paying any applicable taxes, shipping charges, or duties. We accept various payment methods, including credit/debit cards and other payment processors, as indicated on our site.`,
    },
    {
      id: "shipping",
      title: "Shipping and Delivery",
      icon: Truck,
      color: "bg-orange-500",
      content: `Ksauni Bliss strives to ship orders promptly. However, shipping times and availability are subject to stock and delivery service providers. Shipping fees are calculated at checkout and may vary depending on your location and the shipping method selected. We are not responsible for any delays caused by third-party delivery services.`,
    },
    {
      id: "returns",
      title: "Returns and Refunds",
      icon: RotateCcw,
      color: "bg-teal-500",
      content: `Please refer to our Return and Refund Policy for detailed information regarding returns, exchanges, and refunds. By placing an order, you agree to our return and refund conditions.`,
    },
    {
      id: "intellectual",
      title: "Intellectual Property",
      icon: Shield,
      color: "bg-rose-500",
      content: `All content on the Ksauni Bliss website, including logos, designs, text, images, and trademarks, is the property of Ksauni Bliss or its licensors and is protected by intellectual property laws. You may not use, reproduce, or distribute any of our content without prior written permission.`,
    },
    {
      id: "conduct",
      title: "User Conduct",
      icon: AlertTriangle,
      color: "bg-red-500",
      content: `By using our website, you agree not to:
• Engage in any unlawful, fraudulent, or harmful activities.
• Use the website in a way that could damage, disable, or impair the functionality of the site or interfere with other users.
• Post or transmit any harmful or offensive content, including viruses, malware, or hate speech.
• Use the website for unauthorized commercial purposes or solicitations.`,
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      icon: Shield,
      color: "bg-slate-500",
      content: `Ksauni Bliss is not liable for any indirect, incidental, special, or consequential damages arising from your use of the website or our products. Our liability is limited to the amount you paid for the product(s) in question.`,
    },
    {
      id: "indemnification",
      title: "Indemnification",
      icon: Shield,
      color: "bg-cyan-500",
      content: `You agree to indemnify and hold harmless Ksauni Bliss, its employees, affiliates, and partners from any claims, damages, or expenses (including legal fees) arising from your use of the website, violation of these terms, or infringement of any third-party rights.`,
    },
    {
      id: "privacy",
      title: "Privacy",
      icon: Lock,
      color: "bg-violet-500",
      content: `Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.`,
    },
    {
      id: "third-party",
      title: "Third-Party Links",
      icon: Globe,
      color: "bg-lime-500",
      content: `The Ksauni Bliss website may contain links to third-party websites or services that are not controlled by us. We are not responsible for the content or privacy practices of third-party websites. Clicking on those links is done at your own risk.`,
    },
    {
      id: "governing",
      title: "Governing Law",
      icon: FileText,
      color: "bg-sky-500",
      content: `These Terms of Service are governed by the laws of India. Any legal action arising from these terms will be subject to the jurisdiction of the courts in India.`,
    },
    {
      id: "dispute",
      title: "Dispute Resolution",
      icon: CheckCircle,
      color: "bg-emerald-600",
      content: `In the event of any dispute, we encourage you to first contact us directly to resolve the issue. If we are unable to resolve the dispute informally, you agree to submit any unresolved disputes to binding arbitration or mediation, as per the laws in your jurisdiction.`,
    },
    {
      id: "termination",
      title: "Termination",
      icon: AlertTriangle,
      color: "bg-red-600",
      content: `We reserve the right to suspend or terminate your access to the website if we believe you have violated these terms or engaged in any unauthorized or harmful activity. This includes, but is not limited to, engaging in fraudulent or illegal activities, or violating intellectual property rights.`,
    },
    {
      id: "contact",
      title: "Contact Information",
      icon: FileText,
      color: "bg-blue-600",
      content: `If you have any questions about these Terms of Service or need assistance, please contact us at support@ksaunibliss.com or call us at +91-9876543210.`,
    },
  ]

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff fill-opacity=0.1%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

        <div className="container relative px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Eye className="w-12 h-12" />
              </div>
            </div>
            <h1 className="mb-6 text-5xl font-bold md:text-6xl">Privacy Policy</h1>
            <p className="mb-8 text-xl opacity-90 leading-relaxed">
              Transparency in how we handle your personal information and protect your privacy
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
              <Lock className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Last Updated: January 15, 2024</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="p-8 mb-12 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20"
            >
              <div className="flex items-center mb-6">
                <div className="p-3 mr-4 bg-blue-100 rounded-xl">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Your Privacy Matters</h2>
              </div>
              <p className="text-lg leading-relaxed text-gray-600">
                Welcome to Ksauni Bliss! By using our website, making purchases, or interacting with our services, you
                agree to follow these Terms of Service. Please read them carefully to understand your rights and
                responsibilities.
              </p>
            </motion.div>

            {/* Accordion Sections */}
            <div className="space-y-4">
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl border border-white/20 overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-6 text-left transition-all duration-200 hover:bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-3 mr-4 ${section.color} rounded-xl`}>
                          <section.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">{section.title}</h3>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedSection === section.id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                      </motion.div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedSection === section.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          <div className="pl-16">
                            <div className="p-4 bg-gray-50/50 rounded-lg">
                              <p className="leading-relaxed text-gray-700 whitespace-pre-line">{section.content}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Contact CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="p-8 mt-12 text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FileText className="w-8 h-8" />
                </div>
              </div>
              <h3 className="mb-4 text-2xl font-bold">Questions About Our Privacy Policy?</h3>
              <p className="mb-6 text-lg opacity-90">
                We're here to help clarify any concerns you may have about how we handle your personal information.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:support@ksaunibliss.com"
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Email Us
                </a>
                <a
                  href="tel:+919876543210"
                  className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/30 transition-colors"
                >
                  Call +91-9876543210
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PrivacyPage
