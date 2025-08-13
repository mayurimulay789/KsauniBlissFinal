import React from "react";
import { Truck, Package, Clock } from "lucide-react";

const ShippingPage = () => {
  return (
    <div className="max-w-4xl px-4 py-12 mx-auto">
      <h1 className="mb-8 text-4xl font-bold text-center text-red-600">Shipping Information</h1>
      <p className="max-w-3xl mx-auto mb-8 text-lg text-center text-gray-700">
        We offer reliable and fast shipping to ensure your orders reach you on time.
      </p>

      <section className="mb-10">
        <h2 className="flex items-center gap-3 mb-6 text-2xl font-semibold text-red-600">
          <Truck className="w-8 h-8 text-blue-600" />
          Shipping Methods
        </h2>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <li className="flex flex-col items-center p-4 transition-shadow duration-300 border rounded-lg shadow-sm hover:shadow-md">
            <Package className="w-10 h-10 mb-3 text-green-600" />
            <h3 className="mb-2 text-lg font-semibold">Standard Shipping</h3>
            <p className="text-center text-gray-700">Delivered within 5-7 business days.</p>
          </li>
          <li className="flex flex-col items-center p-4 transition-shadow duration-300 border rounded-lg shadow-sm hover:shadow-md">
            <Clock className="w-10 h-10 mb-3 text-yellow-600" />
            <h3 className="mb-2 text-lg font-semibold">Express Shipping</h3>
            <p className="text-center text-gray-700">Delivered within 2-3 business days.</p>
          </li>
          <li className="flex flex-col items-center p-4 transition-shadow duration-300 border rounded-lg shadow-sm hover:shadow-md">
            <Truck className="w-10 h-10 mb-3 text-red-600" />
            <h3 className="mb-2 text-lg font-semibold">Overnight Shipping</h3>
            <p className="text-center text-gray-700">Delivered the next business day.</p>
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-red-600">Shipping Charges</h2>
        <p className="text-gray-700">
          Shipping charges vary based on the shipping method and your location. Free standard shipping is available on orders over ₹999.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-red-600">Order Tracking</h2>
        <p className="text-gray-700">
          Once your order is shipped, you will receive a tracking number via email to monitor your shipment.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-red-600">Delivery Time</h2>
        <p className="text-gray-700">
          Delivery times may vary due to factors such as weather, holidays, or carrier delays. We appreciate your patience.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold text-red-600">International Shipping</h2>
        <p className="text-gray-700">
          Currently, we only ship within India. International shipping will be available soon.
        </p>
      </section>
    </div>
  );
};

export default ShippingPage;
