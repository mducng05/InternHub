import client from "./client";

export const fetchJobs = (params) => client.get("/jobs/", { params });

export const fetchSalaryInsights = (params) => client.get("/jobs/salary-insights/", { params });

export const fetchEmployerJobs = () => client.get("/jobs/manage/");

export const createEmployerJob = (payload) => client.post("/jobs/manage/", payload);

export const updateEmployerJob = (id, payload) => client.patch(`/jobs/manage/${id}/`, payload);

export const closeEmployerJob = (id) => client.post(`/jobs/manage/${id}/close/`);

export const fetchEmployerJobApplications = (id) => client.get(`/jobs/manage/${id}/applications/`);

export const updateEmployerApplicationStatus = (jobId, applicationId, payload) =>
	client.patch(`/jobs/manage/${jobId}/applications/${applicationId}/status/`, payload);

export const fetchJobDetail = (id) => client.get(`/jobs/${id}/`);

export const fetchRecommendedJobs = () => client.get("/jobs/recommendations/");

export const saveJob = (id) => client.post(`/jobs/${id}/save/`);

export const fetchSavedJobs = () => client.get("/jobs/saved/");
