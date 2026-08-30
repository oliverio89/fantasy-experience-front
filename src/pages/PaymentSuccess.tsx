import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PaymentService, { PaymentStatus } from "../services/paymentService";

const FINAL_STATUSES: PaymentStatus[] = [
  "paid",
  "expired",
  "failed",
  "refund_pending",
  "refunded",
];

const isCheckoutSession = (value: string | null): value is string =>
  Boolean(value && /^cs_(test_|live_)?[A-Za-z0-9_]+$/.test(value));

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<PaymentStatus | "checking" | "invalid">(
    isCheckoutSession(sessionId) ? "checking" : "invalid"
  );
  const [gameId, setGameId] = useState<string | null>(null);
  const [fulfillmentType, setFulfillmentType] = useState<
    "reservation" | "digital_download"
  >("reservation");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [message, setMessage] = useState(
    "Estamos confirmando el pago de forma segura con Stripe."
  );

  const checkPayment = useCallback(async () => {
    if (!isCheckoutSession(sessionId)) return;
    setStatus("checking");
    setMessage("Estamos confirmando el pago de forma segura con Stripe.");

    for (let attempt = 0; attempt < 10; attempt += 1) {
      try {
        const payment = await PaymentService.consultarPago(sessionId);
        setGameId(payment.gameId);
        setFulfillmentType(payment.fulfillmentType);
        if (payment.status === "paid") {
          setStatus(payment.status);
          setMessage(
            payment.fulfillmentType === "digital_download"
              ? "Pago confirmado. Tu aventura ya está disponible para descargar."
              : "Pago confirmado. Tu plaza ya está reservada."
          );
          return;
        }
        if (payment.status === "refund_pending") {
          setStatus(payment.status);
          setMessage(
            "El cobro se recibió cuando la plaza ya no estaba disponible. La devolución está en curso."
          );
          return;
        }
        if (payment.status === "refunded") {
          setStatus(payment.status);
          setMessage("El importe ha sido devuelto al método de pago original.");
          return;
        }
        if (FINAL_STATUSES.includes(payment.status)) {
          setStatus(payment.status);
          setMessage("El pago no se completó. No se ha reservado ninguna plaza.");
          return;
        }
      } catch (error) {
        if (attempt === 9) {
          setStatus("failed");
          setMessage(
            error instanceof Error
              ? error.message
              : "No se pudo comprobar el pago"
          );
          return;
        }
      }
      await new Promise((resolve) => window.setTimeout(resolve, 1500));
    }
    setStatus("pending");
    setMessage(
      "Stripe ha recibido el pago, pero la confirmación está tardando más de lo habitual. Puedes volver a comprobarlo."
    );
  }, [sessionId]);

  useEffect(() => {
    void checkPayment();
  }, [checkPayment]);

  useEffect(() => {
    if (status !== "paid" || !gameId || fulfillmentType === "digital_download") return;
    const timeout = window.setTimeout(
      () => navigate(`/detailsgame/${gameId}`, { replace: true }),
      2500
    );
    return () => window.clearTimeout(timeout);
  }, [fulfillmentType, gameId, navigate, status]);

  const handleDownload = async () => {
    if (!gameId) return;
    setDownloadLoading(true);
    try {
      const download = await PaymentService.obtenerDescargaDigital(gameId);
      window.location.assign(download.url);
    } catch (downloadError) {
      setMessage(
        downloadError instanceof Error
          ? downloadError.message
          : "No se pudo preparar la descarga"
      );
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <main className="min-h-[70vh] w-full bg-black text-nude flex items-center justify-center px-6 py-16">
      <section className="w-full max-w-xl rounded-xl border border-dark-gold p-8 text-center flex flex-col gap-5">
        <h1 className="text-3xl text-dark-gold font-bold">
          {status === "paid"
            ? fulfillmentType === "digital_download"
              ? "Compra confirmada"
              : "Reserva confirmada"
            : "Estado del pago"}
        </h1>
        <p aria-live="polite">{message}</p>
        {status === "checking" && (
          <div
            className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-nude border-t-dark-gold"
            aria-label="Comprobando pago"
          />
        )}
        <div className="flex flex-wrap justify-center gap-3">
          {status === "paid" && fulfillmentType === "digital_download" && gameId && (
            <button
              type="button"
              onClick={() => void handleDownload()}
              disabled={downloadLoading}
              className="rounded-full bg-dark-gold px-5 py-2 text-black font-bold disabled:opacity-60"
            >
              {downloadLoading ? "Preparando…" : "Descargar aventura"}
            </button>
          )}
          {gameId && (
            <Link
              to={`/detailsgame/${gameId}`}
              className="rounded-full bg-dark-gold px-5 py-2 text-black font-bold"
            >
              {fulfillmentType === "digital_download" ? "Ver aventura" : "Ver partida"}
            </Link>
          )}
          {status !== "checking" && status !== "paid" && (
            <button
              type="button"
              onClick={() => void checkPayment()}
              className="rounded-full border border-dark-gold px-5 py-2"
            >
              Comprobar de nuevo
            </button>
          )}
          <Link to="/nextgames" className="rounded-full px-5 py-2 underline">
            Volver al catálogo
          </Link>
        </div>
      </section>
    </main>
  );
};

export default PaymentSuccess;
