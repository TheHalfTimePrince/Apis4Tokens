import { Leftbar } from "@/components/leftbar";
import { Space_Mono, Space_Grotesk } from "next/font/google";
const regularFont = Space_Grotesk({
/**
 * A layout component for the /docs route.
 *
 * @param children - The content to be rendered on the right side of the page.
 * @returns A JSX element containing the Leftbar component and the given children.
 */
  subsets: ["latin"],
  variable: "--font-regular",
  display: "swap",
  weight: "400",
});

const codeFont = Space_Mono({
  subsets: ["latin"],
  variable: "--font-code",
  display: "swap",
  weight: "400",
});

/*************  ✨ Codeium Command ⭐  *************/
/******  61cf59b9-1582-4641-9005-5edab79e69be  *******/export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex justify-center bg-background">
    <div className={`flex items-start px-4 gap-14  font-regular max-w-7xl ${regularFont.variable} ${codeFont.variable} font-regular`} >
      <Leftbar key="leftbar" />
      <div className="flex-[4]">{children}</div>{" "}
    </div>
    </div>
  );
}
