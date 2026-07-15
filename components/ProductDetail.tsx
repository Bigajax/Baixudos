"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/content/products";
import { site } from "@/content/site";
import { formatPrice } from "@/lib/format";
import { waLink } from "@/lib/wa";

const MAX_QTY_PER_ORDER = 10;

export default function ProductDetail({ product }: { product: Product }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [sizeIndex, setSizeIndex] = useState<number | null>(
    product.sizes.length === 1 ? 0 : null,
  );
  const [qty, setQty] = useState(1);

  const selected = sizeIndex !== null ? product.sizes[sizeIndex] : null;
  const maxQty = selected ? Math.min(selected.stock, MAX_QTY_PER_ORDER) : 1;
  const canBuy = product.priceCents !== null && selected !== null && selected.stock > 0;
  const total = product.priceCents !== null ? product.priceCents * qty : null;

  const pickSize = (i: number) => {
    setSizeIndex(i);
    setQty((q) => Math.min(q, Math.min(product.sizes[i].stock, MAX_QTY_PER_ORDER)) || 1);
  };

  const order = () => {
    if (!canBuy || !selected) return;
    const message = [
      `🛒 PEDIDO — Loja Baixudos.PR`,
      "",
      `Produto: ${product.name}`,
      `Tamanho: ${selected.size}`,
      `Quantidade: ${qty}`,
      `Total: ${formatPrice(total!)}`,
      "",
      "Aguardo as instruções de pagamento e entrega!",
    ].join("\n");

    const href =
      site.shopMode === "checkout" && product.checkoutUrl
        ? product.checkoutUrl
        : waLink(message);
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
      {/* Galeria */}
      <div>
        <div className="relative aspect-square overflow-hidden border border-line bg-graphite">
          <Image
            key={product.images[imgIndex]}
            src={product.images[imgIndex]}
            alt={`${product.name} — imagem ${imgIndex + 1}`}
            fill
            priority
            quality={90}
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
          {product.limited && (
            <span className="display absolute left-4 top-4 bg-signal px-3 py-1.5 text-sm tracking-wider text-white">
              Edição limitada
            </span>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="mt-3 flex gap-3">
            {product.images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setImgIndex(i)}
                aria-label={`Ver imagem ${i + 1}`}
                className={`relative aspect-square w-20 overflow-hidden border transition-colors ${
                  i === imgIndex ? "border-signal" : "border-line hover:border-smoke"
                }`}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Informações e compra */}
      <div>
        <p className="eyebrow">Produto oficial Baixudos.PR</p>
        <h1 className="display mt-3 text-3xl text-white sm:text-4xl">{product.name}</h1>

        <p className="mt-4 text-3xl font-bold text-signal">
          {product.priceCents !== null ? formatPrice(product.priceCents) : "Preço sob consulta"}
          {product.demo && (
            <span className="ml-3 align-middle text-[10px] font-semibold uppercase tracking-wider text-smoke/70">
              valor de demonstração
            </span>
          )}
        </p>

        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-smoke">{product.description}</p>

        {/* Tamanhos */}
        <div className="mt-7">
          <p className="field-label">Tamanho</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s, i) => {
              const out = s.stock === 0;
              const active = sizeIndex === i;
              return (
                <button
                  key={s.size}
                  type="button"
                  disabled={out}
                  onClick={() => pickSize(i)}
                  aria-pressed={active}
                  className={`min-w-[52px] border px-4 py-3 text-sm font-bold uppercase transition-colors ${
                    active
                      ? "border-signal bg-signal text-white"
                      : out
                        ? "cursor-not-allowed border-line text-smoke/40 line-through"
                        : "border-line text-smoke hover:border-signal hover:text-white"
                  }`}
                >
                  {s.size}
                </button>
              );
            })}
          </div>
          {selected && (
            <p className={`mt-2 text-xs ${selected.stock <= 3 ? "text-signal" : "text-smoke/70"}`}>
              {selected.stock === 0
                ? "Esgotado"
                : selected.stock <= 3
                  ? `Últimas ${selected.stock} unidades!`
                  : `${selected.stock} em estoque`}
            </p>
          )}
          {!selected && <p className="mt-2 text-xs text-smoke/70">Escolha um tamanho</p>}
        </div>

        {/* Quantidade + total */}
        <div className="mt-6 flex items-end gap-6">
          <div>
            <p className="field-label">Quantidade</p>
            <div className="flex items-center border border-line">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Diminuir quantidade"
                className="flex h-12 w-12 items-center justify-center text-lg text-smoke transition-colors hover:bg-graphite hover:text-white"
              >
                −
              </button>
              <span className="w-10 text-center text-base font-bold text-white tabular-nums" aria-live="polite">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                aria-label="Aumentar quantidade"
                className="flex h-12 w-12 items-center justify-center text-lg text-smoke transition-colors hover:bg-graphite hover:text-white"
              >
                +
              </button>
            </div>
          </div>
          {total !== null && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-smoke">Total</p>
              <p className="display text-3xl text-white tabular-nums">{formatPrice(total)}</p>
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={!canBuy}
          onClick={order}
          className="mt-7 w-full bg-signal py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-signal-dark disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-12"
          style={{ clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)" }}
        >
          {canBuy ? "Fazer pedido" : selected ? "Esgotado" : "Escolha um tamanho"}
        </button>

        <p className="mt-4 max-w-md text-xs leading-relaxed text-smoke/70">
          O pedido é confirmado pelo WhatsApp oficial da organização, com instruções de pagamento
          e entrega.
          {product.demo && " Preço e estoque exibidos são de demonstração até o lançamento oficial."}
        </p>
      </div>
    </div>
  );
}
