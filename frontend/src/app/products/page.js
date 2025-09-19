
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';

export default function ProductsPage() {
  const [productsData, setProductsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const clientId = sessionStorage.getItem('clientId');

    if (!clientId) {
      // if there's no clientId, redirect back to the login page
      router.push('/');
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/GetProducts?clientId=${clientId}`);
        const data = await response.json();

        if (response.ok) {
          setProductsData(data);
        } else {
          setError(data.error || 'Failed to fetch products.');
        }
      } catch (err) {
        console.error('Fetch products failed:', err);
        setError('Could not connect to the API.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [router]);

  if (isLoading) {
    return <main className={styles.main}><p>Loading products...</p></main>;
  }

  if (error) {
    return <main className={styles.main}><p style={{ color: 'red' }}>Error: {error}</p></main>;
  }

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <h1>{productsData?.message || 'Product Catalog'}</h1>
        <div style={{ marginTop: '2rem', width: '100%' }}>
          {productsData?.products?.map((product) => (
            <div key={product.productCode} className={styles.card}>
              <h2>Product Code: {product.productCode}</h2>
              <p>Retail Price: ${product.retailPrice}</p>
              <p>Available Stock: {product.availableStock}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
