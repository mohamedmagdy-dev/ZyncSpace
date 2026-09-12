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
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../../firebase.config";

const getAuthErrorMessage = (code) => {
  switch (code) {
    // Register
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/weak-password":
      return "Password is too weak. Must be at least 6 characters.";
    case "auth/invalid-email":
      return "Invalid email address.";

    // Login
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";

    // Social / Popup
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email address.";

    // General & Network
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";

    default:
      return "An unexpected error occurred. Please try again.";
  }
};

const saveUserToFireStore = async (user, customUsername = null) => {
  if (!user?.uid) return;
  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      displayName:
        customUsername || user.displayName || user.email?.split("@")[0],
      email: user.email,
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,
  authReady: false,

  initAuth: () => {
    onAuthStateChanged(auth, (currentUser) => {
      set({ user: currentUser, authReady: true });
    });
  },

  register: async (username, email, password) => {
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
      await saveUserToFireStore(userCredential.user, username);

      set({ user: userCredential.user, loading: false });
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

  clearError: () => {
    set({ error: null });
  },
}));

export default useAuthStore;
