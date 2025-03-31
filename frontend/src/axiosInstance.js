import axios from "axios";

const instance = axios.create({
 // baseURL: "http://localhost:9191/api/v1/questions"
  baseURL: "http://localhost:8083/api/v1/questions",
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
