    import React, { useState, useEffect } from "react";
    import API from "../services/api";   
    import { useNavigate, useLocation } from "react-router-dom";
    import { loadStripe } from '@stripe/stripe-js';
    import { Elements } from '@stripe/react-stripe-js';
    import CheckoutForm from '../components/CheckoutForm';

    const stripePromise = loadStripe('pk_test_51T1NXjJfy9E80wCqGl8wa1qVlUJrRdgoJDvbKrPks5K9B9LUUHVdcKO0PtOeTRGl8NkjuO2oId9Qr18ihIVB6Ct200VAtrS7r0');

    const BookAppointment = () => {
        const [doctors, setDoctors] = useState([]);
        const [selectedDoctor, setSelectedDoctor] = useState(null);
        const [formData, setFormData] = useState({ date: "", time: "", message: "" });
        const [loading, setLoading] = useState(true);
        const [showPayment, setShowPayment] = useState(false); 
        const [clientSecret,setClientSecret]= useState(""); 

        const navigate = useNavigate();
        const location = useLocation();

        const queryParams = new URLSearchParams(location.search);
        const editId = queryParams.get("edit");

        useEffect(() => {
            const fetchDoctors = async () => {
                try {
                    const res = await API.get("/patient/view-doctors");
                    setDoctors(res.data);
                } catch (error) {
                    console.log("Doctor fetch error:", error);
                    alert("Doctor load nahi ho paya");
                } finally {
                    setLoading(false);   
                }
            };

            const token = localStorage.getItem("token");
            if (!token) {
                alert("Session expired, please login again");
                navigate("/login");
                return;
            }
            fetchDoctors();
        }, [navigate, editId]);

        const handlePaymentSuccess = async (paymentId) => {
            try {
                if (editId) {
                    await API.put(`patient/edit-appointment/${editId}`, {
                        ...formData,
                        doctorId: selectedDoctor._id,
                        paymentId: paymentId
                    });
                    alert("Appointment Updated Successfully!");
                } else {
                    await API.post("/patient/book", {
                        ...formData,
                        doctorId: selectedDoctor._id, 
                        paymentId: paymentId
                    });
                    alert("Payment Success & Appointment Booked!");
                }
                navigate("/patientDashboard");
            } catch (error) {
                alert("Payment Successful but DB update fail: " + error.message);
            }
        };

        const handleInitialSubmit = async (e) => {
            e.preventDefault();
            if (!selectedDoctor) {
                return alert("Please select a doctor");
            }
            try{
                const  res = await API.post("/payment/create-payment-intent",{amount:1000});
                setClientSecret(res.data.clientSecret);
                setShowPayment(true);
            }catch(error){
                alert("Payment Initialization failed. Check if backend is running");
            }
        };
        if (loading) {
            return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
        }
        const options ={
            clientSecret,
            appearance:{theme:'stripe'},
        };
        return (
            <div className="main-wrapper">
                <nav className="top-nav">
                    <h3>Tagore Hospital | Appointment Booking</h3>
                    <button onClick={() => navigate(-1)} className="back-btn">Dashboard</button>
                </nav>

                <div className="split-container">
                    <div className="left-panel">
                        <h2 className="panel-title">Choose Your Doctor</h2>
                        <div className="doc-list">
                            {doctors.map((doc) => (
                                <div
                                    key={doc._id}
                                    className={`doc-item ${selectedDoctor?._id === doc._id ? "active" : ""}`}
                                    onClick={() => {
                                        setSelectedDoctor(doc);
                                        setShowPayment(false);
                                    }}
                                >
                                    <img src={doc.image ? `http://localhost:8080/uploads/profilePics/${doc.image}` : "https://via.placeholder.com/60"} alt="doc" />
                                    <div className="details">
                                        <h4>Dr. {doc.name}</h4>
                                        <p>{doc.specialization}</p>
                                        <span className="status">Available</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="right-panel">
                        <div className="booking-form-card">
                            <h2 className="panel-title">Appointment Details</h2>
                            {!showPayment ? (
                                <>
                                    {selectedDoctor ? (
                                        <p>Booking with: <strong>Dr. {selectedDoctor.name}</strong></p>
                                    ) : (
                                        <p>Please select a doctor first</p>
                                    )}

                                    <form onSubmit={handleInitialSubmit}>
                                        <input type="date" required onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                                        <input type="time" required onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
                                        <textarea placeholder="Message..." onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                                        <button type="submit" disabled={!selectedDoctor}>Confirm Appointment</button>
                                    </form>
                                </>
                            ) : (
                                <div className="payment-section">
                                    <p>Paying ₹1000 for Dr. {selectedDoctor?.name}</p>
                                    <Elements stripe={stripePromise} options={options}>
                                        <CheckoutForm amount={1000} onPaymentSuccess={handlePaymentSuccess} />
                                    </Elements>
                                    <button onClick={() => setShowPayment(false)} className="black-link" style={{ marginTop: '10px', background: 'none', color: 'blue', cursor: 'pointer', border: 'none' }}>
                                        ← Edit details
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div> 
            </div>
        );
    };

    export default BookAppointment;