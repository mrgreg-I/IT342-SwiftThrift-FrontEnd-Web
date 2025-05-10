"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await axios.get("http://localhost:8080/api/products/all");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }

    // Fetch products initially and listen for updates
    fetchProducts();

    const handleProductsUpdated = () => {
      fetchProducts();
    };

    window.addEventListener("productsUpdated", handleProductsUpdated);

    return () => {
      window.removeEventListener("productsUpdated", handleProductsUpdated);
    };
  }, []);

  // Improved image URL handling function
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/placeholder.svg";
    
    // If it's already an absolute URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's a relative URL without leading slash, add one
    if (!imageUrl.startsWith('/')) {
      imageUrl = '/' + imageUrl;
    }
    
    // Return the complete URL
    return `http://localhost:8080${imageUrl}`;
  };

  return (
    <div className="products-grid">
      {products.map((product) => (
        <div key={product.productId} className="product-card">
          <div className="product-image">
            {product.imageUrls && product.imageUrls.length > 0 ? (
              <img
                src={getImageUrl(product.imageUrls[0])}
                alt={product.name}
              />
            ) : (
              <div className="no-image">No Image Available</div>
            )}
          </div>
          <div className="product-info">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p className="price">${product.price}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
