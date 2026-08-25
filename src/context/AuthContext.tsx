import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as fbSignOut,
  signInAnonymously
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { UserProfile } from '../types';

export const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4tPnUtPcgXuYydjeBfHJFezeALr-CckH3Nm7tdNnLuFpbGGBia7FmPa06n-vKrMmKEuwCtvsSBDCEpDBEsW60JpXSqzXUqn2kOBBSj6hpEhSSLWOE6cDCVH6z2q9gbp3hN-9KEb8yucJ4AxZXAwc9EYMOinPEYiXMAk-GfO_7KKVjFaxvFkLwmLDMUznPp2Ktb7mldCaEgSvHeVBmONfYMWRJmtpYDZDRLZ6EBShJROticqqBTniddQ';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsDemo: (customEmail?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile({
              uid: currentUser.uid,
              email: currentUser.email || data.email || 'p.peeraya41@gmail.com',
              displayName: currentUser.displayName || data.displayName || 'Peeraya P.',
              photoURL: currentUser.photoURL || data.photoURL || DEFAULT_AVATAR,
              monthlyBudget: data.monthlyBudget ?? 3000,
              currency: data.currency ?? '$',
              isAnonymous: currentUser.isAnonymous,
            });
          } else {
            const initialProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || 'p.peeraya41@gmail.com',
              displayName: currentUser.displayName || 'Peeraya P.',
              photoURL: currentUser.photoURL || DEFAULT_AVATAR,
              monthlyBudget: 3000,
              currency: '$',
              isAnonymous: currentUser.isAnonymous,
            };
            await setDoc(userDocRef, initialProfile, { merge: true });
            setUserProfile(initialProfile);
          }
        } catch (err: any) {
          console.warn('Firestore user fetch failed, using fallback profile:', err);
          setUserProfile({
            uid: currentUser.uid,
            email: currentUser.email || 'p.peeraya41@gmail.com',
            displayName: currentUser.displayName || 'Peeraya P.',
            photoURL: currentUser.photoURL || DEFAULT_AVATAR,
            monthlyBudget: 3000,
            currency: '$',
            isAnonymous: currentUser.isAnonymous,
          });
        }
      } else {
        // Default local profile for guest preview
        setUserProfile({
          uid: 'demo-user-1',
          email: 'p.peeraya41@gmail.com',
          displayName: 'Peeraya P.',
          photoURL: DEFAULT_AVATAR,
          monthlyBudget: 3000,
          currency: '$',
          isAnonymous: true,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      // In iframes, popup might be blocked or auth domain blocked
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        setAuthError('Popup was blocked by the browser. Please allow popups or use Demo Mode.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in cancelled.');
      } else {
        setAuthError(err.message || 'Failed to sign in with Google');
      }
    }
  };

  const signInAsDemo = async (customEmail: string = 'p.peeraya41@gmail.com') => {
    setAuthError(null);
    try {
      const res = await signInAnonymously(auth);
      if (res.user) {
        const profile: UserProfile = {
          uid: res.user.uid,
          email: customEmail,
          displayName: customEmail.split('@')[0],
          photoURL: DEFAULT_AVATAR,
          monthlyBudget: 3000,
          currency: '$',
          isAnonymous: true,
        };
        setUserProfile(profile);
        try {
          await setDoc(doc(db, 'users', res.user.uid), profile, { merge: true });
        } catch (e) {
          console.warn('Firestore setDoc notice:', e);
        }
      }
    } catch (err: any) {
      console.error('Demo Sign In Error:', err);
      // Local demo fallback
      setUserProfile({
        uid: 'demo-user-1',
        email: customEmail,
        displayName: customEmail.split('@')[0],
        photoURL: DEFAULT_AVATAR,
        monthlyBudget: 3000,
        currency: '$',
        isAnonymous: true,
      });
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      setUserProfile({
        uid: 'guest-' + Math.random().toString(36).substring(7),
        email: null,
        displayName: 'Guest User',
        photoURL: DEFAULT_AVATAR,
        monthlyBudget: 3000,
        currency: '$',
        isAnonymous: true,
      });
    } catch (err: any) {
      console.error('Sign Out Error:', err);
    }
  };

  const updateProfile = async (partial: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...partial };
    setUserProfile(updated);

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
      } catch (err) {
        console.warn('Could not sync profile with Firestore:', err);
      }
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signInAsDemo,
        signOut,
        updateProfile,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
