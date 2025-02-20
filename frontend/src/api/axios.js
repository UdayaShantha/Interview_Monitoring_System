import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8181/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getCandidates = async (page = 0, size = 10) => {
  try {
    const response = await api.get(
      `users/candidate/all/paginated?page=${page}&size=${size}`
    );

    // Ensure we're correctly extracting the response structure
    const data = response.data?.data || {}; // Extract 'data' object safely

    return {
      list: data.list || [],
      totalCandidates: data.totalCandidates || 0,
    };
  } catch (error) {
    let errorMessage = "Error fetching candidates";

    if (error.response) {
      errorMessage =
        error.response.data?.message || "Failed to fetch candidates";
    } else if (error.request) {
      errorMessage = "No response from server";
    }

    throw new Error(errorMessage);
  }
};

export default api;
