import React, { useEffect, useMemo, useState } from "react";

const mockProducts = [
  {
    id: 1,
    title: "Гидронасос Komatsu PC200-7",
    category: "Гидравлика",
    brand: "Komatsu",
    machineModel: "PC200-7",
    partNumber: "708-2L-00300",
    compatibility: "PC200-7 / PC210-7",
    priceRub: 1280000,
    delivery: "С учетом доставки до Москвы",
    description:
      "Гидравлический насос для экскаваторов Komatsu. Подбор по модели техники и номеру детали.",
  },
  {
    id: 2,
    title: "Двигатель CAT C7",
    category: "Двигатели",
    brand: "CAT",
    machineModel: "320D",
    partNumber: "CAT-C7-320D",
    compatibility: "CAT 320D / 323D",
    priceRub: 2450000,
    delivery: "С учетом доставки до Москвы",
    description:
      "Дизельный двигатель после восстановления. Фото и видеоотчет перед отправкой.",
  },
  {
    id: 3,
    title: "Бортовой редуктор Hitachi ZX330",
    category: "Бортовые редукторы",
    brand: "Hitachi",
    machineModel: "ZX330",
    partNumber: "9281920",
    compatibility: "ZX330 / ZX350 / ZX360",
    priceRub: 890000,
    delivery: "С учетом доставки до Москвы",
    description:
      "Бортовой редуктор для экскаваторов Hitachi. Возможен подбор аналога.",
  },
];

const categories = ["Все", "Двигатели", "Гидравлика", "Бортовые редукторы"];

function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

function getWebApp() {
  return window?.WebApp || null;
}

