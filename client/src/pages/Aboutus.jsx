"use client"

import { motion } from "framer-motion"
import { Award, Users, Heart, Globe, Shield, Leaf } from "lucide-react"


const AboutUsPage = () => {
  const stats = [
    { icon: Users, label: "Happy Customers", value: "100K+", color: "text-blue-600" },
    { icon: Award, label: "Years of Excellence", value: "8+", color: "text-green-600" },
    { icon: Heart, label: "Products Sold", value: "2M+", color: "text-red-600" },
    { icon: Globe, label: "Cities Served", value: "500+", color: "text-purple-600" },
  ]

  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description: "Every decision we make is centered around providing the best experience for our customers.",
      color: "bg-red-100 text-red-600",
    },
    {
      icon: Award,
      title: "Quality Assured",
      description: "We source only the finest materials and work with trusted manufacturers to ensure premium quality.",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      icon: Leaf,
      title: "Sustainable Fashion",
      description: "We're committed to ethical practices and sustainable fashion that doesn't harm our planet.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Your privacy and security are paramount. We use industry-leading security measures.",
      color: "bg-blue-100 text-blue-600",
    },
  ]

  const team = [
    {
      name: "Kasuni Perera",
      role: "Founder & CEO",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Fashion enthusiast with 15+ years in the industry, passionate about making style accessible to everyone.",
    },
    {
      name: "Arjun Sharma",
      role: "Head of Design",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Award-winning designer who brings creativity and innovation to every collection we create.",
    },
    {
      name: "Priya Nair",
      role: "Operations Director",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Operations expert ensuring smooth delivery and exceptional customer service across all touchpoints.",
    },
    {
      name: "Rahul Gupta",
      role: "Technology Lead",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Tech innovator building the future of online fashion retail with cutting-edge solutions.",
    },
  ]

  const milestones = [
    {
      year: "2016",
      title: "The Beginning",
      description:
        "Kasuni Bliss was founded with a vision to democratize fashion and make style accessible to everyone.",
    },
    {
      year: "2018",
      title: "First Million",
      description: "Reached our first million customers and expanded to 50 cities across India.",
    },
    {
      year: "2020",
      title: "Sustainable Initiative",
      description: "Launched our eco-friendly collection and committed to sustainable fashion practices.",
    },
    {
      year: "2022",
      title: "International Expansion",
      description: "Expanded operations to Southeast Asia and launched our mobile app.",
    },
    {
      year: "2024",
      title: "Innovation Hub",
      description: "Opened our design and innovation center, focusing on AI-driven personalization.",
    },
  ]

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-red-50 to-red-50">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="mb-6 text-5xl font-bold text-gray-800 md:text-6xl">
              About <span className="text-red-500">Kasuni Bliss</span>
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-gray-600">
              We're not just a fashion store – we're your style companions, dedicated to helping you express your unique
              personality through carefully curated, high-quality fashion that doesn't break the bank.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} className="px-6 py-3 bg-white rounded-full shadow-md">
                <span className="font-semibold text-red-500">Est. 2016</span>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="px-6 py-3 bg-white rounded-full shadow-md">
                <span className="font-semibold text-red-500">Made in India</span>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="px-6 py-3 bg-white rounded-full shadow-md">
                <span className="font-semibold text-red-500">Sustainable Fashion</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="mb-2 text-3xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-4xl font-bold text-gray-800">Our Story</h2>
              <div className="space-y-6 leading-relaxed text-gray-600">
                <p>
                  Kasuni Bliss began as a dream in 2016 when our founder, Kasuni Perera, noticed a gap in the Indian
                  fashion market. Quality fashion was either too expensive or compromised on style. She envisioned a
                  brand that could bridge this gap.
                </p>
                <p>
                  Starting from a small studio in Mumbai, we've grown into one of India's most trusted online fashion
                  destinations. Our journey has been fueled by our customers' trust and our unwavering commitment to
                  quality, affordability, and style.
                </p>
                <p>
                  Today, we serve over 100,000 happy customers across 500+ cities, but our mission remains the same: to
                  make fashion accessible, sustainable, and joyful for everyone.
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-block px-8 py-3 mt-8 font-semibold text-white transition-colors bg-red-500 rounded-lg cursor-pointer hover:bg-red-600"
              >
                Join Our Journey
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img src="/placeholder.svg?height=500&width=600" alt="Our Story" className="shadow-2xl rounded-2xl" />
              <div className="absolute p-6 bg-white shadow-lg -bottom-6 -left-6 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-red-100 rounded-full">
                    <Heart className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Customer Love</div>
                    <div className="text-sm text-gray-600">4.8/5 Rating</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-6 text-4xl font-bold text-gray-800">Our Values</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              These core values guide everything we do and shape the way we serve our customers
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="p-6 transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${value.color} mb-4`}>
                  <value.icon className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-800">{value.title}</h3>
                <p className="leading-relaxed text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-6 text-4xl font-bold text-gray-800">Our Journey</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              From a small startup to a leading fashion destination - here's how we've grown
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className={`flex items-center mb-12 ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
              >
                <div className={`flex-1 ${index % 2 === 0 ? "pr-8" : "pl-8"}`}>
                  <div className={`bg-white p-6 rounded-xl shadow-lg ${index % 2 === 0 ? "text-right" : "text-left"}`}>
                    <div className="mb-2 text-lg font-bold text-red-500">{milestone.year}</div>
                    <h3 className="mb-3 text-xl font-semibold text-gray-800">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
                <div className="z-10 w-4 h-4 bg-red-500 border-4 border-white rounded-full shadow-lg"></div>
                <div className="flex-1"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-6 text-4xl font-bold text-gray-800">Meet Our Team</h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              The passionate individuals behind Kasuni Bliss who make the magic happen every day
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="overflow-hidden transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl"
              >
                <div className="overflow-hidden aspect-square">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-1 text-xl font-semibold text-gray-800">{member.name}</h3>
                  <div className="mb-3 font-medium text-red-500">{member.role}</div>
                  <p className="text-sm leading-relaxed text-gray-600">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-red-500 to-red-500">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="mb-6 text-4xl font-bold">Join the Kasuni Bliss Family</h2>
            <p className="max-w-2xl mx-auto mb-8 text-xl opacity-90">
              Be part of our journey to make fashion accessible, sustainable, and joyful for everyone
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 font-semibold text-red-500 transition-colors bg-white rounded-lg hover:bg-gray-100"
              >
                Shop Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 font-semibold text-white transition-colors border-2 border-white rounded-lg hover:bg-white hover:text-red-500"
              >
                Contact Us
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}

export default AboutUsPage
