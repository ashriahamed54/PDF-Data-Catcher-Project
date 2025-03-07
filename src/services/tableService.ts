
import { db } from '@/lib/firebase';
import { Entry } from '@/types/entry';
import { 
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  writeBatch
} from 'firebase/firestore';

export const saveEntry = async (entry: Omit<Entry, 'id'>, userId: string) => {
  const entriesRef = collection(db, 'entries');
  const entryWithMetadata = {
    ...entry,
    userId,
    createdAt: Timestamp.now(),
  };
  
  await addDoc(entriesRef, entryWithMetadata);
};

export const getRecentEntries = async (userId: string) => {
  try {
    console.log('Fetching entries for userId:', userId);
    const entriesRef = collection(db, 'entries');
    
    // Create a query that only filters by userId
    const userQuery = query(
      entriesRef,
      where('userId', '==', userId)
    );

    console.log('Executing query for user:', userId);
    const querySnapshot = await getDocs(userQuery);
    console.log('Number of entries found:', querySnapshot.size);
    
    if (querySnapshot.empty) {
      console.log('No entries found for this user');
      return [];
    }
    
    // Convert Firestore data to Entry objects
    const entries = querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Timestamp to string if needed
      const createdAt = data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate().toISOString() 
        : null;
      
      const entry: Entry = {
        id: doc.id,
        date: data.date || '',
        passNumber: data.passNumber || '',
        cusdecNo: data.cusdecNo || '',
        containerNo: data.containerNo || '',
        destination: data.destination || '',
        truckNumber: data.truckNumber || '',
        item: data.item || '',
        tokenNumber: data.tokenNumber || '',
        status: data.status || 'IN',
        name: data.name || '',
        feet: data.feet || '20 FEET',
        createdAt: createdAt
      };
      
      return entry;
    });
    
    // Auto-clean old entries (older than 2 weeks)
    await cleanupOldEntries(userId);
    
    console.log('Entries retrieved successfully:', entries.length);
    console.log('Sample entry data:', entries.length > 0 ? entries[0] : 'No entries');
    return entries;
  } catch (error) {
    console.error('Error fetching entries:', error);
    throw error; // Rethrow to allow handling in the component
  }
};

export const deleteEntry = async (entryId: string) => {
  const entryDocRef = doc(db, 'entries', entryId);
  await deleteDoc(entryDocRef);
};

export const updateEntry = async (entryId: string, updatedData: Partial<Entry>) => {
  const entryDocRef = doc(db, 'entries', entryId);
  
  // Remove id from the data to be updated since it's the document ID
  const { id, ...dataToUpdate } = updatedData as any;
  
  await updateDoc(entryDocRef, dataToUpdate);
};

// New function to clean up entries older than 2 weeks
export const cleanupOldEntries = async (userId: string) => {
  try {
    console.log('Cleaning up old entries for user:', userId);
    const entriesRef = collection(db, 'entries');
    
    // Calculate date 2 weeks ago
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14); // 14 days = 2 weeks
    const twoWeeksAgoTimestamp = Timestamp.fromDate(twoWeeksAgo);
    
    // Query for entries older than 2 weeks
    const oldEntriesQuery = query(
      entriesRef,
      where('userId', '==', userId),
      where('createdAt', '<', twoWeeksAgoTimestamp)
    );
    
    const querySnapshot = await getDocs(oldEntriesQuery);
    console.log('Number of old entries to clean up:', querySnapshot.size);
    
    if (querySnapshot.empty) {
      console.log('No old entries to clean up');
      return;
    }
    
    // Use batched writes for better performance when deleting multiple documents
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('Successfully cleaned up', querySnapshot.size, 'old entries');
  } catch (error) {
    console.error('Error cleaning up old entries:', error);
  }
};
