// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDhpnywL4FqkK-n4dabT6TyMm_yqgSCO_0",
  authDomain: "chat-app-54146.firebaseapp.com",
  projectId: "chat-app-54146",
  storageBucket: "chat-app-54146.firebasestorage.app",
  messagingSenderId: "278354205169",
  appId: "1:278354205169:web:e9aa4a42b93300b2aa4c50",
  measurementId: "G-FQLMN4TJVH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth =  getAuth(app)