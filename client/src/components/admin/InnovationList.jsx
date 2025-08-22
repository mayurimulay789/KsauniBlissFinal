"use client"

import { useEffect, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAllInnovations } from "../../store/slices/innovationSlice"

const InnovationList = () => {
  const dispatch = useDispatch()
  const {
    innovations: allInnovations,
    loading: isLoading,
    error,
  } = useSelector((state) => state.innovations || { innovations: [], loading: false, error: null })

  const fetchInnovations = useCallback(() => {
    dispatch(fetchAllInnovations())
  }, [dispatch])

  useEffect(() => {
    fetchInnovations()
  }, [fetchInnovations])

  // Use actual data from Redux store
  const innovations = allInnovations || []

  // Limit to 8 innovations for display
  const displayedInnovations = innovations.slice(0, 8)

  return (
    <div className="space-y-0">
      <h1 className="text-base font-bold mb-2 text-left px-6 py-3">
        <span className="text-black px-4">KSAUNI INOVATION FACTORY</span>
      </h1>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : displayedInnovations.length === 0 ? (
        <div className="py-8 text-center text-gray-500">No innovations found</div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden md:flex justify-center">
            <div className="flex gap-6 overflow-x-auto scroll-smooth max-w-screen-xl px-4 py-0">
              {displayedInnovations.map((innovation) => (
                <div
                  key={innovation._id}
                  className="relative rounded-lg overflow-hidden group cursor-pointer inline-block align-top w-[280px] flex-shrink-0"
                >
                  <img
                    src={innovation.image?.url || "/placeholder.svg?height=200&width=400&text=Innovation+Image"}
                    alt={innovation.title}
                    className="object-cover w-full h-64 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center pt-10 px-6 opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          </div>
          {/* Mobile View */}
          <div className="flex md:hidden justify-center">
            <div className="flex gap-4 overflow-x-auto scroll-smooth max-w-screen-sm px-4 py-4">
              {displayedInnovations.map((innovation) => (
                <div
                  key={innovation._id}
                  className="relative rounded-lg overflow-hidden group cursor-pointer inline-block align-top w-[160px] flex-shrink-0"
                >
                  <img
                    src={innovation.image?.url || "/placeholder.svg?height=200&width=400&text=Innovation+Image"}
                    alt={innovation.title}
                    className="object-cover w-full h-28 transition-transform duration-300 group-hover:scale-105"
                  />
                  
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default InnovationList
