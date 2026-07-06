import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { ReservationDraftProvider } from './context/ReservationDraftProvider';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { Header } from './components/Header/Header';

import { LoginPage } from './pages/LoginPage/LoginPage';
import { OtpVerifyPage } from './pages/OtpVerifyPage/OtpVerifyPage';
import { NewReservationPage } from './pages/NewReservationPage/NewReservationPage';
import { OptionsListPage } from './pages/OptionsListPage/OptionsListPage';
import { ReserveFormPage } from './pages/ReserveFormPage/ReserveFormPage';
import { ConfirmationPage } from './pages/ConfirmationPage/ConfirmationPage';
import { MyReservationsPage } from './pages/MyReservationsPage/MyReservationsPage';
import { ReservationDetailPage } from './pages/ReservationDetailPage/ReservationDetailPage';
import { AppBackground } from './pages/AppBackground/AppBackground';

function App() {
  return (
    <AuthProvider>
      <ReservationDraftProvider>
        <BrowserRouter>
          <AppBackground />
          <div style={{ position: 'relative', zIndex: 1 }}>
          <Header />
          <Routes>
            <Route path="/" element={<Navigate to="/new-reservation" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify-otp" element={<OtpVerifyPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/new-reservation" element={<NewReservationPage />} />
              <Route path="/options" element={<OptionsListPage />} />
              <Route path="/reserve" element={<ReserveFormPage />} />
              <Route path="/confirmation/:id" element={<ConfirmationPage />} />
              <Route path="/reservations" element={<MyReservationsPage />} />
              <Route path="/reservations/:id" element={<ReservationDetailPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/new-reservation" replace />} />
          </Routes>
           </div>
        </BrowserRouter>
      </ReservationDraftProvider>
    </AuthProvider>
  );
}

export default App;