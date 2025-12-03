'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Loader2 } from 'lucide-react';

export function UserNav() {
  const { user: authUser, isUserLoading: isAuthLoading, auth } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);

  const { data: currentUser, isLoading: isProfileLoading } = useDoc<User>(userDocRef, {
    disabled: !authUser
  });
  
  const isLoading = isAuthLoading || (authUser && isProfileLoading);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };
  
  if (isLoading) {
    return (
       <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
       </div>
    )
  }

  if (!authUser || !currentUser) {
    return (
      <Button asChild>
        <Link href="/login">Iniciar Sesión</Link>
      </Button>
    )
  }

  const userInitials = currentUser.name
    ? currentUser.name.split(' ').map((n) => n[0]).join('')
    : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/users/${currentUser.id}`}>Perfil</Link>
          </DropdownMenuItem>
          {currentUser.role === 'superadmin' && (
            <DropdownMenuItem>Facturación</DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/settings">Ajustes</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
            Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
