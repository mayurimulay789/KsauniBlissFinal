import React, { useEffect } from "react";

const Popup = ({ banner, visible, onClose, timeout = 5000 }) => {
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      onClose();
    }, timeout);

    return () => clearTimeout(timer);
  }, [visible, onClose, timeout]);

  if (!visible || !banner) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 backdrop-blur-sm">
      <div className="relative w-[320px] h-[480px] bg-black rounded-lg shadow-lg flex flex-col items-center text-white animate-fadeIn scale-up p-6">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-white hover:text-gray-400 text-3xl font-extrabold"
          aria-label="Close popup"
        >
          &#x2715;
        </button>
        {banner.image?.url && (
          <img
            src={banner.image.url}
            alt={banner.title}
            className="w-full h-full object-cover mb-6 rounded-md"
          />
        )}
        {banner.subtitle && (
          <h2 className="text-3xl font-bold text-center mb-2">
            {banner.subtitle}
          </h2>
        )}
        {banner.title && (
          <p className="text-center text-lg mb-6">{banner.title}</p>
        )}
        <button
          onClick={() => {
            // Navigate to shop or perform action
            window.location.href = "/products";
          }}
          className="px-6 py-3 mt-auto text-black bg-white rounded-md font-semibold hover:bg-gray-200 transition"
        >
          SHOP NOW
        </button>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }
        .scale-up {
          transform-origin: center;
          animation: scaleUp 0.5s ease forwards;
        }
        @keyframes scaleUp {
          from { transform: scale(0.8); }
          to { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Popup;
