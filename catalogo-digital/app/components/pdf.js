import { jsPDF } from 'jspdf';

const generateCatalog = (products, logoUrl) => {
  const doc = new jsPDF();
  let y = 10;  // Inicializamos la posición Y para la primera página
  let x = 10;
  const margin = 5; // Margen entre los productos
  const productWidth = 45; // Ancho de la celda del producto para 4 por fila
  const productHeight = 80; // Altura de la celda del producto, más espacio para la imagen
  const maxNameLength = 30; // Longitud máxima para el nombre del producto

  // Función para agregar logo
  const addLogo = () => {
    if (logoUrl) {
      doc.addImage(logoUrl, 'JPEG', 10, 10, 40, 40);  // Ajusta la posición y tamaño del logo
    }
  };

  // Función para agregar un título (solo en la primera página)
  const addTitle = () => {
    doc.setFontSize(14); // Reducimos el tamaño de la fuente del título
    doc.setTextColor('#21b5d5');
    y = 30;  // Después del título, dejamos espacio para los productos
  };

  // Función para agregar un título por marca (hacerlo más llamativo)
  const addBrandTitle = (brand) => {
    doc.setFontSize(16); // Aumentamos el tamaño de la fuente para hacerlo más llamativo
    doc.setFont('helvetica', 'bold'); // Usamos negritas
    doc.setTextColor('#21b5d5'); // Usamos un color más llamativo
    const pageWidth = doc.internal.pageSize.width; // Ancho de la página
    const titleWidth = doc.getTextWidth(brand); // Ancho del título
    const xPosition = pageWidth - titleWidth - 10; // Colocamos el título a la derecha con un margen de 10
    doc.text(brand, xPosition, y);  // Dibuja el título de la marca a la derecha
    y += 10;  // Espacio después del título de la marca
  };

  // Función para agregar un producto en el formato de rejilla (4 por fila)
  const addProduct = (product, index) => {
    // Si se alcanza el límite de 4 productos por fila, pasamos a la siguiente fila
    if (index > 0 && index % 4 === 0) {
      y += productHeight + 5;  // Si se alcanzan 4 productos, pasamos a la siguiente fila
      x = 10;   // Reiniciar la posición X
    }

    // Dibuja una celda para cada producto
    doc.setFontSize(10); // Reducimos el tamaño de la fuente del producto
    doc.setTextColor('#000000');

    // Mostrar la imagen del producto (más estirada)
    const imageUrl = product.LinkFoto;
    if (imageUrl) {
      // Agregar la imagen del producto (se ajusta al tamaño de la celda)
      doc.addImage(imageUrl, 'JPEG', x + 5, y + 5, productWidth - 10, 30); // Imagen estirada
    }

    // Ajuste del texto en nombre (corte de línea para evitar desbordamiento)
    const name = product.NombreArtículo;
    const nameLines = doc.splitTextToSize(name, productWidth - 10); // Corta el nombre si es demasiado largo

    // Agregar el texto dentro del cuadro del producto
    doc.text(nameLines, x + 5, y + 40); // Nombre debajo de la imagen

    // Resaltar el Código de Artículo dentro de la 'card' con el color #21b5d5
    doc.setFontSize(12);  // Mantener tamaño normal
    doc.setFont('helvetica', 'normal'); // Cambiar a fuente normal para el código
    doc.setTextColor('#21b5d5');  // Color #21b5d5 para el código
    doc.text(`Cod: ${product.CódigoArtículo}`, x + 5, y + 60);  // Resaltar código

    x += productWidth + margin;  // Ajusta la posición X para el siguiente producto

    if (y > 240) {
      doc.addPage();
      addLogo();  // Agregar el logo en cada página
      y = 30; // Reiniciar Y en la nueva página para comenzar desde la parte superior
      x = 10; // Reiniciar la posición X en la nueva página para comenzar desde el principio
    }
  };

  // Agregar el logo y título en la primera página
  addLogo();
  addTitle();

  let currentBrand = null;

  // Agregar los productos en formato de rejilla por marca
  products.forEach((product, index) => {
    // Si la marca del producto cambia, agregamos un nuevo título para la marca
    if (product.Marcas !== currentBrand) {
      // Si estamos agregando un título para una nueva marca, se agrega una nueva página
      if (index > 0) {
        doc.addPage();  // Forzamos el cambio de página cuando cambia la marca
        addLogo();  // Agregar el logo en la nueva página
        addTitle(); // Agregar el título en la nueva página

        // Reiniciar la posición Y cuando cambiamos de página
        y = 30; // Reiniciamos Y para que la nueva marca comience desde la parte superior
        x = 10; // Reiniciar la posición X
      }
      
      // Reiniciar las posiciones para la nueva marca
      currentBrand = product.Marcas;
      addBrandTitle(currentBrand);  // Agregar el título de la marca
    }

    addProduct(product, index); // Agregar el producto
  });

  // Guardar el archivo PDF
  doc.save('catalogo.pdf');
};

export default function DownloadCatalogButton({ filteredProducts, logoUrl }) {
  return (
    <button onClick={() => generateCatalog(filteredProducts, logoUrl)}>
      Descargar Catálogo
    </button>
  );
}

