"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";
import { fetchCategories } from "../store/slices/categorySlice";
const FeaturedCategories = () => {
  const dispatch = useDispatch();
  const { categories, isLoading } = useSelector((state) => state.categories);
  useEffect(() => {
    dispatch(fetchCategories({ showOnHomepage: true }));
  }, [dispatch]);
  if (isLoading) return <LoadingSpinner />;
  const featuredCategories =
    categories?.filter((cat) => cat.showOnHomepage)?.slice(0, 6) || [];
  return (
    <section className="relative z-20 py-1 bg-white">
      <div className="px-2 mx-auto max-w-7xl sm:px-4 lg:px-6">
        {/* Header */}
       <div className="text-center mb-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-xl mx-5 sm:text-2xl font-black italic"
          >
            <span className="text-red-600">TOP</span>{" "}
            <span className="text-black">CATEGORY</span>
          </motion.h1>
          <p className="text-gray-600 text-sm sm:text-base font-small mt-1">
            Style for Every Mood, Every Day
            </p>
        </div>
        {/* MOBILE: Horizontal scroll, 2×2 cards per group */}
        <div className="sm:hidden overflow-x-auto scrollbar-hide ">
          <div className="flex gap-4 snap-x snap-mandatory" style={{ minWidth: "100%" }}>
            {Array.from({ length: Math.ceil(featuredCategories.length / 4) }).map((_, groupIndex) => {
              const groupItems = featuredCategories.slice(groupIndex * 4, groupIndex * 4 + 4);
              // Fill with placeholders if less than 4
              while (groupItems.length < 4) {
                groupItems.push(null);
              }
              return (
                <div
                  key={groupIndex}
                  className="grid grid-cols-2 gap-4  flex-shrink-0 snap-center"
                  style={{ width: "100%" }}
                >
                  {groupItems.map((category, index) =>
                    category ? (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
                className=" relative overflow-hidden border border-gray-400 rounded group transition-transform duration-300 transform hover:scale-105"
              >
                <Link to={`/products/${category.slug}`}>
                  {/* Rectangle ratio */}
                  <div className="relative w-full aspect-[20/15] overflow-hidden">
                    <img
                      src={
                        category.image?.url ||
                        "/placeholder.svg?height=500&width=400&query=category image"
                      }
                      alt={category.image?.alt || category.name}
                      className="object-cover object-center w-full h-full transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-1 text-start ">
                    <motion.h3
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-sm   uppercase pl-1"
                    >
                      {category.name}
                    </motion.h3>
                  </div>
                </Link>
              </motion.div>
                    ) : (
                      // Placeholder to keep grid height
                      <div key={`placeholder-${index}`} className="aspect-[20/10]" />
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* TABLET & DESKTOP: One centered row */}
        <div
          className="hidden sm:grid gap-4  justify-center w-full"
          style={{
            gridAutoFlow: "column",
            gridAutoColumns: "minmax(180px, 1fr)",
            alignItems: "start",
          }}
        >
          {featuredCategories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="relative overflow-hidden border border-gray-200 rounded group transition-transform duration-300 transform hover:scale-105"
            >
              <Link to={`/products/${category.slug}`}>
                <div className="relative w-full aspect-[10/10] overflow-hidden">
                  <img
                    src={
                      category.image?.url ||
                      "/placeholder.svg?height=500&width=400&query=category image"
                    }
                    alt={category.image?.alt || category.name}
                    className="object-cover object-center w-full h-full transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-1 text-start">
                  <motion.h3
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.12 }}
                    className="pl-1 text-lg  text-gray-900 uppercase"
                  >
                    {category.name}
                  </motion.h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default FeaturedCategories;