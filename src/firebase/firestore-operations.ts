
'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
  WriteBatch,
  WithFieldValue,
  UpdateData,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export async function setDocumentNonBlocking(docRef: DocumentReference, data: WithFieldValue<any>, options?: SetOptions) {
  const operation = options ? setDoc(docRef, data, options) : setDoc(docRef, data);
  try {
    await operation;
  } catch (error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: (options && 'merge' in options) ? 'update' : 'create',
        requestResourceData: data,
      })
    )
    throw error;
  }
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally.
 */
export async function addDocumentNonBlocking(colRef: CollectionReference, data: WithFieldValue<any>) {
  try {
    await addDoc(colRef, data);
  } catch(error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: data,
      })
    )
    throw error;
  };
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export async function updateDocumentNonBlocking(docRef: DocumentReference, data: UpdateData<any>) {
  try {
    await updateDoc(docRef, data);
  } catch(error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: data,
      })
    )
    throw error;
  };
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export async function deleteDocumentNonBlocking(docRef: DocumentReference) {
  try {
    await deleteDoc(docRef);
  } catch(error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      })
    )
    throw error;
  };
}

/**
 * Commits a batch write operation.
 * Does NOT await the write operation internally.
 */
export async function commitBatchNonBlocking(batch: WriteBatch) {
    try {
        await batch.commit();
    } catch(error) {
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: 'batch operation',
                operation: 'write',
            })
        )
        throw error;
    };
}
