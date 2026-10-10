import type { MetadataRoute } from "next";

import { SITE_URL } from "@/shared/config/site";

/** robots.txt: приватные разделы закрыты от индексации, ссылка на sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/orders", "/checkout", "/cart", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
