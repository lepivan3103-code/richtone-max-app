import React, { useEffect, useMemo, useState } from "react";

const mockProducts = [
  {
    id: 1,
    title: "Гидронасос Komatsu PC200-7",
    priceRub: 1280000,
  },
  {
    id: 2,
    title: "Двигатель CAT C7",
    priceRub: 2450000,
  }
];

function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

export default function App() {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const webApp = window?.WebApp;
    if (webApp?.ready) webApp.ready();
    if (webApp?.expand) webApp.expand();
  }, []);

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((item) => {
      const q = search.toLowerCase();
      return item.title.toLowerCase().includes(q);
    });
  }, [search]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Richtone каталог</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск"
        style={{ padding: 10, width: "100%", marginBottom: 20 }}
      />

      {filteredProducts.map((p) => (
        <div key={p.id} style={{ border: "1px solid #ddd", padding: 15, marginBottom: 10 }}>
          <div style={{ fontWeight: "bold" }}>{p.title}</div>
          <div>{formatPrice(p.priceRub)}</div>
          <button style={{ marginTop: 10 }}>Оставить заявку</button>
        </div>
      ))}
    </div>
  );
}
