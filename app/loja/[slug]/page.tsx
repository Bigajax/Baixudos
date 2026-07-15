import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products, getProduct } from "@/content/products";
import ProductDetail from "@/components/ProductDetail";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/loja/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [{ url: product.images[0] }] },
  };
}

export default async function ProdutoPage(props: PageProps<"/loja/[slug]">) {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images[0],
    brand: { "@type": "Brand", name: "Baixudos.PR" },
    ...(product.priceCents !== null
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "BRL",
            price: (product.priceCents / 100).toFixed(2),
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-[1360px] px-4 pb-20 pt-28 sm:px-6 md:pb-28 md:pt-36">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

      <nav aria-label="Navegação da loja" className="mb-8 text-xs uppercase tracking-[0.16em] text-smoke">
        <Link href="/loja" className="transition-colors hover:text-white">
          ← Voltar para a loja
        </Link>
      </nav>

      <ProductDetail product={product} />

      {related.length > 0 && (
        <section className="mt-20">
          <Reveal>
            <h2 className="eyebrow mb-6">Você também pode curtir</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.05}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
