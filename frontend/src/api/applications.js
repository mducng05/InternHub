import client from "./client";

export const applyJob = (formData) => {
  return client.post("/applications/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const checkApplied = (jobId) => {
  return client.get(`/applications/check/${jobId}/`);
};

export const fetchMyApplications = () => {
  return client.get("/applications/my/");
};

export const cancelApplication = (id) => client.delete(`/applications/${id}/`);

