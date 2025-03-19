"use client";
import { useState, useEffect } from "react";
import ProductFilter from "./components/checkbox";
import DownloadCatalogButton from "./components/pdf";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/getCatalog");
      const data = await response.json();
      setProducts(data);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Catálogo Digital</h1>
      {products.length > 0 ? (
        <>
          <ProductFilter products={products} logoUrl="/logo.png" />
        </>
      ) : (
        <p>Cargando catálogo...</p>
      )}
    </div>
  );
}
