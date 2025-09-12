import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // тут таймер для перенаправления 
    const timer = setTimeout(() => {
      navigate("/products"); 
    }, 2000);

    return () => clearTimeout(timer);//очищает таймер
  }, [navigate]);

 return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "70vh",
      flexDirection: "column",
      gap: "30px"
    }}>
      <img
        src="/image/obejana.jpg" 
        alt="Успешный вход"
        style={{
          width: "220px",
          height: "150px",
        }}
      />
      
      <div style={{
        backgroundColor: "#e1d4edff",
        color: "#cb83eaff",
        padding: "30px",
        border: "2px solid #dec3e6ff",
        borderRadius: "10px",
        fontSize: "20px",
        fontWeight: "bold",
        textAlign: "center"
      }}>
        Вы вошли в систему урааа
      </div>
      
      <div style={{
        color: "#666",
        fontSize: "16px"
      }}>
        Ща...
      </div>
    </div>
  );
}

export default Dashboard;