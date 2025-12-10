
'use server';

import {
  ref,
  uploadBytes,
  getDownloadURL,
  getStorage,
} from 'firebase/storage';
import { firebaseApp } from '@/firebase';

const storage = getStorage(firebaseApp);

export async function uploadProfilePicture(userId: string, file: File): Promise<{ url?: string; error?: string }> {
  try {
    const fileBuffer = await file.arrayBuffer();
    const storageRef = ref(storage, `profile-pictures/${userId}/${file.name}`);
    
    await uploadBytes(storageRef, fileBuffer, {
      contentType: file.type,
    });
    
    const downloadUrl = await getDownloadURL(storageRef);

    return { url: downloadUrl };
  } catch (error: any) {
    console.error('Upload failed:', error);
    return { error: 'No se pudo subir la imagen.' };
  }
}
