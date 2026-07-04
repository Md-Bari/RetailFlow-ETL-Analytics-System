import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "RetailFlow ETL Analytics",
  description: "Automatic profiling and analytics for arbitrary CSV datasets.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><Navbar /><main>{children}</main></body>
    </html>
  );
}
