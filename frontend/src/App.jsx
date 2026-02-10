import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Approute from "./approute/Approute";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Approute />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
