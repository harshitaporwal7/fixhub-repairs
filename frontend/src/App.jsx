import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { RequireAuth } from './components/RequireAuth';

import Home from './pages/Home';
import Devices from './pages/Devices';
import Services from './pages/Services';
import Locations from './pages/Locations';
import About from './pages/About';
import Reviews from './pages/Reviews';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import BookRepair from './pages/BookRepair';
import BookingConfirmation from './pages/BookingConfirmation';
import TrackBooking from './pages/TrackBooking';
import Dashboard from './pages/Dashboard';
import BookingDetail from './pages/BookingDetail';
import NotFound from './pages/NotFound';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminBookingDetail from './pages/admin/AdminBookingDetail';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminContact from './pages/admin/AdminContact';
import AdminCrud from './pages/admin/AdminCrud';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        {/* Admin area has its own layout/shell, no public header/footer */}
        <Route
          path="/admin/*"
          element={
            <RequireAuth adminOnly>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="bookings/:id" element={<AdminBookingDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="devices" element={<AdminCrud entity="devices" />} />
          <Route path="brands" element={<AdminCrud entity="brands" />} />
          <Route path="models" element={<AdminCrud entity="models" />} />
          <Route path="repairs" element={<AdminCrud entity="repairs" />} />
          <Route path="locations" element={<AdminCrud entity="locations" />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="contact" element={<AdminContact />} />
        </Route>

        {/* Public site */}
        <Route
          path="/*"
          element={
            <>
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/devices" element={<Devices />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/locations" element={<Locations />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/book" element={<BookRepair />} />
                  <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />
                  <Route path="/track" element={<TrackBooking />} />
                  <Route
                    path="/dashboard"
                    element={
                      <RequireAuth>
                        <Dashboard />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/dashboard/bookings/:id"
                    element={
                      <RequireAuth>
                        <BookingDetail />
                      </RequireAuth>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  );
}
