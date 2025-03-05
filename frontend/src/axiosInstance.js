import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:9191/api/v1/users", // Base API Gateway URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
