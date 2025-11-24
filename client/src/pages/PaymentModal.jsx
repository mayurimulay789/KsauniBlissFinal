import { useState, useEffect } from "react";
import { CreditCard, X, Info } from "lucide-react";
// PaymentModal – drop this in right under your imports
export const PaymentModal = ({ isOpen, onClose, onOnline, onCOD, amount }) => {
  const [tab, setTab] = useState("online");
  const DELIVERY_CHARGE = 100
  if (!isOpen) return null;
  return (
    <div>
      <div>
        <button
          className="text-gray-500 hover:text-gray-900"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
      <div className="flex border-b rounded-lg">
        <button
          className={`flex-1 py-2 text-center ${tab === "online" ? "font-bold border-b-2 border-red-600" : ""
            }`}
          onClick={() => setTab("online")}
        >
          Pay Online
        </button>
        <button
          className={`flex-1 py-2 text-center ${tab === "cod" ? "font-bold border-b-2 border-red-600" : ""
            }`}
          onClick={() => setTab("cod")}
        >
          Cash on Delivery
        </button>
      </div>
      {/* Content */}
      <div className="p-4">
        {tab === "online" ? (
          <>
            <p className="mb-4">Amount: ₹{amount}</p>
            <button
              className="flex items-center justify-center w-full py-2 text-white bg-red-600 rounded-[10px] hover:bg-red-700"
              onClick={() => {
                onOnline();
              }}
            >
              <CreditCard className="mr-2" /> Pay ₹{amount}
            </button>
          </>
        ) : (
          <>
            <div className="mb-4 space-y-3">
              {/* Cash On Delivery Header */}
              <div className="flex justify-between items-start pb-3 border-b">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Cash On Delivery</h3>
                  <p className="text-xs text-gray-600 mt-1">Additional fees charged for COD</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">₹{amount + DELIVERY_CHARGE}</p>
                </div>
              </div>

              {/* Information Note */}
              <div className="flex gap-2 pt-2">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full border border-blue-400 bg-blue-50">
                    <Info className="h-3 w-3 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-600">COD fee of ₹{DELIVERY_CHARGE} is added to cash on delivery</p>
              </div>
            </div>
            <button
              className="w-full py-2 text-white bg-red-600 rounded-[10px] hover:bg-red-700"
              onClick={() => {
                // Pass the delivery charge through the onCOD handler by attaching it to the event closure
                onCOD({ deliveryCharge: DELIVERY_CHARGE });
                onClose();
              }}
            >
              Confirm COD
            </button>
          </>
        )}
      </div>
    </div>
  );
};




