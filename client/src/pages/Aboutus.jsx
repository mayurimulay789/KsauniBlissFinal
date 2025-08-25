import React from "react"
import logo2 from "../../public/01.webp"
export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About <span className="text-red-200">Ksauni Bliss</span>
          </h1>
          <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto">
            We don't just create T-shirts—we create a vibe.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Our <span className="text-red-600">Story</span>
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                At Ksauni Bliss, we don't just create T-shirts—we create a vibe. A vibe of effortless style, unmatched
                comfort, and a genuine connection to who you are. Rooted in the heart of modern life, our designs are
                crafted for those who want to stand out while feeling at home in their own skin.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900">
                Premium <span className="text-red-600">Quality</span>
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Every Ksauni Bliss T-shirt is made with premium, breathable fabrics that feel just as good as they look.
                We blend contemporary aesthetics with timeless comfort, offering designs that range from bold statements
                to clean, minimalist looks.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900">
                Our <span className="text-red-600">Mission</span>
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our mission is simple: to provide you with a T-shirt that doesn't just fit your body, but your
                lifestyle. Whether you're out exploring the city, enjoying quiet moments, or hanging with friends,
                Ksauni Bliss is designed for those who live life with intention, passion, and a little bit of bliss.
              </p>
            </div>
          </div>

          {/* Image Placeholder */}
          <div className="relative">
            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-2xl p-8 h-96 flex items-center justify-center">
              <img
                src={logo2}
                alt="Ksauni Bliss lifestyle"
                className="rounded-lg shadow-lg max-w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg">
              <p className="font-semibold">Premium Fabrics</p>
              <p className="text-sm text-red-100">Breathable & Comfortable</p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose <span className="text-red-600">Ksauni Bliss</span>?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg border-t-4 border-red-600">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-red-600 rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Effortless Style</h3>
              <p className="text-gray-600">
                Contemporary aesthetics that help you stand out while feeling comfortable in your own skin.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-lg border-t-4 border-red-600">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-red-600 rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Unmatched Comfort</h3>
              <p className="text-gray-600">
                Premium, breathable fabrics that feel just as good as they look, perfect for any lifestyle.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-lg border-t-4 border-red-600">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-red-600 rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Genuine Connection</h3>
              <p className="text-gray-600">
                Designs that connect with who you are, whether bold statements or clean, minimalist looks.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">
            Join the <span className="text-red-200">Bliss</span> Community
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Join us, and wear what feels right. Because when you wear Ksauni Bliss, it's not just about what's on your
            shirt—it's about how it makes you feel.
          </p>
          <button className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-50 transition-colors duration-300 shadow-lg">
            Shop Now
          </button>
        </div>
      </div>
    </div>
  )
}
