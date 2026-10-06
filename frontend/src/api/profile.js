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

/**
 * Scan a CV file (multipart FormData with field `cv_file`).
 * Returns: { skills: [], address: null, raw_text_preview: "" }
 */
export const scanCv = (formData) =>
  client.post("/profiles/student/scan-cv/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/**
 * Upload CV and get recommended jobs.
 * Returns: { skills_found, address_found, candidate, recommendations, jobs_url_params }
 */
export const recommendJobsFromCv = (formData = new FormData()) =>
  client.post("/profiles/student/recommend-from-cv/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/**
 * Sync extracted skills into student's profile.
 * Body: { skills: string[] }
 */
export const syncStudentSkills = (skills) =>
  client.post("/profiles/student/sync-skills/", { skills });

