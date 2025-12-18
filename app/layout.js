import "./globals.css";

export const metadata = {
  title: "Mandalay Morning Star Meal Plan",
  description:
    "Weekly Burmese meal plan subscriptions for Los Angeles, Orange County, and Irvine.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.08),_transparent_35%),_radial-gradient(circle_at_center,_rgba(56,189,248,0.05),_transparent_35%)] min-h-screen">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
