"use client"

import { motion } from "framer-motion"
import { FileText, Shield, CreditCard, Truck, RotateCcw, AlertTriangle } from "lucide-react"


const TermsPage = () => {
  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: FileText,
      content: `By accessing and using the Kasuni Bliss website and mobile application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`,
    },
    {
      id: "definitions",
      title: "Definitions",
      icon: FileText,
      content: `
        • "We", "Us", "Our" refers to Kasuni Bliss Fashion Private Limited
        • "You", "Your", "User" refers to the person accessing our services
        • "Services" refers to our website, mobile app, and all related services
        • "Products" refers to all fashion items, accessories, and merchandise sold on our platform
        • "Account" refers to your registered user account on our platform
      `,
    },
    {
      id: "account",
      title: "User Account & Registration",
      icon: Shield,
      content: `
        • You must be at least 18 years old to create an account
        • You are responsible for maintaining the confidentiality of your account
        • You agree to provide accurate, current, and complete information
        • You are responsible for all activities that occur under your account
        • We reserve the right to suspend or terminate accounts that violate our terms
        • One person may not maintain multiple accounts
      `,
    },
    {
      id: "orders",
      title: "Orders & Pricing",
      icon: CreditCard,
      content: `
        • All orders are subject to acceptance and availability
        • Prices are subject to change without notice
        • We reserve the right to refuse or cancel any order
        • Payment must be received before order processing
        • Order confirmation does not guarantee product availability
        • We may require additional verification for certain orders
        • Bulk orders may be subject to special terms and conditions
      `,
    },
    {
      id: "shipping",
      title: "Shipping & Delivery",
      icon: Truck,
      content: `
        • Delivery times are estimates and not guaranteed
        • Risk of loss passes to you upon delivery to the carrier
        • We are not responsible for delays caused by shipping carriers
        • Delivery address changes may not be possible after order processing
        • Additional charges may apply for remote or difficult-to-reach locations
        • We reserve the right to use alternative shipping methods
        • Signature confirmation may be required for high-value orders
      `,
    },
    {
      id: "returns",
      title: "Returns & Refunds",
      icon: RotateCcw,
      content: `
        • Returns must be initiated within 30 days of delivery
        • Items must be unused, unwashed, and in original condition
        • Original tags and packaging must be intact
        • Certain items (innerwear, cosmetics, personalized items) are non-returnable
        • Return shipping is free for defective or incorrect items
        • Refunds will be processed to the original payment method
        • Processing time for refunds is 5-7 business days after item receipt
      `,
    },
    {
      id: "intellectual",
      title: "Intellectual Property",
      icon: Shield,
      content: `
        • All content on our platform is protected by copyright and trademark laws
        • You may not reproduce, distribute, or create derivative works
        • Product images and descriptions are for reference only
        • User-generated content may be used by us for marketing purposes
        • We respect intellectual property rights and expect users to do the same
        • Report any copyright infringement to our legal team
      `,
    },
    {
      id: "prohibited",
      title: "Prohibited Uses",
      icon: AlertTriangle,
      content: `
        • Using our services for any unlawful purpose
        • Attempting to gain unauthorized access to our systems
        • Interfering with the proper functioning of our website
        • Uploading malicious code or viruses
        • Harassing other users or our staff
        • Creating fake accounts or impersonating others
        • Scraping or data mining our content without permission
        • Reselling our products without authorization
      `,
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      icon: Shield,
      content: `
        • Our liability is limited to the maximum extent permitted by law
        • We are not liable for indirect, incidental, or consequential damages
        • Our total liability shall not exceed the amount paid for the specific product
        • We do not warrant that our service will be uninterrupted or error-free
        • You use our services at your own risk
        • Some jurisdictions do not allow limitation of liability
      `,
    },
    {
      id: "privacy",
      title: "Privacy & Data Protection",
      icon: Shield,
      content: `
        • Your privacy is important to us - see our Privacy Policy for details
        • We collect and use personal information as described in our Privacy Policy
        • You consent to the collection and use of your information
        • We implement appropriate security measures to protect your data
        • You have rights regarding your personal data under applicable laws
        • We may share information as required by law or to protect our rights
      `,
    },
    {
      id: "modifications",
      title: "Modifications to Terms",
      icon: FileText,
      content: `
        • We reserve the right to modify these terms at any time
        • Changes will be effective immediately upon posting
        • Continued use of our services constitutes acceptance of modified terms
        • We will notify users of significant changes via email or website notice
        • It is your responsibility to review terms periodically
        • If you disagree with changes, you must stop using our services
      `,
    },
    {
      id: "governing",
      title: "Governing Law & Jurisdiction",
      icon: FileText,
      content: `
        • These terms are governed by the laws of India
        • Any disputes will be subject to the jurisdiction of Mumbai courts
        • We will attempt to resolve disputes through good faith negotiations
        • Arbitration may be required for certain disputes
        • Class action lawsuits are not permitted
        • You waive the right to trial by jury for any disputes
      `,
    },
    {
      id: "contact",
      title: "Contact Information",
      icon: FileText,
      content: `
        For questions about these Terms and Conditions, please contact us:
        
        • Email: legal@kasunibliss.com
        • Phone: +91-9876543210
        • Address: 123 Fashion Street, Bandra West, Mumbai - 400050
        • Business Hours: Monday to Friday, 9:00 AM to 6:00 PM IST
        
        We will respond to your inquiries within 48 hours during business days.
      `,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="mb-6 text-4xl font-bold text-gray-800 md:text-5xl">
              Terms & <span className="text-orange-500">Conditions</span>
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              Please read these terms and conditions carefully before using our services
            </p>
            <div className="inline-block p-4 bg-white rounded-lg shadow-md">
              <p className="text-sm text-gray-600">
                <strong>Last Updated:</strong> January 15, 2024
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="p-8 mb-8 bg-white shadow-lg rounded-xl"
            >
              <h2 className="mb-4 text-2xl font-bold text-gray-800">Welcome to Kasuni Bliss</h2>
              <p className="mb-4 leading-relaxed text-gray-600">
                These Terms and Conditions ("Terms") govern your use of the Kasuni Bliss website and mobile application
                operated by Kasuni Bliss Fashion Private Limited ("we", "us", or "our").
              </p>
              <p className="leading-relaxed text-gray-600">
                By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part
                of these terms, then you may not access the service.
              </p>
            </motion.div>

            {/* Terms Sections */}
            <div className="space-y-6">
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="overflow-hidden bg-white shadow-lg rounded-xl"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="p-3 mr-4 bg-orange-100 rounded-full">
                        <section.icon className="w-6 h-6 text-orange-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">{section.title}</h3>
                    </div>
                    <div className="leading-relaxed text-gray-600 whitespace-pre-line">{section.content}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Important Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="p-8 mt-12 text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl"
            >
              <div className="flex items-start">
                <AlertTriangle className="flex-shrink-0 w-8 h-8 mt-1 mr-4" />
                <div>
                  <h3 className="mb-3 text-xl font-bold">Important Notice</h3>
                  <p className="mb-4 leading-relaxed">
                    These terms and conditions are legally binding. By using our services, you acknowledge that you have
                    read, understood, and agree to be bound by these terms.
                  </p>
                  <p className="leading-relaxed">
                    If you have any questions about these Terms and Conditions, please contact our legal team at
                    legal@kasunibliss.com before using our services.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 mt-8 bg-white shadow-lg rounded-xl"
            >
              <h3 className="mb-4 text-lg font-bold text-gray-800">Related Documents</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <a
                  href="/privacy"
                  className="flex items-center p-3 transition-colors rounded-lg bg-gray-50 hover:bg-orange-50 hover:text-orange-500"
                >
                  <Shield className="w-5 h-5 mr-3" />
                  <span className="font-medium">Privacy Policy</span>
                </a>
                <a
                  href="/contact"
                  className="flex items-center p-3 transition-colors rounded-lg bg-gray-50 hover:bg-orange-50 hover:text-orange-500"
                >
                  <FileText className="w-5 h-5 mr-3" />
                  <span className="font-medium">Contact Us</span>
                </a>
                <a
                  href="/faq"
                  className="flex items-center p-3 transition-colors rounded-lg bg-gray-50 hover:bg-orange-50 hover:text-orange-500"
                >
                  <FileText className="w-5 h-5 mr-3" />
                  <span className="font-medium">FAQ</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default TermsPage
