import "./globals.css";

export const metadata = {
  title: "Social Fast Agent",
    description: "AI-powered social media assistant",
    };

    export default function RootLayout({
      children,
      }: {
        children: React.ReactNode;
        }) {
          return (
              <html lang="en">
                    <body>{children}</body>
                        </html>
                          );
                          }