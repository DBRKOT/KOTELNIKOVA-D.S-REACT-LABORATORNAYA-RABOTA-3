import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

function Menu() {
  const { theme, toggleTheme, getTotalItems } = useContext(ThemeContext);

  const linkStyle = ({ isActive }) => ({
    marginRight: "15px",
    textDecoration: "none",
    color: isActive ? "purple" : theme === "dark" ? "#ffffffff" : "#000"
  });

  return (
    <nav style={{ marginBottom: "20px" }}>
      <NavLink to="/home" style={linkStyle}>Главная</NavLink> 
      <NavLink to="/about" style={linkStyle}>О нас</NavLink>
      <NavLink to="/products" style={linkStyle}>Каталог</NavLink>
      <NavLink to="/cart" style={linkStyle}>Корзина ({getTotalItems()})</NavLink>
      <NavLink to="/login" style={linkStyle}>Вход</NavLink>
      <button onClick={toggleTheme} style={{ marginLeft: "20px" }}> 
        Сменить тему ({theme})
      </button>
    </nav>
  );//использовала navlink
}

export default Menu;