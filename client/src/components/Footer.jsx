import React from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"

const Footer = () => {
  const { categories } = useSelector((state) => state.categories || {})

  // Display all categories from navbar (same as navbar)
  const displayCategories = categories?.slice(0, 8) || []

  return (
    <footer className="text-white bg-gray-900">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <img
                src="logo company bg.png"
                alt="Company Logo"
                className="inline-block w-16 h-auto"
              />
            </h3>
            <p className="text-sm text-white">
              Your one-stop destination for trendy and affordable fashion. 
              Discover the latest styles and express your unique personality.
            </p>
            <div className="flex space-x-4">
  <a
    href="https://www.facebook.com/profile.php?id=61573721382198"
    target="_blank"
    rel="noopener noreferrer"
    className="transition-colors duration-200"
  >
    <Facebook className="w-5 h-5 cursor-pointer hover:text-gray-300" />
  </a>
  <a
    href="https://www.instagram.com/ksaunibliss/"
    target="_blank"
    rel="noopener noreferrer"
    className="transition-colors duration-200"
  >
    <Instagram className="w-5 h-5 cursor-pointer hover:text-gray-300" />
  </a>
</div>

          </div>

          {/* Categories from Navbar */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories</h3>
            <ul className="space-y-2 text-sm">
              {displayCategories.length > 0 ? (
                displayCategories.map((cat) => (
                  <li key={cat._id}>
                    <Link
                      to={`/products/${cat.slug}`}
                      className="text-white hover:text-gray-300"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">Loading categories...</li>
              )}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-white hover:text-gray-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white hover:text-gray-300">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-white hover:text-gray-300">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-white hover:text-gray-300">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-white hover:text-gray-300">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>123 Fashion Street, Style City</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>ksaunibliss@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between pt-8 mt-8 border-t border-gray-800 md:flex-row">
          <p className="flex items-center gap-2 text-sm text-white">
            © 2025 KSAUNIBLISS. All rights reserved.
          </p>
          <div className="flex mt-4 space-x-6 md:mt-0">
            <Link to="/privacy" className="text-sm text-white hover:text-gray-300">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-white hover:text-gray-300">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
