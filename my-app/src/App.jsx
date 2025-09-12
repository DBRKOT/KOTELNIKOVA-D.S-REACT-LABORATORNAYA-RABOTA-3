import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import GlobalStyles from './GlobalStyles';
import Menu from './Menu';
import Home from './Home';
import About from './About';
import Products from './Products';
import Cart from './Cart';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  return (
    <ThemeProvider>
      <GlobalStyles>
        <Menu />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} /> 
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </GlobalStyles>
    </ThemeProvider>
  );
}

export default App;