
import { db, auth } from '@/lib/firebase';
import { 
  collection,
  query,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  where,
  serverTimestamp,
  setDoc,
  getDoc
} from 'firebase/firestore';

export interface UserData {
  id: string;
  email: string | null;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt?: string;
  lastLogin?: string;
}

export const getUsers = async (): Promise<UserData[]> => {
  try {
    // Get current user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("No authenticated user");
      return [];
    }
    
    // First check if the current user is an admin by checking their document
    const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const currentUserData = currentUserDoc.data();
    
    // If not admin or document doesn't exist, return empty array
    if (!currentUserData || currentUserData.role !== 'admin') {
      console.error("User is not an admin");
      return [];
    }
    
    // If we get here, user is confirmed admin
    console.log("Admin access confirmed, fetching all users...");
    const usersRef = collection(db, 'users');
    const q = query(usersRef);
    
    try {
      const querySnapshot = await getDocs(q);
      
      // Convert snapshot to UserData objects
      const users: UserData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          email: data.email || null,
          role: data.role || 'user',
          status: data.status || 'active',
          createdAt: data.createdAt ? 
            (typeof data.createdAt === 'string' ? 
              data.createdAt : 
              data.createdAt.toDate?.()?.toISOString() || new Date().toISOString()) : 
            undefined,
          lastLogin: data.lastLogin ?
            (typeof data.lastLogin === 'string' ?
              data.lastLogin :
              data.lastLogin.toDate?.()?.toISOString() || undefined) :
            undefined
        });
      });
      
      console.log("Users fetched successfully:", users);
      return users;
    } catch (error) {
      console.error("Error fetching users (permission issue):", error);
      throw error;
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Handle permission errors by adding at least the current admin user
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.email) {
      // Return at least the current admin user
      const adminUser: UserData = {
        id: currentUser.uid,
        email: currentUser.email,
        role: 'admin',
        status: 'active',
        createdAt: currentUser.metadata.creationTime
      };
      
      // Try to update admin in Firestore anyway (this might still fail due to permissions)
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          email: currentUser.email,
          role: 'admin',
          status: 'active',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        }, { merge: true });
      } catch (innerError) {
        console.error("Couldn't update admin in Firestore:", innerError);
      }
      
      return [adminUser];
    }
    
    return [];
  }
};

export const deleteUserAccount = async (userId: string) => {
  try {
    // Delete user from Firestore
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);
    
    // Note: Deleting a user from Firebase Auth requires Cloud Functions
    // or a server component with Admin SDK
    console.log('User deleted from Firestore. Firebase Auth deletion requires server-side code.');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const updateUserStatus = async (userId: string, status: 'active' | 'inactive') => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { status });
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

export const ensureUserExists = async (user: { uid: string, email: string | null }) => {
  if (!user.uid || !user.email) return;
  
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create new user document if it doesn't exist
      await setDoc(userRef, {
        email: user.email,
        role: user.email === "ashriahamed54@gmail.com" ? 'admin' : 'user', // Set admin by email
        status: 'active',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
      console.log("Created missing user document in Firestore for user:", user.email);
    } else {
      // Update last login time
      await updateDoc(userRef, {
        lastLogin: serverTimestamp()
      });
      console.log("Updated last login for existing user:", user.email);
    }
  } catch (error) {
    console.error("Error ensuring user exists in Firestore:", error);
    throw error; // Rethrow to handle in calling code
  }
};
