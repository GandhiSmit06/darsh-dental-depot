import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyBDpTH86EukRoLvjrC4g4nPDpWo8Aa54RU",
  authDomain: "darshdentaldepot-8cc7a.firebaseapp.com",
  projectId: "darshdentaldepot-8cc7a",
  storageBucket: "darshdentaldepot-8cc7a.firebasestorage.app",
  messagingSenderId: "780832675204",
  appId: "1:780832675204:web:e21873a39c84a49ff9b9d1",
  measurementId: "G-YQN80R66SP",
};

// Initialize Firebase
export const firebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const firebaseAuth = getAuth(firebaseApp);

let confirmationResult: ConfirmationResult | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;

export const phoneAuth = {
  setupRecaptcha: (containerId: string = "recaptcha-container") => {
    if (typeof window === "undefined") return null;

    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch {
        // ignore
      }
      recaptchaVerifier = null;
    }

    recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, containerId, {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved
      },
      "expired-callback": () => {
        // Response expired
      },
    });

    return recaptchaVerifier;
  },

  sendOtp: async (phoneNumber: string, containerId: string = "recaptcha-container") => {
    let cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length === 10) {
      cleanPhone = "+91" + cleanPhone;
    } else if (!cleanPhone.startsWith("+")) {
      cleanPhone = "+" + cleanPhone;
    }

    const appVerifier = phoneAuth.setupRecaptcha(containerId);
    if (!appVerifier) {
      throw new Error("Unable to initialize reCAPTCHA verification.");
    }

    confirmationResult = await signInWithPhoneNumber(
      firebaseAuth,
      cleanPhone,
      appVerifier
    );

    return {
      success: true,
      phone: cleanPhone,
      message: `A 6-digit SMS OTP has been sent to ${cleanPhone}.`,
    };
  },

  verifyOtp: async (code: string) => {
    if (!confirmationResult) {
      throw new Error("No active OTP session. Please request a new SMS OTP.");
    }

    const userCredential = await confirmationResult.confirm(code.trim());
    return userCredential.user;
  },

  clearSession: () => {
    confirmationResult = null;
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch {
        // ignore
      }
      recaptchaVerifier = null;
    }
  },
};
