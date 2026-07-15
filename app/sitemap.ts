import type { MetadataRoute } from "next";
import { allEvents } from "@/content/events";

const BASE = "https://baixudospr.com.br"; // [PLACEHOLDER] trocar pelo domínio real

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/eventos",
    "/inscrever-veiculo",
    "/loja",
    "/campanhas",
    "/parceiros",
    "/sobre",
    "/contato",
  ].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const eventRoutes = allEvents.map((e) => ({
    url: `${BASE}/eventos/${e.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...eventRoutes];
}
