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
    return <main className="container"><p>Loading products...</p></main>;
  }

  if (error) {
    return <main className="container"><p className={styles.error}>Error: {error}</p></main>;
  }

  return (
    <main className="container">
      <div className={styles.header}>
        <h1>{productsData?.message || 'Product Catalog'}</h1>
      </div>

      <div className={styles.productGrid}>
        {productsData?.products?.map((product) => (
          <div key={product.productCode} className={styles.productCard}>
            <h2>{product.productName}</h2>
            <p className={styles.code}>Product Code: {product.productCode}</p>
            <p className={styles.price}>Wholesale Price: €{product.wholesalePrice.toFixed(2)}</p>
            <p className={styles.price}>Retail Price: €{product.retailPrice.toFixed(2)}</p>
            <p>Available Stock: {product.availableStock}</p>
          </div>
        ))}
      </div>
    </main>
  );
}