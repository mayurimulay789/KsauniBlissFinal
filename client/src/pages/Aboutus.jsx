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
              
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img src="https://media.istockphoto.com/id/1428709516/photo/shopping-online-woman-hand-online-shopping-on-laptop-computer-with-virtual-graphic-icon.jpg?s=612x612&w=0&k=20&c=ROAncmFL4lbSQdU4VOhyXu-43ngzfEqHE5ZZAw5FtYk=" alt="Our Story" className="shadow-2xl rounded-2xl" />
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
     

      {/* Team Section */}
      

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
              
               
              
              
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}

export default AboutUsPage
