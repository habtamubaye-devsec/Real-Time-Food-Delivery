// src/pages/customer/OrderStatus.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderHistory } from "../../api/customer/orderHistoryApi";
import Sidebar from "../../components/Sidebar";

const steps = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "picked",
  "en_route",
  "delivered",
];

const OrderStatus = () => {
  const { orderId } = useParams(); // optional: order ID from history
  const [order, setOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (orderId) {
          const API_URL = import.meta.env.VITE_API_URL || "/api/delivery";
          const res = await fetch(`${API_URL}/orders/${orderId}`, {
            method: "GET",
            credentials: "include",
          });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to load order");
          }
          const json = await res.json();
          setOrder(json.data);
          return;
        }

        const data = await getOrderHistory();
        const selectedOrder = data?.data?.orders?.[0];
        if (selectedOrder) setOrder(selectedOrder);
      } catch (err) {
        console.error("Failed to fetch order:", err);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading order status...</p>
      </div>
    );
  }

  const currentState = order.status?.toLowerCase();

  const canViewMap = ["picked", "enroute", "en_route"].includes(currentState);

  const completedSteps = steps.map((step) => {
    if (currentState === "accepted") {
      return step === "pending" || step === "accepted";
    }
    return steps.indexOf(step) <= steps.indexOf(currentState);
  });

  const handleViewMap = () => {
    if (canViewMap) {
      navigate(`/orders/${order._id}/map`);
    }
  };

  const handleBackHome = () => {
    navigate("/nearby");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-20 sm:w-24">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-3xl flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            Order Status
          </h1>
          <p className="mb-6 font-medium">
            Order ID: <span className="text-red-500">{order._id}</span>
          </p>

          {/* Steps */}
          <div className="flex items-center w-full mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center h-12 w-12 rounded-full text-white font-bold transition-all duration-300
                      ${completedSteps[index] ? "bg-green-500" : "bg-gray-300"}`}
                  >
                    {completedSteps[index] ? (
                      <i className="bx bx-check text-xl"></i>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium capitalize text-gray-700">
                    {step}
                  </p>
                </div>
                {index !== steps.length - 1 && (
                  <div
                    className={`flex-1 h-2 mx-2 rounded-full transition-all duration-300 ${
                      completedSteps[index] ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={canViewMap ? handleViewMap : undefined}
              disabled={!canViewMap}
              className={`px-10 py-3 rounded-3xl text-white font-semibold transition-all duration-300
                ${canViewMap ? "bg-blue-500 hover:bg-blue-600 cursor-pointer" : "bg-gray-400 cursor-not-allowed"}`}
            >
              View Map
            </button>

            <button
              onClick={handleBackHome}
              className="px-6 py-3 rounded-3xl bg-gray-700 text-white font-semibold hover:bg-gray-800 transition-all duration-300"
            >
              Back to Home
            </button>
          </div>

          {/* Delivered modal */}
          {currentState === "delivered" && showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Order Delivered</h2>
                <p className="mb-4">
                  Your order has been delivered successfully!
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
