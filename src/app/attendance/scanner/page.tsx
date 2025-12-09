'use client';

import React, { useState, useEffect } from 'react';
import QrScanner from 'react-qr-scanner';
import { useToast } from '@/components/ui/toast';
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, getDocs, Timestamp, doc, serverTimestamp } from 'firebase/firestore';
import type { User, AttendanceRecord } from '@/lib/types';
import { CameraOff, CheckCircle, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

export default function ScannerPage() {
  const [result, setResult] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ userId: string; timestamp: number } | null>(null);
  const [scannedUser, setScannedUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'success_in' | 'success_out' | 'error' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();
  const [hasCamera, setHasCamera] = useState(true);

  const handleScan = async (data: { text: string } | null) => {
    if (data && data.text) {
      const now = Date.now();
      // Debounce: prevent re-scanning the same code within 3 seconds
      if (lastResult && lastResult.userId === data.text && (now - lastResult.timestamp) < 3000) {
        return;
      }
      
      setResult(data.text);
      setLastResult({ userId: data.text, timestamp: now });
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    setHasCamera(false);
    toast({
      variant: 'destructive',
      title: 'Error de Cámara',
      description: 'No se pudo acceder a la cámara. Revisa los permisos del navegador.',
    });
  };
  
  useEffect(() => {
    const processScan = async () => {
      if (!result || !firestore) return;

      try {
        const userSnap = await getDocs(query(collection(firestore, 'users'), where('id', '==', result)));

        if (userSnap.empty) {
          setStatus('error');
          setMessage('Usuario no encontrado.');
          setScannedUser(null);
          return;
        }

        const user = { id: userSnap.docs[0].id, ...userSnap.docs[0].data() } as User;
        setScannedUser(user);
        
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const attendanceQuery = query(
          collection(firestore, 'attendance'),
          where('userId', '==', result),
          where('checkIn', '>=', Timestamp.fromDate(todayStart)),
          where('checkIn', '<=', Timestamp.fromDate(todayEnd))
        );

        const attendanceSnap = await getDocs(attendanceQuery);
        
        if (attendanceSnap.empty) {
          const newRecord: Omit<AttendanceRecord, 'id'> = {
            userId: result,
            checkIn: serverTimestamp(),
            status: new Date().getHours() > 8 ? 'retardo' : 'presente',
          };
          addDocumentNonBlocking(collection(firestore, 'attendance'), newRecord);
          setStatus('success_in');
          setMessage(`Entrada registrada a las ${format(new Date(), 'HH:mm')}`);
        } else {
          const recordToUpdate = attendanceSnap.docs[0];
          if (!recordToUpdate.data().checkOut) { // Only update if checkOut is not set
            updateDocumentNonBlocking(doc(firestore, 'attendance', recordToUpdate.id), {
              checkOut: serverTimestamp(),
            });
            setStatus('success_out');
            setMessage(`Salida registrada a las ${format(new Date(), 'HH:mm')}`);
          } else {
             setStatus('error');
             setMessage('Ya se ha registrado una salida para hoy.');
          }
        }

      } catch (error) {
        console.error("Error processing scan:", error);
        setStatus('error');
        setMessage('Ocurrió un error al procesar el registro.');
        setScannedUser(null);
      } finally {
        setTimeout(() => {
            setResult(null);
            setStatus(null);
            setMessage(null);
            setScannedUser(null);
        }, 3000);
      }
    };
    
    processScan();
  }, [result, firestore, toast]);

  const getUserInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col items-center justify-center p-4 relative">
      {!status && hasCamera && (
        <>
          <div className="absolute top-4 left-4 text-white">
            <h1 className="text-3xl font-bold">Registro de Asistencia</h1>
            <p className="text-gray-300">Apunta el código QR de tu credencial a la cámara.</p>
          </div>
          <div className="w-full max-w-md h-auto aspect-square overflow-hidden rounded-2xl border-4 border-dashed border-gray-600 bg-gray-800">
            <QrScanner
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%' }}
              constraints={{
                video: { facingMode: 'environment' }
              }}
            />
          </div>
        </>
      )}

      {!hasCamera && (
        <div className="text-center text-white">
          <CameraOff className="h-24 w-24 text-red-400 mx-auto" />
          <h2 className="text-4xl font-bold mt-4">Error de Cámara</h2>
          <p className="text-2xl text-gray-300">No se pudo acceder a la cámara. Revisa los permisos.</p>
        </div>
      )}

      {status === 'success_in' && scannedUser && (
        <div className="text-center text-white">
          <CheckCircle className="h-24 w-24 text-green-400 mx-auto animate-pulse" />
          <h2 className="text-4xl font-bold mt-4">¡Bienvenido, {scannedUser.name}!</h2>
          <p className="text-2xl text-gray-300">{message}</p>
        </div>
      )}
       {status === 'success_out' && scannedUser && (
        <div className="text-center text-white">
          <CheckCircle className="h-24 w-24 text-blue-400 mx-auto animate-pulse" />
          <h2 className="text-4xl font-bold mt-4">¡Hasta luego, {scannedUser.name}!</h2>
          <p className="text-2xl text-gray-300">{message}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center text-white">
          <XCircle className="h-24 w-24 text-red-400 mx-auto" />
          <h2 className="text-4xl font-bold mt-4">Error de Registro</h2>
          <p className="text-2xl text-gray-300">{message}</p>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 bg-black/50 p-4 rounded-lg text-white max-w-sm">
        <h3 className="font-bold mb-2">Último Registro</h3>
        {scannedUser ? (
           <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={(scannedUser as any).avatarUrl} />
                <AvatarFallback>{getUserInitials(scannedUser.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{scannedUser.name}</p>
                <p className="text-xs text-gray-400">{message}</p>
              </div>
           </div>
        ) : (
            <p className="text-sm text-gray-400">Esperando escaneo...</p>
        )}
      </div>

    </div>
  );
}
