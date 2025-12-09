'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function MenuDialog({ isOpen, onOpenChange, menu, setEditingMenu, currentWeekStart }: any) {
  const handleClose = () => {
    onOpenChange(false);
    if (setEditingMenu) {
        setEditingMenu(null);
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{menu ? 'Editar Menú' : 'Crear Nuevo Menú'}</DialogTitle>
           <DialogDescription>
            {/* Aquí puedes añadir una descripción si es necesario */}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="text-center p-4 text-muted-foreground">
            <p>Aquí irá el formulario para gestionar los platillos, ingredientes y horarios del menú.</p>
            <p className="text-xs mt-2">(Componente en desarrollo)</p>
          </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
