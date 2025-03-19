import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'datos', 'catalogo.xlsx');
    if (!fs.existsSync(filePath)) {
      return new Response(JSON.stringify({ error: 'El archivo catalogo.xlsx no existe en public/datos/' }), { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    let data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Limpiar las claves de las columnas (Quitar saltos de línea y espacios innecesarios)
    data = data.map((item) => {
      const cleanedItem = {};
      Object.keys(item).forEach((key) => {
        const cleanedKey = key.replace(/\r\n|\n|\r/g, '').trim(); // Limpiar los saltos de línea y espacios
        cleanedItem[cleanedKey] = item[key];
      });
      return cleanedItem;
    });


    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al leer el archivo' }), { status: 500 });
  }
}
