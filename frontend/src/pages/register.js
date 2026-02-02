import React from "react";
import{useFormik} from "formik";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register=()=>{
    const navigate = useNavigate();
    const formik    = useFormik({
        initialvaluesL:{
            name:"",
            email:"",
            phone:"",
            password:"",
            gender:"Male",
            specialization:"",
            fees:"",
            experience:"",
            bio:"",
            image:null
        },
        onSubmit:async(values)=>{
            const data=new FormData();
            for(let key in values){
                data.append(key,values[key]);
            }
            try{
                const res = await axios.post ("http://localhost:8080/api/auth/register",data);
                if(res.status === 201){
                    alert("Registration Succesfull");
                    navigate("/login");
                }
            }catch(error){
                alert(error.response?.data?.message||"Failed");
            }
        }
    });
    return(
        <div>
            <h2>Tagore Hospital</h2>
            <form onSubmit={formik.handleSubmit}>
                <input name="name" placeholder="Name"{...formik.getFieldProps("name")}required/>
                <br/>
                <input name="email" type="email" placeholder="Email"{...formik.getFieldProps("email")}required/>
                <br/>
                <input name="password"type="password" placeholder="Password"{...formik.getFieldProps("password")}required/>
                <br/>
                <input name="phone" placeholder="phone"{...formik.getFieldProps("phone")}required/>
                <br/>
                <input name="address" placeholder="address"{...formik.getFieldProps("address")}required/>
                <br/>

                <select name="role"{...formik.getFieldProps("role")}>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                </select>
                <br/>

                <label>Profile Image: </label>
                <input
                type="file"
                name="image"
                onChange={(e)=>formik.setFieldValue("image",e.target.files[0])}
                required/>  
                <br/>
                {formik.values.role==="doctor"&&(
                    <div>
                        <input name="specilization" placeholder="specilization"{...formik.getFieldProps("specilization")}required/>
                        <br/>
                        <input name="fees" placeholder="fees"{...formik.getFieldProps("fees")}required/>
                        <br/>
                        <input name="experience" placeholder="experience"{...formik.getFieldProps("experience")}required/>
                        <br/>
                        <textarea name="bio" placeholder="bio"{...formik.getFieldProps("bio")}></textarea>
                    </div>
                )}
                <button type="submit">Register</button>
                
            </form>
        </div>
    )
};
export default Register;