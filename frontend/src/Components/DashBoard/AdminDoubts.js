import React, { useEffect, useState } from 'react';

const AdminDoubts = () => {
  const [doubts, setDoubts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/discussions/all')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDoubts(data);
        } else {
          console.error('Invalid response:', data);
          setDoubts([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching doubts:', error);
        setDoubts([]);
      });
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>All Student Doubts</h2>
      {doubts.length === 0 ? (
        <p style={styles.noDoubts}>No doubts submitted yet.</p>
      ) : (
        doubts.map((doubt) => (
          <div key={doubt.id} style={styles.doubtBox}>
            <p style={styles.user}>
              <strong>{doubt.uName}</strong> ({doubt.email})
            </p>
            <p style={styles.content}>{doubt.content}</p>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
  },
  doubtBox: {
    backgroundColor: '#fff',
    padding: '15px 20px',
    marginBottom: '15px',
    borderRadius: '8px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
  },
  user: {
    color: '#6c63ff',
    fontSize: '14px',
    marginBottom: '5px',
  },
  content: {
    fontSize: '16px',
    color: '#333',
  },
  noDoubts: {
    textAlign: 'center',
    color: '#777',
    fontStyle: 'italic',
  },
};

export default AdminDoubts;
