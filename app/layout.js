import "./globals.css";

export const metadata = {
  title: "SettleSmart",
  description: "AI-guided immigration readiness & post-visa setup",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}
