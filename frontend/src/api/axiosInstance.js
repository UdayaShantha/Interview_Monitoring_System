import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:9191/api/v1/users", 
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;

