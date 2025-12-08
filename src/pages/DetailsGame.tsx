import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PartidasService from "../services/partidasService";
import { Partida } from "../components/PartidaCard";

const DetailsGame: FunctionComponent = () => {
  const navigate = useNavigate();
  const { partidaId } = useParams<{ partidaId: string }>();

  // Usamos 'any' para permitir campos extra que puedan venir del backend aunque no estén en la interfaz base
  const [partida, setPartida] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartida = async () => {
      if (partidaId) {
        try {
          const data = await PartidasService.obtenerPartidaPorId(partidaId);
          setPartida(data);
        } catch (err) {
          console.error("Error cargando partida:", err);
          setError("No se pudo cargar la información de la partida.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError("ID de partida no válido");
      }
    };

    fetchPartida();
  }, [partidaId]);

  const handleVolver = useCallback(() => {
    navigate("/nextgames");
  }, [navigate]);

  const handleEditar = useCallback(() => {
    navigate(`/editarpartida/${partidaId}`);
  }, [navigate, partidaId]);

  const handleEliminar = useCallback(async () => {
    if (
      confirm(
        "¿Estás seguro de que deseas eliminar esta partida? Esta acción no se puede deshacer."
      )
    ) {
      try {
        if (partidaId) {
          await PartidasService.eliminarPartida(partidaId);
          alert("Partida eliminada correctamente.");
          navigate("/nextgames");
        }
      } catch (err) {
        console.error("Error al eliminar:", err);
        alert("Hubo un error al intentar eliminar la partida.");
      }
    }
  }, [partidaId, navigate]);

  const handleComprar = useCallback(() => {
    console.log("Comprar partida:", partidaId);
    alert("Funcionalidad de compra en desarrollo");
  }, [partidaId]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl font-radio-option">
          Cargando detalles de la partida...
        </div>
      </div>
    );
  }

  if (error || !partida) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="text-red-500 text-xl font-radio-option">
          {error || "Partida no encontrada"}
        </div>
        <button
          onClick={handleVolver}
          className="py-2 px-4 bg-dark-gold rounded-xl cursor-pointer"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="w-full relative bg-white overflow-hidden flex flex-col items-start justify-start leading-[normal] tracking-[normal]">
      <main className="self-stretch bg-black flex flex-col items-end justify-start pt-[0rem] px-[4.875rem] pb-[7.562rem] box-border max-w-full text-center text-[1.125rem] text-black1 font-radio-option lg:pb-[4.938rem] lg:box-border mq1050:pb-[3.188rem] mq1050:box-border mq450:pb-[2.063rem] mq450:box-border mq750:pl-[2.438rem] mq750:pr-[2.438rem] mq750:box-border">
        <div className="w-[80rem] h-[116.25rem] relative bg-black hidden max-w-full z-[1]" />

        <section className="self-stretch rounded-xl bg-darkslategray flex flex-col items-start justify-start pt-[4rem] px-[6.062rem] pb-[5.312rem] box-border gap-[2.25rem] max-w-full z-[1] mt-[-1.813rem] text-left text-[2.25rem] text-nude font-radio-option lg:pt-[4rem] lg:px-[3rem] lg:pb-[3.438rem] lg:box-border mq1050:pb-[2.25rem] mq1050:box-border mq450:pb-[1.438rem] mq450:box-border mq750:gap-[1.125rem] mq750:pl-[1.5rem] mq750:pr-[1.5rem] mq750:box-border">
          <div className="w-[70.125rem] h-[101.938rem] relative rounded-xl bg-darkslategray hidden max-w-full" />

          <div className="self-stretch flex flex-col items-start justify-start">
            <h1 className="m-0 self-stretch relative text-inherit font-extrabold font-[inherit] z-[2] mq1050:text-[1.813rem] mq1050:leading-[1.75rem] mq450:text-[1.375rem] mq450:leading-[1.313rem]">
              {partida.titulo}
            </h1>
            <div className="self-stretch h-[2.688rem] relative text-[1.125rem] leading-[1.625rem] whitespace-pre-wrap flex items-center shrink-0 z-[2] mt-[-0.625rem]">
              Detalles de la partida organizada por{" "}
              {partida.masterName || "Master Desconocido"}
            </div>
          </div>

          <div className="self-stretch flex flex-col items-end justify-start gap-[4.375rem] max-w-full mq1050:gap-[2.188rem] mq450:gap-[1.063rem]">
            <div className="self-stretch flex flex-row items-start justify-end py-[0rem] pl-[0rem] pr-[0.062rem] box-border max-w-full">
              <div className="m-0 flex-1 flex flex-col items-start justify-start gap-[4.75rem] max-w-full mq1050:gap-[2.375rem] mq450:gap-[1.188rem]">
                {/* SECCIÓN 1: Información de la partida */}
                <div className="self-stretch flex flex-row items-start justify-start gap-[2.5rem] lg:flex-wrap mq450:gap-[1.25rem]">
                  <div className="rounded-xl bg-oldlace-300 flex flex-row items-start justify-start py-[1.125rem] pl-[0.562rem] pr-[0.437rem] gap-[0.187rem] z-[2]">
                    <div className="h-[3.75rem] w-[15.625rem] relative rounded-xl bg-oldlace-300 hidden" />
                    <img
                      className="h-[1.5rem] w-[1.5rem] relative z-[3]"
                      loading="lazy"
                      alt=""
                      src="/group-95.svg"
                    />
                    <b className="relative text-[1.25rem] font-radio-option text-nude whitespace-pre-wrap text-left z-[3]">
                      Información de la partida
                    </b>
                  </div>

                  {/* Columna izquierda */}
                  <div className="w-[18rem] flex flex-col items-start justify-start pt-[0.062rem] px-[0rem] pb-[0rem] box-border">
                    <div className="self-stretch flex flex-col items-start justify-start gap-[2rem] mq450:gap-[1rem]">
                      <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                        <div className="w-[15.688rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                          Imagen de partida
                        </div>
                        <img
                          className="self-stretch flex-1 relative rounded-xl max-w-full overflow-hidden max-h-[300px] object-cover z-[2]"
                          loading="lazy"
                          alt={partida.titulo}
                          src={partida.imagenUrl || "/placeholder.jpg"}
                          onError={(e: any) =>
                            (e.target.src =
                              "https://via.placeholder.com/300x200?text=No+Image")
                          }
                        />
                      </div>

                      <div className="self-stretch flex flex-col items-start justify-start gap-[1.312rem]">
                        <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                          <div className="w-[15.044rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                            Descripción
                          </div>
                          <div className="border-nude border-[1px] border-solid bg-[transparent] h-[9.375rem] w-auto [outline:none] self-stretch rounded-3xs box-border flex flex-row items-start justify-start py-[0.25rem] px-[0.562rem] font-radio-option font-light text-[0.875rem] text-nude z-[2] overflow-auto">
                            {partida.descripcion}
                          </div>
                        </div>

                        <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                          <div className="w-[12.425rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                            Tags
                          </div>
                          <div className="self-stretch [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid flex flex-row items-end justify-between py-[0rem] pl-[0.562rem] pr-[0.75rem] gap-[1.25rem] z-[2]">
                            <div className="h-[2.5rem] w-[18rem] relative [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border hidden mix-blend-normal" />
                            <div className="h-[2.5rem] w-full relative text-[0.875rem] font-light font-radio-option text-nude text-left flex items-center shrink-0 z-[3]">
                              {partida.tags}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Columna derecha */}
                  <div className="w-[19.25rem] flex flex-col items-start justify-start pt-[0.062rem] px-[0rem] pb-[0rem] box-border">
                    <div className="self-stretch flex flex-col items-start justify-start gap-[2.225rem] mq450:gap-[1.125rem]">
                      <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                        <div className="w-[16.106rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                          Título de la partida
                        </div>
                        <div className="self-stretch flex flex-row items-start justify-start py-[0rem] px-[0.875rem] relative">
                          <div className="h-full w-full absolute !m-[0] top-[0rem] right-[0rem] bottom-[0rem] left-[0rem] [filter:blur(1px)] rounded-xl border-dark-gold border-[1px] border-solid box-border mix-blend-normal z-[2]" />
                          <div className="w-[12.831rem] [border:none] [outline:none] font-light font-radio-option text-[0.875rem] bg-[transparent] h-[2.5rem] relative text-nude text-left flex items-center p-0 z-[3]">
                            {partida.titulo}
                          </div>
                        </div>
                      </div>

                      <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                        <div className="w-[13.288rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                          Tipo de partida
                        </div>
                        <div className="flex items-center gap-3 mt-1 cursor-default">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center border border-nude bg-nude">
                            <div className="w-2 h-2 bg-black rounded-full" />
                          </div>
                          <span className="relative text-[0.875rem] font-light font-radio-option text-nude text-left z-[3]">
                            {partida.tipoPartida
                              ? partida.tipoPartida.charAt(0).toUpperCase() +
                                partida.tipoPartida.slice(1).toLowerCase()
                              : ""}
                          </span>
                        </div>
                      </div>

                      <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                        <div className="w-[16.363rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                          Idioma
                        </div>
                        <div className="self-stretch rounded-xl border-nude border-[1px] border-solid flex flex-row items-start justify-start py-[0rem] px-[0.687rem] z-[2]">
                          <div className="h-[2.5rem] w-[19.25rem] relative rounded-xl border-nude border-[1px] border-solid box-border hidden mix-blend-normal" />
                          <div className="w-[15.338rem] [border:none] [outline:none] font-light font-radio-option text-[0.875rem] bg-[transparent] h-[2.5rem] relative text-nude text-left flex items-center p-0 z-[3]">
                            {partida.idioma}
                          </div>
                        </div>
                      </div>

                      <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                        <div className="w-[16.363rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                          Edad mínima
                        </div>
                        <div className="self-stretch rounded-xl border-nude border-[1px] border-solid flex flex-row items-start justify-start py-[0rem] px-[0.687rem] z-[2]">
                          <div className="h-[2.5rem] w-[19.25rem] relative rounded-xl border-nude border-[1px] border-solid box-border hidden mix-blend-normal" />
                          <div className="w-[15.338rem] [border:none] [outline:none] font-light font-radio-option text-[0.875rem] bg-[transparent] h-[2.5rem] relative text-nude text-left flex items-center p-0 z-[3]">
                            {partida.edadMinima}
                          </div>
                        </div>
                      </div>

                      <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                        <div className="w-[16.363rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                          Número de jugadores
                        </div>
                        <div className="self-stretch rounded-xl border-nude border-[1px] border-solid flex flex-row items-start justify-start py-[0rem] px-[0.687rem] z-[2]">
                          <div className="h-[2.5rem] w-[19.25rem] relative rounded-xl border-nude border-[1px] border-solid box-border hidden mix-blend-normal" />
                          <div className="w-[15.338rem] [border:none] [outline:none] font-light font-radio-option text-[0.875rem] bg-[transparent] h-[2.5rem] relative text-nude text-left flex items-center p-0 z-[3]">
                            {partida.jugadores}
                          </div>
                        </div>
                      </div>

                      <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                        <div className="w-[16.363rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                          Temporalidad
                        </div>
                        <div className="self-stretch rounded-xl border-nude border-[1px] border-solid flex flex-row items-start justify-start py-[0rem] px-[0.687rem] z-[2]">
                          <div className="h-[2.5rem] w-[19.25rem] relative rounded-xl border-nude border-[1px] border-solid box-border hidden mix-blend-normal" />
                          <div className="w-[15.338rem] [border:none] [outline:none] font-light font-radio-option text-[0.875rem] bg-[transparent] h-[2.5rem] relative text-nude text-left flex items-center p-0 z-[3]">
                            {partida.temporalidad}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 2: Información de la sesión */}
                <div className="self-stretch flex flex-col items-start justify-start gap-[4.125rem] max-w-full mq1050:gap-[2.063rem] mq450:gap-[1rem]">
                  <div className="self-stretch flex flex-row items-start justify-start gap-[2.437rem] mq1050:flex-wrap mq450:gap-[1.188rem]">
                    <div className="rounded-xl bg-oldlace-300 flex flex-row items-start justify-start py-[1.125rem] pl-[0.562rem] pr-[0.437rem] gap-[0.187rem] z-[2]">
                      <div className="h-[3.75rem] w-[15.625rem] relative rounded-xl bg-oldlace-300 hidden" />
                      <img
                        className="h-[1.5rem] w-[1.5rem] relative z-[3]"
                        loading="lazy"
                        alt=""
                        src="/settings.svg"
                      />
                      <b className="relative text-[1.25rem] font-radio-option text-nude whitespace-pre-wrap text-left z-[3]">
                        Información de la sesión
                      </b>
                    </div>

                    <div className="w-[18.125rem] flex flex-col items-start justify-start gap-[3.687rem] mq450:gap-[1.813rem]">
                      <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                        <div className="relative text-[1.125rem] font-medium font-radio-option text-nude text-left z-[2]">
                          Recomendaciones para la partida
                        </div>
                        <div className="border-nude border-[1px] border-solid bg-[transparent] h-[9.375rem] w-auto [outline:none] self-stretch rounded-3xs box-border flex flex-row items-start justify-start py-[0.25rem] px-[0.562rem] font-radio-option font-light text-[0.875rem] text-nude z-[2] overflow-auto">
                          {partida.recomendaciones}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col items-start justify-start gap-[1.481rem]">
                      <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                        <div className="w-[13.288rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                          Ciudad (si es presencial)
                        </div>
                        <div className="self-stretch [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid flex flex-row items-start justify-start py-[0rem] px-[0.625rem] z-[2]">
                          <div className="h-[2.5rem] w-[19.25rem] relative [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border hidden mix-blend-normal" />
                          <div className="w-[12.581rem] [border:none] [outline:none] font-light font-radio-option text-[0.875rem] bg-[transparent] h-[2.5rem] relative text-nude text-left flex items-center p-0 z-[3]">
                            {partida.ciudad}
                          </div>
                        </div>
                      </div>

                      <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                        <div className="w-[12.425rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                          Contacto del máster
                        </div>
                        <div className="self-stretch [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid flex flex-row items-start justify-start py-[0rem] px-[0.562rem] z-[2]">
                          <div className="h-[2.5rem] w-[19.25rem] relative [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border hidden mix-blend-normal" />
                          <div className="w-[11.763rem] [border:none] [outline:none] font-light font-radio-option text-[0.875rem] bg-[transparent] h-[2.5rem] relative text-nude text-left flex items-center p-0 z-[3]">
                            {partida.contactoMaster}
                          </div>
                        </div>
                      </div>

                      <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                        <div className="w-[12.425rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                          Precio
                        </div>
                        <div className="self-stretch [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid flex flex-row items-start justify-start py-[0rem] px-[0.562rem] z-[2]">
                          <div className="h-[2.5rem] w-[19.25rem] relative [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border hidden mix-blend-normal" />
                          <div className="w-[11.763rem] [border:none] [outline:none] font-light font-radio-option text-[0.875rem] bg-[transparent] h-[2.5rem] relative text-nude text-left flex items-center p-0 z-[3]">
                            {partida.precio}
                          </div>
                        </div>
                      </div>

                      <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                        <div className="w-[12.425rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                          Horario
                        </div>
                        <div className="self-stretch [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid flex flex-row items-start justify-start py-[0rem] px-[0.562rem] z-[2]">
                          <div className="h-[2.5rem] w-[19.25rem] relative [backdrop-filter:blur(4px)] rounded-xl border-nude border-[1px] border-solid box-border hidden mix-blend-normal" />
                          <div className="w-[11.763rem] [border:none] [outline:none] font-light font-radio-option text-[0.875rem] bg-[transparent] h-[2.5rem] relative text-nude text-left flex items-center p-0 z-[3]">
                            {partida.horario}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 3: Información técnica */}
                  <div className="w-[54.5rem] flex flex-row items-start justify-start gap-[2.5rem] max-w-full mq450:gap-[1.25rem]">
                    <div className="rounded-xl bg-oldlace-300 flex flex-row items-start justify-start py-[1.125rem] pl-[0.562rem] pr-[0.437rem] gap-[0.187rem] z-[2]">
                      <div className="h-[3.75rem] w-[15.625rem] relative rounded-xl bg-oldlace-300 hidden" />
                      <img
                        className="h-[1.5rem] w-[1.5rem] relative z-[3]"
                        loading="lazy"
                        alt=""
                        src="/tool.svg"
                      />
                      <b className="relative text-[1.25rem] font-radio-option text-nude whitespace-pre-wrap text-left z-[3]">
                        Información técnica
                      </b>
                    </div>

                    <div className="flex-1 flex flex-row items-start justify-start gap-[2.5rem] max-w-full mq1050:min-w-full mq750:gap-[1.25rem] mq750:flex-wrap">
                      <div className="flex-1 flex flex-col items-start justify-start gap-[0.375rem]">
                        <div className="w-[15.044rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                          Herramientas necesarias
                        </div>
                        <div className="border-nude border-[1px] border-solid bg-[transparent] h-[9.375rem] w-auto [outline:none] self-stretch rounded-3xs box-border flex flex-row items-start justify-start py-[0.625rem] px-[0.437rem] font-radio-option font-light text-[0.875rem] text-nude z-[2] overflow-auto">
                          {partida.herramientas}
                        </div>
                      </div>

                      <div className="w-[15.875rem] flex flex-col items-start justify-start gap-[1.937rem] mq450:gap-[0.938rem] mq750:flex-1">
                        <div className="self-stretch flex flex-col items-start justify-start pt-[0rem] px-[0rem] pb-[0.562rem] gap-[0.812rem]">
                          <div className="self-stretch relative text-[1.125rem] font-medium font-radio-option text-nude text-left z-[2]">
                            Uso de tarjeta X
                          </div>
                          <div className="w-[9.75rem] flex flex-row items-start justify-start py-[0rem] px-[0.125rem] box-border">
                            <div className="flex-1 flex flex-row items-start justify-between gap-[1.25rem]">
                              <div className="w-[3.625rem] flex flex-row items-start justify-start gap-[0.562rem]">
                                <div className="flex flex-col items-start justify-start pt-[0.25rem] px-[0rem] pb-[0rem]">
                                  <div className="w-[1.5rem] h-[1.5rem] relative">
                                    <div
                                      className={`absolute top-[0rem] left-[0rem] rounded-[50%] bg-gray-200 border-nude border-[0px] border-solid box-border w-full h-full z-[2] ${
                                        partida.usoTarjetaX ? "" : ""
                                      }`}
                                    />
                                    {partida.usoTarjetaX && (
                                      <div className="absolute top-[0.375rem] left-[0.375rem] rounded-[50%] bg-nude border-nude border-[0px] border-solid box-border w-[0.75rem] h-[0.75rem] z-[3]" />
                                    )}
                                  </div>
                                </div>
                                <div className="h-[2rem] flex-1 relative text-[1.125rem] font-radio-option text-nude text-left flex items-center z-[2]">
                                  Si
                                </div>
                              </div>
                              <div className="flex flex-row items-start justify-start gap-[0.562rem]">
                                <div className="flex flex-col items-start justify-start pt-[0.25rem] px-[0rem] pb-[0rem]">
                                  <div className="w-[1.5rem] h-[1.5rem] relative">
                                    <div
                                      className={`absolute top-[0rem] left-[0rem] rounded-[50%] bg-gray-200 border-nude border-[0px] border-solid box-border w-full h-full z-[2] ${
                                        !partida.usoTarjetaX ? "" : ""
                                      }`}
                                    />
                                    {!partida.usoTarjetaX && (
                                      <div className="absolute top-[0.375rem] left-[0.375rem] rounded-[50%] bg-nude border-nude border-[0px] border-solid box-border w-[0.75rem] h-[0.75rem] z-[3]" />
                                    )}
                                  </div>
                                </div>
                                <div className="h-[2rem] relative text-[1.125rem] font-radio-option text-nude text-left flex items-center min-w-[1.625rem] z-[2]">
                                  No
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="self-stretch flex flex-col items-start justify-start gap-[0.812rem]">
                          <div className="self-stretch relative text-[1.125rem] font-medium font-radio-option text-nude text-left z-[2]">
                            ¿Uso obligatorio de cámara?
                          </div>
                          <div className="w-[9.75rem] flex flex-row items-start justify-start py-[0rem] px-[0.125rem] box-border">
                            <div className="flex-1 flex flex-row items-start justify-between gap-[1.25rem]">
                              <div className="w-[3.625rem] flex flex-row items-start justify-start gap-[0.562rem]">
                                <div className="flex flex-col items-start justify-start pt-[0.25rem] px-[0rem] pb-[0rem]">
                                  <div className="w-[1.5rem] h-[1.5rem] relative">
                                    {partida.obligatorioCamara && (
                                      <>
                                        <div className="absolute top-[0rem] left-[0rem] rounded-[50%] bg-gray-200 border-nude border-[0px] border-solid box-border w-full h-full z-[2]" />
                                        <div className="absolute top-[0.375rem] left-[0.375rem] rounded-[50%] bg-nude border-nude border-[0px] border-solid box-border w-[0.75rem] h-[0.75rem] z-[3]" />
                                      </>
                                    )}
                                    {!partida.obligatorioCamara && (
                                      <div className="absolute top-[0rem] left-[0rem] rounded-[50%] bg-gray-200 border-nude border-[0px] border-solid box-border w-full h-full z-[2]" />
                                    )}
                                  </div>
                                </div>
                                <div className="h-[2rem] flex-1 relative text-[1.125rem] font-radio-option text-nude text-left flex items-center z-[2]">
                                  Si
                                </div>
                              </div>
                              <div className="flex flex-row items-start justify-start gap-[0.562rem]">
                                <div className="flex flex-col items-start justify-start pt-[0.25rem] px-[0rem] pb-[0rem]">
                                  <div className="w-[1.5rem] h-[1.5rem] relative">
                                    {!partida.obligatorioCamara && (
                                      <>
                                        <div className="absolute top-[0rem] left-[0rem] rounded-[50%] bg-gray-200 border-nude border-[0px] border-solid box-border w-full h-full z-[2]" />
                                        <div className="absolute top-[0.375rem] left-[0.375rem] rounded-[50%] bg-nude border-nude border-[0px] border-solid box-border w-[0.75rem] h-[0.75rem] z-[3]" />
                                      </>
                                    )}
                                    {partida.obligatorioCamara && (
                                      <div className="absolute top-[0rem] left-[0rem] rounded-[50%] bg-gray-200 border-nude border-[0px] border-solid box-border w-full h-full z-[2]" />
                                    )}
                                  </div>
                                </div>
                                <div className="h-[2rem] relative text-[1.125rem] font-radio-option text-nude text-left flex items-center min-w-[1.625rem] z-[2]">
                                  No
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="self-stretch flex flex-col items-start justify-start gap-[0.812rem]">
                          <div className="self-stretch relative text-[1.125rem] font-medium font-radio-option text-nude text-left z-[2]">
                            ¿Uso obligatorio de micrófono?
                          </div>
                          <div className="w-[9.5rem] flex flex-row items-start justify-between gap-[1.25rem]">
                            <div className="w-[3.625rem] flex flex-row items-start justify-start gap-[0.562rem]">
                              <div className="flex flex-col items-start justify-start pt-[0.25rem] px-[0rem] pb-[0rem]">
                                <div className="w-[1.5rem] h-[1.5rem] relative">
                                  {partida.obligatorioMicrofono && (
                                    <>
                                      <div className="absolute top-[0rem] left-[0rem] rounded-[50%] bg-gray-200 border-nude border-[0px] border-solid box-border w-full h-full z-[2]" />
                                      <div className="absolute top-[0.375rem] left-[0.375rem] rounded-[50%] bg-nude border-nude border-[0px] border-solid box-border w-[0.75rem] h-[0.75rem] z-[3]" />
                                    </>
                                  )}
                                  {!partida.obligatorioMicrofono && (
                                    <div className="absolute top-[0rem] left-[0rem] rounded-[50%] bg-gray-200 border-nude border-[0px] border-solid box-border w-full h-full z-[2]" />
                                  )}
                                </div>
                              </div>
                              <div className="h-[2rem] flex-1 relative text-[1.125rem] font-radio-option text-nude text-left flex items-center z-[2]">
                                Si
                              </div>
                            </div>
                            <div className="flex flex-row items-start justify-start gap-[0.562rem]">
                              <div className="flex flex-col items-start justify-start pt-[0.25rem] px-[0rem] pb-[0rem]">
                                <div className="w-[1.5rem] h-[1.5rem] relative">
                                  {!partida.obligatorioMicrofono && (
                                    <>
                                      <div className="absolute top-[0rem] left-[0rem] rounded-[50%] bg-gray-200 border-nude border-[0px] border-solid box-border w-full h-full z-[2]" />
                                      <div className="absolute top-[0.375rem] left-[0.375rem] rounded-[50%] bg-nude border-nude border-[0px] border-solid box-border w-[0.75rem] h-[0.75rem] z-[3]" />
                                    </>
                                  )}
                                  {partida.obligatorioMicrofono && (
                                    <div className="absolute top-[0rem] left-[0rem] rounded-[50%] bg-gray-200 border-nude border-[0px] border-solid box-border w-full h-full z-[2]" />
                                  )}
                                </div>
                              </div>
                              <div className="h-[2rem] relative text-[1.125rem] font-radio-option text-nude text-left flex items-center min-w-[1.625rem] z-[2]">
                                No
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción principales */}
            <div className="flex flex-row items-start justify-start gap-[2.5rem] max-w-full mq450:gap-[1.25rem] mq750:flex-wrap mb-8">
              <button
                onClick={handleComprar}
                className="cursor-pointer [border:none] py-[0.625rem] px-[3.5rem] bg-dark-gold h-[2.625rem] rounded-31xl shadow-[0px_2px_4px_rgba(0,_0,_0,_0.25)] overflow-hidden flex flex-row items-start justify-start box-border z-[2] hover:bg-darkgoldenrod"
              >
                <b className="flex-1 relative text-[1.125rem] inline-block font-radio-option text-black text-center min-w-[5.125rem]">
                  Comprar partida
                </b>
              </button>
              <button
                onClick={handleEditar}
                className="cursor-pointer border-dark-gold border-[1px] border-solid py-[0.5rem] px-[2.75rem] bg-nude/10 h-[2.625rem] rounded-31xl box-border overflow-hidden flex flex-row items-start justify-start z-[2] hover:bg-nude/20 hover:border-darkgoldenrod-100"
              >
                <b className="flex-1 relative text-[1.125rem] inline-block font-radio-option text-white text-center min-w-[4rem]">
                  Editar
                </b>
              </button>
              <button
                onClick={handleEliminar}
                className="cursor-pointer border-red-500 border-[1px] border-solid py-[0.5rem] px-[2.75rem] bg-red-900/20 h-[2.625rem] rounded-31xl box-border overflow-hidden flex flex-row items-start justify-start z-[2] hover:bg-red-900/40"
              >
                <b className="flex-1 relative text-[1.125rem] inline-block font-radio-option text-red-500 text-center min-w-[4rem]">
                  Eliminar
                </b>
              </button>
              <button
                onClick={handleVolver}
                className="cursor-pointer border-dark-gold border-[1px] border-solid py-[0.5rem] px-[2.75rem] bg-[transparent] h-[2.625rem] rounded-31xl box-border overflow-hidden flex flex-row items-start justify-start z-[2] hover:bg-darkgoldenrod-200 hover:border-darkgoldenrod-100 hover:border-[1px] hover:border-solid hover:box-border"
              >
                <b className="flex-1 relative text-[1.125rem] inline-block font-radio-option text-dark-gold text-center min-w-[4rem]">
                  Volver
                </b>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DetailsGame;
