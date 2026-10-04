import "./globals.css";

export const metadata = {
  title: "MindCare AI – Intelligent Mental Health Assessment Platform",
  description: "AI-Powered Evidence-Based Mental Health Assessment Platform featuring SHAP explainability, voice evaluation, and HIPAA-compliant patient dashboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F4F7F6] text-slate-900 antialiased min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
