import AppRoutes from "./routes/AppRoutes";
import FloatingWidget from "./components/FloatingWidget";
import MessengerWidget from "./components/MessengerWidget";

function App() {
  return (
    <>
      <AppRoutes />
      <FloatingWidget />
      <MessengerWidget />
    </>
  );
}

export default App;
