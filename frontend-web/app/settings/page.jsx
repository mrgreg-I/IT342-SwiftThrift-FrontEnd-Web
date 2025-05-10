"use client";

import { useRouter } from "next/navigation";
import "../styles.css"; // Adjust the path based on the actual location of styles.css

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="container">
      <h1>Settings Page</h1>
      <button onClick={() => router.push("/")}>Go to Home</button>
    </div>
  );
}
