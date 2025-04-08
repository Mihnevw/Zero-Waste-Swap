import { useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: Date;
}

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log('Favorites snapshot:', snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        const favoriteIds = snapshot.docs.map(doc => String(doc.data().listingId));
        console.log('Favorite IDs:', favoriteIds);
        setFavorites(favoriteIds);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching favorites:', err);
        setError('Грешка при зареждане на любими');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const toggleFavorite = async (listingId: string | number) => {
    if (!user) {
      setError('Моля, влезте в системата, за да добавите в любими');
      return;
    }

    try {
      const listingIdStr = String(listingId);
      const favoriteId = `${user.uid}_${listingIdStr}`;
      const favoriteRef = doc(db, 'favorites', favoriteId);
      
      console.log('Toggling favorite:', { 
        listingId: listingIdStr, 
        favoriteId, 
        exists: favorites.includes(listingIdStr),
        isDemo: listingIdStr.startsWith('demo_')
      });

      if (favorites.includes(listingIdStr)) {
        await deleteDoc(favoriteRef);
        console.log('Favorite deleted:', favoriteId);
      } else {
        // For demo listings, we don't need to check if the listing exists
        if (!listingIdStr.startsWith('demo_')) {
          // Check if the listing exists in Firestore
          const listingRef = doc(db, 'listings', listingIdStr);
          const listingDoc = await getDoc(listingRef);
          
          if (!listingDoc.exists()) {
            setError('Обявата не съществува');
            return;
          }
        }

        const favoriteData = {
          userId: user.uid,
          listingId: listingIdStr,
          createdAt: serverTimestamp(),
          id: favoriteId
        };
        console.log('Creating favorite:', favoriteData);
        await setDoc(favoriteRef, favoriteData, { merge: true });
        console.log('Favorite created:', favoriteId);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Грешка при обновяване на любими');
    }
  };

  const isFavorite = (listingId: string | number) => {
    return favorites.includes(String(listingId));
  };

  return {
    favorites,
    loading,
    error,
    toggleFavorite,
    isFavorite
  };
}; 