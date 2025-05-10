"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import "./styles.css"

export default function HomePage() {
  const router = useRouter()
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token")
    if (token) {
      // User is authenticated, redirect to products page
      router.push("/products")
    } else {
      // User is not authenticated, redirect to login
      router.push("/login")
    }
  }, [router])

  // Show loading state while redirecting
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  )
}
