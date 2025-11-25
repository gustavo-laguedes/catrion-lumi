// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBRRiyP6NfaYt0QORlOo8s0w4oJkOpMZ7w",
  authDomain: "catrion-lumi.firebaseapp.com",
  projectId: "catrion-lumi",
  storageBucket: "catrion-lumi.firebasestorage.app",
  messagingSenderId: "236769242398",
  appId: "1:236769242398:web:c4f734e313b9821b5bed0f"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
