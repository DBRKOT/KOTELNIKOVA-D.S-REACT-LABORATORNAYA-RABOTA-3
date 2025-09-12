import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

function Cart() {
  const { cartItems, removeFromCart, getTotalPrice } = useContext(ThemeContext);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Корзина</h2>
      {cartItems.length === 0 ? (//проверка пустая ли корзина
        <p>Корзина пуста</p>
      ) : (
        <div>
          {cartItems.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span>{item.name} * {item.quantity}</span>
              <span>{item.price * item.quantity} ₽</span> 
              <button onClick={() => removeFromCart(item.id)}>Удалить</button>
            </div>//*вычисляет итоговую стоимость и удаляет товар*//
          ))}
          <h3>Итого: {getTotalPrice()} ₽</h3>
        </div>
      )}
    </div>
  );
}

export default Cart;
