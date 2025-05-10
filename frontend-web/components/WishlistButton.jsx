"use client";
import React from 'react';

export default function WishlistButton({ 
  productId, 
  isInWishlist, 
  isLoading, 
  isAnimating, 
  onToggle 
}) {
  return (
    <button
      className={`wishlist-heart-btn ${isInWishlist ? 'active' : ''} ${isAnimating ? 'animate' : ''}`}
      onClick={() => onToggle(productId)}
      disabled={isLoading}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "none",
        border: "none",
        fontSize: "24px",
        color: isInWishlist ? "red" : "#ccc",
        cursor: "pointer",
        transition: "color 0.3s, transform 0.3s",
      }}
    >
      {isLoading ? "..." : "♥"}
    </button>
  );
}
