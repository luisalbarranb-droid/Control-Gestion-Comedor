import { useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/types';
import QRCode from 'react-qr-code';
import { Printer, Utensils } from 'lucide-react';

interface EmployeeIdCardDialogProps {
    employee: User;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EmployeeIdCardDialog({ employee, isOpen, onOpenChange }: EmployeeIdCardDialogProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        // Simple and robust printing: use window.print() and CSS media queries
        // instead of DOM manipulation which can break React state
        window.print();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm bg-white p-0 overflow-hidden">
                <div className="flex flex-col h-full bg-slate-50">
                    {/* Estilos para impresión */}
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media print {
                            body * {
                                visibility: hidden !important;
                            }
                            #id-card-to-print, #id-card-to-print * {
                                visibility: visible !important;
                            }
                            #id-card-to-print {
                                position: fixed !important;
                                left: 50% !important;
                                top: 50% !important;
                                transform: translate(-50%, -50%) !important;
                                width: 53.98mm !important;
                                height: 85.6mm !important;
                                border: none !important;
                                box-shadow: none !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                z-index: 9999 !important;
                            }
                            .no-print {
                                display: none !important;
                            }
                            @page {
                                size: auto;
                                margin: 0;
                            }
                        }
                    `}} />

                    {/* Header / Actions */}
                    <div className="p-4 flex justify-between items-center border-b bg-white no-print">
                        <h2 className="text-lg font-semibold">Carnet Digital</h2>
                        <div className="flex gap-2">
                            <Button onClick={handlePrint} size="sm" className="gap-2">
                                <Printer className="h-4 w-4" />
                                Imprimir
                            </Button>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="p-8 flex justify-center items-center flex-grow bg-slate-100/50">
                        {/* ID Card Container - Aspect Ratio of a standard ID card (CR80: 53.98 x 85.60 mm) */}
                        <div
                            id="id-card-to-print"
                            ref={printRef}
                            className="w-[240px] h-[380px] bg-white rounded-xl shadow-lg relative overflow-hidden flex flex-col border border-slate-200"
                        >

                            {/* Background Design Elements */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-[#1e293b]"></div>
                            <div className="absolute bottom-0 left-0 w-full h-2 bg-[#1e293b]"></div>
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-slate-100 rounded-full z-0 opacity-50"></div>

                            {/* Top Section: Photo & Personal Info */}
                            <div className="h-[70%] p-5 z-10 flex flex-col items-center text-center relative">
                                {/* Header: Logo and Company Name */}
                                <div className="flex items-center justify-center gap-2 mb-4 w-full">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white flex-shrink-0">
                                        <Utensils className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 leading-tight">Control</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900 leading-tight">Comedor</span>
                                    </div>
                                </div>

                                {/* Photo */}
                                <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-slate-100 bg-slate-50 flex-shrink-0 shadow-sm mb-3">
                                    {employee.avatarUrl ? (
                                        <img src={employee.avatarUrl} alt={employee.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
                                            <span className="text-xs">Sin Foto</span>
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex flex-col items-center">
                                    <h3 className="text-base font-bold text-slate-900 leading-tight uppercase line-clamp-2 mb-1">{employee.name}</h3>
                                    <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wide mb-3">{employee.position || employee.role}</p>

                                    <div className="space-y-1">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase">C.I.</span>
                                            <span className="text-[11px] font-mono text-slate-700">{employee.cedula}</span>
                                        </div>
                                        {employee.rif && (
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase">RIF</span>
                                                <span className="text-[11px] font-mono text-slate-700">{employee.rif}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Section: QR Code */}
                            <div className="h-[30%] bg-slate-50 flex flex-col items-center justify-center border-t border-slate-100 z-10 p-4">
                                <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <QRCode value={employee.id} size={70} level="M" />
                                </div>
                                <p className="text-[9px] text-slate-400 mt-2 text-center font-mono tracking-tighter">{employee.id}</p>
                            </div>

                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
