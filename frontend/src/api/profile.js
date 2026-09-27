import client from "./client";

export const getStudentProfile = () => client.get("/profiles/student/me/");

export const updateStudentProfile = (payload) =>
  client.put("/profiles/student/me/", payload);

export const patchStudentProfile = (payload) =>
  client.patch("/profiles/student/me/", payload);

export const getEmployerProfile = () => client.get("/profiles/employer/me/");

export const patchEmployerProfile = (payload) =>
  client.patch("/profiles/employer/me/", payload);

export const fetchPublicCompany = (id) => client.get(`/profiles/companies/${id}/`);
