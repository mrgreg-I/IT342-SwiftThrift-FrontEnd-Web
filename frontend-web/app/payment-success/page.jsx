"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic'; // Add this line

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const sessionId = searchParams?.get('session_id');
    
    if (sessionId) {
      router.push(`/orders?session_id=${sessionId}`);
    } else {
      router.push('/orders');
    }
  }, [router, searchParams]);

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