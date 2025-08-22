"use client"

import { useNavigate } from "react-router-dom"

const ShopByFandom = () => {
  const navigate = useNavigate()

    const mockProducts = [
    {
      id: 1,
      name: "Attack on Titan",
      image: "/AttackonTitan.webp",
      logoAlt: "Attack On Titan",
    },
    {
      id: 2,
      name: "Solo Leveling Shirt",
      image: "/SoloLeveling.webp",
      logoAlt: "Solo Leveling Logo",
    },
    {
      id: 3,
      name: "Kaijya",
      image: "/KaijuNo.webp",
      logoAlt: "Geometric Brand Logo",
    },
    {
      id: 4,
      name: "Joker",
      image: "/Joker.webp",
      logoAlt: "Gaming Brand Logo",
    },
   
    
    {
      id: 5,
      name: "Naruto",
      image: "/deathnote.webp",
      logoAlt: "Naruto",
    },
    {
      id: 6,
      name: "K-Pop Style Tee",
      image: "/naruto.webp",
      logo: "/wing.png",
      logoAlt: "K-Pop Style Logo",
    },
    {
      id: 7,
      name: "K-Pop Style Tee",
      image: "/venom.webp",
      logoAlt: "K-Pop Style Logo",
    },
    {
      id: 8,
      name: "K-Pop Style Tee",
      image: "/zoro.webp",
      logoAlt: "K-Pop Style Logo",
    },
  ]

  const handleProductClick = () => {
    navigate("/products")
  }

  return (
    <section className="py-6 bg-white sm:py-8">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="mb-6 text-center sm:mb-8">
          <h2 className="text-2xl font-black text-black sm:text-3xl md:text-4xl">
            SHOP BY <span className="text-red-600 italic">FANDOM</span>
          </h2>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">Shop for every fandom. Every style.</p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 sm:gap-6 md:gap-8 scrollbar-hide">
          {mockProducts.map((product, index) => (
            <div key={product.id} className="flex-shrink-0 cursor-pointer group" onClick={handleProductClick}>
              <div className="relative mb-8 sm:mb-10 md:mb-12">
                <div className="relative overflow-hidden transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl group-hover:scale-105">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="object-cover w-40 h-48 sm:w-48 sm:h-56 md:w-56 md:h-64 lg:w-64 lg:h-72"
                    
                  />
                  <div className="absolute inset-0 transition-all duration-300 bg-black bg-opacity-0 opacity-0 group-hover:bg-opacity-20 group-hover:opacity-100" />
                </div>

                
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ShopByFandom
