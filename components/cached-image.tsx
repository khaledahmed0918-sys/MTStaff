'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

const DB_NAME = 'discord-dashboard-images';
const STORE_NAME = 'images';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

const getDB = () => {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }
  return dbPromise;
};

const getCachedImage = async (url: string): Promise<string | null> => {
  try {
    const db = await getDB();
    if (!db) return null;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(url);
      request.onsuccess = () => {
        if (request.result) {
          resolve(URL.createObjectURL(request.result));
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    // Error handling removed
    return null;
  }
};

const setCachedImage = async (url: string, blob: Blob): Promise<void> => {
  try {
    const db = await getDB();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(blob, url);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    // Error handling removed
  }
};

interface CachedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
}

export default function CachedImage({ src, alt, ...props }: CachedImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (!src) return;
      
      // Try to get from cache first
      const cachedUrl = await getCachedImage(src);
      if (cachedUrl) {
        if (isMounted) setImgSrc(cachedUrl);
        return;
      }

      // If not in cache, fetch it
      try {
        const response = await fetch(src, { mode: 'cors' });
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        
        // Store in cache
        await setCachedImage(src, blob);
        
        // Create object URL and set it
        if (isMounted) {
          setImgSrc(URL.createObjectURL(blob));
        }
      } catch (error) {
        // Fallback to original src if fetch fails
        if (isMounted) setImgSrc(src);
        console.warn('Failed to cache image, falling back to direct URL:', src);
      }
    };

    loadImage();

    return () => {
      isMounted = false;
      // Note: We don't revoke the object URL here because it might be used by other instances
      // of the same image. In a more complex implementation, we might want to reference count
      // the object URLs to know when it's safe to revoke them.
    };
  }, [src]);

  if (!imgSrc) {
    // Render a placeholder or nothing while loading
    return <div className={`animate-pulse bg-gray-800 ${props.className || ''}`} />;
  }

  return <Image src={imgSrc} alt={alt} unoptimized {...props} />;
}
