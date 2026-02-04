import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/types';
import QRCode from 'react-qr-code';
import { Printer, X } from 'lucide-react';
import Image from 'next/image';

interface EmployeeIdCardDialogProps {
    employee: User;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EmployeeIdCardDialog({ employee, isOpen, onOpenChange }: EmployeeIdCardDialogProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = printRef.current;
        if (printContent) {
            const originalContents = document.body.innerHTML;
            const printContents = printContent.innerHTML;

            // Create a temporary style for printing
            const style = document.createElement('style');
            style.innerHTML = `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 85.6mm;
            height: 53.98mm;
            border: 1px solid #000;
            display: flex;
            flex-direction: row;
            overflow: hidden;
            background-color: white;
            box-sizing: border-box;
          }
          @page {
            size: auto;
            margin: 0;
          }
        }
      `;
            document.head.appendChild(style);

            // Add a specific class to the print content wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'print-area';
            wrapper.innerHTML = printContents;
            document.body.appendChild(wrapper);

            window.print();

            // Cleanup
            document.body.removeChild(wrapper);
            document.head.removeChild(style);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden">
                <div className="flex flex-col h-full bg-slate-50">
                    {/* Header / Actions */}
                    <div className="p-4 flex justify-between items-center border-b bg-white">
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
                        {/* ID Card Container - Aspect Ratio of a standard ID card (CR80: 85.60 × 53.98 mm) */}
                        <div ref={printRef} className="w-[342px] h-[216px] bg-white rounded-xl shadow-lg relative overflow-hidden flex flex-row border border-slate-200">

                            {/* Background Design Elements */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-[#1e293b]"></div>
                            <div className="absolute bottom-0 left-0 w-full h-2 bg-[#1e293b]"></div>
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-slate-100 rounded-full z-0 opacity-50"></div>

                            {/* Left Side: Photo & Personal Info */}
                            <div className="w-[65%] p-4 z-10 flex flex-col justify-between h-full relative">
                                {/* Header: Logo and Company Name */}
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="relative w-8 h-8 flex-shrink-0">
                                        <img src="/logo-carnet.png" alt="Logo" className="object-contain w-full h-full" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 leading-tight">Control</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900 leading-tight">Comedor</span>
                                    </div>
                                </div>

                                {/* Photo and Details */}
                                <div className="flex gap-3 items-center mt-1">
                                    <div className="w-[70px] h-[70px] rounded-md overflow-hidden border-2 border-slate-200 bg-slate-50 flex-shrink-0">
                                        {employee.avatarUrl ? (
                                            <img src={employee.avatarUrl} alt={employee.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
                                                <span className="text-xs">Sin Foto</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <h3 className="text-sm font-bold text-slate-900 leading-tight uppercase line-clamp-2">{employee.name}</h3>
                                        <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">{employee.position || employee.role}</p>
                                        <div className="mt-1.5 space-y-0.5">
                                            <p className="text-[9px] text-slate-600"><span className="font-semibold">C.I.:</span> {employee.cedula}</p>
                                            {employee.rif && <p className="text-[9px] text-slate-600"><span className="font-semibold">RIF:</span> {employee.rif}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-auto pt-2">
                                    <p className="text-[8px] text-slate-400 text-center uppercase tracking-widest">Personal Autorizado</p>
                                </div>
                            </div>

                            {/* Right Side: QR Code */}
                            <div className="w-[35%] bg-slate-50 flex flex-col items-center justify-center border-l border-slate-100 z-10 p-2">
                                <div className="p-1 bg-white border border-slate-200 rounded-sm">
                                    <QRCode value={employee.id} size={80} level="M" />
                                </div>
                                <p className="text-[8px] text-slate-500 mt-2 text-center font-mono">{employee.id.substring(0, 6)}</p>
                            </div>

                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
