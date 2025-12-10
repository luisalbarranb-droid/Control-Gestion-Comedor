
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import type { EvaluationCriterion } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Separator } from '../ui/separator';

interface EvaluationFormProps {
  criteria: EvaluationCriterion[];
  onSave: (scores: Record<string, { score: number; comment: string }>, totalScore: number) => void;
  isSubmitting: boolean;
}

interface FormValues {
  scores: Record<string, { score: number; comment: string }>;
}

export function EvaluationForm({ criteria, onSave, isSubmitting }: EvaluationFormProps) {
  const defaultScores = criteria.reduce((acc, criterion) => {
    acc[criterion.id] = { score: Math.round(criterion.maxPoints / 2), comment: '' };
    return acc;
  }, {} as FormValues['scores']);

  const { control, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: { scores: defaultScores },
  });

  const watchedScores = watch('scores');

  const [totalScore, setTotalScore] = useState(0);
  const maxTotalScore = criteria.reduce((acc, c) => acc + c.maxPoints, 0);

  useEffect(() => {
    const currentTotal = Object.values(watchedScores).reduce((acc, { score }) => acc + score, 0);
    setTotalScore(currentTotal);
  }, [watchedScores]);

  const onSubmit = (data: FormValues) => {
    onSave(data.scores, totalScore);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Formulario de Evaluación</CardTitle>
          <CardDescription>
            Asigna una puntuación para cada criterio de la matriz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {criteria.map((criterion, index) => (
            <React.Fragment key={criterion.id}>
              {index > 0 && <Separator />}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-1">
                  <h4 className="font-semibold">{criterion.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {criterion.description}
                  </p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                        <Label>Puntuación</Label>
                        <span className="font-mono text-lg font-bold w-16 text-center bg-muted rounded-md py-1">
                            {watchedScores[criterion.id]?.score || 0} / {criterion.maxPoints}
                        </span>
                    </div>
                     <Controller
                        name={`scores.${criterion.id}.score`}
                        control={control}
                        render={({ field }) => (
                            <Slider
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                max={criterion.maxPoints}
                                step={1}
                            />
                        )}
                    />
                  </div>
                  <div>
                     <Label className="text-xs text-muted-foreground">Comentarios (Opcional)</Label>
                      <Controller
                        name={`scores.${criterion.id}.comment`}
                        control={control}
                        render={({ field }) => (
                            <Textarea
                                {...field}
                                placeholder={`Añade un comentario sobre ${criterion.name}...`}
                                className="mt-1"
                            />
                        )}
                    />
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </CardContent>
        <CardFooter className="flex justify-end items-center gap-4">
            <div className="text-xl font-bold">
                Puntaje Total: <span className="text-primary">{totalScore} / {maxTotalScore}</span>
            </div>
            <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Evaluación
            </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

