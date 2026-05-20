// AdminPanel.jsx
// Student: xvq7775
// Description: Admin search and assign component
// Fetches booking data from admin.php on webdev server

import { useState } from 'react';

const PHP_BASE = 'https://webdev.aut.ac.nz/~xvq7775/assign_part2';

export default function AdminPanel() {
  const [bsearch, setBsearch] = useState('');
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [assignMsg, setAssignMsg] = useState('');

  const handleSearch = async () => {
    setError('');
    setAssignMsg('');
    setRecords([]);

    if (bsearch !== '' && !/^BRN\d{5}$/.test(bsearch)) {
      return setError(
        'Invalid format. Please enter a valid BRN (e.g. BRN00001).'
      );
    }

    const formData = new FormData();
    formData.append('action', 'search');
    formData.append('bsearch', bsearch);

    try {
      const res = await fetch(`${PHP_BASE}/admin.php`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'error') return setError(data.message);
      if (data.records.length === 0) return setError('No bookings found.');
      setRecords(data.records);
    } catch {
      setError('Connection error. Please try again.');
    }
  };

  const handleAssign = async (brn) => {
    const formData = new FormData();
    formData.append('action', 'assign');
    formData.append('brn', brn);

    try {
      const res = await fetch(`${PHP_BASE}/admin.php`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'success') {
        setRecords(
          records.map((r) => (r.brn === brn ? { ...r, status: 'assigned' } : r))
        );
        setAssignMsg(
          `Congratulations! Booking request ${brn} has been assigned!`
        );
      }
    } catch {
      setError('Connection error. Please try again.');
    }
  };

  return (
    <div>
      <h2 style={{ color: '#2E75B6' }}>Admin Panel</h2>
      <p style={{ color: '#555' }}>
        Enter a BRN to find a specific booking, or leave empty to see all
        unassigned bookings within 2 hours.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          name="bsearch"
          value={bsearch}
          onChange={(e) => setBsearch(e.target.value)}
          placeholder="e.g. BRN00001"
          style={{
            padding: '8px',
            width: '250px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginRight: '10px',
          }}
        />
        <input
          type="button"
          name="sbutton"
          value="Search"
          onClick={handleSearch}
          style={{
            padding: '8px 20px',
            backgroundColor: '#1F3864',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {assignMsg && (
        <p style={{ color: 'green', fontWeight: 'bold' }}>{assignMsg}</p>
      )}

      {records.length > 0 && (
        <div className="content" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#1F3864', color: 'white' }}>
                {[
                  'BRN',
                  'Name',
                  'Phone',
                  'Pickup Suburb',
                  'Dest. Suburb',
                  'Date & Time',
                  'Status',
                  'Assign',
                ].map((h) => (
                  <th key={h} style={{ padding: '10px', textAlign: 'left' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr
                  key={r.brn}
                  style={{ backgroundColor: i % 2 === 0 ? '#f2f2f2' : 'white' }}
                >
                  <td style={{ padding: '8px' }}>{r.brn}</td>
                  <td style={{ padding: '8px' }}>{r.cname}</td>
                  <td style={{ padding: '8px' }}>{r.phone}</td>
                  <td style={{ padding: '8px' }}>{r.sbname}</td>
                  <td style={{ padding: '8px' }}>{r.dsbname}</td>
                  <td style={{ padding: '8px' }}>
                    {r.pdate} {r.ptime}
                  </td>
                  <td style={{ padding: '8px' }}>{r.status}</td>
                  <td style={{ padding: '8px' }}>
                    <button
                      name="Assign"
                      onClick={() => handleAssign(r.brn)}
                      disabled={r.status === 'assigned'}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor:
                          r.status === 'assigned' ? '#aaa' : '#2E75B6',
                        color: 'white',
                        cursor:
                          r.status === 'assigned' ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
