import type { Metadata } from "next";

import { HomePage } from "@/views/home";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomePage />;
}
