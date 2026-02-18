import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ amount, onPaymentSuccess }) => {
    const stripe = useStripe(); 
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [method, setMethod] = useState('card'); 

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (method === 'cod') {
            setIsProcessing(true);
            setTimeout(() => {
                onPaymentSuccess("COD_PENDING_" + Date.now());
                setIsProcessing(false);
            }, 1000);
            return;
        }

        if (!stripe || !elements) return;
        setIsProcessing(true);
        setErrorMessage('');

        try {
            const response = await fetch("http://localhost:8080/api/payment/create-payment-intent", {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });

            const data = await response.json();
            const { clientSecret } = data;

            if (!clientSecret) {
                throw new Error("Client Secret not found. Check Backend Console.");
            }

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                },
            });

            if (result.error) {
                setErrorMessage(result.error.message);
                setIsProcessing(false);
            } else if (result.paymentIntent.status === 'succeeded') {
                onPaymentSuccess(result.paymentIntent.id);
            }
        } catch (error) {
            setErrorMessage("Payment Failed: " + error.message);
            setIsProcessing(false);
        }
    };

    return (
        <div className="checkout-wrapper">
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', justifyContent: 'center' }}>
                <label style={{ cursor: 'pointer' }}>
                    <input 
                        type="radio" 
                        name="method" 
                        checked={method === 'card'} 
                        onChange={() => setMethod('card')} 
                    />  Pay by Card
                </label>
                <label style={{ cursor: 'pointer' }}>
                    <input 
                        type="radio" 
                        name="method" 
                        checked={method === 'cod'} 
                        onChange={() => setMethod('cod')} 
                    />  Cash at Hospital
                </label>
            </div>

            <form onSubmit={handleSubmit} className='payment-form'>
                <h4 className='payment-title' style={{ textAlign: 'center' }}>
                    {method === 'card' ? "Secure Card Payment" : "Confirm Cash Booking"} - ₨{amount}
                </h4>

                {method === 'card' ? (
                    <div className='card-input-wrapper' style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', margin: '15px 0', background: '#f9f9f9' }}>
                        <CardElement options={{
                            style: {
                                base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } },
                            }
                        }} />
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: '#666', padding: '20px', border: '1px dashed #28a745', borderRadius: '8px', margin: '15px 0' }}>
                        Aap appointment ke baad hospital desk par cash pay kar sakte hain.
                    </p>
                )}

                {errorMessage && <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>}
                
                <button 
                    className='pay-btn' 
                    disabled={isProcessing || (method === 'card' && !stripe)}
                    style={{ 
                        width: '100%', 
                        padding: '12px', 
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        background: method === 'card' ? '#6772e5' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                    }}
                >
                    {isProcessing ? "Processing..." : method === 'card' ? "Pay Now" : "Confirm Appointment"}
                </button>
            </form>
        </div>
    );
};

export default CheckoutForm;