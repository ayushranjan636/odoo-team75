"use client";

import { useState, useMemo } from "react";

type Product = {
  id: number;
  name: string;
  dailyRate: number;
  description: string;
  image: string | null;
  categoryId: number;
  categoryName?: string;
};

type CategoryBucket = {
  id: number;
  name: string;
  slug: string;
  products: Product[];
};

export default function RentalsView({ data }: { data: { categories: CategoryBucket[] } }) {
  const { categories } = data;
  const [active, setActive] = useState(categories[0]?.slug ?? "");

  const activeCat = useMemo(
    () => categories.find(c => c.slug === active) ?? categories[0],
    [categories, active]
  );

  if (!categories.length) {
    return <div style={{ padding: 24 }}>No rental products found.</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ margin: "0 0 16px", fontSize: 28 }}>Rentals</h1>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.slug)}
            aria-pressed={active === cat.slug}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: active === cat.slug ? "#f5f5f5" : "white",
              cursor: "pointer"
            }}
          >
            {cat.name} <span style={{ opacity: 0.6 }}>({cat.products.length})</span>
          </button>
        ))}
      </div>

      <ProductGrid products={activeCat?.products ?? []} />
    </div>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return <div>No products in this category yet.</div>;
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))"
      }}
    >
      {products.map(p => (
        <article
          key={p.id}
          style={{
            border: "1px solid #eee",
            borderRadius: 12,
            overflow: "hidden",
            background: "white"
          }}
        >
          <div style={{ aspectRatio: "4/3", overflow: "hidden", background: "#fafafa" }}>
            {p.image ? (
              // data URL coming straight from the API
              <img
                src={p.image}
                alt={p.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                loading="lazy"
              />
            ) : (
              <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#aaa" }}>
                No image
              </div>
            )}
          </div>
          <div style={{ padding: 12 }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>{p.name}</h3>
            <p style={{ margin: "0 0 8px", fontSize: 14, color: "#666" }}>
              {p.description || "—"}
            </p>
            <div style={{ fontWeight: 600 }}>₹{p.dailyRate} / day</div>
          </div>
        </article>
      ))}
    </div>
  );
}
