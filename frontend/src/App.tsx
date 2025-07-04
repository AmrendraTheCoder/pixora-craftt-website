import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import AdminDashboard from "./components/admin/AdminDashboard";
import CMSDashboard from "./components/cms/CMSDashboard";
import routes from "tempo-routes";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CMSProvider } from "./contexts/CMSContext";

function App() {
  return (
    <ThemeProvider>
      <CMSProvider>
        <Suspense fallback={<p>Loading...</p>}>
          <>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/cms" element={<CMSDashboard />} />
            </Routes>
            {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
          </>
        </Suspense>
      </CMSProvider>
    </ThemeProvider>
  );
}

export default App;
