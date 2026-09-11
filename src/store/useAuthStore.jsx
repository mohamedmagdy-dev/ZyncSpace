import { create } from "zustand";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";

import { auth } from "../../firebase.config";

const getAuthErrorMessage = (code) => {
  switch (code) {
    case "auth/invalid-credential":
      return "Invalid email address or password";
    case "auth/user-not-found":
      return "User not found";
    case "auth/wrong-password":
      return "Wrong password";
    case "auth/too-many-requests":
      return "Too many requests, please try again later";
    case "auth/popup-closed-by-user":
      return "Sign in cancelled";
    case "auth/credential-already-in-use":
      return "Email already in use";
    default:
      return "Something went wrong. Please try again.";
  }
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

      return { success: true };
    } catch (err) {
      set({ loading: false, error: getAuthErrorMessage(err.code) });
      return { success: false};
    }
  },
}));

export default useAuthStore;
