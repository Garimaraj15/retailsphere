import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`https://retailsphere-4.onrender.com/product/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => setError('❌ Product not found or server error.'));
  }, [id]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!product) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => window.history.back()} style={{ marginBottom: 10 }}>
        🔙 Go Back
      </button>
      <h2>{product.name}</h2>
      <p><b>Brand:</b> {product.brand}</p>
      <p><b>Price:</b> ₹{product.price}</p>
      <p><b>Description:</b> {product.description}</p>
      <p><b>Ethical Tags:</b> {product.ethical_tags}</p>
      <p><b>Carbon Footprint:</b> {product.carbon_footprint}</p>
      <p><b>Trust Score:</b> {product.trust_score}</p>
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          style={{ maxWidth: '100%', marginTop: 10 }}
        />
      )}
    </div>
  );
};

export default ProductDetails;
