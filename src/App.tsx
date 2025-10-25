import { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
} from "react-router-dom";
import Layout from "./components/Layout";
import HomeV from "./pages/Home";
import CrearPartida from "./pages/NewGame";
import PartidasDetalles from "./pages/DetailsGame";
import Register from "./pages/Register";
import LogIn from "./pages/LogIn";
import Contact from "./pages/Contact";
import UserDetail from "./pages/UserDetail";
import MasterDetail from "./pages/MasterDetail";
import NextGames from "./pages/NextGames";
import OurMasters from "./pages/OurMasters";

function App() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [action, pathname]);

  useEffect(() => {
    let title = "";
    let metaDescription = "";

    switch (pathname) {
      case "/":
        title = "";
        metaDescription = "";
        break;
    }

    if (title) {
      document.title = title;
    }

    if (metaDescription) {
      const metaDescriptionTag: HTMLMetaElement | null = document.querySelector(
        'head > meta[name="description"]'
      );
      if (metaDescriptionTag) {
        metaDescriptionTag.content = metaDescription;
      }
    }
  }, [pathname]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomeV />} />
        <Route path="/crearpartida" element={<CrearPartida />} />
        {/* <Route path="/partidadetalles" element={<PartidasDetalles />} /> */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/user" element={<UserDetail />} />
        <Route path="/ourmasters" element={<OurMasters />} />
        <Route path="/master/:masterId" element={<MasterDetail />} />
        <Route
          path="/partidasdetalles-v12/:partidaId?"
          element={<PartidasDetalles />}
        />
        <Route path="/nextgames" element={<NextGames />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Route>
    </Routes>
  );
}
export default App;
