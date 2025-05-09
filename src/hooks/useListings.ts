import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, QuerySnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Listing } from '../types/listing';

export const useListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateListing = async (id: string, data: Partial<Listing>) => {
    try {
      setError(null);
      const listingRef = doc(db, 'listings', id);
      await updateDoc(listingRef, data);
    } catch (err) {
      setError('Грешка при обновяване на обявата');
      throw err;
    }
  };

  const deleteListing = async (id: string) => {
    try {
      setError(null);
      const listingRef = doc(db, 'listings', id);
      await deleteDoc(listingRef);
    } catch (err) {
      setError('Грешка при изтриване на обявата');
      throw err;
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let retryCount = 0;
    const maxRetries = 3;
    let isMounted = true;

    const processSnapshot = (snapshot: QuerySnapshot) => {
      if (!isMounted) return;
      
      const listingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Listing[];

      setListings(listingsData);
      setLoading(false);
      retryCount = 0; // Reset retry count on successful update
    };

    const fetchListings = async () => {
      try {
        if (!isMounted) return;
        
        setLoading(true);
        setError(null);

        const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));

        // First try onSnapshot
        try {
          unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              processSnapshot(snapshot);
            },
            (error) => {
              console.error('onSnapshot error:', error);
              if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Retrying connection (attempt ${retryCount}/${maxRetries})...`);
                setTimeout(fetchListingsWithGetDocs, 1000 * retryCount); // Exponential backoff
              } else {
                fetchListingsWithGetDocs();
              }
            }
          );
        } catch (error) {
          console.error('Error setting up onSnapshot:', error);
          fetchListingsWithGetDocs();
        }
      } catch (err) {
        console.error('Error in fetchListings:', err);
        if (isMounted) {
          setError('Грешка при зареждане на обявите');
          setLoading(false);
        }
      }
    };

    const fetchListingsWithGetDocs = async () => {
      try {
        if (!isMounted) return;
        
        const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        processSnapshot(querySnapshot);
      } catch (err) {
        console.error('Error fetching listings with getDocs:', err);
        if (isMounted) {
          setError('Грешка при зареждане на обявите');
          setLoading(false);
        }
      }
    };

    fetchListings();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { listings, loading, error, updateListing, deleteListing };
}; 