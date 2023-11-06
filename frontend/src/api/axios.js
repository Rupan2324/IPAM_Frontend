import axios from "axios";

//const BASEURL = import.meta.env.VITE_API_BASE_URL;

const BASEURL = 'http://localhost:8082';

const instance = axios.create({
  baseURL: BASEURL,
});
export const axiosPrivate = axios.create({
  baseURL: BASEURL,
  headers: {'Content-Type': 'application/json'},
})

export default instance;
