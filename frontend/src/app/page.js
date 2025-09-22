'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css'; 

export default function LoginPage() {
  const [clientCode, setClientCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientCode }),
      });
      const data = await response.json();
      if (response.ok) {
        sessionStorage.setItem('clientId', data.clientId);
        router.push('/products');
      } else {
        setError(data.error || 'An unknown error occurred.');
      }
    } catch (err) {
      setError('Could not connect to the API. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container">
      <div className={styles.header}>
        <h1>Wholesale Login</h1>
      </div>
      
      <form onSubmit={handleLogin} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="clientCode" className={styles.label}>Client Code</label>
          <input
            id="clientCode"
            type="text"
            value={clientCode}
            onChange={(e) => setClientCode(e.target.value)}
            placeholder="e.g., 1337"
            required
            className={styles.input}
          />
        </div>
        <button type="submit" disabled={isLoading} className={styles.button}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </main>
  );
}