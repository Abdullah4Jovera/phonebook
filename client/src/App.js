import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegisteredNumber from './Components/registeredNumber/RegisteredNumber';
import Login from './Components/login/Login';
import HomeNavbar from './Components/navbar/Navbar';
import SuperadminDashboard from './pages/SuperadminDashboard';
import Home from './pages/Home';
import Blocklist from './pages/Blocklist';
import Profile from './pages/Profile';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/superadmindashboard' element={<SuperadminDashboard />} />
          <Route path='/home' element={<Home />} />
          <Route path='/blocklist' element={<Blocklist />} />
          <Route path='/profile' element={<Profile />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
