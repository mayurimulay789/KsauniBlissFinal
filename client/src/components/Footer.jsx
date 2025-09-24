"use client"

import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react"

const Footer = () => {
  const { categories } = useSelector((state) => state.categories || {})

  return (
    <footer className="bg-gray-900 text-white py-10 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* ===== Company Info ===== */}
        <div className="text-center lg:text-left space-y-3">
          <img
            src="/logo.webp"
            alt="Ksauni Bliss Logo"
            className="w-28 h-auto mx-auto lg:mx-0"
          />
          <p className="text-xs sm:text-sm leading-relaxed max-w-md mx-auto lg:mx-0">
            Ksauni Bliss is your one-stop destination for trendy and affordable fashion.
            Discover the latest styles and express your unique personality with us.
          </p>
          <div className="flex justify-center lg:justify-start space-x-4 mt-3">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-red-400">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-red-400">
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* ===== Links Section (Always 3 Columns, Even on Mobile) ===== */}
        <div className="grid grid-cols-3 gap-6 text-center sm:text-left">
          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-semibold">Categories</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              {categories?.length > 0 ? (
                categories.slice(0, 6).map((cat) => (
                  <li key={cat._id}>
                    <Link
                      to={`/products?category=${cat.slug}`}
                      className="hover:text-red-400 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">Loading...</li>
              )}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="/about" className="hover:text-red-400">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-red-400">Contact</Link></li>
              <li><Link to="/shipping" className="hover:text-red-400">Shipping Info</Link></li>
              <li><Link to="/returns" className="hover:text-red-400">Returns</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-semibold">Contact Us</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex justify-center sm:justify-start items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-400" />
                <span>Delhi, India</span>
              </li>
              <li className="flex justify-center sm:justify-start items-center space-x-2">
                <Phone className="w-4 h-4 text-red-400" />
                <span>9211891719</span>
              </li>
              <li className="flex justify-center sm:justify-start items-center space-x-2">
                <Mail className="w-3 h-3 text-red-400" />
                <span>support@ksaunibliss.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ===== Bottom Bar ===== */}
        <div className="border-t border-gray-700 pt-4 text-center text-xs sm:text-sm text-gray-400">
          © {new Date().getFullYear()} Ksauni Bliss. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
