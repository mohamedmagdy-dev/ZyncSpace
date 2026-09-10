import { create } from "zustand";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../../firebase.config";

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

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
      set({ loading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },
}));

export default useAuthStore;
