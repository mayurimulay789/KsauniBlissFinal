import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react"
import logo from "../../public/logo1.webp"
const Footer = () => {
  const { categories } = useSelector((state) => state.categories || {})

  // Display all categories from navbar (same as navbar)
  const displayCategories = categories?.slice(0, 8) || []

  return (
    <footer className="text-white bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {/* Company Info */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="flex items-center gap-2 text-base font-semibold sm:text-lg">
              <img src={logo || "/placeholder.svg"} alt="Company Logo" className="inline-block w-15 h-auto sm:w-12" />
            </h3>
            <p className="text-xs leading-relaxed text-white sm:text-sm">
              Your one-stop destination for trendy and affordable fashion. Discover the latest styles and express your
              unique personality.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=61573721382198"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-200"
              >
                <Facebook className="w-4 h-4 cursor-pointer hover:text-gray-300 sm:w-5 sm:h-5" />
              </a>
              <a
                href="https://www.instagram.com/ksaunibliss/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-200"
              >
                <Instagram className="w-4 h-4 cursor-pointer hover:text-gray-300 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Categories from Navbar */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base font-semibold sm:text-lg">Categories</h3>
            <ul className="space-y-1.5 text-xs sm:space-y-2 sm:text-sm">
              {displayCategories.length > 0 ? (
                displayCategories.map((cat) => (
                  <li key={cat._id}>
                    <Link
                      to={`/products/${cat.slug}`}
                      className="text-white transition-colors duration-200 hover:text-gray-300"
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
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base font-semibold sm:text-lg">Quick Links</h3>
            <ul className="space-y-1.5 text-xs sm:space-y-2 sm:text-sm">
              <li>
                <Link to="/about" className="text-white transition-colors duration-200 hover:text-gray-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white transition-colors duration-200 hover:text-gray-300">
                  Contact
                </Link>
              </li>

              <li>
                <Link to="/shipping" className="text-white transition-colors duration-200 hover:text-gray-300">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-white transition-colors duration-200 hover:text-gray-300">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base font-semibold sm:text-lg">Contact Us</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="flex-shrink-0 w-3 h-3 mt-0.5 sm:w-4 sm:h-4" />
                <span className="leading-relaxed">Ground Floor, Nawada Housing Complex,Dwarka More, Delhi -110059</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
                <span>919211891719</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
                <span className="break-all">ksaunibliss@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between pt-6 mt-6 space-y-3 border-t border-gray-800 sm:flex-row sm:space-y-0 sm:pt-8 sm:mt-8">
          <p className="text-xs text-center text-white sm:text-sm sm:text-left">
            © 2025 KSAUNIBLISS. All rights reserved.
          </p>
          <div className="flex space-x-4 sm:space-x-6">
            <Link
              to="/privacy"
              className="text-xs text-white transition-colors duration-200 hover:text-gray-300 sm:text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-xs text-white transition-colors duration-200 hover:text-gray-300 sm:text-sm"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
