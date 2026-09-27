import client from "./client";

export const login = (email, password) =>
  client.post("/auth/token/", { email, password });

export const register = (payload) => client.post("/auth/register/", payload);

export const fetchMe = () => client.get("/auth/me/");

export const patchMe = (payload) => client.patch("/auth/me/", payload);

export const googleAuth = (credential, role = "student") =>
  client.post("/auth/google/", { credential, role });

export const changePassword = (payload) =>
  client.post("/auth/change-password/", payload);

