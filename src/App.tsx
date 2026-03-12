import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AddItem from './pages/AddItem';
import ItemDetails from './pages/ItemDetails';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
             <Route path="/" element={<Home />} />
             <Route path="/login" element={<Login />} />
             <Route path="/signup" element={<Signup />} />
             <Route path="/add-item" element={<AddItem />} />
             <Route path="/item/:id" element={<ItemDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
