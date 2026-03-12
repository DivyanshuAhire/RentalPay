import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import './item-card.css';

export interface ClothingItem {
  id: string;
  title: string;
  brand: string;
  pricePerDay: number;
  imageUrl: string;
  size: string;
  owner: {
    name: string;
    rating: number;
  };
}

interface ItemCardProps {
  item: ClothingItem;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  return (
    <div className="item-card glass-card">
      <div className="item-image-container">
        <img src={item.imageUrl} alt={item.title} className="item-image" loading="lazy" />
        <div className="item-price-badge">
           ₹{item.pricePerDay} <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>/day</span>
        </div>
      </div>
      
      <div className="item-content">
        <div className="flex-between" style={{ marginBottom: '8px' }}>
          <span className="item-brand">{item.brand}</span>
          <span className="item-size">Size: {item.size}</span>
        </div>
        
        <h3 className="item-title">{item.title}</h3>
        
        <div className="item-owner flex-center" style={{ justifyContent: 'flex-start', gap: '8px', marginBottom: '16px' }}>
          <div className="owner-avatar" style={{ width: '24px', height: '24px', background: 'var(--color-primary)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
            {item.owner.name.charAt(0)}
          </div>
          <span className="owner-name" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {item.owner.name} • ★ {item.owner.rating.toFixed(1)}
          </span>
        </div>
        
        <Link to={`/item/${item.id}`} style={{ display: 'block' }}>
           <Button variant="primary" fullWidth size="sm">
             Rent Now
           </Button>
        </Link>
      </div>
    </div>
  );
};
