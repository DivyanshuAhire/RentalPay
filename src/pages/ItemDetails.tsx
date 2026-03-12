import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ArrowLeft, ShieldCheck, MapPin, Star, Calendar } from 'lucide-react';

const ItemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isRenting, setIsRenting] = useState(false);
  const [rentDays, setRentDays] = useState(3);

  // Mocking data retrieval based on ID. Ideally this comes from context/API
  const mockItemDetail = {
    id: id,
    title: 'Vintage Leather Moto Jacket',
    brand: 'AllSaints',
    pricePerDay: 15,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1000&q=80',
    size: 'Medium',
    description: "Classic black leather biker jacket from AllSaints. Features asymmetrical zip, shoulder epaulettes, and zipped cuffs. In excellent condition, well broken-in for that perfect vintage feel. Great for evening outings or layering over a simple tee.",
    owner: { name: 'Alex M.', rating: 4.8, location: 'Downtown, NY', joinDate: 'Jan 2025' }
  };

  const handleRent = () => {
    setIsRenting(true);
    setTimeout(() => {
       alert("P2P Rent Transaction Mock Successful! Payment held in escrow.");
       navigate('/');
    }, 2000);
  };

  return (
    <div className="container animate-fade-in" style={{ marginTop: '100px', marginBottom: '4rem' }}>
      
      <button 
        onClick={() => navigate(-1)} 
        className="flex-center" 
        style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: '2rem', gap: '8px', fontSize: '1rem' }}
      >
        <ArrowLeft size={20} /> Back to Catalog
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4rem', alignItems: 'start' }}>
        
        {/* Left Column: Image Area */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div className="glass-card" style={{ padding: '0.5rem', borderRadius: '24px', overflow: 'hidden' }}>
             <img src={mockItemDetail.imageUrl} alt={mockItemDetail.title} style={{ width: '100%', borderRadius: '20px', display: 'block' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
             <div className="glass-card" style={{ aspectRatio: '1', borderRadius: '12px', background: 'var(--color-surface)', border: '2px solid var(--color-primary)' }}></div>
             <div className="glass-card" style={{ aspectRatio: '1', borderRadius: '12px', background: 'var(--color-surface)' }}></div>
             <div className="glass-card" style={{ aspectRatio: '1', borderRadius: '12px', background: 'var(--color-surface)' }}></div>
          </div>
        </div>

        {/* Right Column: Details & Rent Action */}
        <div>
          <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '2rem', marginBottom: '2rem' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 600 }}>{mockItemDetail.brand}</span>
              <span className="glass-card" style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '0.875rem' }}>Size: {mockItemDetail.size}</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.2 }}>{mockItemDetail.title}</h1>
            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
               <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                 ₹{mockItemDetail.pricePerDay}
                 <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--color-text-muted)' }}> / day</span>
               </div>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Description</h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>{mockItemDetail.description}</p>
          </div>

          {/* Owner Info block */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
             <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
                {mockItemDetail.owner.name.charAt(0)}
             </div>
             <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Lender: {mockItemDetail.owner.name}</h4>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  <span className="flex-center" style={{ gap: '4px' }}><Star size={14} color="#fbbf24" fill="#fbbf24" /> {mockItemDetail.owner.rating}</span>
                  <span className="flex-center" style={{ gap: '4px' }}><MapPin size={14} /> {mockItemDetail.owner.location}</span>
                </div>
             </div>
          </div>

          {/* Renting Configuration block */}
          <div className="glass-card" style={{ padding: '2rem' }}>
             <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Request Rental</h3>
             
             <div className="flex-between" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                <div className="flex-center" style={{ gap: '12px' }}>
                   <Calendar size={24} color="var(--color-text-muted)" />
                   <div>
                     <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Duration</div>
                     <div style={{ fontWeight: 500 }}>{rentDays} Days</div>
                   </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button variant="outline" size="sm" onClick={() => setRentDays(Math.max(1, rentDays-1))}>-</Button>
                  <Button variant="outline" size="sm" onClick={() => setRentDays(rentDays+1)}>+</Button>
                </div>
             </div>

             <div style={{ marginBottom: '2rem' }}>
               <div className="flex-between" style={{ marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
                 <span>₹{mockItemDetail.pricePerDay} × {rentDays} days</span>
                 <span>₹{mockItemDetail.pricePerDay * rentDays}</span>
               </div>
               <div className="flex-between" style={{ marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
                 <span>Platform Fee (5%)</span>
                 <span>₹{(mockItemDetail.pricePerDay * rentDays * 0.05).toFixed(2)}</span>
               </div>
               <div className="flex-between" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem', fontWeight: 700, fontSize: '1.25rem' }}>
                 <span>Total</span>
                 <span>₹{(mockItemDetail.pricePerDay * rentDays * 1.05).toFixed(2)}</span>
               </div>
             </div>

             <Button 
                variant="primary" 
                size="lg" 
                fullWidth 
                onClick={handleRent}
                disabled={isRenting}
             >
                {isRenting ? 'Processing Request...' : 'Send Rental Request'}
             </Button>

             <div className="flex-center" style={{ marginTop: '1.5rem', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.75rem', textAlign: 'center' }}>
                <ShieldCheck size={16} color="var(--color-accent)" /> 
                <span>Your payment is protected. Holds securely until item is received.</span>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
