import { useState } from "react";
import { CreditCard, X } from "lucide-react";

// PaymentModal – drop this in right under your imports
export const PaymentModal = ({ isOpen, onClose, onOnline, onCOD, amount }) => {
  const [tab, setTab] = useState("online");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg w-96">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-2 text-center ${
              tab === "online" ? "font-bold border-b-2 border-pink-600" : ""
            }`}
            onClick={() => setTab("online")}
          >
            Pay Online
          </button>
          <button
            className={`flex-1 py-2 text-center ${
              tab === "cod" ? "font-bold border-b-2 border-pink-600" : ""
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
                className="flex items-center justify-center w-full py-2 text-white bg-pink-600 rounded"
                onClick={() => {
                  onOnline();
                  onClose();
                }}
              >
                <CreditCard className="mr-2" /> Pay ₹{amount}
              </button>
            </>
          ) : (
            <>
              <p className="mb-4">You’ll pay ₹{amount} on delivery.</p>
              <button
                className="w-full py-2 text-white bg-green-600 rounded"
                onClick={() => {
                  onCOD();
                  onClose();
                }}
              >
                Confirm COD
              </button>
            </>
          )}
        </div>

        {/* Close button */}
        <button
          className="absolute text-gray-500 top-2 right-2 hover:text-gray-900"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
    </div>
  );
};
