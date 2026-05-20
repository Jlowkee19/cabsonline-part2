// BookingForm.jsx
// Student: xvq7775
// Description: Customer booking form component
// Sends booking data to booking.php on webdev server using fetch

import { useState, useEffect } from 'react';

const PHP_BASE = 'https://corsproxy.io/?url=https://webdev.aut.ac.nz/~xvq7775/assign_part2';

export default function BookingForm() {
  const [form, setForm] = useState({
    cname: '',
    phone: '',
    unumber: '',
    snumber: '',
    stname: '',
    sbname: '',
    dsbname: '',
    date: '',
    time: '',
  });
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  // Pre-fill date and time on load
  useEffect(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setForm((f) => ({
      ...f,
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}`,
    }));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');

    // Validation
    if (!form.cname) return setError('Please enter your name.');
    if (!form.phone) return setError('Please enter your phone number.');
    if (!/^\d{10,12}$/.test(form.phone))
      return setError('Phone must be 10-12 digits.');
    if (!form.snumber) return setError('Please enter your street number.');
    if (!form.stname) return setError('Please enter your street name.');
    if (!form.date) return setError('Please enter a pickup date.');
    if (!form.time) return setError('Please enter a pickup time.');

    // Past date check
    const parts = form.date.split('/');
    const pickup = new Date(
      parts[2],
      parts[1] - 1,
      parts[0],
      form.time.split(':')[0],
      form.time.split(':')[1]
    );
    if (pickup < new Date())
      return setError('Pickup date and time cannot be in the past.');

    // Send to PHP
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));

    try {
      const res = await fetch(`${PHP_BASE}/booking.php`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'success') {
        setConfirmation(data);
      } else {
        setError('Error: ' + data.message);
      }
    } catch {
      setError('Connection error. Please try again.');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    marginBottom: '12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  };

  if (confirmation)
    return (
      <div
        style={{ padding: '30px', background: '#e8f5e9', borderRadius: '8px' }}
      >
        <h2 style={{ color: '#2e7d32' }}>✅ Booking Confirmed!</h2>
        <p>
          <strong>Booking Reference Number:</strong> {confirmation.brn}
        </p>
        <p>
          <strong>Pickup Date:</strong> {confirmation.pdate}
        </p>
        <p>
          <strong>Pickup Time:</strong> {confirmation.ptime}
        </p>
        <button
          onClick={() => setConfirmation(null)}
          style={{
            marginTop: '15px',
            padding: '8px 20px',
            backgroundColor: '#1F3864',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Make Another Booking
        </button>
      </div>
    );

  return (
    <div>
      <h2 style={{ color: '#2E75B6' }}>Book a Taxi</h2>
      {[
        { label: 'Customer Name *', name: 'cname' },
        { label: 'Phone Number * (10-12 digits)', name: 'phone' },
        { label: 'Unit Number (optional)', name: 'unumber' },
        { label: 'Street Number *', name: 'snumber' },
        { label: 'Street Name *', name: 'stname' },
        { label: 'Pickup Suburb (optional)', name: 'sbname' },
        { label: 'Destination Suburb (optional)', name: 'dsbname' },
        { label: 'Pickup Date * (DD/MM/YYYY)', name: 'date' },
        { label: 'Pickup Time * (HH:MM)', name: 'time' },
      ].map(({ label, name }) => (
        <div key={name}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {label}
          </label>
          <br />
          <input
            type={name === 'time' ? 'time' : 'text'}
            name={name}
            value={form[name]}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
      ))}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button
        onClick={handleSubmit}
        style={{
          padding: '10px 24px',
          backgroundColor: '#1F3864',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Book Taxi 🚕
      </button>
    </div>
  );
}
