import { createContext, useReducer, useState } from "react"

export const ThemeContext = createContext()

// редьюсер для корзины 
function cartReducer(state, action) {
  // действие добавить товар
  if (action.type === "add") {
    // проверкка есть ли товар уже в корзине
    const existing = state.find(item => item.id === action.product.id)
    if (existing) {
      // увеличиваем количество товаров если екть
      return state.map(item =>
        item.id === action.product.id
          ? { 
              id: item.id, 
              name: item.name, 
              price: item.price, 
              image: item.image, 
              quantity: item.quantity + action.product.quantity // суммируется старое и новое количество
            }
          : item
      )
    }
    // если товара нет добавляем его в массив
    return state.concat(action.product)
  }

  // действие удалить товар 
  if (action.type === "remove") {
    return state.filter(item => item.id !== action.id)
  }

  // действие неизвестно тогда возвращаемсостояние без изменений
  return state
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light")

  // состояние корзины через useReducer
  // cartItems - массив товаров
  // dispatch - функция для отправки  в редьюсер
  const [cartItems, dispatch] = useReducer(cartReducer, []) //используетс для корзины редьюсер

  // ддля подсчёта общего количества товаров в корзин
  const getTotalItems = () => {
    // если не задано — считаем 1
    return cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
  }

  //  подсчёт общей суммы товаров в корзине
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * (item.quantity || 1), 0)
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  //  добавление товара в корзину
  const addToCart = (product) => {
    dispatch({ type: "add", product: product })
  }

  // функция для удаления товара из корзины 
  const removeFromCart = (id) => {
    dispatch({ type: "remove", id: id })
  }

  // все детие будут иметь доступ к этим данным  через useContext
  return (
    <ThemeContext.Provider value={{
      theme,             
      toggleTheme,      
      cartItems,       
      addToCart,        
      removeFromCart,    
      getTotalItems,     
      getTotalPrice     
    }}>
      {children}       
    </ThemeContext.Provider>
  )
}
