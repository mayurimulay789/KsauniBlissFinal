"use client"

import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import HeroBanner from "../components/HeroBanner"
import PriceSelection from "../components/PriceSelection"
import FeaturedCategories from "../components/FeaturedCategories"
import TrendingProducts from "../components/TrendingProducts"
import FandomShop from "../components/FandomShop"
import NewArrivals from "../components/NewArrivals"
import Oversized899 from "../components/Oversized899"
import KsauniTshirtStyle from "../components/KsauniTshirtStyle"
import PromoBanners from "../components/PromoBanners"
import CategoryBanner from "../components/CategoryBanner"
import InnovationList from "../components/admin/InnovationList"
// import FirstUserCoupon from "../components/FirstUserCoupon"
// import AboutBrand from "../components/AboutBrand"
import FeaturedHighlight from '../components/FeaturedHighlight'
import Testimonials from "../components/Testimonials"
import Popup from "../components/Popup"
import BrandIndia from "../components/BrandIndia"

import {
  fetchTrendingProducts,
  fetchNewArrivals,
  fetchProducts,
} from "../store/slices/productSlice"
import { fetchCategories } from "../store/slices/categorySlice"
import {
  fetchHeroBanners,
  fetchPromoBanners,
  fetchCategoryBanners,
} from "../store/slices/bannerSlice"
import { fetchPopupSetting } from "../store/slices/popupSlice"

const HomePage = () => {
  const dispatch = useDispatch()

  // Get necessary slices of state
  const {
    trendingProducts,
    newArrivals,
  } = useSelector((state) => state.products)

  const { categories } = useSelector((state) => state.categories)
  const { heroBanners, promoBanners, categoryBanners } = useSelector((state) => state.banners)
  const { showSalePopup, popupBanners } = useSelector((state) => state.popup)

  const [popupVisible, setPopupVisible] = useState(false)
  const [popupBanner, setPopupBanner] = useState(null)

  // Fetch hero, promo and category banners only if not already loaded
  useEffect(() => {
    if (!heroBanners.length) {
      dispatch(fetchHeroBanners())
    }

    if (!promoBanners.length) {
      dispatch(fetchPromoBanners())
    }

    if (!categoryBanners.length) {
      dispatch(fetchCategoryBanners())
    }
  }, [dispatch, heroBanners.length, promoBanners.length, categoryBanners.length])

  // Fetch categories only if not already loaded
  useEffect(() => {
    if (!categories.length) {
      dispatch(fetchCategories({ showOnHomepage: true }))
    }
  }, [dispatch, categories.length])

  // Fetch trending, new arrival, and all products only if not already loaded
  useEffect(() => {
    if (!trendingProducts.length) {
      dispatch(fetchTrendingProducts())
    }

    if (!newArrivals.length) {
      dispatch(fetchNewArrivals())
    }

    dispatch(fetchProducts())
  }, [dispatch, trendingProducts.length, newArrivals.length])

  // Fetch popup setting on mount
  useEffect(() => {
    dispatch(fetchPopupSetting())
  }, [dispatch])

  // Show popup immediately on page load or refresh if global setting is true
  // Removed to prevent popup reopening after close
  // useEffect(() => {
  //   if (showSalePopup) {
  //     setPopupVisible(true)
  //   }
  // }, [showSalePopup])

  // Show popup immediately on page load or refresh regardless of previous state
  // Removed to prevent overriding popupVisible state on close
  // useEffect(() => {
  //   setPopupVisible(true)
  // }, [])

  // Set popup banner based on popupBanners and banners
  useEffect(() => {
    if (popupBanners.length > 0) {
      // Find the first active popup banner
      const activePopup = popupBanners.find(pb => pb.isActive)
      if (activePopup) {
        // Find banner details from heroBanners or promoBanners
        const banner =
          heroBanners.find(b => b._id === activePopup.bannerId) ||
          promoBanners.find(b => b._id === activePopup.bannerId)
        setPopupBanner(banner || null)
        setPopupVisible(!!banner)
      } else {
        setPopupBanner(null)
        setPopupVisible(false)
      }
    } else {
      setPopupBanner(null)
      setPopupVisible(false)
    }
  }, [popupBanners, heroBanners, promoBanners])

  return (
    <div className="min-h-screen bg-white">
      <main>

        <div className="flex flex-col gap-2">
          <div>
            <PromoBanners />
          </div>
          {/* <CategoryBanner /> */}
            <HeroBanner />
              <PriceSelection/>
          <FeaturedCategories />
          <TrendingProducts />
          <FandomShop />
             <NewArrivals />
          <Oversized899 />
    
          <InnovationList />
                <KsauniTshirtStyle />
        </div>
       
       
        {/* Brand of India Banner - moved to last position before footer */}
        <div className="px-4 mx-auto max-w-7xl">
          <div className="my-8">
            <BrandIndia />
          </div>
        </div>

        {popupVisible && popupBanner && (
          <Popup
            banner={popupBanner}
            visible={popupVisible}
            onClose={() => setPopupVisible(false)}
          />
        )}
      </main>
    </div>
  )
}

export default HomePage
