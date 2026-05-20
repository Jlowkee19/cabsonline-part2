// App.jsx
// Student: xvq7775
// Description: Main app component - routes between Booking and Admin pages

import { useState } from 'react';
import BookingForm from './BookingForm';
import AdminPanel from './AdminPanel';

export default function App() {
  const [page, setPage] = useState('booking');

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        maxWidth: '900px',
        margin: '40px auto',
        padding: '0 20px',
      }}
    >
      {/* Navigation */}
      <div
        style={{
          marginBottom: '30px',
          borderBottom: '2px solid #1F3864',
          paddingBottom: '15px',
        }}
      >
        <h1 style={{ color: '#1F3864', margin: 0 }}>🚕 CabsOnline</h1>
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={() => setPage('booking')}
            style={{
              marginRight: '10px',
              padding: '8px 20px',
              backgroundColor: page === 'booking' ? '#1F3864' : '#ccc',
              color: page === 'booking' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Book a Taxi
          </button>
          <button
            onClick={() => setPage('admin')}
            style={{
              padding: '8px 20px',
              backgroundColor: page === 'admin' ? '#1F3864' : '#ccc',
              color: page === 'admin' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Admin Panel
          </button>
        </div>
      </div>

      {/* Page Content */}
      {page === 'booking' ? <BookingForm /> : <AdminPanel />}
    </div>
  );
}
