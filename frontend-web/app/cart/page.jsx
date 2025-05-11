"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import "../styles.css"

const STRIPE_PUBLIC_KEY = "pk_test_51RHvE5HX4UZcHBXUnq2kaKVJP082SVqNxZqMrtVCVdUKCONHMMyFxGYPsMHGuBrvpP7iP1zXiovWAe7E4j7yTlTa00a3q6NzAy"

// Helper function to load Stripe.js
async function loadStripeJs() {
  if (window.Stripe) return window.Stripe(STRIPE_PUBLIC_KEY)
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = "https://js.stripe.com/v3/"
    script.onload = () => {
      resolve(window.Stripe(STRIPE_PUBLIC_KEY))
    }
    document.body.appendChild(script)
  })
}

export default function CartPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cartItems, setCartItems] = useState([])
  const [selectedItems, setSelectedItems] = useState([])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    try {
      const userData = localStorage.getItem("user")
      const parsedUser = userData ? JSON.parse(userData) : null
      setUser(parsedUser)
    } catch (e) {
      setError("Failed to load user.")
    }
  }, [router])

  useEffect(() => {
    if (!user) return
    async function fetchCart() {
      try {
        setLoading(true)
        // Use the new endpoint to get the user's cart directly
        const res = await axios.get(`https://swiftthrift-457311.as.r.appspot.com/api/cart/byUser/${user.userId}`)
        if (res.data) {
          setCart(res.data)
          setCartItems(res.data.cartItems || [])
        } else {
          setCart(null)
          setCartItems([])
        }
        setError("")
      } catch (e) {
        setCart(null)
        setCartItems([])
        setError("Failed to load cart.")
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
    // Listen for cart updates
    const handleCartUpdated = () => fetchCart()
    window.addEventListener("cartUpdated", handleCartUpdated)
    return () => window.removeEventListener("cartUpdated", handleCartUpdated)
  }, [user])

  const handleRemoveItem = async (cartItemId) => {
    try {
      await axios.delete(`https://swiftthrift-457311.as.r.appspot.com/api/cartItem/delete/${cartItemId}`)
      window.dispatchEvent(new Event("cartUpdated"))
    } catch (e) {
      setError("Failed to remove item.")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  // Checkbox handlers
  const handleSelectItem = (cartItemId) => {
    setSelectedItems((prev) =>
      prev.includes(cartItemId)
        ? prev.filter((id) => id !== cartItemId)
        : [...prev, cartItemId]
    )
  }

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(cartItems.map((item) => item.cartItemId))
    }
  }

  // Calculate total price of selected items
  const totalPrice = cartItems
    .filter((item) => selectedItems.includes(item.cartItemId))
    .reduce((sum, item) => sum + (item.price || 0), 0)

  // Stripe Checkout integration - FIXED to properly use Stripe.js
  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to checkout.")
      return
    }
    try {
      const itemsToCheckout = cartItems.filter(item => selectedItems.includes(item.cartItemId))
      const amountInCents = Math.round(
        itemsToCheckout.reduce((sum, item) => sum + (item.price || 0), 0) * 100
      )
      
      // Call backend to create Stripe Checkout session
      const res = await axios.post("https://swiftthrift-457311.as.r.appspot.com/api/payments/create-intent", {
        userId: user.userId.toString(),
        amount: amountInCents,
        currency: "php", // Changed from "usd" to "php" for Philippine Pesos
        // Optionally send items: itemsToCheckout
      })
      
      // FIXED: Backend returns sessionId in a field called clientSecret
      if (res.data && res.data.clientSecret) {
        // Load Stripe.js
        const stripe = await loadStripeJs()
        
        // Use proper Stripe.js redirect with the session ID
        const { error } = await stripe.redirectToCheckout({
          sessionId: res.data.clientSecret // Using clientSecret as sessionId based on your backend
        })
        
        if (error) {
          console.error("Stripe redirect error:", error)
          alert(`Payment error: ${error.message}`)
        }
      } else {
        alert("Stripe session creation failed.")
        console.error("Missing session ID in response:", res.data)
      }
    } catch (err) {
      alert("Failed to initiate payment. Please try again.")
      console.error("Checkout error:", err)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/placeholder.svg";
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `https://swiftthrift-457311.as.r.appspot.com${imageUrl}`;
  };

  return (
    <div className="container cart-page-flex">
      <nav className="navbar">
        <div className="logo">Swiftthrift</div>
        <ul className="nav-links">
          <li>
            <a onClick={() => router.push("/products")}>Products</a>
          </li>
          <li>
            <a onClick={() => router.push("/wishlist")}>Wishlist</a>
          </li>
          <li>
            <a className="active">Cart</a>
          </li>
          <li>
            <a onClick={() => router.push("/orders")}>Orders</a>
          </li>
          <li>
            <a onClick={() => router.push("/about")}>About Us</a>
          </li>
        </ul>
        <div className="auth-links">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="page-header">
        <h1>Your Cart</h1>
        <p>Review your selected items and proceed to checkout</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="cart-content-flex">
        {/* Left: Cart Items */}
        <div className="cart-items-section">
          <div className="featured-products">
            <div className="products-grid">
              {cartItems.length > 0 ? cartItems.map(item => (
                <div key={item.cartItemId} className="product-card" style={{ position: "relative" }}>
                  <div className="product-image" style={{ position: "relative" }}>
                    {/* Checkbox on top left */}
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.cartItemId)}
                      onChange={() => handleSelectItem(item.cartItemId)}
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        zIndex: 2,
                        width: 20,
                        height: 20,
                        accentColor: "#ff6b6b"
                      }}
                    />
                    <img 
                      src={item.product?.imageUrls && item.product.imageUrls.length > 0
                        ? getImageUrl(item.product.imageUrls[0])
                        : "/placeholder.svg?height=200&width=200"}
                      alt={item.product?.name || "Product image"}
                    />
                  </div>
                  <div className="product-info">
                    <h3>{item.product?.name}</h3>
                    <p className="product-description">{item.product?.description}</p>
                    <p className="price">₱{item.price}</p>
                    <button className="add-to-cart" onClick={() => handleRemoveItem(item.cartItemId)}>
                      Remove
                    </button>
                  </div>
                </div>
              )) : (
                <div className="no-products">
                  <p>Your cart is empty.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Right: Checkout Box */}
        <div className="checkout-box">
          <h2>Checkout</h2>
          <div className="checkout-summary">
            <p>
              <span style={{ fontWeight: 500 }}>Selected Items:</span> {selectedItems.length}
            </p>
            <p>
              <span style={{ fontWeight: 500 }}>Total:</span>{" "}
              <span style={{ color: "#ff6b6b", fontWeight: 700 }}>₱{totalPrice.toFixed(2)}</span>
            </p>
          </div>
          <button
            className="checkout-btn"
            disabled={selectedItems.length === 0}
            onClick={handleCheckout}
          >
            Checkout
          </button>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2025 Swiftthrift. All rights reserved.</p>
      </footer>
    </div>
  )
}
