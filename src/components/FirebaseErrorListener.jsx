'use client';
import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error) => {
      console.error(error); // Also log to console for debugging
      if (error instanceof FirestorePermissionError) {
        toast({
          variant: 'destructive',
          title: 'Permission Denied',
          description: "You don't have permission to perform this action. Check Firestore rules.",
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'An Error Occurred',
          description: error.message || 'An unexpected error occurred.',
        });
      }
    };

    errorEmitter.on('permission-error', handleError);
    errorEmitter.on('error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
      errorEmitter.off('error', handleError);
    };
  }, [toast]);

  return null;
}
