import client from "./client";

export const fetchIndustries = () => client.get("/catalog/industries/");
export const fetchJobCategories = () => client.get("/catalog/job-categories/");
export const fetchLocations = () => client.get("/catalog/locations/");