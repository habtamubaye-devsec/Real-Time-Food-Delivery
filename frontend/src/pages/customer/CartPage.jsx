import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import useCartStore from "../../store/customer/cartStore";
import { FiTrash2, FiShoppingCart } from "react-icons/fi";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    clearCart,
    loadCart,
  } = useCartStore();

  // 🔥 fetch cart on mount so refresh keeps data
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleDecrease = (id, qty) => {
    if (qty > 1) updateQuantity(id, qty - 1);
  };

  const handleIncrease = (id, qty) => updateQuantity(id, qty + 1);

  const deliveryFee = cartItems.length > 0 ? 3.5 : 0;
  const taxRate = 0.07;
  const subtotal = getTotalPrice();
  const tax = subtotal * taxRate;
  const total = subtotal + tax + deliveryFee;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-20 border-r bg-white">
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-grow px-6 py-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center">
          <FiShoppingCart size={28} className="text-red-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800 ml-2">
            Welcome to Your Cart
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <section className="flex flex-col space-y-4 w-1/2 max-w-xl">
            {cartItems.length === 0 ? (
              <p className="text-center text-gray-500 text-lg mt-20">
                Your cart is empty. Go add some tasty dishes!
              </p>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex bg-white rounded-lg shadow-md px-5 py-4 min-h-[96px] w-full items-start relative"
                >
                  {/* Image */}
                  <img
                    src={item.image || "/images/default-food.jpg"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />

                  {/* Info & Quantity */}
                  <div className="flex flex-col flex-grow min-w-0">
                    <h2 className="font-semibold text-md truncate">
                      {item.name}
                    </h2>
                    {item.description && (
                      <p className="text-gray-500 text-xs truncate">
                        {item.description}
                      </p>
                    )}
                    <div className="flex justify-start items-center space-x-2 mt-2">
                      <button
                        onClick={() => handleDecrease(item._id, item.quantity)}
                        className="w-7 h-7 bg-gray-200 rounded-md hover:bg-gray-300 text-sm font-semibold"
                      >
                        –
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item._id,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-10 text-center border rounded-md text-sm"
                      />
                      <button
                        onClick={() => handleIncrease(item._id, item.quantity)}
                        className="w-7 h-7 bg-gray-200 rounded-md hover:bg-gray-300 text-sm font-semibold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price & Remove */}
                  <div className="flex flex-col items-end ml-4 absolute right-5 top-4">
                    <p className="text-red-600 font-bold text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-600 hover:text-red-700 mt-2"
                      aria-label="Remove item"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Order Summary */}
          <aside
            className="w-full lg:w-80 bg-white border rounded-lg p-6 shadow-md h-fit self-start"
            style={{
              position: "fixed",
              right: "2rem",
              top: "6rem",
              width: "20rem",
              maxHeight: "calc(100vh - 8rem)",
              overflowY: "auto",
              zIndex: 100,
            }}
          >
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="flex justify-between mb-3 text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-3 text-sm">
              <span>Tax (7%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-6 text-sm">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-lg mb-4">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg"
            >
              Checkout
            </button>
            {cartItems.length > 0 && (
              <button
                onClick={() => clearCart()}
                className="mt-3 w-full text-red-600 hover:text-red-700 font-semibold text-sm underline"
              >
                Clear Cart
              </button>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
