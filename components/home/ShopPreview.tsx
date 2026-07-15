import Link from "next/link";
import { products } from "@/content/products";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

export default function ShopPreview() {
  return (
    <section className="mx-auto max-w-[1360px] px-4 py-20 sm:px-6 md:py-28">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Loja oficial</p>
            <h2 className="display mt-4 text-4xl text-white sm:text-5xl md:text-6xl">
              Vista a <span className="slash-mark">cultura.</span>
            </h2>
          </div>
          <Link
            href="/loja"
            className="text-sm font-bold uppercase tracking-[0.12em] text-signal transition-colors hover:text-white"
          >
            Ver loja completa →
          </Link>
        </div>
      </Reveal>

      <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.slice(0, 4).map((p, i) => (
          <Reveal key={p.slug} delay={Math.min(i * 0.06, 0.24)}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
