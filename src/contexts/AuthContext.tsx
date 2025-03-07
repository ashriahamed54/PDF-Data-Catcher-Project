
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { toast } from 'sonner';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ensureUserExists } from '@/services/userService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateAdminEmail: (newEmail: string) => Promise<void>;
  updateAdminPassword: (newPassword: string) => Promise<void>;
}

const ADMIN_EMAIL = "ashriahamed54@gmail.com";
const ADMIN_PASSWORD = "2316327Rodalf";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const ensureAdminExists = async () => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, ADMIN_EMAIL);
      
      if (methods.length === 0) {
        const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: ADMIN_EMAIL,
          role: 'admin',
          status: 'active',
          createdAt: serverTimestamp()
        });
        
        await signOut(auth);
        console.log("Admin account created successfully");
      } else {
        console.log("Admin account already exists");
      }
    } catch (error) {
      console.error("Error ensuring admin exists:", error);
    }
  };

  const checkIfAdmin = async (user: User) => {
    if (!user) return false;
    
    try {
      if (user.email === ADMIN_EMAIL) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: 'admin',
          status: 'active',
          updatedAt: serverTimestamp()
        }, { merge: true });
        return true;
      }
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.role === 'admin';
      }
      
      return false;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return user.email === ADMIN_EMAIL;
    }
  };

  useEffect(() => {
    ensureAdminExists();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed, user:", currentUser?.email);
      if (currentUser) {
        await ensureUserExists(currentUser);
        
        const adminStatus = await checkIfAdmin(currentUser);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Sign in successful for:", email);
      
      await ensureUserExists(userCredential.user);
      
      const adminStatus = await checkIfAdmin(userCredential.user);
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch (error) {
      console.error("Sign in error:", error);
      if (email === ADMIN_EMAIL && (error as any)?.code === "auth/user-not-found") {
        try {
          await ensureAdminExists();
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          setIsAdmin(true);
          return true;
        } catch (secondError) {
          console.error("Failed to create and sign in admin:", secondError);
          throw secondError;
        }
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      console.log("Created new user account:", userCredential.user.uid);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        role: email === ADMIN_EMAIL ? 'admin' : 'user',
        status: 'active',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
      
      console.log("User document saved to Firestore successfully");
      
      // IMPORTANT: After signup, explicitly sign out to prevent auto-login
      await signOut(auth);
      console.log("User signed out after signup to prevent auto-login");
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setIsAdmin(false);
  };

  const updateAdminEmail = async (newEmail: string) => {
    if (!user) throw new Error("No user signed in");
    
    try {
      await updateEmail(user, newEmail);
      
      await setDoc(doc(db, 'users', user.uid), { 
        email: newEmail,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Error updating email:", error);
      throw error;
    }
  };

  const updateAdminPassword = async (newPassword: string) => {
    if (!user) throw new Error("No user signed in");
    await updatePassword(user, newPassword);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAdmin, 
      signIn, 
      signUp, 
      logout, 
      updateAdminEmail, 
      updateAdminPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
