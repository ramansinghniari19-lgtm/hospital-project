import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute=({children,roleRequired})=>{
    const user = JSON.parse(localStorage.getItem("user"));
    if(!user){
        return<Navigate to="/login"/>
    }
    if(roleRequired && user.role !==roleRequired){
        return <Navigate to="/"/>
    }
    return children;
};
export default ProtectedRoute;