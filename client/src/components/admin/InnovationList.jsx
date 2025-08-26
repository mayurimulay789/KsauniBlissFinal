"use client"

import { useEffect, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchPublicInnovations } from "../../store/slices/innovationSlice" // ✅ use public thunk

const InnovationList = () => {
  const dispatch = useDispatch()
  const {
    innovations: allInnovations,
    loading: isLoading,
    error,
  } = useSelector((state) => state.innovations || { innovations: [], loading: false, error: null })

  const fetchInnovations = useCallback(() => {
    dispatch(fetchPublicInnovations()) // ✅ public API call (no login needed)
  }, [dispatch])

  useEffect(() => {
    fetchInnovations()
  }, [fetchInnovations])

  const innovations = allInnovations || []
  const displayedInnovations = innovations.slice(0, 8)

  return (
    <div className="space-y-0 px-5">
      <h1 className="text-base font-bold mb-2 text-left px-3 py-1">
        <span className="text-black">KSAUNI INNOVATION FACTORY</span>
      </h1>

      {isLoading ? (
        <div className="flex justify-center py-2">
          <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : displayedInnovations.length === 0 ? (
        <div className="py-3 text-center text-gray-500">No innovations found</div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden md:flex justify-center">
            <div className="flex gap-3 overflow-x-auto scroll-smooth max-w-screen-xl px-4 py-0">
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
