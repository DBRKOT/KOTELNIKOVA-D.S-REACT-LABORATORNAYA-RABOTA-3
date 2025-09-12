import { useContext, useState } from "react";
import { ThemeContext } from "./ThemeContext";
import { products } from "./productsData";
import { useNavigate } from "react-router-dom";

function Products() {
  const { addToCart, theme } = useContext(ThemeContext);//,итогоапя сумма конекст

  return (
    <div style={{ padding: "20px" }}>
      <h2>Каталог товаров</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            addToCart={addToCart}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product, addToCart, theme }) {
  const [count, setCount] = useState(0); 
  const navigate = useNavigate();

  const handleAddToCart = () => {

    const productWithQuantity = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: count
    };

    addToCart(productWithQuantity);
    setCount(1);

    navigate("/cart");
  };

  return (
    <div style={{
      border: "1px solid #ccc",
      padding: "10px",
      width: "200px",
      backgroundColor: theme === "dark" ? "#333" : "#fff",
      color: theme === "dark" ? "#d9d6d6ff" : "#360b44ff"
    }}>
      <img
        src={product.image || "/image/proc.png"} //для отображения товара
        alt={product.name}
        style={{ width: "100%", height: "150px", objectFit: "contain" }}
      />
      <h4>{product.name}</h4>
      <p>{product.price} ₽</p>

      <div>
        <button onClick={() => setCount(count > 0 ? count - 1 : 0)}>-</button>
        <span style={{ margin: "0 8px" }}>{count}</span>
        <button onClick={() => setCount(count + 1)}>+</button>
        <button onClick={() => setCount(0)}>Отмена</button>
      </div>

      <button onClick={handleAddToCart} style={{ marginTop: "10px" }}>
        Добавить в корзину
      </button>
    </div>
  );
}
export default Products;
