'use client'
import { useState, useEffect } from "react";
import Image from "next/image";
import DownloadCatalogButton from "./pdf";

export default function ProductFilter({ products, logoUrl }) {
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [filterStock, setFilterStock] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  useEffect(() => {
    filterProducts();
  }, [selectedBrands, filterStock, products]);

  // Obtener marcas únicas
  const getUniqueBrands = () => {
    // Asumimos que la columna de marcas en el Excel se llama 'Marcas'
    return Array.from(new Set(products.map((product) => product.Marcas))).sort();
  };

  // Manejo de selección de marcas
  const handleBrandSelect = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Manejo del filtro de stock
  const handleStockChange = () => {
    setFilterStock(!filterStock);
  };

  // Filtrado de productos por marca y stock
  const filterProducts = () => {
    let filtered = products;

    // Filtrado por marcas
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) =>
        selectedBrands.includes(product.Marcas)
      );
    }

    // Filtrado por stock (solo si está activado)
    if (filterStock) {
      filtered = filtered.filter((product) => product.Stock === "Si");
    }

    setFilteredProducts(filtered);
  };

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <Image src={logoUrl} alt="Logo de la Empresa" width={150} height={150} />
      </div>

      {/* Filtro de Marcas */}
      <div className="brand-filter">
        <button onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}>
          {selectedBrands.length > 0
            ? `${selectedBrands.length} Marca(s) Seleccionada(s)`
            : "Seleccionar Marcas"}
        </button>
        {brandDropdownOpen && (
          <div className="brand-dropdown">
            {getUniqueBrands().map((brand, index) => (
              <div key={index} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandSelect(brand)}
                />
                <label>{brand}</label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filtro de Stock */}
      <div className="stock-filter">
        <label>
          <input
            type="checkbox"
            checked={filterStock}
            onChange={handleStockChange}
          />
          Mostrar solo productos con stock
        </label>
      </div>
      <DownloadCatalogButton filteredProducts={filteredProducts} logoUrl="/logo.png" />
      

      <div className="product-list">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.CódigoArtículo} className="product-card">
              <img src={product.LinkFoto} alt={product.NombreArtículo} />
              <h2>{product.NombreArtículo}</h2>
              <p><strong>Código:</strong> {product.CódigoArtículo}</p>
            </div>
          ))
        ) : (
          <p>No hay productos disponibles.</p>
        )}
      </div>
    </div>
  );
}
