import React,{useState} from "react";
import { Formik, Form, Field } from "formik";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import PasswordChecklist from "react-password-checklist";



const Register = () => {
    const [password,setPassword]=useState('');
    const [passwordAgain,setPasswordAgain]=useState('');
    const [isValid,setIsValid]=useState(false);
    
    const navigate = useNavigate();

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Create Account</h2>
                <Formik 
                    initialValues={{
                        name: "",
                        email: "",
                        password: "",
                        phone: "",
                        role: "patient",
                        address: "",
                        gender: "Male",
                        specialization: "",
                        experience: "",
                        fees: "",
                        bio: "",
                        image: null
                    }}
                    onSubmit={async (values) => {
                        try {
                            const formData = new FormData();
                            Object.keys(values).forEach((key) => {
                                if (values[key] !== null && values[key] !== "") {
                                    formData.append(key, values[key]);
                                }
                            });

                            const res = await API.post("/auth/register", formData, {
                                headers: { "Content-Type": "multipart/form-data" },
                            });

                            if (res.status === 201 || res.data.success) {
                                alert("Registration Successful!");
                                navigate("/login");
                            }
                        } catch (error) {
                            alert(error.response?.data?.message || "Registration Failed!");
                        }
                    }}
                >
                    {({ setFieldValue, values }) => (
                        <Form>
                            <Field name="name" type="text" placeholder="Enter your name" required />
                            <Field name="email" type="email" placeholder="Enter your email" required />
                            <Field name="password" type="password" placeholder="Enter your password" onChange={(e)=>{setFieldValue("password",e.target.value);setPassword(e.target.value);}} required />
                            <input name="password" type="password" placeholder="Confirm the password" onChange={(e)=>setPasswordAgain(e.target.value)} required/>
                            <PasswordChecklist rules={['minLength','specialChar','number','capital','match']}
                            minLength={8} value={password} valueAgain={passwordAgain} onChange={(isValid)=>setIsValid(isValid)} />
                            <Field name="phone" type="text" placeholder="Enter your phone number" required />
                            <Field name="address" type="text" placeholder="Enter your address" required />

                            <div className="from-row">
                                <label>Gender:</label>
                                <Field as="select" name="gender">
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </Field>

                                <label>Role:</label>
                                <Field as="select" name="role">
                                    <option value="patient">Patient</option>
                                    <option value="doctor">Doctor</option>
                                </Field>
                            </div>

                            <div className="file-input">
                                <label>Profile Picture:</label>
                                <input 
                                    type="file" 
                                    name="image" 
                                    accept="image/*" 
                                    onChange={(e) => setFieldValue("image", e.currentTarget.files[0])} 
                                />
                            </div>

                            {values.role === "doctor" && (
                                <div className="doctor-section" style={{ borderTop: "1px solid #ccc", paddingTop: "10px" }}>
                                    <h4 style={{ color: "#007bff" }}>Professional Details</h4>
                                    <Field name="specialization" placeholder="Specialization" required />
                                    <Field name="fees" type="number" placeholder="Consultation Fees" required />
                                    <Field name="experience" type="number" placeholder="Experience (Years)" required />
                                    <Field as="textarea" name="bio" placeholder="Tell us about yourself..." />
                                </div>
                            )}

                            <button type="submit" disabled={!isValid}>Register</button>
                        </Form>
                    )}
                </Formik>
                <p>Already have an account? <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => navigate("/login")}>Login</span></p>
            </div>
        </div>
    );
};

export default Register;