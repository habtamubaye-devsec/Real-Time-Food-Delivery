import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const OrderDetails = () => {
  const { id } = useParams(); // order id from route
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/orders/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching order:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Order #{order.id}</h2>
      <p><strong>Restaurant:</strong> {order.restaurant}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Items:</strong> {order.items.join(", ")}</p>

      {/* Feedback Section */}
      <div className="mt-6 p-4 border rounded bg-gray-50">
        <h3 className="text-lg font-semibold">Feedback</h3>
        {order.feedback ? (
          <div>
            <p><strong>Rating:</strong> ⭐ {order.feedback.rating}/5</p>
            <p><strong>Comment:</strong> {order.feedback.text}</p>
            <p className="text-sm text-gray-500">
              Submitted at: {new Date(order.feedback.submittedAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="text-gray-600">No feedback submitted yet.</p>
        )}
      </div>
    </div>
  );
}
export default OrderDetails;
