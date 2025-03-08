// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "../pages/Home";
import EventDashboard from "../pages/EventDashboard";
import About from "../pages/About";
import Dashboard from "../pages/Dashboard";
import EventPage from "../pages/EventPage";
import Events from "../pages/Events";
import RegisterPage from "../pages/RegisterPage";
import Login from "./components/Login";
import PaymentSetup from "./components/PaymentSetup";
import EventMarketing from "./components/EventMarketing";
import PaymentDetails from "./components/PaymentDetails";
import CreateEventForm from "./components/CreateEventForm";
import DiscussionForum from "./components/DiscussionForum";
import SummarizedVideoPage from "./components/SummarizedVideoPage";
import GetTicket from "./components/GetTicket";
import LiveStreamPage from "./components/LiveStreamPage";
import MeetingPage from "./components/MeetingPage";
import TicketConfirmation from "./components/TicketConfirmation";
import TicketPurchaseForm from "./components/TicketPurchaseForm";
import TicketVerification from "./components/TicketVerification";
import SignUp from "./components/SignUp";
import { ThemeProvider } from "../contexts/ThemeContext";
import ProfilePage from "../pages/ProfilePage";
import QAChatRoomPage from "../pages/QAChatRoomPage";

const App = () => (
  <AuthProvider>
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/create-event-form" element={<CreateEventForm />} />
          <Route
            path="/events/:eventId/discussion-forum"
            element={
              <ProtectedRoute>
                <DiscussionForum />
              </ProtectedRoute>
            }
          />{" "}
          <Route
            path="/events/:eventId/get-ticket"
            element={
              <ProtectedRoute>
                <GetTicket />
              </ProtectedRoute>
            }
          />{" "}
          <Route path="/event-page/:eventId" element={<EventPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register-page" element={<RegisterPage />} />
          <Route path="/events/:eventId/chat" element={<QAChatRoomPage />} />
          <Route
            path="/events/:eventId/payment-details"
            element={<PaymentDetails />}
          />
          <Route
            path="/events/:eventId/live-stream"
            element={<LiveStreamPage />}
          />
          <Route
            path="/events/:eventId/discussion"
            element={<DiscussionForum />}
          />
          <Route
            path="/events/:eventId/marketing"
            element={<EventMarketing />}
          />
          <Route path="/live-meeting/:eventId" element={<MeetingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-ticket" element={<TicketVerification />} />
          <Route
            path="//events/:eventId/ticket-purchase"
            element={<TicketPurchaseForm />}
          />
          <Route
            path="/events/:eventId/summarized-video"
            element={<SummarizedVideoPage />}
          />
          <Route
            path="/ticket-confirmation/:ticketId"
            element={<TicketConfirmation />}
          />
          <Route
            path="/events/:eventId/dashboard"
            element={<EventDashboard />}
          />
          <Route path="/payment-setup" element={<PaymentSetup />} />
          <Route path="/signup" element={<SignUp />} />
          <Route element={<ProtectedRoute />}></Route>
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  </AuthProvider>
);

export default App;
