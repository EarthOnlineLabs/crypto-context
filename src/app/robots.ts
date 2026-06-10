import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private/app surfaces — nothing useful for crawlers.
        disallow: ["/api/", "/dashboard", "/dev/"],
      },
    ],
    sitemap: "https://cryptocontext.aiself.site/sitemap.xml",
  };
}
