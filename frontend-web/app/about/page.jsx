"use client";

import { useRouter } from "next/navigation";
import "../styles.css";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="container">
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
            <a onClick={() => router.push("/cart")}>Cart</a>
          </li>
          <li>
            <a onClick={() => router.push("/orders")}>Orders</a>
          </li>
          <li>
            <a className="active">About Us</a>
          </li>
        </ul>
        <div className="auth-links">
          <button onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
          }} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="page-header">
        <h1>About SwiftThrift</h1>
        <p>Learn more about our company and mission</p>
      </div>

      <div className="about-content">
        <section className="mission-section">
          <h2>Our Mission</h2>
          <p>
            At SwiftThrift, we believe in making quality products accessible to everyone. 
            Our mission is to provide a platform where buyers can find great deals on a wide 
            range of products while sellers can reach a broader audience.
          </p>
        </section>

        <section className="story-section">
          <h2>Our Story</h2>
          <p>
            SwiftThrift was founded in 2023 by a group of passionate entrepreneurs who saw 
            the need for a better online marketplace experience. What started as a small 
            project has grown into a thriving platform connecting thousands of buyers and sellers.
          </p>
        </section>

        <section className="values-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Quality</h3>
              <p>We ensure all products on our platform meet high standards of quality.</p>
            </div>
            <div className="value-card">
              <h3>Accessibility</h3>
              <p>Making great products available to everyone at competitive prices.</p>
            </div>
            <div className="value-card">
              <h3>Trust</h3>
              <p>Building a safe and secure platform for all our users.</p>
            </div>
            <div className="value-card">
              <h3>Innovation</h3>
              <p>Constantly improving our platform to enhance user experience.</p>
            </div>
          </div>
        </section>

        <section className="team-section">
          <h2>Our Team</h2>
          <p>
            We're a diverse team of developers, designers, and product specialists 
            working together to create the best possible online shopping experience.
          </p>
          <div className="team-members">
            {/* You can add team member cards here if desired */}
          </div>
        </section>
      </div>

      <footer className="footer">
        <p>&copy; 2025 Swiftthrift. All rights reserved.</p>
      </footer>
    </div>
  );
}
