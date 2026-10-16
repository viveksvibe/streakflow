import apiClient from ".";

export const signUpApi = async (payload: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  return apiClient.post("/auth/register", payload);
};

export const signInApi = async (payload: {
  email: string;
  password: string;
}) => {
  return apiClient.post("/auth/login", payload);
};

export const refreshApi = async () => {
  return apiClient.post("/auth/refresh");
};

export const logoutApi = async () => {
  return apiClient.post("/auth/logout");
};

export const getCurrentUserApi = async () => {
  return apiClient.get("/auth/me");
};

export const updateProfileApi = async (data: FormData) => {
  return apiClient.patch("/auth/me", data);
};

export const googleLoginApi = async (accessToken: string) => {
  return apiClient.post("/auth/google", { accessToken });
};