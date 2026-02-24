'use client';

import { useState, useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';

export const useCollection = (query) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // A query is required to fetch data.
    if (!query) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (querySnapshot) => {
        const documents = querySnapshot.docs.map((doc) => ({
          ...(doc.data()),
          id: doc.id,
        }));
        setData(documents);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('useCollection Error:', err);
        // We can't easily get the collection path from a generic Query object for the
        // FirestorePermissionError, so we emit a more generic error.
        // The FirebaseErrorListener will catch this and display a toast.
        errorEmitter.emit('error', err);
        setError(err);
        setData(null);
        setIsLoading(false);
      }
    );

    // Unsubscribe from the listener when the component unmounts.
    return () => unsubscribe();
  }, [query]); // The query object is a dependency. A new query will trigger a re-fetch.

  return { data, isLoading, error };
};
