"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import "../styles.css"  // Fix the import path to point to the app/styles.css file

export default function WishlistPage() {
  const router = useRouter()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

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

      if (parsedUser) {
        fetchWishlist(parsedUser.userId)
      }
    } catch (error) {
      console.error("Error parsing user data:", error)
      setError("Failed to load user data. Please try logging in again.")
    }
  }, [router])

  async function fetchWishlist(userId) {
    try {
      setLoading(true)
      const res = await axios.get(`https://swiftthrift-457311.as.r.appspot.com/api/wishlist/byUser/${userId}`)

      if (res.data && res.data.length > 0) {
        const wishlistId = res.data[0].wishlistId || res.data[0].id
        const itemsRes = await axios.get(`https://swiftthrift-457311.as.r.appspot.com/api/wishlistItems/wishlist/${wishlistId}`)
        setWishlistItems(itemsRes.data)
      } else {
        setWishlistItems([])
      }

      setError(null)
    } catch (e) {
      console.error("Error fetching wishlist:", e)
      setError("Failed to load wishlist. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (itemId) => {
    try {
      await axios.delete(`https://swiftthrift-457311.as.r.appspot.com/api/wishlistItems/${itemId}`)
      // Refresh the wishlist after deletion
      if (user) {
        fetchWishlist(user.userId)
      }
    } catch (e) {
      console.error("Error removing item:", e)
      alert("Failed to remove item from wishlist. Please try again.")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  // Improved image URL handling function
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/placeholder.svg"

    // If it's already an absolute URL, return as is
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl
    }

    // If it's a relative URL without leading slash, add one
    if (!imageUrl.startsWith("/")) {
      imageUrl = "/" + imageUrl
    }

    // Return the complete URL
    return `https://swiftthrift-457311.as.r.appspot.com${imageUrl}`
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your wishlist...</p>
      </div>
    )
  }

  return (
    <div className="container">
      <nav className="navbar">
        <div className="logo">Swiftthrift</div>
        <ul className="nav-links">
          <li>
            <a onClick={() => router.push("/products")}>Products</a>
          </li>
          <li>
            <a className="active">Wishlist</a>
          </li>
          <li>
            <a onClick={() => router.push("/cart")}>Cart</a>
          </li>
          <li>
            <a onClick={() => router.push("/orders")}>Orders</a>
          </li>
          <li>
            <a onClick={() => router.push("/about")}>About Us</a>
          </li>
        </ul>
        <div className="auth-links">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="page-header">
        <h1>Your Wishlist</h1>
        <p>All your favorite products in one place</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="featured-products">
        <div className="products-grid">
          {wishlistItems.length > 0 ? (
            wishlistItems.map((item) => (
              <div key={item.wishlistItemId || item.id} className="product-card">
                <div className="product-image" style={{ position: "relative" }}>
                  <img
                    src={item.product.imageUrls && item.product.imageUrls.length > 0
                      ? getImageUrl(item.product.imageUrls[0])
                      : "/placeholder.svg"}
                    alt={item.product.name}
                  />
                  <button
                    className="wishlist-heart-btn active"
                    title="Remove from wishlist"
                    onClick={() => handleRemove(item.wishlistItemId || item.id)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 24,
                      color: "red",
                    }}
                  >
                    ♥
                  </button>
                </div>
                <div className="product-info">
                  <h3>{item.product.name}</h3>
                  <p className="product-description">{item.product.description}</p>
                  <p className="price">₱{item.product.price}</p>
                  <button className="add-to-cart">Add to Cart</button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-products">
              <p>Your wishlist is empty.</p>
              <button className="browse-products-btn" onClick={() => router.push("/products")}>
                Browse Products
              </button>
            </div>
          )}
        </div>
      </div>
      <footer className="footer">
        <p>&copy; 2025 Swiftthrift. All rights reserved.</p>
      </footer>
    </div>
  )
}
