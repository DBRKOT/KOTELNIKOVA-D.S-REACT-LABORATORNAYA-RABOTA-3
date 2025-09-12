import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

function GlobalStyles({ children }) {
  const { theme } = useContext(ThemeContext);

  const style = {
    backgroundColor: theme === "dark" ? "#222" : "#faf1f8ff",
    color: theme === "dark" ? "#ffffffff" : "#000",
    minHeight: "100vh",
    padding: "20px"
  };

  return <div style={style}>{children}</div>;
}

export default GlobalStyles;
