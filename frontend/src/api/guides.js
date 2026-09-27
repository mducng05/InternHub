import client from "./client";

export const fetchMarketInsights = () => client.get("/jobs/market-insights/");