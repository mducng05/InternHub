import client from "./client";

export const fetchJobs = (params) => client.get("/jobs/", { params });

export const fetchJobDetail = (id) => client.get(`/jobs/${id}/`);

export const fetchRecommendedJobs = () => client.get("/jobs/recommendations/");

export const saveJob = (id) => client.post(`/jobs/${id}/save/`);

export const fetchSavedJobs = () => client.get("/jobs/saved/");
