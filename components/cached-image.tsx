'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { motion, AnimatePresence } from 'motion/react';

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
  } catch (err) {}
};

interface CachedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
}

const getUrlWithSize = (src: string, size: number) => {
  try {
    const url = new URL(src);
    if (url.hostname.includes('discordapp')) {
      url.searchParams.set('size', size.toString());
      return url.toString();
    }
  } catch (e) {}
  return src; 
};

export default function CachedImage({ src, alt, ...props }: CachedImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0); // 0: init, 1: low, 2: mid, 3: high

  useEffect(() => {
    let isMounted = true;
    let onlineHandler: () => void;

    const loadProgressive = async () => {
      if (!src) return;
      
      // Attempt cache for final image first
      try {
        const cachedUrl = await getCachedImage(src);
        if (cachedUrl) {
          if (isMounted) {
            setCurrentSrc(cachedUrl);
            setLoadingStep(3);
          }
          return;
        }
      } catch (e) {}

      // If network is offline, wait for it
      if (!navigator.onLine) {
        return new Promise<void>((resolve) => {
          onlineHandler = () => {
            window.removeEventListener('online', onlineHandler);
            resolve(loadProgressive());
          };
          window.addEventListener('online', onlineHandler);
        });
      }

      // Load steps based on url type
      const isDiscordUrl = src.includes('cdn.discordapp.com');
      const sizes = isDiscordUrl ? [32, 256, 1024] : [0]; 
      
      for (let i = 0; i < sizes.length; i++) {
        if (!isMounted) break;
        
        const sizeSrc = isDiscordUrl ? getUrlWithSize(src, sizes[i]) : src;
        
        try {
          const response = await fetch(sizeSrc, { mode: 'cors', credentials: 'omit' });
          if (!response.ok) throw new Error('Fetch failed');
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          
          if (isMounted) {
            setCurrentSrc(objectUrl);
            setLoadingStep(isDiscordUrl ? i + 1 : 3);
            if (i === sizes.length - 1 || !isDiscordUrl) {
              await setCachedImage(src, blob);
            }
          }
        } catch (error) {
          if (!navigator.onLine && isMounted) {
            // Wait for online to resume from this step
            await new Promise<void>((resolve) => {
              const resumeHandler = () => {
                window.removeEventListener('online', resumeHandler);
                resolve();
              };
              window.addEventListener('online', resumeHandler);
            });
            i--; // retries current step
          } else if (i === sizes.length - 1 && isMounted) {
            // fallback if it fails fully
            setCurrentSrc(src);
          }
        }
      }
    };

    loadProgressive();

    return () => {
      isMounted = false;
      if (onlineHandler) window.removeEventListener('online', onlineHandler);
    };
  }, [src]);

  const { fill, unoptimized, objectFit, ...rest } = props as any;

  return (
    <div className={`relative overflow-hidden w-full h-full ${props.className || ''}`}>
      {!currentSrc && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse w-full h-full" />
      )}
      <AnimatePresence>
        {currentSrc && (
          <motion.img
            key={currentSrc} // force unmount/remount on src change for crossfade
            src={currentSrc}
            alt={alt}
            initial={{ opacity: 0, filter: loadingStep < 3 ? 'blur(10px)' : 'none' }}
            animate={{ opacity: 1, filter: loadingStep < 3 ? 'blur(10px)' : 'none' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700`}
            {...rest}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
