import axios from "axios";
const API = axios.create({
    baseURL:"http://localhost:8080/api" ,
    withCredentials:true
});

export const IMG_URL="http://localhost:8080/uploads/Profile_Pics/";
export default API;