import React from "react";
import { RotateCcw, Package, RefreshCcw } from "lucide-react";

const ReturnPage = () => {
  return (
    <div className="max-w-4xl px-4 py-12 mx-auto">
      <h1 className="mb-10 text-4xl font-bold text-red-600 text-center">Returns & Refunds</h1>
      <p className="mb-10 text-lg text-gray-700 text-center max-w-3xl mx-auto">
        We want you to be completely satisfied with your purchase. If you need to return an item, please review our return policy below.
      </p>

      <section className="mb-12">
        <h2 className="mb-8 text-2xl font-semibold text-red-600 flex items-center gap-3">
          <RotateCcw className="w-10 h-10 text-blue-600" />
          Return Policy
        </h2>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <li className="flex items-start space-x-4 p-6 border rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
            <RotateCcw className="w-8 h-8 text-red-500 flex-shrink-0" />
            <p className="text-gray-700">
              Items must be unused, unwashed, with original tags attached, and in original packaging.
            </p>
          </li>
          <li className="flex items-start space-x-4 p-6 border rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
            <Package className="w-8 h-8 text-green-500 flex-shrink-0" />
            <p className="text-gray-700">
              Certain items like innerwear, cosmetics, and personalized items are non-returnable.
            </p>
          </li>
          <li className="flex items-start space-x-4 p-6 border rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
            <RefreshCcw className="w-8 h-8 text-yellow-500 flex-shrink-0" />
            <p className="text-gray-700">
              Return shipping is free for defective or incorrect items.
            </p>
          </li>
          <li className="flex items-start space-x-4 p-6 border rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
            <RotateCcw className="w-8 h-8 text-purple-500 flex-shrink-0" />
            <p className="text-gray-700">
              Returns must be initiated within 30 days of delivery.
            </p>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="mb-8 text-2xl font-semibold text-red-600 flex items-center gap-3">
          <Package className="w-10 h-10 text-green-600" />
          How to Return an Item
        </h2>
        <p className="text-gray-700 mb-6">
          Log into your account, go to "My Orders", select the item you want to return, choose a reason, and schedule a pickup. Our courier partner will collect the item from your address free of charge.
        </p>
      </section>

      <section>
        <h2 className="mb-8 text-2xl font-semibold text-red-600 flex items-center gap-3">
          <RefreshCcw className="w-10 h-10 text-yellow-600" />
          Refund Process
        </h2>
        <p className="text-gray-700">
          Refunds are processed within 5-7 business days after we receive and verify the returned item. The amount will be credited to your original payment method or Kasuni Bliss wallet, as per your preference.
        </p>
      </section>
    </div>
  );
};

export default ReturnPage;
