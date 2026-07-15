import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/content/products";
import { totalStock } from "@/content/products";
import { formatPrice } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const stock = totalStock(product);
  const soldOut = stock === 0;

  return (
    <Link
      href={`/loja/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden border border-line bg-panel transition-colors duration-300 hover:border-signal/70"
    >
      <div className="relative aspect-square overflow-hidden bg-graphite">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 z-10 h-[3px] w-0 bg-signal transition-all duration-300 group-hover:w-full"
        />
        {product.limited && (
          <span className="display absolute left-3 top-3 bg-signal px-2.5 py-1 text-xs tracking-wider text-white">
            Edição limitada
          </span>
        )}
        {soldOut && (
          <span className="absolute right-3 top-3 border border-line bg-night/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-smoke">
            Esgotado
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[15px] font-semibold leading-snug text-white">{product.shortName}</h3>
        <p className="mt-1 text-lg font-bold text-signal">
          {product.priceCents !== null ? formatPrice(product.priceCents) : "Sob consulta"}
        </p>
        <p className="mt-0.5 text-xs text-smoke/70">
          {product.sizes.length > 1
            ? product.sizes.map((s) => s.size).join(" · ")
            : "Tamanho único"}
        </p>
        <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-smoke transition-colors group-hover:text-signal">
          Ver produto <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
