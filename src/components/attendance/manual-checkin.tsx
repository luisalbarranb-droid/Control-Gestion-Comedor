'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, getDocs, Timestamp, doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/components/ui/toast';
import { useMultiTenant } from '@/providers/multi-tenant-provider';
import { Search, UserPlus } from 'lucide-react';
import type { User, AttendanceRecord } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ManualCheckIn() {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();
    const { activeComedorId } = useMultiTenant();

    const handleSearch = async () => {
        if (!searchQuery.trim() || !firestore) return;

        setIsSearching(true);
        try {
            // This is a simple client-side search or a limited server side search
            // For production, consider using a more robust search index
            let q = query(collection(firestore, 'users'));
            if (activeComedorId) {
                q = query(q, where('comedorId', '==', activeComedorId));
            }

            const snapshot = await getDocs(q);
            const users = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as User))
                .filter(u =>
                    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (u.cedula && u.cedula.includes(searchQuery))
                );

            setSearchResults(users);
        } catch (error) {
            console.error("Error searching users:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo realizar la búsqueda.' });
        } finally {
            setIsSearching(false);
        }
    };

    const handleRegistry = async (user: User) => {
        if (!firestore) return;

        setIsLoading(true);
        try {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const attendanceQuery = query(
                collection(firestore, 'attendance'),
                where('userId', '==', user.id),
                where('checkIn', '>=', Timestamp.fromDate(todayStart)),
                where('checkIn', '<=', Timestamp.fromDate(todayEnd))
            );

            const attendanceSnap = await getDocs(attendanceQuery);

            if (attendanceSnap.empty) {
                const newRecord: Omit<AttendanceRecord, 'id'> = {
                    userId: user.id,
                    comedorId: activeComedorId || user.comedorId || 'unknown',
                    checkIn: serverTimestamp() as any,
                    status: new Date().getHours() > 8 ? 'retardo' : 'presente',
                };
                addDocumentNonBlocking(collection(firestore, 'attendance'), newRecord);
                toast({ title: 'Entrada Registrada', description: `Se ha registrado la entrada de ${user.name} manualmente.` });
            } else {
                const recordToUpdate = attendanceSnap.docs[0];
                if (!recordToUpdate.data().checkOut) {
                    updateDocumentNonBlocking(doc(firestore, 'attendance', recordToUpdate.id), {
                        checkOut: serverTimestamp(),
                    });
                    toast({ title: 'Salida Registrada', description: `Se ha registrado la salida de ${user.name} manualmente.` });
                } else {
                    toast({ variant: 'destructive', title: 'Ya registrado', description: 'Ya se ha registrado una salida para hoy.' });
                }
            }
            setOpen(false);
        } catch (error) {
            console.error("Error manual registry:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo procesar el registro.' });
        } finally {
            setIsLoading(false);
        }
    };

    const getUserInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                    <Search className="mr-2 h-4 w-4" />
                    Registro Manual
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Registro Manual de Asistencia</DialogTitle>
                    <DialogDescription>
                        Busca al empleado por nombre o cédula para registrar su entrada o salida.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2 py-4">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="search" className="sr-only">Buscar</Label>
                        <Input
                            id="search"
                            placeholder="Nombre o Cédula..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button type="button" size="sm" onClick={handleSearch} disabled={isSearching}>
                        {isSearching ? 'Buscando...' : <Search className="h-4 w-4" />}
                    </Button>
                </div>

                <ScrollArea className="h-64 rounded-md border p-2">
                    {searchResults.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            Realiza una búsqueda para ver resultados.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {searchResults.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatarUrl} />
                                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                {getUserInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium leading-none">{user.name}</span>
                                            <span className="text-xs text-muted-foreground mt-1">
                                                {user.cedula && `CI: ${user.cedula}`}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleRegistry(user)}
                                        disabled={isLoading}
                                    >
                                        <UserPlus className="h-4 w-4 text-green-600" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter className="sm:justify-start">
                    <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
