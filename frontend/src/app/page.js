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
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientCode }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('clientId', data.clientId);
        // redirect to the products page
        router.push('/products');
      } else {
        setError(data.error || 'An unknown error occurred.');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Could not connect to the API. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <h1>Wholesale Storefront Login</h1>
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="clientCode">Client Code:</label>
            <input
              id="clientCode"
              type="text"
              value={clientCode}
              onChange={(e) => setClientCode(e.target.value)}
              placeholder="e.g., 1337"
              required
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      </div>
    </main>
  );
}
