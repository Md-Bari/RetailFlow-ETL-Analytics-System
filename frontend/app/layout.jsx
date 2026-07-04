import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "RetailFlow ETL Analytics",
  description: "Traceable retail data ingestion and analytics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><Navbar /><main>{children}</main></body>
    </html>
  );
}
