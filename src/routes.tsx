import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CreateListing from './pages/CreateListing';
import ListingDetails from './pages/ListingDetails';
import EditListing from './pages/EditListing';
import Search from './pages/Search';
import HowItWorks from './pages/HowItWorks';
import MyListings from './pages/MyListings';
import About from './pages/About';
import Settings from './pages/Settings';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/create-listing" element={<CreateListing />} />
      <Route path="/listing/:id" element={<ListingDetails />} />
      <Route path="/edit-listing/:id" element={<EditListing />} />
      <Route path="/search" element={<Search />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/my-listings" element={<MyListings />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
};

export default AppRoutes; 