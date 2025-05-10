export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <head>
          <title>ShopEasy - Online Shopping</title>
          <meta name="description" content="Shop online for the best products" />
        </head>
        <body>{children}</body>
      </html>
    )
  }
  