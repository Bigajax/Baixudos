import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://baixudospr.com.br/sitemap.xml", // [PLACEHOLDER] domínio real
  };
}
