"use client"
import { Link, useLocation } from "react-router-dom"
import {
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  PhotoIcon,
  UsersIcon,
  TicketIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline"
import { useDispatch } from "react-redux"
import { logout } from "../../store/slices/authSlice"

const AdminSidebar = ({ sidebarOpen, setSidebarOpen, userRole }) => {
  const location = useLocation()
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(logout())
  }

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: HomeIcon, roles: ["admin", "digitalMarketer"] },
    { name: "Products", href: "/admin/products", icon: ShoppingBagIcon, roles: ["admin"] },
    { name: "Categories", href: "/admin/categories", icon: TagIcon, roles: ["admin"] },
    { name: "Orders", href: "/admin/orders", icon: ClipboardDocumentListIcon, roles: ["admin"] },
    { name: "Banners", href: "/admin/banners", icon: PhotoIcon, roles: ["admin", "digitalMarketer"] },
    { name: "Innovation Lab", href: "/admin/innovations", icon: PhotoIcon, roles: ["admin", "digitalMarketer"] },
    { name: "Users", href: "/admin/users", icon: UsersIcon, roles: ["admin"] },
    { name: "Coupons", href: "/admin/coupons", icon: TicketIcon, roles: ["admin"] },
  ]

  const filteredNavigation = navigation.filter((item) => item.roles.includes(userRole))

  const isActive = (href) => {
    return location.pathname === href || (href === "/admin/dashboard" && location.pathname === "/admin")
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col px-6 pb-4 overflow-y-auto bg-white shadow-lg grow gap-y-5">
          {/* Logo */}
          <div className="flex items-center h-16 shrink-0">
            <Link to="/" className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-red-500 rounded-lg">
                <span className="text-lg font-bold text-white">F</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">KsauniBliss</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col flex-1">
            <ul role="list" className="flex flex-col flex-1 gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {filteredNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                          isActive(item.href)
                            ? "bg-red-50 text-red-600"
                            : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                        }`}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${
                            isActive(item.href) ? "text-red-600" : "text-gray-400 group-hover:text-red-600"
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Logout */}
              <li className="mt-auto">
                <button
                  onClick={handleLogout}
                  className="flex w-full p-2 -mx-2 text-sm font-semibold leading-6 text-gray-700 transition-colors rounded-md group gap-x-3 hover:bg-red-50 hover:text-red-600"
                >
                  <ArrowRightOnRectangleIcon
                    className="w-6 h-6 text-gray-400 shrink-0 group-hover:text-red-600"
                    aria-hidden="true"
                  />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`relative z-50 lg:hidden ${sidebarOpen ? "" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-900/80" />
        <div className="fixed inset-0 flex">
          <div className="relative flex flex-1 w-full max-w-xs mr-16">
            <div className="absolute top-0 flex justify-center w-16 pt-5 left-full">
              <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                <span className="sr-only">Close sidebar</span>
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col px-6 pb-4 overflow-y-auto bg-white grow gap-y-5">
              {/* Logo */}
              <div className="flex items-center h-16 shrink-0">
                <Link to="/" className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-500 rounded-lg">
                    <span className="text-lg font-bold text-white">F</span>
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-900">KsauniBliss</span>
                </Link>
              </div>

              {/* Navigation */}
              <nav className="flex flex-col flex-1">
                <ul role="list" className="flex flex-col flex-1 gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {filteredNavigation.map((item) => (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                              isActive(item.href)
                                ? "bg-red-50 text-red-600"
                                : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                            }`}
                          >
                            <item.icon
                              className={`h-6 w-6 shrink-0 ${
                                isActive(item.href) ? "text-red-600" : "text-gray-400 group-hover:text-red-600"
                              }`}
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>

                  {/* Logout */}
                  <li className="mt-auto">
                    <button
                      onClick={handleLogout}
                      className="flex w-full p-2 -mx-2 text-sm font-semibold leading-6 text-gray-700 transition-colors rounded-md group gap-x-3 hover:bg-red-50 hover:text-red-600"
                    >
                      <ArrowRightOnRectangleIcon
                        className="w-6 h-6 text-gray-400 shrink-0 group-hover:text-red-600"
                        aria-hidden="true"
                      />
                      Logout
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminSidebar
