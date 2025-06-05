'use client'
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

const compressImage = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 1); // calidad máxima
      resolve(compressedDataUrl);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

const generateCatalog = async (products, logoUrl, setProgress) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = 40;
  let x = 15;
  const margin = 15;
  const productWidth = 45;
  const productHeight = 68;
  const spacing = 12;

  const productsPerRow = Math.floor((pageWidth - margin * 2 + spacing) / (productWidth + spacing));
  let rowCount = 0;
  let productInRow = 0;

  const addHeader = () => {
    doc.setFillColor(27, 141, 165);
    doc.rect(0, 0, pageWidth, 30, 'F');

    if (logoUrl) {
      try {
        doc.addImage(logoUrl, 'JPEG', 10, 5, 20, 20);
      } catch {}
    }

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255);
    doc.text('Catálogo de Productos', pageWidth / 2, 20, { align: 'center' });

    y = 40;
  };

  const addBrandTitle = (brand) => {
    y += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#1b8da5');
    doc.text(brand.toUpperCase(), margin, y);
    y += 5;

    doc.setDrawColor('#1b8da5');
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  };

  const addNewPage = () => {
    doc.addPage();
    addHeader();
    y = 40;
    x = margin;
    rowCount = 0;
    productInRow = 0;
  };

  const addProduct = async (product) => {
    if (productInRow === productsPerRow) {
      y += productHeight + spacing;
      x = margin;
      productInRow = 0;
      rowCount++;
    }

    if (rowCount === 3) {
      addNewPage();
    }

    doc.setDrawColor(180);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, productWidth, productHeight, 3, 3, 'FD');

    if (product.LinkFoto) {
      try {
        const compressedImg = await compressImage(product.LinkFoto, productWidth - 10, 30);
        if (compressedImg) {
          doc.addImage(compressedImg, 'JPEG', x + 5, y + 5, productWidth - 10, 30);
        } else {
          throw new Error('No se pudo comprimir la imagen');
        }
      } catch {
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Sin imagen', x + 10, y + 20);
      }
    } else {
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Sin imagen', x + 10, y + 20);
    }

    if (product.Descuento !== undefined) {
      doc.setFontSize(8);
      doc.setTextColor(220, 53, 69);
      doc.setFont('helvetica', 'bold');
      doc.text(`-${product.Descuento}%`, x + productWidth / 2, y + 38, { align: 'center' });
    }

    if (product.PrecioFinal !== undefined) {
      doc.setFontSize(10);
      doc.setTextColor(40, 167, 69);
      doc.setFont('helvetica', 'bold');
      doc.text(`$${product.PrecioFinal}`, x + productWidth / 2, y + 45, { align: 'center' });
    }

    doc.setFontSize(8);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'normal');
    const centerX = x + productWidth / 2;
    const nameLines = doc.splitTextToSize(product.NombreArtículo, productWidth - 4);
    const lineHeight = 4;
    nameLines.forEach((line, i) => {
      doc.text(line, centerX, y + 50 + i * lineHeight, { align: 'center' });
    });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#1b8da5');
    doc.text(`Cod: ${product.CódigoArtículo}`, centerX, y + productHeight - 5, { align: 'center' });

    x += productWidth + spacing;
    productInRow++;
  };

  addHeader();

  let currentBrand = '';
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    if (product.Marcas !== currentBrand) {
      if (i > 0) {
        doc.addPage();
        addHeader();
        y = 40;
        x = margin;
        rowCount = 0;
        productInRow = 0;
      }
      currentBrand = product.Marcas;
      addBrandTitle(currentBrand);
    }

    await addProduct(product);

    // Actualizamos el progreso (de 0 a 100%)
    setProgress(Math.floor(((i + 1) / products.length) * 100));
  }

  doc.save('catalogo.pdf');
  setProgress(0);
};

export default function DownloadCatalogButton({ filteredProducts, logoUrl }) {
  const [progress, setProgress] = useState(0);

  return (
    <div>
      <button onClick={() => generateCatalog(filteredProducts, logoUrl, setProgress)}>
        Descargar Catálogo
      </button>
      {progress > 0 && (
        <div style={{ marginTop: 10, width: '100%', backgroundColor: '#eee', height: 20, borderRadius: 10 }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#1b8da5',
              borderRadius: 10,
              transition: 'width 0.3s ease',
              textAlign: 'center',
              color: 'white',
              fontWeight: 'bold',
              lineHeight: '20px',
              userSelect: 'none',
            }}
          >
            {progress}%
          </div>
        </div>
      )}
    </div>
  );
}
