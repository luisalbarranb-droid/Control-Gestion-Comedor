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
import { UploadCloud, File, X, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { MenuImportRow, MealType } from '@/lib/types';

interface MenuImportDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onImport: (data: MenuImportRow[]) => void;
}

const requiredColumns: (keyof MenuImportRow)[] = ['date', 'pax', 'time', 'itemName', 'itemCategory', 'ingredientName', 'ingredientQuantity', 'ingredientWasteFactor'];
const mealTypes: MealType[] = ['desayuno', 'almuerzo', 'cena', 'merienda', 'especial', 'otro'];

export function MenuImportDialog({ isOpen, onOpenChange, onImport }: MenuImportDialogProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<MenuImportRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setParsedData([]);
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type.includes('spreadsheetml') || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
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
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<MenuImportRow>(worksheet);

        if (json.length === 0) {
            setError('El archivo está vacío o no tiene el formato correcto.');
            return;
        }

        const headers = Object.keys(json[0] as object) as (keyof MenuImportRow)[];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));

        if (missingColumns.length > 0) {
            setError(`Faltan las siguientes columnas requeridas: ${missingColumns.join(', ')}.`);
            return;
        }

        setParsedData(json);
      } catch (err) {
        setError('Hubo un error al procesar el archivo. Asegúrate de que es un archivo de Excel válido y que las fechas están en un formato correcto.');
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
    } else {
      toast({
        variant: 'destructive',
        title: 'No hay datos para importar',
        description: 'Por favor, selecciona y procesa un archivo primero.',
      });
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
    onOpenChange(false);
  }

  const handleDownloadTemplate = () => {
    const templateData: Partial<Record<keyof MenuImportRow, any>>[] = [
      {
        date: '2024-08-01',
        pax: 150,
        time: 'almuerzo',
        itemName: 'Pollo al Horno',
        itemCategory: 'proteico',
        ingredientName: 'Pechuga de Pollo',
        ingredientQuantity: 0.25,
        ingredientWasteFactor: 0.05
      },
      {
        date: '2024-08-01',
        pax: 150,
        time: 'almuerzo',
        itemName: 'Arroz Blanco',
        itemCategory: 'acompanante1',
        ingredientName: 'Arroz Grano Largo',
        ingredientQuantity: 0.1,
        ingredientWasteFactor: 0
      },
       {
        date: '2024-08-01',
        pax: 80,
        time: 'cena',
        itemName: 'Sopa de Vegetales',
        itemCategory: 'entrada',
        ingredientName: 'Cebolla',
        ingredientQuantity: 0.05,
        ingredientWasteFactor: 0.1
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla Menús');
    
    // Auto-adjust column widths
    worksheet["!cols"] = requiredColumns.map(col => ({ wch: col.length + 5 }));

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});
    saveAs(dataBlob, 'plantilla_menus.xlsx');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Importación Masiva de Menús</DialogTitle>
          <DialogDescription>
            Sube un archivo de Excel para planificar múltiples menús y sus ingredientes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
            {!file ? (
                <div {...getRootProps()} className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'}`}>
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                        </p>
                        <p className="text-xs text-muted-foreground">Archivos de Excel (XLSX, XLS)</p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center p-4 rounded-md border bg-muted/50">
                    <File className="w-6 h-6 mr-3 text-primary" />
                    <span className="font-medium">{file.name}</span>
                    <Button variant="ghost" size="icon" className="ml-auto" onClick={() => { setFile(null); setParsedData([]); setError(null); }}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            
            <div className="space-y-2">
                <h4 className="font-medium">Instrucciones y Plantilla</h4>
                <p className="text-sm text-muted-foreground">
                    Tu archivo debe tener una fila por cada ingrediente de cada plato. La fecha, PAX y tipo de comida se repetirán. Columnas requeridas:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    {requiredColumns.map(col => (
                        <code key={col} className="text-xs font-mono bg-muted text-muted-foreground rounded px-2 py-1">{col}</code>
                    ))}
                     <Button variant="link" size="sm" onClick={handleDownloadTemplate} className="text-sm">
                        <Download className="mr-2 h-4 w-4" />
                        Descargar plantilla
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground pt-2">Valores permitidos para 'time': {mealTypes.join(', ')}.</p>
            </div>

            {parsedData.length > 0 && (
                <div className="max-h-64 overflow-auto border rounded-md">
                    <Table>
                        <TableHeader className="sticky top-0 bg-muted">
                            <TableRow>
                                {Object.keys(parsedData[0]).map(key => <TableHead key={key}>{key}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {parsedData.slice(0, 10).map((row, i) => (
                                <TableRow key={i}>
                                    {Object.values(row).map((val: any, j) => <TableCell key={j}>{String(val instanceof Date ? val.toLocaleDateString() : val)}</TableCell>)}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {parsedData.length > 10 && <p className="text-center text-sm text-muted-foreground p-2">Mostrando 10 de {parsedData.length} filas.</p>}
                </div>
            )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button type="button" onClick={handleImportClick} disabled={parsedData.length === 0 || !!error}>
            Importar {parsedData.length > 0 ? `${parsedData.length} Filas` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
