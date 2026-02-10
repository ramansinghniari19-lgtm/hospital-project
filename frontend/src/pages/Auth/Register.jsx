import React from "react";
import {Formik,Form,ErrorMessage,Field}  from "formik";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

const Register=()=>{
    const navigate=useNavigate();

    return(
        <div className="auth-container">
            <div className="auth-card">
                <h2>Create Account</h2>
                <Formik initialValues={{
                    name:"",
                    email:"",
                    password:"",
                    phone:"",
                    role:"patient",
                    address:"",
                    gender:"",
                    specialization: "", 
                    experience: "",
                    fees: "",
                    image:null
                }}
                onSubmit={async(values)=>{
                    try{
                        const res = await API.post("/auth/register",values);
                        if(res.data.success){
                            alert("Registration Successful! now Login.");
                            navigate("/login");
                        }
                    }catch(error){
                        alert(error.response?.data?.message|| "Registration Failed!");
                    }

                }}>
                     
                     {({setFieldValue,values})=>(
                        <Form>
                        <Field name="name" type="text" placeholder="enter your name" required />
                        <Field name="email" type="email" placeholder="enter your email" required />
                        <Field name="password" type="password" placeholder="enter your password" required />
                        <Field name="phone" type="text" placeholder="enter your phone number" required />
                        <Field name="address" type="text" placeholder="enter your address" required />

                        <div className="from-row" >
                            <label > Gender :</label>
                        <Field as="select" name="gender">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </Field>
                        <label >Role: </label>
                                <Field as="select" name="role">
                                    <option value="patient">Patient</option>
                                    <option value="doctor">Doctor</option>
                                </Field>
                        </div>

                            <div className="file-input" > 
                                 <label>Profile Picture:</label>
                                 <input type="file"
                                 name="image"
                                 accept="image/*"
                                 onChange={(e)=>setFieldValue("image",e.currentTarget.files[0])}/>
                                  </div>
                                  {values.role === "doctor" && (
                                <div className="doctor-section" style={{ borderTop: "1px solid #ccc", paddingTop: "10px" }}>
                                    <h4 style={{ color: "#007bff" }}>👨‍⚕️ Professional Details</h4>
                                    <Field name="specialization" placeholder="Specialization" required />
                                    <Field name="fees" type="number" placeholder="Consultation Fees" required />
                                    <Field name="experience" type="number" placeholder="Experience (Years)" required />
                                    <Field as="textarea" name="bio" placeholder="Tell us about yourself..." />
                                </div>
                            )}
                        <button type="submit">Register</button>
                        </Form>
                     )}
                </Formik>
                <p>Already have an account? <span style={{color:'blue',cursor:'pointer'}} onClick={()=>navigate("/login")}>Login</span></p>
            </div>
        </div>
    );
};
export default Register;