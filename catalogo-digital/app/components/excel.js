import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function CatalogUploader({ setProducts }) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = () => {
      const binaryStr = reader.result;
      const wb = XLSX.read(binaryStr, { type: 'binary' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      setProducts(data);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
    </div>
  );
}
