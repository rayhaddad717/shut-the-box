import { Public_Sans } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "Shut the box",
  description: "Shut the box (literally)",
};
export const viewport = {
  themeColor: "#11141a",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={publicSans.className}>{children}</body>
    </html>
  );
}
