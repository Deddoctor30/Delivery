import type { Metadata } from "next";
import { AboutPage } from "@/views/about";

export const metadata: Metadata = {
  title: "О нас — Delivery",
};

export default function AboutRoute() {
  return <AboutPage />;
}
