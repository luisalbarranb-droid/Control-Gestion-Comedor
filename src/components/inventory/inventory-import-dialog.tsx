'use client';

import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { UploadCloud, FileSpreadsheet, X, Download, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface InventoryImportDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onImport: (data: any[]) => void;
}

// Columnas mínimas para que la importación funcione
const requiredColumns = ['codigo', 'nombre', 'categoriaId', 'cantidad', 'unidadReceta', 'stockMinimo'];

// Todas las columnas posibles para la validación y la plantilla
const allColumns = ['codigo', 'nombre', 'descripcion', 'categoriaId', 'subCategoria', 'cantidad', 'unidadReceta', 'unidadCompra', 'factorConversion', 'stockMinimo', 'proveedor', 'costoUnitario'];

export function InventoryImportDialog({ isOpen, onOpenChange, onImport }: InventoryImportDialogProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setParsedData([]);
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      // Validar extensiones
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        parseFile(selectedFile);
      } else {
        setError('Tipo de archivo no válido. Por favor, sube un archivo de Excel (.xlsx o .xls).');
        setFile(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
  });

  const parseFile = (fileToParse: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0]; // Leer la primera hoja
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (json.length === 0) {
            setError('El archivo está vacío o no tiene el formato correcto.');
            return;
        }

        // Validar columnas requeridas
        const headers = Object.keys(json[0] as object);
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));

        if (missingColumns.length > 0) {
            setError(`Faltan las columnas requeridas: ${missingColumns.join(', ')}.`);
            return;
        }

        setParsedData(json);
      } catch (err) {
        console.error(err);
        setError('Hubo un error al leer el archivo Excel.');
        setFile(null);
      }
    };
    reader.onerror = () => {
        setError('No se pudo leer el archivo.');
        setFile(null);
    };
    reader.readAsArrayBuffer(fileToParse);
  };
  
  const handleImportClick = () => {
    if (parsedData.length > 0) {
      onImport(parsedData);
      // Limpiar estado al terminar (opcional, depende de si el padre cierra el modal)
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No hay datos válidos para importar.',
      });
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
    onOpenChange(false);
  }

  // Lógica para descargar la plantilla de Excel
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        codigo: 'CAR-001',
        nombre: 'Ej: Pechuga de Pollo',
        descripcion: 'Ej: Fileteada y sin piel',
        categoriaId: 'carnes',
        subCategoria: 'Aves',
        cantidad: 10,
        unidadReceta: 'kg',
        unidadCompra: 'caja',
        factorConversion: 15,
        stockMinimo: 5,
        proveedor: 'Ej: Avícola Central',
        costoUnitario: 80.50
      },
       {
        codigo: 'VIV-001',
        nombre: 'Ej: Arroz',
        descripcion: 'Grano entero',
        categoriaId: 'viveres',
        subCategoria: 'Granos',
        cantidad: 100,
        unidadReceta: 'kg',
        unidadCompra: 'saco',
        factorConversion: 50,
        stockMinimo: 20,
        proveedor: 'Ej: Distribuidora ABC',
        costoUnitario: 25.00
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');
    
    // Ajustar ancho de columnas para que se vea bonito
    worksheet["!cols"] = allColumns.map(col => ({ wch: col.length + 5 }));

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});
    saveAs(data, 'plantilla_inventario.xlsx');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importación Masiva de Inventario</DialogTitle>
          <DialogDescription>
            Carga un archivo Excel para agregar múltiples productos a la vez.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
            {/* Área de Dropzone */}
            {!file ? (
                <div 
                    {...getRootProps()} 
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:bg-muted'}`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Haz clic para subir</span> o arrastra el archivo aquí
                        </p>
                        <p className="text-xs text-muted-foreground">Formatos aceptados: .xlsx, .xls</p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between p-4 rounded-md border bg-muted/30">
                    <div className="flex items-center">
                        <FileSpreadsheet className="w-8 h-8 mr-4 text-green-600" />
                        <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { setFile(null); setParsedData([]); setError(null); }}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Mensajes de Error */}
            {error && (
                <div className="flex items-center p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                </div>
            )}
            
            {/* Instrucciones y Botón de Descarga */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border">
                <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">Instrucciones</h4>
                    <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="h-8 gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Download className="h-3.5 w-3.5" />
                        Descargar Plantilla Excel
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    El archivo debe tener exactamente los encabezados mostrados abajo. Puedes descargar la plantilla para guiarte.
                </p>
                <div className="flex flex-wrap gap-1">
                    {requiredColumns.map(col => (
                        <span key={col} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-200 text-slate-700 font-semibold border border-slate-300">
                            {col}*
                        </span>
                    ))}
                    {allColumns.filter(c => !requiredColumns.includes(c)).map(col => (
                         <span key={col} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-500 border border-slate-200">
                            {col}
                        </span>
                    ))}
                </div>
            </div>

            {/* Vista Previa de Datos */}
            {parsedData.length > 0 && (
                <div className="border rounded-md">
                    <div className="p-2 bg-muted border-b text-xs font-medium text-muted-foreground">
                        Vista previa ({parsedData.length} registros encontrados)
                    </div>
                    <div className="max-h-48 overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {Object.keys(parsedData[0]).map(key => (
                                        <TableHead key={key} className="h-8 text-xs whitespace-nowrap">{key}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parsedData.slice(0, 5).map((row, i) => (
                                    <TableRow key={i}>
                                        {Object.values(row).map((val: any, j) => (
                                            <TableCell key={j} className="py-2 text-xs whitespace-nowrap">{String(val)}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {parsedData.length > 5 && (
                        <div className="p-2 text-center text-xs text-muted-foreground bg-muted/20 border-t">
                            ... y {parsedData.length - 5} más
                        </div>
                    )}
                </div>
            )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button type="button" onClick={handleImportClick} disabled={parsedData.length === 0 || !!error}>
            <UploadCloud className="mr-2 h-4 w-4" />
            Importar Datos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
