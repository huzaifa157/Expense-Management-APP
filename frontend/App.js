import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { CurrencyProvider } from "./src/context/CurrencyContext";
import AppNavigator from "./src/navigation/AppNavigator";

import "./src/global.css";

export default function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
