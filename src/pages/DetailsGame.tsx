import { FunctionComponent, useCallback, useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import PartidasService from "../services/partidasService";
import { Partida } from "../components/PartidaCard";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "../i18n";
import ReviewForm from "../components/ReviewForm";
import { FALLBACK_GAME_IMAGE_URL } from "../constants";
import { getErrorMessage } from "../lib/errors";
import PaymentService from "../services/paymentService";
import { publicConfig } from "../lib/publicConfig";

const DetailsGame: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { partidaId } = useParams<{ partidaId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [partida, setPartida] = useState<Partida | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userRole } = useAuth();
  const { showToast } = useToast();

  const [isJoined, setIsJoined] = useState(false);
  const [hasDigitalAccess, setHasDigitalAccess] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const isPaidGame = Number(partida?.precio || 0) > 0;
  const isDigital = partida?.tipoPartida === "Digital";

  useEffect(() => {
    if (searchParams.get("payment") !== "cancelled") return;
    showToast(t.detailsGame.paymentCancelled, "info");
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("payment");
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams, showToast, t]);

  useEffect(() => {
    const fetchPartidaAndStatus = async () => {
      if (partidaId) {
        try {
          const data = await PartidasService.obtenerPartidaPorId(partidaId);
          setPartida(data);

          if (user) {
            if (data.tipoPartida === "Digital") {
              setHasDigitalAccess(
                await PartidasService.tieneAccesoDigital(partidaId)
              );
              setIsJoined(false);
            } else {
              const joined = await PartidasService.verificarInscripcion(
                partidaId
              );
              setIsJoined(joined);
              setHasDigitalAccess(false);
            }
          }
        } catch (err) {
          console.error("Error cargando partida:", err);
          setError(t.detailsGame.loadError);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError(t.detailsGame.invalidId);
      }
    };

    fetchPartidaAndStatus();
  }, [partidaId, user]);

  const handleVolver = useCallback(() => {
    navigate("/nextgames");
  }, [navigate]);

  const handleEditar = useCallback(() => {
    navigate(`/editarpartida/${partidaId}`);
  }, [navigate, partidaId]);

  const handleDigitalDownload = useCallback(async () => {
    if (!partidaId) return;
    setJoinLoading(true);
    try {
      const download = await PaymentService.obtenerDescargaDigital(partidaId);
      window.location.assign(download.url);
    } catch (downloadError) {
      showToast(
        getErrorMessage(downloadError, "No se pudo preparar la descarga"),
        "error"
      );
    } finally {
      setJoinLoading(false);
    }
  }, [partidaId, showToast]);

  const handleEliminar = useCallback(async () => {
    if (Number(partida?.jugadoresActuales) > 0) {
      showToast(t.detailsGame.cannotDeleteWithPlayers, "error");
      return;
    }
    if (
      confirm(t.detailsGame.confirmDelete)
    ) {
      try {
        if (partidaId) {
          await PartidasService.eliminarPartida(partidaId);
          showToast(t.detailsGame.deleteSuccess, "success");
          navigate("/nextgames");
        }
      } catch (err) {
        console.error("Error al eliminar:", err);
        showToast(t.detailsGame.deleteError, "error");
      }
    }
  }, [partida, partidaId, navigate, showToast, t]);

  const handleStatusChange = useCallback(
    async (status: "active" | "cancelled" | "completed") => {
      if (!partidaId) return;
      if (
        status === "cancelled" &&
        !confirm(
          partida?.tipoPartida === "Digital"
            ? "¿Quieres retirar esta aventura de la venta? Quienes ya la compraron conservarán su descarga."
            : t.detailsGame.confirmCancel
        )
      ) {
        return;
      }

      try {
        await PartidasService.cambiarEstado(partidaId, status);
        const updatedPartida = await PartidasService.obtenerPartidaPorId(
          partidaId
        );
        setPartida(updatedPartida);
        showToast(t.detailsGame.statusUpdated, "success");
      } catch (statusError) {
        const message =
          getErrorMessage(statusError, t.detailsGame.actionError);
        showToast(message, "error");
      }
    },
    [partida, partidaId, showToast, t]
  );

  const handleToggleJoin = useCallback(async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!partidaId || !partida) return;

    setJoinLoading(true);
    try {
      if (partida.tipoPartida === "Digital") {
        if (hasDigitalAccess) {
          const download = await PaymentService.obtenerDescargaDigital(partidaId);
          window.location.assign(download.url);
        } else {
          if (!publicConfig.paymentsEnabled) {
            navigate("/en-desarrollo", {
              state: { feature: "El pago seguro de aventuras digitales" },
            });
            return;
          }
          const checkoutUrl = await PaymentService.iniciarPago(partidaId);
          window.location.assign(checkoutUrl);
        }
        return;
      }

      if (isJoined) {
        // Salir
        await PartidasService.salirPartida(partidaId);
        setIsJoined(false);
        showToast(t.detailsGame.leftGame, "info");
      } else {
        if (Number(partida.jugadoresActuales) >= Number(partida.jugadores)) {
          throw new Error(t.detailsGame.gameFull);
        }
        if (isPaidGame) {
          if (!publicConfig.paymentsEnabled) {
            navigate("/en-desarrollo", {
              state: { feature: "La reserva de partidas de pago" },
            });
            return;
          }
          const checkoutUrl = await PaymentService.iniciarPago(partidaId);
          window.location.assign(checkoutUrl);
          return;
        }
        await PartidasService.unirsePartida(partidaId);
        setIsJoined(true);
        showToast(t.detailsGame.joinedGame, "success");
      }

      // Refrescar datos de la partida para actualizar slots
      const updatedPartida = await PartidasService.obtenerPartidaPorId(
        partidaId
      );
      setPartida(updatedPartida);
    } catch (error: unknown) {
      console.error("Error al cambiar estado unirse:", error);
      showToast(
        getErrorMessage(error, t.detailsGame.actionError),
        "error"
      );
    } finally {
      setJoinLoading(false);
    }
  }, [
    user,
    navigate,
    partidaId,
    partida,
    hasDigitalAccess,
    isJoined,
    isPaidGame,
    showToast,
    t,
  ]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl font-radio-option">
          {t.detailsGame.loading}
        </div>
      </div>
    );
  }

  if (error || !partida) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="text-red-500 text-xl font-radio-option">
          {error || t.detailsGame.notFound}
        </div>
        <button
          onClick={handleVolver}
          className="py-2 px-4 bg-dark-gold rounded-xl cursor-pointer"
        >
          {t.detailsGame.back}
        </button>
      </div>
    );
  }

  const canComplete =
    partida.tipoPartida !== "Digital" &&
    (partida.status === "active" || partida.status === "full") &&
    Boolean(partida.fecha) &&
    new Date(partida.fecha as string).getTime() <= Date.now();
  const canManage = user?.id === partida.masterId || userRole === "admin";

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
            <p className="text-base text-dark-gold font-bold z-[2]">
              {t.detailsGame.statusLabel}:{" "}
              {isDigital
                ? partida.status === "cancelled"
                  ? "No disponible"
                  : "Disponible"
                : partida.status === "completed"
                ? t.detailsGame.statusCompleted
                : partida.status === "cancelled"
                ? t.detailsGame.statusCancelled
                : partida.status === "full"
                ? t.detailsGame.statusFull
                : t.detailsGame.statusActive}
            </p>
            <div className="self-stretch h-[2.688rem] relative text-[1.125rem] leading-[1.625rem] whitespace-pre-wrap flex items-center shrink-0 z-[2] mt-[-0.625rem]">
              {t.detailsGame.organizedBy}{" "}
              {partida.masterName || t.detailsGame.unknownMaster}
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
                      {t.detailsGame.gameInfo}
                    </b>
                  </div>

                  {/* Columna izquierda */}
                  <div className="w-[18rem] flex flex-col items-start justify-start pt-[0.062rem] px-[0rem] pb-[0rem] box-border">
                    <div className="self-stretch flex flex-col items-start justify-start gap-[2rem] mq450:gap-[1rem]">
                      <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                        <div className="w-[15.688rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                          {t.detailsGame.imageAlt}
                        </div>
                        <img
                          className="self-stretch flex-1 relative rounded-xl max-w-full overflow-hidden max-h-[300px] object-cover z-[2]"
                          loading="lazy"
                          alt={partida.titulo}
                          src={partida.imagenUrl || FALLBACK_GAME_IMAGE_URL}
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = FALLBACK_GAME_IMAGE_URL;
                          }}
                        />
                      </div>

                      <div className="self-stretch flex flex-col items-start justify-start gap-[1.312rem]">
                        <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                          <div className="w-[15.044rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                            {t.detailsGame.description}
                          </div>
                          <div className="border-nude border-[1px] border-solid bg-[transparent] h-[9.375rem] w-auto [outline:none] self-stretch rounded-3xs box-border flex flex-row items-start justify-start py-[0.25rem] px-[0.562rem] font-radio-option font-light text-[0.875rem] text-nude z-[2] overflow-auto">
                            {partida.descripcion}
                          </div>
                        </div>

                        <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                          <div className="w-[12.425rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                            {t.detailsGame.tags}
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
                          {t.detailsGame.titleField}
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
                          {t.detailsGame.type}
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
                          {t.detailsGame.language}
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
                          {t.detailsGame.minAge}
                        </div>
                        <div className="self-stretch rounded-xl border-nude border-[1px] border-solid flex flex-row items-start justify-start py-[0rem] px-[0.687rem] z-[2]">
                          <div className="h-[2.5rem] w-[19.25rem] relative rounded-xl border-nude border-[1px] border-solid box-border hidden mix-blend-normal" />
                          <div className="w-[15.338rem] [border:none] [outline:none] font-light font-radio-option text-[0.875rem] bg-[transparent] h-[2.5rem] relative text-nude text-left flex items-center p-0 z-[3]">
                            {partida.edadMinima}
                          </div>
                        </div>
                      </div>

                      {partida.tipoPartida === "Digital" ? (
                        <div className="self-stretch rounded-xl border border-dark-gold/50 bg-black/20 p-4 text-left text-sm text-nude">
                          <strong className="block mb-2 text-base text-light-gold">Archivo incluido</strong>
                          <span className="block break-all">{partida.digitalFileName || "Archivo digital"}</span>
                          <span className="block mt-1 text-nude/60">
                            {partida.digitalFileSizeBytes
                              ? `${(partida.digitalFileSizeBytes / 1024 / 1024).toFixed(1)} MB`
                              : "Tamaño no disponible"}
                            {partida.digitalVersion ? ` · versión ${partida.digitalVersion}` : ""}
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                            <div className="w-[16.363rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                              {t.detailsGame.numPlayers}
                            </div>
                            <div className="self-stretch rounded-xl border-nude border-[1px] border-solid flex flex-row items-start justify-start py-[0rem] px-[0.687rem] z-[2]">
                              <div className="w-[15.338rem] font-light font-radio-option text-[0.875rem] h-[2.5rem] relative text-nude text-left flex items-center z-[3]">
                                {partida.jugadores}
                              </div>
                            </div>
                          </div>
                          <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                            <div className="w-[16.363rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                              {t.detailsGame.temporality}
                            </div>
                            <div className="self-stretch rounded-xl border-nude border-[1px] border-solid flex flex-row items-start justify-start py-[0rem] px-[0.687rem] z-[2]">
                              <div className="w-[15.338rem] font-light font-radio-option text-[0.875rem] h-[2.5rem] relative text-nude text-left flex items-center z-[3]">
                                {partida.temporalidad}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {partida.tipoPartida === "Digital" && (
                  <div className="w-full max-w-[54.5rem] rounded-xl border border-dark-gold/40 bg-black/20 p-6 text-left text-nude">
                    <h2 className="m-0 text-2xl text-light-gold">Aventura digital</h2>
                    <p className="mb-0 mt-3 text-base leading-6">
                      Compra única con entrega privada en PDF, ZIP o RAR. El pago se procesa
                      con Stripe y el archivo se entrega mediante un enlace temporal asociado
                      a tu cuenta; no reserva plaza ni incluye una sesión dirigida por el máster.
                    </p>
                  </div>
                )}

                {partida.tipoPartida !== "Digital" && <>
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
                        {t.detailsGame.sessionInfo}
                      </b>
                    </div>

                    <div className="w-[18.125rem] flex flex-col items-start justify-start gap-[3.687rem] mq450:gap-[1.813rem]">
                      <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                        <div className="relative text-[1.125rem] font-medium font-radio-option text-nude text-left z-[2]">
                          {t.detailsGame.recommendations}
                        </div>
                        <div className="border-nude border-[1px] border-solid bg-[transparent] h-[9.375rem] w-auto [outline:none] self-stretch rounded-3xs box-border flex flex-row items-start justify-start py-[0.25rem] px-[0.562rem] font-radio-option font-light text-[0.875rem] text-nude z-[2] overflow-auto">
                          {partida.recomendaciones}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col items-start justify-start gap-[1.481rem]">
                      <div className="self-stretch flex flex-col items-start justify-start gap-[0.375rem]">
                        <div className="w-[13.288rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                          {t.detailsGame.city}
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
                          {t.detailsGame.masterContact}
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
                          {t.detailsGame.price}
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
                          {t.detailsGame.schedule}
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
                        {t.detailsGame.technicalInfo}
                      </b>
                    </div>

                    <div className="flex-1 flex flex-row items-start justify-start gap-[2.5rem] max-w-full mq1050:min-w-full mq750:gap-[1.25rem] mq750:flex-wrap">
                      <div className="flex-1 flex flex-col items-start justify-start gap-[0.375rem]">
                        <div className="w-[15.044rem] relative text-[1.125rem] font-medium font-radio-option text-nude text-left flex items-center z-[2]">
                          {t.detailsGame.tools}
                        </div>
                        <div className="border-nude border-[1px] border-solid bg-[transparent] h-[9.375rem] w-auto [outline:none] self-stretch rounded-3xs box-border flex flex-row items-start justify-start py-[0.625rem] px-[0.437rem] font-radio-option font-light text-[0.875rem] text-nude z-[2] overflow-auto">
                          {partida.herramientas}
                        </div>
                      </div>

                      <div className="w-[15.875rem] flex flex-col items-start justify-start gap-[1.937rem] mq450:gap-[0.938rem] mq750:flex-1">
                        <div className="self-stretch flex flex-col items-start justify-start pt-[0rem] px-[0rem] pb-[0.562rem] gap-[0.812rem]">
                          <div className="self-stretch relative text-[1.125rem] font-medium font-radio-option text-nude text-left z-[2]">
                            {t.detailsGame.xCardUsage}
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
                                  {t.detailsGame.yes}
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
                                  {t.detailsGame.no}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="self-stretch flex flex-col items-start justify-start gap-[0.812rem]">
                          <div className="self-stretch relative text-[1.125rem] font-medium font-radio-option text-nude text-left z-[2]">
                            {t.detailsGame.cameraRequired}
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
                                  {t.detailsGame.yes}
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
                                  {t.detailsGame.no}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="self-stretch flex flex-col items-start justify-start gap-[0.812rem]">
                          <div className="self-stretch relative text-[1.125rem] font-medium font-radio-option text-nude text-left z-[2]">
                            {t.detailsGame.micRequired}
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
                                {t.detailsGame.yes}
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
                                {t.detailsGame.no}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN NUEVA: Jugadores Inscritos */}
                <div className="w-full max-w-[54.5rem] flex flex-col items-start justify-start gap-[1.5rem]">
                  <b className="relative text-[1.25rem] font-radio-option text-nude whitespace-pre-wrap text-left z-[3]">
                    {t.detailsGame.playersEnrolled} ({partida.jugadoresActuales}/
                    {partida.jugadores})
                  </b>
                  <div className="flex flex-row flex-wrap gap-4 items-start justify-start">
                    {Array.from({ length: Number(partida.jugadores) }).map(
                      (_, index) => {
                        const player = partida.participantes?.[index];
                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center gap-2 w-[80px]"
                          >
                            <div
                              className={`w-[60px] h-[60px] rounded-full border-2 flex items-center justify-center ${
                                player
                                  ? "bg-dark-gold border-goldenrod text-black"
                                  : "bg-transparent border-gray-500 text-gray-500 border-dashed"
                              }`}
                            >
                              {player ? (
                                <span className="text-xl font-bold uppercase">
                                  {player.nombre?.charAt(0) || "?"}
                                </span>
                              ) : (
                                <span className="text-sm">+</span>
                              )}
                            </div>
                            <span className="text-xs text-nude text-center truncate w-full">
                              {player
                                ? player.nombre?.split(" ")[0] || t.detailsGame.playerDefault
                                : t.detailsGame.freeSlot}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
                </>}
              </div>
            </div>

            {/* Botones de acción principales */}
            <div className="flex flex-row items-start justify-start gap-[2.5rem] max-w-full mq450:gap-[1.25rem] mq750:flex-wrap mb-8">
              {user?.id !== partida.masterId &&
                ((isDigital && hasDigitalAccess) ||
                  partida.status === "active" ||
                  partida.status === "full") && (
                <button
                  onClick={handleToggleJoin}
                  disabled={
                    joinLoading ||
                    (!isDigital && isJoined && isPaidGame) ||
                    (!isJoined &&
                      !isDigital &&
                      (partida.status !== "active" ||
                        Number(partida.jugadoresActuales) >=
                          Number(partida.jugadores)))
                  }
                  className={`cursor-pointer [border:none] py-[0.625rem] px-[3.5rem] min-h-[2.625rem] rounded-31xl shadow-[0px_2px_4px_rgba(0,_0,_0,_0.25)] overflow-hidden flex flex-row items-center justify-center box-border z-[2] transition-colors ${
                    !isDigital && isJoined
                      ? "bg-red-900/20 border-red-500 border-[1px] border-solid hover:bg-red-900/40"
                      : "bg-dark-gold hover:bg-darkgoldenrod"
                  } ${joinLoading ? "opacity-70 cursor-wait" : ""}`}
                >
                  <b
                    className={`flex-1 relative text-[1.125rem] inline-block font-radio-option text-center min-w-[5.125rem] ${
                      !isDigital && isJoined ? "text-red-500" : "text-black"
                    }`}
                  >
                    {joinLoading
                      ? t.detailsGame.processingButton
                      : isDigital
                      ? hasDigitalAccess
                        ? "Descargar aventura"
                        : `Comprar y descargar · ${Number(partida.precio).toFixed(2)} €`
                      : isJoined
                      ? isPaidGame
                        ? t.detailsGame.paidReservationButton
                        : t.detailsGame.leaveButton
                      : Number(partida.jugadoresActuales) >=
                        Number(partida.jugadores)
                      ? t.detailsGame.fullButton
                      : isPaidGame
                      ? `${t.detailsGame.payButton} ${Number(partida.precio).toFixed(2)} €`
                      : t.detailsGame.joinButton}
                  </b>
                </button>
              )}

              {!isDigital && isJoined && isPaidGame && (
                <Link
                  to="/contacto"
                  className="h-[2.625rem] flex items-center text-nude underline"
                >
                  {t.detailsGame.cancelPaidReservation}
                </Link>
              )}

              {canManage && (
                <>
                  {partida.tipoPartida === "Digital" && (
                    <button
                      type="button"
                      onClick={() => void handleDigitalDownload()}
                      disabled={joinLoading}
                      className="cursor-pointer border-dark-gold border-[1px] border-solid py-[0.5rem] px-[2rem] min-h-[2.625rem] rounded-31xl bg-dark-gold text-black disabled:opacity-60"
                    >
                      <b className="text-[1rem] font-radio-option">Descargar archivo</b>
                    </button>
                  )}
                  <button
                    onClick={handleEditar}
                    className="cursor-pointer border-dark-gold border-[1px] border-solid py-[0.5rem] px-[2.75rem] bg-nude/10 h-[2.625rem] rounded-31xl box-border overflow-hidden flex flex-row items-start justify-start z-[2] hover:bg-nude/20 hover:border-darkgoldenrod-100"
                  >
                    <b className="flex-1 relative text-[1.125rem] inline-block font-radio-option text-white text-center min-w-[4rem]">
                      {t.detailsGame.editButton}
                    </b>
                  </button>
                  <button
                    onClick={handleEliminar}
                    className="cursor-pointer border-red-500 border-[1px] border-solid py-[0.5rem] px-[2.75rem] bg-red-900/20 h-[2.625rem] rounded-31xl box-border overflow-hidden flex flex-row items-start justify-start z-[2] hover:bg-red-900/40"
                  >
                    <b className="flex-1 relative text-[1.125rem] inline-block font-radio-option text-red-500 text-center min-w-[4rem]">
                      {t.detailsGame.deleteButton}
                    </b>
                  </button>
                  {canComplete && (
                    <button
                      onClick={() => handleStatusChange("completed")}
                      className="cursor-pointer border-dark-gold border-[1px] border-solid py-[0.5rem] px-[2.75rem] bg-nude/10 h-[2.625rem] rounded-31xl box-border"
                    >
                      <b className="text-[1.125rem] font-radio-option text-white">
                        {t.detailsGame.completeButton}
                      </b>
                    </button>
                  )}
                  {partida.tipoPartida === "Digital" ? (
                    <button
                      onClick={() =>
                        handleStatusChange(
                          partida.status === "cancelled" ? "active" : "cancelled"
                        )
                      }
                      className={`cursor-pointer border-[1px] border-solid py-[0.5rem] px-[2.75rem] bg-nude/10 min-h-[2.625rem] rounded-31xl box-border ${
                        partida.status === "cancelled"
                          ? "border-dark-gold text-white"
                          : "border-red-500 text-red-500"
                      }`}
                    >
                      <b className="text-[1rem] font-radio-option">
                        {partida.status === "cancelled"
                          ? "Volver a poner a la venta"
                          : "Retirar de la venta"}
                      </b>
                    </button>
                  ) : partida.status === "cancelled" ? (
                    <button
                      onClick={() => handleStatusChange("active")}
                      className="cursor-pointer border-dark-gold border-[1px] border-solid py-[0.5rem] px-[2.75rem] bg-nude/10 h-[2.625rem] rounded-31xl box-border"
                    >
                      <b className="text-[1.125rem] font-radio-option text-white">
                        {t.detailsGame.reactivateButton}
                      </b>
                    </button>
                  ) : partida.status !== "completed" ? (
                    <button
                      onClick={() => handleStatusChange("cancelled")}
                      className="cursor-pointer border-red-500 border-[1px] border-solid py-[0.5rem] px-[2.75rem] bg-red-900/20 h-[2.625rem] rounded-31xl box-border"
                    >
                      <b className="text-[1.125rem] font-radio-option text-red-500">
                        {t.detailsGame.cancelGameButton}
                      </b>
                    </button>
                  ) : null}
                </>
              )}
              <button
                onClick={handleVolver}
                className="cursor-pointer border-dark-gold border-[1px] border-solid py-[0.5rem] px-[2.75rem] bg-[transparent] h-[2.625rem] rounded-31xl box-border overflow-hidden flex flex-row items-start justify-start z-[2] hover:bg-darkgoldenrod-200 hover:border-darkgoldenrod-100 hover:border-[1px] hover:border-solid hover:box-border"
              >
                <b className="flex-1 relative text-[1.125rem] inline-block font-radio-option text-dark-gold text-center min-w-[4rem]">
                  {t.detailsGame.back}
                </b>
              </button>
            </div>
            {user?.id !== partida.masterId &&
              partida.status === "completed" &&
              partida.tipoPartida !== "Digital" &&
              isJoined &&
              partida.masterId &&
              partidaId && (
                <ReviewForm
                  partidaId={partidaId}
                  masterId={partida.masterId}
                />
              )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DetailsGame;
