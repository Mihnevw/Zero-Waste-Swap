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
import Contact from './pages/Contact';
import Favorites from './pages/Favorites';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';
import ChatPage from './pages/ChatPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/create-listing" element={<CreateListing />} />
      <Route path="/listing/:id" element={<ListingDetails />} />
      <Route path="/edit-listing/:id" element={<EditListing />} />
      <Route path="/search" element={<Search />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/my-listings" element={<MyListings />} />
      <Route path="/about" element={<About />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 