
'use client';

import React, 'react';
import { Award, ThumbsUp, ThumbsDown, Meh, Trophy, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { users as mockUsers, tasks as mockTasks } from '@/lib/placeholder-data';
import { Textarea } from '@/components/ui/textarea';

// Datos de ejemplo
const employeeOfTheMonth = mockUsers.find(u => u.id === 'user-admin-1');
const topPerformers = [
    { rank: 1, user: mockUsers.find(u => u.id === 'user-admin-1'), points: 1250 },
    { rank: 2, user: mockUsers.find(u => u.id === 'user-comun-2'), points: 1100 },
    { rank: 3, user: mockUsers.find(u => u.id === 'user-comun-1'), points: 980 },
];

export default function RecognitionPage() {

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center gap-4">
                <Award className="h-8 w-8 text-amber-500" />
                <div>
                    <h1 className="font-headline text-2xl font-bold md:text-3xl">Portal de Reconocimiento</h1>
                    <p className="text-muted-foreground">Celebra los logros y fomenta una cultura de feedback positivo.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna Izquierda: Empleado del Mes y Leaderboard */}
                <div className="lg:col-span-1 space-y-8">
                    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300">
                        <CardHeader className="text-center">
                            <Trophy className="mx-auto h-12 w-12 text-amber-500" />
                            <CardTitle className="text-2xl text-amber-800">Empleado del Mes</CardTitle>
                            <CardDescription className="text-amber-600">¡Felicidades por un trabajo excepcional!</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                             <Avatar className="h-24 w-24 border-4 border-amber-400">
                                <AvatarImage src={employeeOfTheMonth?.avatarUrl} />
                                <AvatarFallback className="text-3xl">{employeeOfTheMonth?.name?.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <h3 className="text-xl font-bold">{employeeOfTheMonth?.name}</h3>
                                <p className="text-sm text-muted-foreground capitalize">{employeeOfTheMonth?.area}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tablero de Puntos</CardTitle>
                            <CardDescription>Top 3 de empleados con más puntos este mes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {topPerformers.map(({ user, points, rank }) => (
                                    <li key={user?.id} className="flex items-center gap-4">
                                        <div className="text-lg font-bold w-6 text-center text-muted-foreground">{rank}</div>
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user?.avatarUrl} />
                                            <AvatarFallback>{user?.name?.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-semibold">{user?.name}</p>
                                            <div className="flex items-center gap-1 text-xs text-amber-600">
                                                <Star className="h-3 w-3 fill-amber-400" />
                                                <span className="font-bold">{points}</span> puntos
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Columna Derecha: Formulario de Reconocimiento de Pares */}
                <div className="lg:col-span-2">
                     <Card>
                        <CardHeader>
                            <CardTitle>Reconocimiento entre Pares</CardTitle>
                            <CardDescription>Valora una tarea específica completada por un compañero.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <label className="text-sm font-medium">Tarea a Evaluar</label>
                                <div className="p-4 border rounded-lg mt-2">
                                     <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{mockTasks[0].titulo}</p>
                                            <p className="text-sm text-muted-foreground">Completada por: <span className="font-medium text-foreground">{mockUsers.find(u => u.id === mockTasks[0].asignadoA)?.name}</span></p>
                                        </div>
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">Completada</Badge>
                                     </div>
                                </div>
                            </div>
                           
                            <div>
                                <label className="text-sm font-medium">Tu Valoración</label>
                                <div className="flex justify-around items-center p-4 border rounded-lg mt-2 bg-muted/50">
                                    <Button variant="ghost" size="icon" className="h-16 w-16 flex flex-col gap-1 text-red-500 hover:bg-red-100 hover:text-red-600">
                                        <ThumbsDown className="h-7 w-7"/>
                                        <span className="text-xs">Negativo</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-16 w-16 flex flex-col gap-1 text-gray-500 hover:bg-gray-200 hover:text-gray-600">
                                        <Meh className="h-7 w-7"/>
                                        <span className="text-xs">Neutral</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-16 w-16 flex flex-col gap-1 text-green-500 hover:bg-green-100 hover:text-green-600">
                                        <ThumbsUp className="h-7 w-7"/>
                                        <span className="text-xs">Positivo</span>
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="comment" className="text-sm font-medium">Comentario (Opcional)</label>
                                <Textarea id="comment" placeholder="Añade un comentario para explicar tu valoración..." className="mt-2" />
                            </div>

                            <Button className="w-full">Enviar Valoración</Button>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}

