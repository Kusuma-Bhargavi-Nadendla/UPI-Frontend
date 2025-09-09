import { useState } from 'react';
import UPIQRCode from "./UPIQRCode";

interface PaymentResponse {
  success: boolean;
  paymentId: string;
}

const PaymentButton = () => {
  const [itemCount, setItemCount] = useState<number>(1);
  const [showQR, setShowQR] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState<boolean>(false);

  // CONFIG — CHANGE TO YOUR UPI
  const RECEIVER_UPI = "6304352660@ybl";
  const RECEIVER_NAME = "Kusuma Nadendla";
  const PRICE_PER_ITEM = 10;
  const totalAmount = (itemCount * PRICE_PER_ITEM).toFixed(2);

  // Initiate payment with server
  const initiatePayment = async () => {
    setIsPaying(true);
    setPaymentStatus(null);
    setShowQR(false);

    try {
      // const response = await fetch('http://localhost:5000/api/initiate-payment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount: totalAmount, items: itemCount }),
      // });

      // const data: PaymentResponse = await response.json();
      const data: PaymentResponse = { success: true, paymentId: `pay_${Date.now()}` }; // Mock response

      if (data.success) {
        setPaymentId(data.paymentId);
        console.log(" Payment initiated with ID:", data.paymentId);

        //Generate UPI URL with paymentId in note (for tracking)
        // const upiUrl = `upi://pay?pa=${encodeURIComponent(RECEIVER_UPI)}&pn=${encodeURIComponent(RECEIVER_NAME)}&am=${totalAmount}&cu=INR&tn=Order:${data.paymentId}`;
        const upiUrl = `upi://pay?pa=${encodeURIComponent(RECEIVER_UPI)}&pn=${encodeURIComponent(RECEIVER_NAME)}&am=${totalAmount}&cu=INR&tr=${paymentId}&tn=Order:${paymentId}&mc=0000`;

        // Open UPI app
        window.location.href = upiUrl;

        // Show QR fallback after 1s
        setTimeout(() => {
          setShowQR(true);
        }, 1000);

        // Simulate checking payment status after delay
        simulateCheckPaymentStatus(data.paymentId);
      } else {
        throw new Error("Payment initiation failed");
      }
    } catch (e) {
      console.error(e);
      setPaymentStatus('failure');
    } finally {
      setIsPaying(false);
    }
  };

  // Simulate polling server for payment status
  const simulateCheckPaymentStatus = (id: string) => {
    setPaymentStatus('checking');

    const interval = setInterval(async () => {
      try {
        // const res = await fetch(`http://localhost:5000/api/payment-status/${id}`);
        // const paymentData = await res.json();
        const paymentData = { status: Math.random() < 0.7 ? 'success' : 'failure' }; // Mock random success/failure

        if (paymentData.status === 'success' || paymentData.status === 'failure') {
          clearInterval(interval);
          setPaymentStatus(paymentData.status);
          console.log(" Payment result:", paymentData.status);
        }
      } catch (e) {
        console.warn("Status check failed");
      }
    }, 3000);
    setTimeout(() => {
      clearInterval(interval);
      if (paymentStatus === 'checking') {
        setPaymentStatus('timeout');
      }
    }, 15000);
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Arial' }}>
      <h2> Order Items</h2>

      <div style={{ margin: '1.5rem 0', fontSize: '1.3rem' }}>
        <button
          onClick={() => setItemCount(Math.max(1, itemCount - 1))}
          style={{ padding: '0.5rem 1rem', margin: '0 0.5rem' }}
        >
          -
        </button>
        <span>{itemCount} item(s)</span>
        <button
          onClick={() => setItemCount(itemCount + 1)}
          style={{ padding: '0.5rem 1rem', margin: '0 0.5rem' }}
        >
          +
        </button>
      </div>

      <h3> Pay: ₹{totalAmount}</h3>

      <button
        onClick={initiatePayment}
        disabled={isPaying || paymentStatus === 'success'}
        style={{
          padding: '0.75rem 2rem',
          fontSize: '1.1rem',
          background: isPaying ? '#ccc' : paymentStatus === 'success' ? '#28a745' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: isPaying ? 'not-allowed' : 'pointer',
        }}
      >
        {isPaying ? ' Processing...' :
          paymentStatus === 'success' ? ' Paid!' :
            `Pay ₹${totalAmount} via UPI`}
      </button>

      {showQR && <UPIQRCode upiUrl={`upi://pay?pa=${encodeURIComponent(RECEIVER_UPI)}&pn=${encodeURIComponent(RECEIVER_NAME)}&mc=0000&tr=${paymentId}&am=${totalAmount}&cu=INR&tn=Order:${paymentId}`} />}

      <a
        href={`upi://pay?pa=${encodeURIComponent(RECEIVER_UPI)}&pn=${encodeURIComponent(RECEIVER_NAME)}&mc=0000&tr=${paymentId}&am=${totalAmount}&cu=INR&tn=Order:${paymentId}`}
        style={{
          display: 'block',
          marginTop: '1rem',
          fontSize: '1rem',
          color: '#007bff',
          textDecoration: 'underline',
        }}
      >
        Proceed to pay with UPI link
      </a>


      {paymentStatus && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: paymentStatus === 'success' ? '#d4edda' : '#f8d7da',
            color: paymentStatus === 'success' ? '#155724' : '#721c24',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          {paymentStatus === 'success' && ' Payment Successful! (Simulated via server)'}
          {paymentStatus === 'failure' && ' Payment Failed (Simulated)'}
          {paymentStatus === 'checking' && ' Checking payment status...'}
          {paymentStatus === 'timeout' && ' Status check timed out. Check manually.'}
          {paymentId && <div><small>Payment ID: {paymentId}</small></div>}
        </div>
      )}

      <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
        Real payment goes to: <strong>{RECEIVER_UPI}</strong>
      </p>
    </div>
  );
};

export default PaymentButton;