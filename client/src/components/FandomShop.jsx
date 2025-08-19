"use client"

import { useNavigate } from "react-router-dom"

const ShopByFandom = () => {
  const navigate = useNavigate()

    const mockProducts = [
    {
      id: 1,
      name: "Attack on Titan",
      image: "/Attack On Titan.webp",
      logo: "/attackontitan.png",
      logoAlt: "Attack On Titan",
    },
    {
      id: 2,
      name: "Solo Leveling Shirt",
      image: "/SOLO LEVELING.webp",
      logo: "/ksa1.png",
      logoAlt: "Solo Leveling Logo",
    },
    {
      id: 3,
      name: "Kaijya",
      image: "/KAIJU NO.8 .webp",
      logo: "/kaijya.png",
      logoAlt: "Geometric Brand Logo",
    },
    {
      id: 4,
      name: "Joker",
      image: "/JOKER.webp",
      logo: "/joker.png",
      logoAlt: "Gaming Brand Logo",
    },
    {
      id: 5,
      name: "Demon Slayer",
      image: "/demonslayer.webp",
      logo: "/demo.png",
      logoAlt: "Marvel Style Logo",
    },
    {
      id: 6,
      name: "deathore",
      image: "/deathnote.webp",
      logo: "/deathore.png",
      logoAlt: "Retro Anime Logo",
    },
    {
      id: 7,
      name: "Naruto",
      image: "/travisscott.webp",
      logo: "/ksa.png",
      logoAlt: "Naruto",
    },
    {
      id: 8,
      name: "K-Pop Style Tee",
      image: "/VENOM.webp",
      logo: "/wing.png",
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
                    onError={(e) => {
                      e.target.src = "/abstract-geometric-tee.png"
                    }}
                  />
                  <div className="absolute inset-0 transition-all duration-300 bg-black bg-opacity-0 opacity-0 group-hover:bg-opacity-20 group-hover:opacity-100" />
                </div>

                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 sm:-bottom-8 md:-bottom-10">
                  <img
                    src={product.logo || "/placeholder.svg"}
                    alt={product.logoAlt}
                    className="h-12 max-w-[140px] object-contain sm:h-16 sm:max-w-[160px] md:h-20 md:max-w-[180px] lg:h-24 lg:max-w-[200px] filter drop-shadow-lg bg-white rounded-lg p-2"
                    onError={(e) => {
                      e.target.src = "/generic-brand-logo.png"
                    }}
                  />
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
