"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import "../styles.css"

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [wishlistItems, setWishlistItems] = useState([])
  const [wishlistId, setWishlistId] = useState(null)
  const [animatingHeart, setAnimatingHeart] = useState(null)
  const [addToCartLoading, setAddToCartLoading] = useState(null)

  // Define the missing handleProductsUpdated function
  const handleProductsUpdated = () => {
    fetchProducts()
  }
  
  // Extract fetchProducts as a named function so it can be referenced elsewhere
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://swiftthrift-457008.as.r.appspot.com/api/products/all");
      console.log("API response:", response.data);
      
      // Ensure products is always an array
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (response.data && typeof response.data === 'object') {
        // If the response is a single object that's an array-like structure
        if (Object.keys(response.data).some(key => !isNaN(parseInt(key)))) {
          // Convert object to array if it has numeric keys
          const productsArray = Object.values(response.data);
          setProducts(productsArray);
        } else {
          // If it's a single product object, wrap it in an array
          setProducts([response.data]);
        }
      } else {
        console.error("API did not return an array or object:", response.data);
        setProducts([]); // Set to empty array as fallback
        setError("Received invalid data format from server.");
      }
    } catch (error) {
      setError("Failed to load products. Please try again later.");
      console.error("Error fetching products:", error);
      setProducts([]); // Ensure products is an array even on error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    } else {
      try {
        const userData = localStorage.getItem("user")
        const parsedUser = userData ? JSON.parse(userData) : null
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
      setAuthChecked(true)
    }

    // Call fetchProducts when component mounts
    fetchProducts()

    window.addEventListener("productsUpdated", handleProductsUpdated)
    return () => {
      window.removeEventListener("productsUpdated", handleProductsUpdated)
    }
  }, [router])

  useEffect(() => {
    if (!user) return
    async function fetchWishlist() {
      try {
        const res = await axios.get(`https://swiftthrift-457008.as.r.appspot.com/api/wishlist/byUser/${user.userId}`)
        if (res.data && res.data.length > 0) {
          setWishlistId(res.data[0].id || res.data[0].wishlistId)
          const itemsRes = await axios.get(`https://swiftthrift-457008.as.r.appspot.com/api/wishlistItems/wishlist/${res.data[0].id || res.data[0].wishlistId}`)
          setWishlistItems(itemsRes.data.map(item => item.product.productId))
        } else {
          const createRes = await axios.post("https://swiftthrift-457008.as.r.appspot.com/api/wishlist/create", {
            user: { userId: user.userId }
          })
          setWishlistId(createRes.data.id || createRes.data.wishlistId)
          setWishlistItems([])
        }
      } catch (e) {
        console.error("Wishlist error:", e.response?.data || e.message)
        alert("Could not load wishlist. Please try again.")
      }
    }
    fetchWishlist()
  }, [user])

  const handleWishlistToggle = async (productId) => {
    if (!wishlistId) return
    const isInWishlist = wishlistItems.includes(productId)
    setAnimatingHeart(productId)
    try {
      if (!isInWishlist) {
        await axios.post("https://swiftthrift-457008.as.r.appspot.com/api/wishlistItems/create", {
          wishlist: { wishlistId: wishlistId },
          product: { productId }
        }, {
          withCredentials: true // This is important for CORS with credentials
        })
      } else {
        const res = await axios.get(`https://swiftthrift-457008.as.r.appspot.com/api/wishlistItems/wishlist/${wishlistId}`, {
          withCredentials: true
        })
        const item = res.data.find(i => i.product.productId === productId)
        if (item) {
          await axios.delete(`https://swiftthrift-457008.as.r.appspot.com/api/wishlistItems/${item.wishlistid || item.id}`, {
            withCredentials: true
          })
        }
      }
      const itemsRes = await axios.get(`https://swiftthrift-457008.as.r.appspot.com/api/wishlistItems/wishlist/${wishlistId}`, {
        withCredentials: true
      })
      setWishlistItems(itemsRes.data.map(item => item.product.productId))
      window.dispatchEvent(new Event("wishlistUpdated"))
    } catch (e) {
      console.error("Wishlist error:", e.response?.data || e.message)
      alert("Could not update wishlist. Please try again.")
    } finally {
      setTimeout(() => setAnimatingHeart(null), 200)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const handleAddToCart = async (product) => {
    if (!user) {
      router.push("/login")
      return
    }
    setAddToCartLoading(product.productId)
    try {
      let userCart = null
      let cartId = null
      
      // First try to get the user's cart
      try {
        console.log("Fetching cart for user", user.userId)
        const res = await axios.get(`https://swiftthrift-457008.as.r.appspot.com/api/cart/byUser/${user.userId}`)
        userCart = res.data
        console.log("Cart found:", userCart)
        // Check if we got a valid cart with cartId
        if (!userCart || !userCart.cartId) {
          throw new Error("Cart not found or missing ID")
        } else {
          cartId = userCart.cartId
        }
      } catch (err) {
        console.log("Cart fetch error:", err.response?.data || err.message)
        // If cart not found, we need to check if user already has a cart in the backend
        try {
          // This is a workaround to check all carts to find user's cart if API is not working correctly
          const allCartsRes = await axios.get("https://swiftthrift-457008.as.r.appspot.com/api/cart/all")
          const userExistingCart = allCartsRes.data.find(cart => 
            cart.user && cart.user.userId === user.userId
          )
          
          if (userExistingCart) {
            console.log("Found user's cart in all carts:", userExistingCart)
            userCart = userExistingCart
            cartId = userExistingCart.cartId
          } else {
            // No cart exists yet, create one
            console.log("Creating new cart for user", user.userId)
            const createRes = await axios.post("https://swiftthrift-457008.as.r.appspot.com/api/cart/create", {
              user: { userId: user.userId },
              totalPrice: 0
            })
            userCart = createRes.data
            cartId = createRes.data.cartId
            console.log("New cart created:", userCart)
          }
        } catch (createErr) {
          console.error("Cart creation error:", createErr.response?.data || createErr.message)
          // If we get "User already has a cart" but still can't find it, there's a data issue
          if (createErr.response?.data?.message === "User already has a cart.") {
            alert("System error: Your cart exists but cannot be accessed. Please contact support.")
            throw new Error("Cart access error: Cart exists but can't be retrieved")
          }
          throw new Error("Could not create or access your cart")
        }
      }
      console.log("Adding item to cart:", userCart.cartId, product.productId)
      // Now add the item to the cart with the valid cartId
      await axios.post("https://swiftthrift-457008.as.r.appspot.com/api/cartItem/create", {
        price: product.price,
        cart: { cartId: userCart.cartId },
        product: { productId: product.productId }
      })
      window.dispatchEvent(new Event("cartUpdated"))
      router.push("/cart")
    } catch (e) {
      alert(e.message || "Failed to add to cart.")
      console.error("Add to cart error:", e)
    } finally {
      setAddToCartLoading(null)
    }
  }

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/placeholder.svg";
    // If it's already an absolute URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // If it's a relative URL, prepend the API base URL
    return `https://swiftthrift-457008.as.r.appspot.com${imageUrl}`;
  };

  if (!authChecked || loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container">
      <nav className="navbar">
        <div className="logo">Swiftthrift</div>
        <ul className="nav-links">
         
          <li><a className="active">Products</a></li>
          <li><a onClick={() => router.push("/wishlist")}>Wishlist</a></li>
          <li><a onClick={() => router.push("/cart")}>Cart</a></li>
          <li><a onClick={() => router.push("/orders")}>Orders</a></li>
         
          <li><a onClick={() => router.push("/about")}>About Us</a></li>
        </ul>
        <div className="auth-links">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>
      <div className="page-header">
        <h1>Our Products</h1>
        <p>Discover our amazing collection of high-quality products</p>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="featured-products">
        <div className="products-grid">
          {products.length > 0 ? products.map((product) => {
            const isWishlisted = wishlistItems.includes(product.productId)
            return (
              <div key={product.productId} className="product-card">
                <div className="product-image" style={{ position: "relative" }}>
                  {product.imageUrls && product.imageUrls.length > 0 ? (
                    <img
                      src={getImageUrl(product.imageUrls[0])}
                      alt={product.name}
                    />
                  ) : (
                    <img src="/placeholder.svg" alt="No image available" />
                  )}
                  <button
                    className={`wishlist-heart-btn${isWishlisted ? " active" : ""}${animatingHeart === product.productId ? " animating" : ""}`}
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    onClick={() => handleWishlistToggle(product.productId)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 28,
                      color: isWishlisted ? "red" : "#aaa",
                      transition: "color 0.2s, transform 0.15s",
                      transform: animatingHeart === product.productId ? "scale(1.2)" : "scale(1)"
                    }}
                  >{isWishlisted ? "♥" : "♡"}
                  </button>
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <p className="price">₱{product.price}</p>
                  <button
                    className="add-to-cart"
                    disabled={addToCartLoading === product.productId}
                    onClick={() => handleAddToCart(product)}
                  >{addToCartLoading === product.productId ? "Adding..." : "Add to Cart"}
                  </button>
                </div>
              </div>
            )
          }) : (
            <div className="no-products">
              <p>No products available at the moment. Please check back later.</p>
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
