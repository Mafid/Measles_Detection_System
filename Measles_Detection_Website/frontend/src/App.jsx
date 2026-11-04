import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Detection from "./pages/Detection";
import Result from "./pages/Result";
import XAIDashboard from "./pages/XAIDashboard";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detection" element={<Detection />} />
        <Route path="/result" element={<Result />} />
        <Route path="/xai" element={<XAIDashboard />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;