import { create } from "zustand";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../../firebase.config";

const getAuthErrorMessage = (code) => {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/weak-password":
      return "Password is too weak. Must be at least 6 characters.";
    case "auth/invalid-email":
      return "Invalid email address.";

    case "auth/invalid-credential":
      case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";

    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email address.";

    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";

    default:
      return "An unexpected error occurred. Please try again.";
  }
};

const saveUserToFireStore = async (user, customUsername = null, photoURL = null) => {
  if (!user?.uid) return;
  const data = {
    uid: user.uid,
    displayName:
      customUsername || user.displayName || user.email?.split("@")[0],
    email: user.email,
    createdAt: serverTimestamp(),
  };
  if (photoURL !== null) {
    data.photoURL = photoURL;
  } else if (user.photoURL) {
    data.photoURL = user.photoURL;
  }
  await setDoc(doc(db, "users", user.uid), data, { merge: true });
};

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,
  authReady: false,

  initAuth: () => {
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            set({
              user: {
                ...currentUser,
                displayName: userData.displayName || currentUser.displayName,
                photoURL: userData.photoURL || currentUser.photoURL,
              },
              authReady: true,
            });
            return;
          }
        } catch (err) {
          console.error(err);
        }
        set({ user: currentUser, authReady: true });
      } else {
        set({ user: null, authReady: true });
      }
    });
  },

  register: async (username, email, password, photoBase64 = null) => {
    set({ loading: true, error: null });

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      if (username) {
        await updateProfile(userCredential.user, { displayName: username });
      }
      await saveUserToFireStore(userCredential.user, username, photoBase64);

      set({
        user: {
          ...userCredential.user,
          displayName: username || userCredential.user.email?.split("@")[0],
          photoURL: photoBase64,
        },
        loading: false,
      });
      return { success: true };
    } catch (err) {
      set({ loading: false, error: getAuthErrorMessage(err.code) });
      return { success: false };
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      set({ user: userCredential.user, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false, error: getAuthErrorMessage(err.code) });
      return { success: false };
    }
  },

  loginWithGoogle: async () => {
    set({ loading: true, error: null });
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      set({ user: result.user, loading: false });
      await saveUserToFireStore(result.user);
      return { success: true };
    } catch (err) {
      set({ loading: false, error: getAuthErrorMessage(err.code) });
      return { success: false };
    }
  },

  loginWithFacebook: async () => {
    set({ loading: true, error: null });
    const provider = new FacebookAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      set({ user: result.user, loading: false });
      await saveUserToFireStore(result.user);
      return { success: true };
    } catch (err) {
      set({ loading: false, error: getAuthErrorMessage(err.code) });
      return { success: false };
    }
  },

  resetPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      await sendPasswordResetEmail(auth, email);
      set({ loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false, error: getAuthErrorMessage(err.code) });
      return { success: false };
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await signOut(auth);
      set({ user: null, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false, error: getAuthErrorMessage(err.code) });
      return { success: false };
    }
  },

  updateUserProfile: async ({ displayName, photoURL }) => {
    set({ loading: true, error: null });
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return { success: false };

      const updates = {};
      if (displayName) updates.displayName = displayName;
      if (photoURL) updates.photoURL = photoURL;

      if (displayName) {
        await updateProfile(currentUser, { displayName });
      }

      await setDoc(doc(db, "users", currentUser.uid), updates, { merge: true });

      set((state) => ({
        user: {
          ...state.user,
          ...updates,
        },
        loading: false,
      }));
      return { success: true };
    } catch (err) {
      set({ loading: false, error: err.message });
      return { success: false };
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useAuthStore;
