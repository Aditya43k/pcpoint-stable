'use client';
import { doc, setDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

export function setServiceRequest(db, userId, data) {
  const docRef = doc(collection(db, 'serviceRequests'));
  const requestData = {
    ...data,
    userId,
    submittedAt: new Date().toISOString(), // Using ISO string for consistency
    updatedAt: new Date().toISOString(),
    status: 'Pending',
    id: docRef.id,
  };

  // Using serverTimestamp causes issues with client-side rendering before data is synced
  // so we use a client-side timestamp for now.
  const firestoreData = { ...requestData };
  delete firestoreData.submittedAt;
  delete firestoreData.updatedAt;
  firestoreData.submittedAt = serverTimestamp();
  firestoreData.updatedAt = serverTimestamp();

  if (data.appointmentDate) {
    firestoreData.appointmentDate = data.appointmentDate;
  }


  setDoc(docRef, firestoreData)
    .catch(async (serverError) => {
      console.error("Firestore error:", serverError);
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: requestData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw permissionError; // Re-throw to be caught by the form
    });

    return requestData; // return the client-side version of the data immediately
}

export function updateServiceRequestStatus(db, requestId, status) {
    const docRef = doc(db, 'serviceRequests', requestId);
    const updateData = {
        status,
        updatedAt: serverTimestamp(),
    };

    return updateDoc(docRef, updateData)
        .catch(async (serverError) => {
            console.error("Firestore error:", serverError);
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
        });
}

export function completeServiceRequest(db, requestId, details) {
    const docRef = doc(db, 'serviceRequests', requestId);
    const updateData = {
        status: 'Completed',
        cost: details.cost,
        updatedAt: serverTimestamp(),
    };
    if (details.invoiceNotes) {
        updateData.invoiceNotes = details.invoiceNotes;
    }

    return updateDoc(docRef, updateData)
        .catch(async (serverError) => {
            console.error("Firestore error:", serverError);
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
        });
}
