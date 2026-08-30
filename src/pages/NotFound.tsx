import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-black text-nude flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <p className="text-dark-gold text-lg mb-3">Error 404</p>
        <h1 className="text-4xl font-titulo-2 mb-4">Esta página no existe</h1>
        <p className="text-nude/70 mb-8">
          Puede que el enlace haya cambiado o que el contenido ya no esté disponible.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-full bg-dark-gold text-black font-bold"
          >
            Volver al inicio
          </button>
          <button
            type="button"
            onClick={() => navigate("/nextgames")}
            className="px-6 py-3 rounded-full border border-dark-gold text-dark-gold"
          >
            Explorar partidas
          </button>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