export default function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [statusText, setStatusText] = useState("MAX Bridge не обнаружен");
  const [requestResult, setRequestResult] = useState("");

  useEffect(() => {
    const webApp = getWebApp();

    if (webApp?.ready) webApp.ready();
    if (webApp?.expand) webApp.expand();

    if (webApp) {
      setStatusText("MAX Bridge подключен");
      console.log("MAX WebApp detected", webApp);
      console.log("initDataUnsafe:", webApp?.initDataUnsafe || null);
    } else {
      setStatusText("Открыто вне MAX");
      console.log("window.WebApp not found");
    }
  }, []);

  useEffect(() => {
    const webApp = getWebApp();
    if (!webApp?.BackButton) return;

    if (selectedProduct) {
      const handleBack = () => setSelectedProduct(null);

      webApp.BackButton.show();
      webApp.BackButton.onClick(handleBack);

      return () => {
        webApp.BackButton.offClick(handleBack);
        webApp.BackButton.hide();
      };
    }

    webApp.BackButton.hide();
  }, [selectedProduct]);

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((item) => {
      const matchesCategory = category === "Все" || item.category === category;
      const q = search.trim().toLowerCase();

      const haystack = [
        item.title,
        item.category,
        item.brand,
        item.machineModel,
        item.partNumber,
        item.compatibility,
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && (!q || haystack.includes(q));
    });
  }, [search, category]);

  function handleOpenProduct(product) {
    setSelectedProduct(product);
    setRequestResult("");
  }

  async function handleOrder(product) {
    const webApp = getWebApp();

    const payload = {
      action: "product_request",
      productId: product.id,
      title: product.title,
      category: product.category,
      brand: product.brand,
      machineModel: product.machineModel,
      partNumber: product.partNumber,
      priceRub: product.priceRub,
      delivery: product.delivery,
      source: "webapp_catalog",
      user: webApp?.initDataUnsafe?.user || null,
    };

    try {
      console.log("Sending payload:", payload);

      if (webApp?.sendData) {
        webApp.sendData(JSON.stringify(payload));
      }

      if (webApp?.requestContact) {
        try {
          webApp.requestContact();
        } catch (contactError) {
          console.error("requestContact error:", contactError);
        }
      }

      setRequestResult(
        `Заявка по товару "${product.title}" отправлена. Пользователю предложено поделиться номером.`
      );

      alert("Заявка отправлена. Пользователю предложено поделиться номером.");
    } catch (error) {
      console.error("Ошибка при отправке заявки:", error);
      setRequestResult("Ошибка при отправке заявки.");
      alert("Ошибка при отправке заявки");
    }
  }

  if (selectedProduct) {
    return (
      <div style={styles.page}>
        <div style={styles.headerRow}>
          <button style={styles.backButton} onClick={() => setSelectedProduct(null)}>
            ← Назад
          </button>
          <div style={styles.status}>{statusText}</div>
        </div>

        {requestResult && <div style={styles.resultBox}>{requestResult}</div>}

        <h1 style={styles.title}>{selectedProduct.title}</h1>

        <div style={styles.detailCard}>
          <div style={styles.detailGrid}>
            <div>
              <strong>Категория:</strong> {selectedProduct.category}
            </div>
            <div>
              <strong>Бренд:</strong> {selectedProduct.brand}
            </div>
            <div>
              <strong>Модель:</strong> {selectedProduct.machineModel}
            </div>
            <div>
              <strong>Артикул:</strong> {selectedProduct.partNumber}
            </div>
            <div>
              <strong>Совместимость:</strong> {selectedProduct.compatibility}
            </div>
            <div>
              <strong>Доставка:</strong> {selectedProduct.delivery}
            </div>
          </div>

          <div style={styles.priceBox}>{formatPrice(selectedProduct.priceRub)}</div>

          <p style={styles.description}>{selectedProduct.description}</p>

          <div style={styles.actionRow}>
            <button
              style={styles.primaryButton}
              onClick={() => handleOrder(selectedProduct)}
            >
              Оставить заявку
            </button>
            <button
              style={styles.secondaryButton}
              onClick={() => setSelectedProduct(null)}
            >
              Вернуться в каталог
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Richtone каталог</h1>
          <div style={styles.subtitle}>
            Запчасти для спецтехники с ценами в рублях и доставкой до Москвы
          </div>
        </div>
        <div style={styles.status}>{statusText}</div>
      </div>

      {requestResult && <div style={styles.resultBox}>{requestResult}</div>}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск по номеру детали, бренду, модели"
        style={styles.input}
      />

      <div style={styles.filterRow}>
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            style={{
              ...styles.filterButton,
              ...(category === item ? styles.filterButtonActive : {}),
            }}
          >
            {item}
          </button>
        ))}
      </div>

      <div style={styles.list}>
        {filteredProducts.map((p) => (
          <div key={p.id} style={styles.card}>
            <div style={styles.cardTitle}>{p.title}</div>
            <div style={styles.cardMeta}>
              {p.brand} • {p.machineModel}
            </div>
            <div style={styles.cardMeta}>Артикул: {p.partNumber}</div>
            <div style={styles.price}>{formatPrice(p.priceRub)}</div>
            <div style={styles.delivery}>🚚 {p.delivery}</div>

            <div style={styles.actionRow}>
              <button style={styles.primaryButton} onClick={() => handleOrder(p)}>
                Оставить заявку
              </button>
              <button
                style={styles.secondaryButton}
                onClick={() => handleOpenProduct(p)}
              >
                Подробнее
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div style={styles.emptyState}>
          Ничего не найдено. Измени поиск или категорию.
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: 16,
    fontFamily: "Arial, sans-serif",
    background: "#f6f7f9",
    minHeight: "100vh",
    color: "#111827",
    boxSizing: "border-box",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#6b7280",
  },
  status: {
    fontSize: 12,
    color: "#6b7280",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 999,
    padding: "6px 10px",
  },
  resultBox: {
    marginBottom: 16,
    background: "#fff7ed",
    border: "1px solid #fdba74",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#9a3412",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    fontSize: 15,
    boxSizing: "border-box",
    marginBottom: 14,
  },
  filterRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  filterButton: {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    cursor: "pointer",
    fontSize: 14,
  },
  filterButtonActive: {
    background: "#111827",
    color: "#ffffff",
    borderColor: "#111827",
  },
  list: {
    display: "grid",
    gap: 12,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  price: {
    fontSize: 26,
    fontWeight: 700,
    marginTop: 10,
    marginBottom: 6,
  },
  delivery: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 14,
  },
  actionRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "11px 14px",
    borderRadius: 12,
    border: "none",
    background: "#dc2626",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryButton: {
    padding: "11px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    fontWeight: 600,
  },
  backButton: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    cursor: "pointer",
    fontWeight: 600,
  },
  detailCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 16,
  },
  detailGrid: {
    display: "grid",
    gap: 8,
    fontSize: 14,
    color: "#374151",
    marginBottom: 16,
  },
  priceBox: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 14,
  },
  description: {
    fontSize: 14,
    lineHeight: 1.5,
    color: "#374151",
    marginBottom: 16,
  },
  emptyState: {
    marginTop: 16,
    background: "#ffffff",
    border: "1px dashed #d1d5db",
    borderRadius: 16,
    padding: 20,
    color: "#6b7280",
  },
};