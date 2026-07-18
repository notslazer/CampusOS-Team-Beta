import type { UserCredential } from "firebase/auth";
import type {
  AuthSession,
  LoginPayload,
  RegisterPayload,
  User,
} from "../types";
import { api } from "./api";

export const loginUser = async (
  credentials: Pick<LoginPayload, "email" | "password">
): Promise<AuthSession> => {
  try {
    const { data } = await api.post("/auth/login", credentials);
    return data;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const registerUser = async (userData: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  year: string;
}): Promise<AuthSession> => {
  try {
    const { data } = await api.post("/auth/register", userData);
    return data;
  } catch (error) {
    console.error("Registration failed", error);
    throw error;
  }
};

export const authService = {
  async login(
    payload: LoginPayload
  ): Promise<AuthSession> {
    return loginUser({
      email: payload.email,
      password: payload.password,
    });
  },

  async register(
    payload: RegisterPayload
  ): Promise<AuthSession> {
    return registerUser({
      fullName: payload.name,
      email: payload.email,
      password: payload.password,
      confirmPassword: payload.password,
      department: payload.department,
      year: payload.year,
    });
  },

  async googleLogin(
    firebaseUser: UserCredential["user"]
  ): Promise<AuthSession> {

    const token =
      await firebaseUser.getIdToken();

    const user: User = {
      id:
        firebaseUser.uid,

      name:
        firebaseUser.displayName ??
        "Google User",

      email:
        firebaseUser.email ?? "",

      role:
        "member",

      department: "",

      year: "",
    };

    return {
      token,
      user,
    };
  },

  async getProfile() {
    throw new Error(
      "Profile endpoint not connected."
    );
  },

  async getDashboard() {
    throw new Error(
      "Dashboard endpoint not connected."
    );
  },
};

export default authService;

