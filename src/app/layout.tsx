import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import ThemeProvider from "@/components/ui/theme/ThemeProvider";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { figtree } from "@/utils/fonts";
import { APP_DESCRIPTION, APP_NAME } from "@/utils/config/variables";
import "../assets/global/index.css";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden bg-black font-sans text-white">
        <AntdRegistry>
          <ThemeProvider>
            <LocaleProvider>{children}</LocaleProvider>
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
