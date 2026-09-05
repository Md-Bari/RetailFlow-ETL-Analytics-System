import "./globals.css";

export const metadata = {
  title: "RetailFlow ETL Analytics",
  description: "Automatic profiling and analytics for arbitrary CSV datasets.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><main>{children}</main></body>
    </html>
  );
}
