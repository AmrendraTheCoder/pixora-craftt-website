import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import AdminDashboard from "./components/admin/AdminDashboard";
import CMSDashboard from "./components/cms/CMSDashboard";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CMSProvider } from "./contexts/CMSContext";

function App() {
  return (
    <ThemeProvider>
      <CMSProvider>
        <Suspense fallback={<p>Loading...</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/cms" element={<CMSDashboard />} />
          </Routes>
        </Suspense>
      </CMSProvider>
    </ThemeProvider>
  );
}

export default App;
