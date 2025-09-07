"use client";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
export default function Oversized899() {
  const { products } = useSelector((state) => state.products) || { products: [] };
  const [productsToShow, setProductsToShow] = useState([]);
  useEffect(() => {
    const filteredProducts = products.filter((product) => {
      if (!product) return false;
      let isOversized = false;
      // Category string
      if (product.category && typeof product.category === "string") {
        const categoryStr = product.category.toLowerCase().trim();
        isOversized = categoryStr.includes("oversized");
      }
      // Category object
      if (!isOversized && product.category && typeof product.category === "object") {
        const categoryName = String(product.category.name || "").toLowerCase().trim();
        isOversized = categoryName.includes("oversized");
      }
      // categoryName field
      if (!isOversized && product.categoryName) {
        const categoryNameStr = String(product.categoryName).toLowerCase().trim();
        isOversized = categoryNameStr.includes("oversized");
      }
      // subcategory
      if (!isOversized && product.subcategory) {
        const subcategoryStr = String(product.subcategory).toLowerCase().trim();
        isOversized = subcategoryStr.includes("oversized");
      }
      // categories array
      if (!isOversized && Array.isArray(product.categories)) {
        isOversized = product.categories.some((cat) => {
          if (typeof cat === "string") {
            return cat.toLowerCase().trim().includes("oversized");
          }
          if (cat && typeof cat === "object") {
            return String(cat.name || "").toLowerCase().trim().includes("oversized");
          }
          return false;
        });
      }
      // fits
      if (!isOversized) {
        if (Array.isArray(product.fits)) {
          isOversized = product.fits.some((f) => String(f).toLowerCase().trim().includes("oversized"));
        } else if (product.fits) {
          isOversized = String(product.fits).toLowerCase().trim().includes("oversized");
        }
      }
      // tags
      if (!isOversized && Array.isArray(product.tags)) {
        isOversized = product.tags.some((t) => String(t).toLowerCase().trim().includes("oversized"));
      }
      return isOversized;
    });
    setProductsToShow(filteredProducts.slice(0, 7));
  }, [products]);
  return (
    <section className="bg-white px-2 py-3 ml-2 sm:ml-5">
      <div>
        {/* Heading */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[16px] uppercase font-bold text-black mb-2">Oversized Products</h3>
          <Link to="/products" className="text-black text-[18px] leading-none">
            +
          </Link>
        </div>
        {/* Products Scroll */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide -mx-3 px-1">
          {productsToShow.length > 0 ? (
            productsToShow.map((product) => {
              const discountPercentage =
                product.originalPrice && product.originalPrice > product.price
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  : 0;
              return (
                <div
                  key={product._id}
                  className="
                    flex-shrink-0
                    border border-gray-500/80 hover:border-gray-800/80 transition-colors duration-200
                    rounded-[5px] bg-white overflow-hidden shadow-sm
                    w-[calc(50%-4px)]   /* mobile: 2 items */
                    sm:w-[calc(20%-6px)] /* desktop: 5 items */
                  "
                >
                  {/* Product Image */}
                  <Link to={`/product/${product._id}`}>
                    <div className="w-full aspect-[3.5/3.8] bg-gray-100">
                      <img
                        src={
                          product.images?.[0]?.url ||
                          "/placeholder.svg?height=400&width=400&query=product%20image%20placeholder"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                  {/* Product Info */}
                  <div className="p-1.5">
                    <p className="text-[9px] font-semibold text-black uppercase">{product.brand || "EXAMPLE BRAND"}</p>
                    <Link to={`/product/${product._id}`}>
                      <p className="text-[10px] text-black uppercase leading-tight mb-0.5 line-clamp-2">
                        {product.name}
                      </p>
                    </Link>
                    {/* Price */}
                    <div className="flex items-center gap-1">
                      <span className="text-[12px] text-black font-bold">₹{product.price}</span>
                      {discountPercentage > 0 && (
                        <>
                          <span className="text-[10px] text-gray-500 line-through">₹{product.originalPrice}</span>
                          <span className="text-[10px] text-red-500 font-semibold">{discountPercentage}% off</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500 w-full">No oversized products available from ₹899</div>
          )}
        </div>
      </div>
    </section>
  );
}