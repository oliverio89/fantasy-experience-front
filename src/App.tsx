import { lazy, Suspense, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
} from "react-router-dom";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { I18nProvider } from "./i18n";

const HomeV = lazy(() => import("./pages/Home"));
const CrearPartida = lazy(() => import("./pages/NewGame"));
const PartidasDetalles = lazy(() => import("./pages/DetailsGame"));
const Register = lazy(() => import("./pages/Register"));
const LogIn = lazy(() => import("./pages/LogIn"));
const EmailConfirmation = lazy(() => import("./pages/EmailConfirmation"));
const Contact = lazy(() => import("./pages/Contact"));
const UserDetail = lazy(() => import("./pages/UserDetail"));
const MasterDetail = lazy(() => import("./pages/MasterDetail"));
const NextGames = lazy(() => import("./pages/NextGames"));
const OurMasters = lazy(() => import("./pages/OurMasters"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Legal = lazy(() => import("./pages/Legal"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
    const defaultMetadata = {
      title: "Fantasy Experience | Encuentra tu Máster de Rol Online",
      description:
        "Encuentra Másters y partidas de rol online o presenciales, consulta requisitos y reserva tu plaza.",
    };
    const metadata = pathname.startsWith("/nextgames")
      ? {
          title: "Próximas partidas de rol | Fantasy Experience",
          description:
            "Busca próximas partidas por sistema, modalidad, fecha y Máster, y reserva una plaza.",
        }
      : pathname.startsWith("/ourmasters")
      ? {
          title: "Másters de rol | Fantasy Experience",
          description:
            "Compara perfiles, experiencia, sistemas y valoraciones verificadas de Másters de rol.",
        }
      : pathname.startsWith("/detailsgame") ||
        pathname.startsWith("/partidasdetalles")
      ? {
          title: "Detalle de partida | Fantasy Experience",
          description:
            "Consulta fecha, plazas, requisitos y condiciones de una partida de rol.",
        }
      : pathname.startsWith("/register")
      ? {
          title: "Crear cuenta | Fantasy Experience",
          description:
            "Crea una cuenta como jugador o Máster para reservar o publicar partidas de rol.",
        }
      : pathname.startsWith("/en-desarrollo") ||
        pathname.startsWith("/proximamente")
      ? {
          title: "Estamos trabajando en ello | Fantasy Experience",
          description:
            "Esta funcionalidad de Fantasy Experience todavía está en desarrollo.",
        }
      : pathname.startsWith("/legal") ||
        pathname.startsWith("/privacidad") ||
        pathname.startsWith("/cookies") ||
        pathname.startsWith("/terminos")
      ? {
          title: "Información legal | Fantasy Experience",
          description:
            "Aviso legal, privacidad, cookies y condiciones de uso de Fantasy Experience.",
        }
      : defaultMetadata;

    document.title = metadata.title;
    const metaDescriptionTag: HTMLMetaElement | null = document.querySelector(
      'head > meta[name="description"]'
    );
    if (metaDescriptionTag) metaDescriptionTag.content = metadata.description;

    const canonicalTag: HTMLLinkElement | null = document.querySelector(
      'head > link[rel="canonical"]'
    );
    if (canonicalTag) {
      canonicalTag.href = `${window.location.origin}${pathname === "/" ? "" : pathname}`;
    }
  }, [pathname]);

  return (
    <I18nProvider>
    <AuthProvider>
      <ToastProvider>
        <Suspense
          fallback={
            <div className="min-h-screen bg-black text-nude flex items-center justify-center">
              Cargando...
            </div>
          }
        >
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomeV />} />
            <Route path="/crearpartida" element={<CrearPartida />} />
            <Route
              path="/editarpartida/:partidaId"
              element={<CrearPartida />}
            />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/email-confirmation" element={<EmailConfirmation />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/privacidad" element={<Legal />} />
            <Route path="/cookies" element={<Legal />} />
            <Route path="/terminos" element={<Legal />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/en-desarrollo" element={<ComingSoon />} />
            <Route path="/proximamente" element={<ComingSoon />} />
            <Route path="/user" element={<UserDetail />} />
            <Route path="/user/:userId" element={<UserDetail />} />
            <Route path="/ourmasters" element={<OurMasters />} />
            <Route path="/master/:masterId" element={<MasterDetail />} />
            <Route
              path="/partidasdetalles-v12/:partidaId"
              element={<PartidasDetalles />}
            />
            <Route
              path="/detailsgame/:partidaId"
              element={<PartidasDetalles />}
            />
            <Route path="/nextgames" element={<NextGames />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        </Suspense>
      </ToastProvider>
    </AuthProvider>
    </I18nProvider>
  );
}
export default App;
