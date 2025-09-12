import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/dashboard"); 
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Вход в систему</h2>
      <button 
        onClick={handleLogin}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#cb59dc60",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Войти
      </button>
    </div>
  );
}

export default Login;