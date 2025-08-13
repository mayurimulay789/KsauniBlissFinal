"use client"

import { motion } from "framer-motion"
import {
  Shield,
  Eye,
  Lock,
  Database,
  Share2,
  Settings,
  AlertTriangle,
  CheckCircle,
  Globe,
  Smartphone,
} from "lucide-react"

import Footer from "../components/Footer"

const PrivacyPage = () => {
  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: Shield,
      content: `
        At Kasuni Bliss, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our mobile application, or make a purchase from us.

        We respect your privacy rights and are committed to transparency about our data practices. This policy applies to all users of our services, regardless of location.
      `,
    },
    {
      id: "information-collect",
      title: "Information We Collect",
      icon: Database,
      content: `
        Personal Information:
        • Name, email address, phone number
        • Billing and shipping addresses
        • Payment information (processed securely by our payment partners)
        • Date of birth and gender (optional)
        • Account credentials and preferences

        Automatically Collected Information:
        • IP address and device information
        • Browser type and version
        • Operating system and device type
        • Pages visited and time spent on our site
        • Referring website and search terms
        • Location data (with your permission)

        Information from Third Parties:
        • Social media profile information (when you connect accounts)
        • Information from our business partners and service providers
        • Public databases and marketing partners
      `,
    },
    {
      id: "how-we-use",
      title: "How We Use Your Information",
      icon: Settings,
      content: `
        We use your information for the following purposes:

        Service Provision:
        • Processing and fulfilling your orders
        • Managing your account and preferences
        • Providing customer support and assistance
        • Sending order confirmations and shipping updates

        Improvement and Personalization:
        • Personalizing your shopping experience
        • Recommending products based on your preferences
        • Analyzing usage patterns to improve our services
        • Conducting research and analytics

        Communication:
        • Sending promotional emails and newsletters (with consent)
        • Notifying you about sales, new products, and special offers
        • Responding to your inquiries and feedback
        • Sending important service announcements

        Legal and Security:
        • Preventing fraud and ensuring security
        • Complying with legal obligations
        • Protecting our rights and property
        • Enforcing our terms and conditions
      `,
    },
    {
      id: "information-sharing",
      title: "Information Sharing",
      icon: Share2,
      content: `
        We may share your information in the following circumstances:

        Service Providers:
        • Payment processors for secure transaction handling
        • Shipping companies for order delivery
        • Email service providers for communications
        • Analytics providers for website improvement
        • Customer service platforms for support

        Business Transfers:
        • In case of merger, acquisition, or sale of assets
        • During business restructuring or reorganization
        • With successor entities or buyers

        Legal Requirements:
        • When required by law or legal process
        • To protect our rights and property
        • To prevent fraud or illegal activities
        • To ensure user safety and security

        With Your Consent:
        • When you explicitly agree to share information
        • For marketing partnerships (opt-in only)
        • For social media integrations
      `,
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: Lock,
      content: `
        We implement comprehensive security measures to protect your information:

        Technical Safeguards:
        • SSL encryption for all data transmission
        • Secure servers with regular security updates
        • Firewalls and intrusion detection systems
        • Regular security audits and penetration testing
        • Access controls and authentication systems

        Operational Safeguards:
        • Employee training on data protection
        • Limited access to personal information
        • Background checks for employees with data access
        • Incident response procedures
        • Regular backup and recovery procedures

        Physical Safeguards:
        • Secure data centers with restricted access
        • Environmental controls and monitoring
        • Secure disposal of physical media
        • Visitor access controls and logging

        Payment Security:
        • PCI DSS compliance for payment processing
        • Tokenization of payment information
        • No storage of complete credit card numbers
        • Secure payment gateways (Razorpay, Stripe)
      `,
    },
    {
      id: "your-rights",
      title: "Your Privacy Rights",
      icon: CheckCircle,
      content: `
        You have the following rights regarding your personal information:

        Access and Portability:
        • Request a copy of your personal information
        • Download your data in a portable format
        • Receive information about how we use your data

        Correction and Updates:
        • Update your account information at any time
        • Correct inaccurate or incomplete information
        • Request verification of data accuracy

        Deletion and Erasure:
        • Request deletion of your account and data
        • Right to be forgotten (subject to legal requirements)
        • Selective deletion of specific information

        Control and Consent:
        • Opt-out of marketing communications
        • Manage cookie preferences
        • Control data sharing with third parties
        • Withdraw consent for data processing

        To exercise these rights, contact us at privacy@kasunibliss.com
      `,
    },
    {
      id: "cookies",
      title: "Cookies and Tracking",
      icon: Eye,
      content: `
        We use cookies and similar technologies to enhance your experience:

        Essential Cookies:
        • Required for website functionality
        • Shopping cart and checkout process
        • User authentication and security
        • Cannot be disabled

        Performance Cookies:
        • Website analytics and performance monitoring
        • Error tracking and debugging
        • Load time optimization
        • User behavior analysis

        Functional Cookies:
        • Remember your preferences and settings
        • Language and region selection
        • Personalized content delivery
        • Social media integration

        Marketing Cookies:
        • Targeted advertising and promotions
        • Retargeting and remarketing
        • Social media advertising
        • Campaign effectiveness measurement

        You can manage cookie preferences through your browser settings or our cookie consent tool.
      `,
    },
    {
      id: "international",
      title: "International Data Transfers",
      icon: Globe,
      content: `
        Your information may be transferred to and processed in countries other than your own:

        Data Transfer Safeguards:
        • Adequate protection measures in place
        • Standard contractual clauses with service providers
        • Compliance with applicable data protection laws
        • Regular monitoring of transfer arrangements

        Countries We May Transfer Data To:
        • United States (for cloud services and analytics)
        • European Union (for some service providers)
        • Other countries with adequate protection levels

        Your Rights:
        • Right to object to international transfers
        • Right to request information about safeguards
        • Right to file complaints with supervisory authorities
      `,
    },
    {
      id: "children",
      title: "Children's Privacy",
      icon: Shield,
      content: `
        We are committed to protecting children's privacy:

        Age Restrictions:
        • Our services are not intended for children under 13
        • We do not knowingly collect information from children under 13
        • Parental consent required for users under 18

        If We Discover Child Information:
        • We will delete the information immediately
        • We will notify parents/guardians if possible
        • We will take steps to prevent future collection

        Parental Rights:
        • Review information collected from their child
        • Request deletion of child's information
        • Refuse further collection or use of child's information

        If you believe we have collected information from a child under 13, please contact us immediately.
      `,
    },
    {
      id: "updates",
      title: "Policy Updates",
      icon: AlertTriangle,
      content: `
        We may update this Privacy Policy from time to time:

        Notification of Changes:
        • Email notification for significant changes
        • Website banner for 30 days after updates
        • Updated "Last Modified" date on this page
        • Option to review previous versions

        Types of Changes:
        • Legal requirement updates
        • New service features or functionality
        • Changes in data processing practices
        • Clarifications and improvements

        Your Continued Use:
        • Constitutes acceptance of updated policy
        • Right to stop using services if you disagree
        • Ability to download your data before leaving

        We encourage you to review this policy periodically to stay informed about how we protect your information.
      `,
    },
  ]

  const dataTypes = [
    { icon: Smartphone, title: "Device Information", description: "Device type, OS, browser details" },
    { icon: Globe, title: "Location Data", description: "IP-based location, GPS (with permission)" },
    { icon: Eye, title: "Usage Analytics", description: "Pages visited, time spent, interactions" },
    { icon: Lock, title: "Security Data", description: "Login attempts, security events" },
  ]

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
              Privacy <span className="text-red-500">Policy</span>
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              Your privacy is important to us. Learn how we collect, use, and protect your personal information.
            </p>
            <div className="inline-block p-4 bg-white rounded-lg shadow-md">
              <p className="text-sm text-gray-600">
                <strong>Last Updated:</strong> January 15, 2024
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="mb-8 text-3xl font-bold text-center text-gray-800">Data We Collect</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {dataTypes.map((type, index) => (
                <motion.div
                  key={type.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="p-6 text-center bg-gray-50 rounded-xl"
                >
                  <div className="inline-block p-3 mb-4 bg-orange-100 rounded-full">
                    <type.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-800">{type.title}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="overflow-hidden bg-white shadow-lg rounded-xl"
                >
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="p-3 mr-4 bg-orange-100 rounded-full">
                        <section.icon className="w-6 h-6 text-orange-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">{section.title}</h3>
                    </div>
                    <div className="leading-relaxed text-gray-600 whitespace-pre-line">{section.content}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="p-8 mt-12 text-white bg-gradient-to-r from-red-500 to-red-500 rounded-xl"
            >
              <div className="text-center">
                <Shield className="w-16 h-16 mx-auto mb-6 opacity-90" />
                <h3 className="mb-4 text-2xl font-bold">Questions About Your Privacy?</h3>
                <p className="mb-6 text-lg opacity-90">
                  If you have any questions about this Privacy Policy or our data practices, we're here to help.
                </p>
                <div className="grid gap-6 text-left md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold">Privacy Officer</h4>
                    <p className="opacity-90">privacy@kasunibliss.com</p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">Data Protection</h4>
                    <p className="opacity-90">dpo@kasunibliss.com</p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">General Inquiries</h4>
                    <p className="opacity-90">support@kasunibliss.com</p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold">Phone Support</h4>
                    <p className="opacity-90">+91-9876543210</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 mt-8 bg-white shadow-lg rounded-xl"
            >
              <h3 className="mb-4 text-lg font-bold text-gray-800">Quick Actions</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <button className="flex items-center p-3 transition-colors rounded-lg bg-gray-50 hover:bg-orange-50 hover:text-orange-500">
                  <Settings className="w-5 h-5 mr-3" />
                  <span className="font-medium">Manage Preferences</span>
                </button>
                <button className="flex items-center p-3 transition-colors rounded-lg bg-gray-50 hover:bg-red-50 hover:text-red-500">
                  <Database className="w-5 h-5 mr-3" />
                  <span className="font-medium">Download My Data</span>
                </button>
                <button className="flex items-center p-3 transition-colors rounded-lg bg-gray-50 hover:bg-red-50 hover:text-red-500">
                  <AlertTriangle className="w-5 h-5 mr-3" />
                  <span className="font-medium">Delete Account</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default PrivacyPage
