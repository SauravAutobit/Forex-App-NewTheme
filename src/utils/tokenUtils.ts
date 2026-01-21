import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  session?: string;
  // Add other fields if needed
  [key: string]: any;
}

export const getSessionIdFromToken = (token?: string | null): string | null => {
  if (!token) return null;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded.session || null;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};
