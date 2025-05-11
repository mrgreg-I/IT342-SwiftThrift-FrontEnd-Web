"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    
    if (sessionId) {
      router.push(`/orders?session_id=${sessionId}`);
    } else {
      router.push('/orders');
    }
  }, [router]);

  if (!isClient) return null; // Don't render on server

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh",
      flexDirection: "column" 
    }}>
      <div className="loading-spinner"></div>
      <p>Payment successful! Redirecting to your orders...</p>
    </div>
  );
}