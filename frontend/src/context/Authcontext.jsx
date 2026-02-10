import React,{createContext,useState,useEffect} from "react";

export const Authcontext=createContext();

export const AuthProvider =({children})=>{
    const[user,setUser]=useState(null);
    const [loading,setLoading]= useState(true);


    useEffect(()=>{
        const savedUser = localStorage.getItem("user");
        if(savedUser){
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    },[])
     
    const login = (userData)=>{
        setUser(userData);
        localStorage.setItem("user",JSON.stringify(userData));
    } ;
    const logout = () =>{
        setUser(null);
        localStorage.removeItem("user");
        window.location.href = "/login";
    };
    return(
      <  Authcontext.Provider value ={{user,login,logout,loading}}>
      {!loading && children}
      </Authcontext.Provider>
    )
}