import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

const AddItem: React.FC = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      navigate('/');
    }, 2500);
  };

  return (
    <div className="container animate-fade-in" style={{ marginTop: '100px', marginBottom: '4rem' }}>
      <div className="flex-center">
        <div className="glass-panel" style={{ width: '100%', maxWidth: '700px', padding: '3rem' }}>
          
          {isSuccess ? (
            <div className="flex-center animate-fade-in" style={{ flexDirection: 'column', padding: '4rem 0', textAlign: 'center' }}>
               <CheckCircle2 size={80} color="var(--color-accent)" style={{ marginBottom: '1.5rem' }} />
               <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Item Listed Successfully!</h2>
               <p style={{ color: 'var(--color-text-muted)' }}>Your clothing item is now live for others to rent.</p>
               <p style={{ fontSize: '0.875rem', marginTop: '2rem', color: 'var(--color-primary)' }}>Redirecting to home...</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Lend Your Style</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Turn your wardrobe into extra income by lending out your premium pieces.</p>
              </div>

              <form onSubmit={handleSubmit}>
                 {/* Image Upload Area */}
                 <div style={{ 
                    border: '2px dashed var(--color-border)', 
                    borderRadius: '16px', 
                    padding: '3rem', 
                    textAlign: 'center',
                    marginBottom: '2rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                 }} className="upload-area">
                    <UploadCloud size={48} color="var(--color-primary)" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Upload Item Photos</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Drag and drop or click to browse (Max 5 photos)</p>
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="input-label" htmlFor="title">Item Title</label>
                      <input id="title" type="text" className="input-field" placeholder="e.g. Vintage Leather Moto Jacket" required />
                    </div>

                    <div className="input-group">
                      <label className="input-label" htmlFor="brand">Brand / Designer</label>
                      <input id="brand" type="text" className="input-field" placeholder="e.g. AllSaints" required />
                    </div>

                    <div className="input-group">
                       <label className="input-label" htmlFor="category">Category</label>
                       <select id="category" className="input-field" required style={{ appearance: 'none' }}>
                         <option value="" disabled selected>Select category</option>
                         <option value="outerwear">Outerwear & Jackets</option>
                         <option value="dresses">Dresses & Skirts</option>
                         <option value="suits">Suits & Formalwear</option>
                         <option value="ethnic">Ethnic Wear</option>
                         <option value="streetwear">Streetwear</option>
                       </select>
                    </div>

                    <div className="input-group">
                      <label className="input-label" htmlFor="size">Size</label>
                      <input id="size" type="text" className="input-field" placeholder="e.g. US Medium / 38" required />
                    </div>

                    <div className="input-group">
                      <label className="input-label" htmlFor="price">Price per Day (₹)</label>
                      <input id="price" type="number" min="5" step="1" className="input-field" placeholder="0.00" required />
                    </div>

                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="input-label" htmlFor="desc">Description</label>
                      <textarea id="desc" className="input-field" rows={4} placeholder="Describe the item, fit, and any wear/tear..." required style={{ resize: 'vertical' }}></textarea>
                    </div>
                 </div>

                 <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button type="submit" variant="primary" size="lg">List Item for Rent</Button>
                 </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default AddItem;
