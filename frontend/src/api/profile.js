import client from "./client";

export const getStudentProfile = () => client.get("/profiles/student/me/");

export const updateStudentProfile = (payload) =>
  client.put("/profiles/student/me/", payload);

export const patchStudentProfile = (payload) =>
  client.patch("/profiles/student/me/", payload);
