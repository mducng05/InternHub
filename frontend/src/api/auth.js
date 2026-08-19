import client from "./client";

export const login = (email, password) =>
  client.post("/auth/token/", { email, password });

export const register = (payload) => client.post("/auth/register/", payload);

export const fetchMe = () => client.get("/auth/me/");
