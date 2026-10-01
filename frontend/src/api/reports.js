import client from "./client";

export const createReport = (payload) => client.post("/moderation/reports/", payload);
