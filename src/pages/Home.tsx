import React from 'react';
import { ItemCard, type ClothingItem } from '../components/ItemCard';
import { Search, Filter } from 'lucide-react';

const MOCK_ITEMS: ClothingItem[] = [
  {
    id: '1',
    title: 'Vintage Leather Jacket',
    brand: 'AllSaints',
    pricePerDay: 15,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    size: 'M',
    owner: { name: 'Alex M.', rating: 4.8 }
  },
  {
    id: '2',
    title: 'Floral Summer Dress',
    brand: 'Reformation',
    pricePerDay: 25,
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80',
    size: 'S',
    owner: { name: 'Sarah K.', rating: 5.0 }
  },
  {
    id: '3',
    title: 'Designer Tuxedo Suit',
    brand: 'Hugo Boss',
    pricePerDay: 45,
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
    size: 'L',
    owner: { name: 'James B.', rating: 4.9 }
  },
  {
    id: '4',
    title: 'Embroidered Silk Saree',
    brand: 'Sabyasachi',
    pricePerDay: 80,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
    size: 'Free Size',
    owner: { name: 'Priya R.', rating: 4.7 }
  },
  {
    id: '5',
    title: 'Streetwear Graphic Hoodie',
    brand: 'Supreme',
    pricePerDay: 20,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    size: 'XL',
    owner: { name: 'Mike T.', rating: 4.5 }
  },
  {
    id: '6',
    title: 'Minimalist Work Blazer',
    brand: 'Theory',
    pricePerDay: 18,
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
    size: 'M',
    owner: { name: 'Elena V.', rating: 4.9 }
  }
];

const Home: React.FC = () => {
  return (
    <div className="container animate-fade-in" style={{ marginTop: '100px', marginBottom: '4rem' }}>
      
      {/* Hero Section */}
      <div className="glass-panel text-center" style={{ padding: '4rem 2rem', marginBottom: '3rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="text-gradient" style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1 }}>
            Rent the Look.<br/>Own the Moment.
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Discover thousands of premium clothing items from people just like you. Sustainable fashion at a fraction of the cost.
          </p>
          
          <div className="search-bar glass-card" style={{ display: 'flex', alignItems: 'center', maxWidth: '500px', margin: '0 auto', padding: '0.5rem 1rem', borderRadius: '50px' }}>
            <Search size={20} color="var(--color-text-muted)" style={{ marginRight: '10px' }} />
            <input 
              type="text" 
              placeholder="Search for dresses, suits, jackets..." 
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '1rem', outline: 'none' }} 
            />
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '50%', height: '200%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '40%', height: '100%', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', zIndex: 0 }}></div>
      </div>

      {/* Main Content */}
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Trending Now</h2>
        <button className="glass-card flex-center" style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', color: 'white', background: 'var(--color-surface)', borderRadius: '8px', cursor: 'pointer' }}>
          <Filter size={16} style={{ marginRight: '8px' }} /> Filters
        </button>
      </div>

      {/* Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '2rem' 
      }}>
        {MOCK_ITEMS.map((item, index) => (
          <div key={item.id} className={`delay-${(index % 3 + 1) * 100} animate-fade-in`}>
            <ItemCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
