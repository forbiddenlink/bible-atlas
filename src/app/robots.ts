import type { MetadataRoute } from "next";

const SITE_URL = "https://bible-atlas-five.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
