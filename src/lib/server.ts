import { useSession } from "vinxi/http";

const baseUrl = 'https://bit-hauss-backend.vercel.app'

export enum UserType {
  SUPERADMIN = "SUPERADMIN",
  MODERATOR = "MODERATOR",
  BUYER = "BUYER",
  SELLER = "SELLER",
  INTERMEDIARY = "INTERMEDIARY",
}

export enum UserStatus {
  UNVERIFIED = "UNVERIFIED",
  VERIFIED = "VERIFIED",
}

export interface User {
  id: string;
  email: string;
  password: string;
  type: UserType;
  name: string;
  phone: string;
  taxRegime: string;
  rfc: string;
  status: UserStatus;
  cover?: string | null;
  uuid?: string;
  createAt?: Date;
  updateAt?: Date;
}

export interface SignInTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export type SignInUser = Pick<
  User,
  "id" | "uuid" | "email" | "type" | "name" | "status"
>;


export type ApiClientToken = Pick<SignInTokens, "accessToken">;

export type RequestInitSend = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown>;
};

export type RequestInitObtaint = Omit<RequestInit, "body"> & {
  params?: Record<string, unknown>;
};

export interface SignInResponse {
  user?: SignInUser;
  tokens?: SignInTokens;
}

export const buildParamsFromObject = (params?: Record<string, unknown>) => {
  if (!params) {
    return "";
  }
  const keys = Object.keys(params);
  if (keys.length === 0) {
    return "";
  }
  const query = new URLSearchParams();
  keys.forEach((key) => {
    const value = params[key];
    if (value === null || value === undefined || value === "") {
      return;
    }
    query.append(key, String(value));
  });
  return `?${query.toString()}`;
};


export const apiClient = {
  accessToken: "",
  setAccessToken(accessToken: string) {
    this.accessToken = accessToken;
    return this;
  },
  async get<T>(url: string, options?: RequestInitObtaint): Promise<T> {
    const response = await fetch(
      `${url}${buildParamsFromObject(options?.params)}`,
      {
        ...options,
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          ...options?.headers,
        },
      },
    );
    const data = await response.json();
    return data as T;
  },
  async post<T>(url: string, options?: RequestInitSend): Promise<T> {
    const response = await fetch(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
        ...options?.headers,
      },
      body: JSON.stringify(options?.body),
    });
    const data = await response.json();
    return data as T;
  },
  async put<T>(url: string, options?: RequestInitSend): Promise<T> {
    const response = await fetch(url, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
        ...options?.headers,
      },
      body: JSON.stringify(options?.body),
    });
    const data = await response.json();
    return data as T;
  },
  async patch<T>(url: string, options?: RequestInitSend): Promise<T> {
    const response = await fetch(url, {
      ...options,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
        ...options?.headers,
      },
      body: JSON.stringify(options?.body),
    });
    const data = await response.json();
    return data as T;
  },
  async delete<T>(url: string, options?: RequestInitObtaint): Promise<T> {
    const response = await fetch(
      `${url}${buildParamsFromObject(options?.params)}`,
      {
        ...options,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          ...options?.headers,
        },
      },
    );
    const data = await response.json();
    return data as T;
  },
};


export function validateUsername(username: unknown) {
  if (typeof username !== "string" || username.length < 3) {
    return `Usernames must be at least 3 characters long`;
  }
}

export function validatePassword(password: unknown) {
  if (typeof password !== "string" || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

export async function login(email: string, password: string) {
  return apiClient.post<SignInResponse>(`${baseUrl}/auth/signin`, {
    body: { email, password },
  })
}

export async function logout() {
  const session = await getSession();
  await session.update(d => (d.user = undefined));
}

export async function register(username: string, password: string) {
  
}

export function getSession() {
  return useSession<SignInResponse>({
    password: process.env.SESSION_SECRET ?? "areallylongsecretthatyoushouldreplace"
  });
}
