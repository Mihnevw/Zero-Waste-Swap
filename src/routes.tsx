import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CreateListing from './pages/CreateListing';
import ListingDetails from './pages/ListingDetails';
import EditListing from './pages/EditListing';
import Search from './pages/Search';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/create-listing" element={<CreateListing />} />
      <Route path="/listing/:id" element={<ListingDetails />} />
      <Route path="/edit-listing/:id" element={<EditListing />} />
      <Route path="/search" element={<Search />} />
    </Routes>
  );
};

export default AppRoutes; 