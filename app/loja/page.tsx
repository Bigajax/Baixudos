import type { Metadata } from "next";
import { products } from "@/content/products";
import { site } from "@/content/site";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Loja oficial",
  description:
    "Produtos oficiais Baixudos.PR: camisetas, bonés, adesivos e itens de edição limitada da cultura automotiva de Maringá.",
};

export default function LojaPage() {
  return (
    <div className="mx-auto max-w-[1360px] px-4 pb-20 pt-32 sm:px-6 md:pb-28 md:pt-40">
      <Reveal>
        <p className="eyebrow">Loja oficial</p>
        <h1 className="display mt-4 max-w-3xl text-5xl text-white sm:text-6xl md:text-7xl">
          Vista a <span className="slash-mark">cultura.</span>
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-smoke">
          Produtos oficiais da Baixudos.PR.{" "}
          {site.shopMode === "whatsapp"
            ? "Os pedidos são feitos direto pelo WhatsApp da organização."
            : "Compra pelo checkout oficial."}
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {products.map((p, i) => (
          <Reveal key={p.slug} delay={Math.min(i * 0.05, 0.25)}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>

      <p className="mt-10 text-xs leading-relaxed text-smoke/70">
        Preços e estoques exibidos são de demonstração até o lançamento oficial da loja — os
        pedidos são confirmados pelo WhatsApp da organização.
      </p>
    </div>
  );
}
