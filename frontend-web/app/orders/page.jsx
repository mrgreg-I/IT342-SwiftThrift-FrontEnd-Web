"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import "../styles.css";
export const dynamic = 'force-dynamic';
export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Check if there's a session_id in the URL (payment success redirect)
    const sessionIdParam = searchParams?.get('session_id');
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
      setPaymentSuccess(true);
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const userData = localStorage.getItem("user");
      const parsedUser = userData ? JSON.parse(userData) : null;
      setUser(parsedUser);

      if (parsedUser) {
        fetchOrders(parsedUser.userId);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      setError("Failed to load user data. Please try logging in again.");
    }
  }, [router, searchParams]);

  async function fetchOrders(userId) {
    try {
      setLoading(true);
      // Fetch orders from the API
      const res = await axios.get(`https://swiftthrift-457008.as.r.appspot.com/api/orders/byUser/${userId}`);
      console.log("Orders data:", res.data); // Debug log
      setOrders(res.data || []);
      setError(null);
    } catch (e) {
      console.error("Error fetching orders:", e);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <nav className="navbar">
        <div className="logo">Swiftthrift</div>
        <ul className="nav-links">
          <li><a onClick={() => router.push("/products")}>Products</a></li>
          <li><a onClick={() => router.push("/wishlist")}>Wishlist</a></li>
          <li><a onClick={() => router.push("/cart")}>Cart</a></li>
          <li><a className="active">Orders</a></li>
          <li><a onClick={() => router.push("/about")}>About Us</a></li>
        </ul>
        <div className="auth-links">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="page-header">
        <h1>Your Orders</h1>
        <p>Track and manage your purchases</p>
      </div>

      {paymentSuccess && (
        <div className="success-message" style={{
          backgroundColor: "#c6f6d5",
          color: "#2f855a",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "24px",
          textAlign: "center"
        }}>
          <h2>Payment Successful!</h2>
          <p>Your order has been placed successfully. Thank you for your purchase!</p>
          <p>Session ID: {sessionId}</p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="orders-list">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.orderId} className="order-card" style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "16px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
            }}>
              <div className="order-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <h3>Order #{order.orderId}</h3>
                <span className={`order-status ${order.status?.toLowerCase()}`} style={{
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  backgroundColor: order.status === "COMPLETED" ? "#c6f6d5" : "#feebc8",
                  color: order.status === "COMPLETED" ? "#2f855a" : "#dd6b20"
                }}>
                  {order.status || "Processing"}
                </span>
              </div>
              
              <div className="order-date">
                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className="order-items" style={{ margin: "16px 0" }}>
                {order.orderItems && order.orderItems.length > 0 ? (
                  order.orderItems.map((item) => (
                    <div key={item.orderItemid} className="order-item" style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      borderBottom: "1px solid #eee", 
                      padding: "12px 0" 
                    }}>
                      <div className="item-details" style={{ display: "flex", alignItems: "center" }}>
                        {item.product?.imageUrls && item.product.imageUrls.length > 0 && (
                          <img 
                            src={item.product.imageUrls[0].startsWith('http') 
                              ? item.product.imageUrls[0] 
                              : `https://swiftthrift-457008.as.r.appspot.com${item.product.imageUrls[0]}`}
                            alt={item.product.name}
                            style={{ width: "50px", height: "50px", objectFit: "cover", marginRight: "12px", borderRadius: "4px" }}
                          />
                        )}
                        <div>
                          <div className="item-name" style={{ fontWeight: "500" }}>
                            {item.product?.name || "Product"}
                          </div>
                          <div className="item-id" style={{ fontSize: "12px", color: "#666" }}>
                            Item ID: {item.orderItemid}
                          </div>
                        </div>
                      </div>
                      <div className="item-price" style={{ fontWeight: "500" }}>₱{item.subtotal.toFixed(2)}</div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#666", fontStyle: "italic", textAlign: "center" }}>
                    No items found for this order.
                  </p>
                )}
              </div>
              
              <div className="order-total" style={{ 
                textAlign: "right", 
                fontWeight: "bold", 
                borderTop: "1px solid #eee", 
                paddingTop: "16px",
                marginTop: "8px" 
              }}>
                <p>Total: <span style={{ color: "#ff6b6b" }}>₱{order.totalPrice.toFixed(2)}</span></p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-orders" style={{ textAlign: "center", padding: "30px", backgroundColor: "white", borderRadius: "8px" }}>
            <p>You don't have any orders yet.</p>
            <button 
              onClick={() => router.push("/products")}
              style={{
                backgroundColor: "#ff6b6b",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                marginTop: "16px",
                cursor: "pointer"
              }}
            >
              Browse Products
            </button>
          </div>
        )}
      </div>

      <footer className="footer">
        <p>&copy; 2025 Swiftthrift. All rights reserved.</p>
      </footer>
    </div>
  );
}
