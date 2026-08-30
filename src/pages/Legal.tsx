import { useLocation } from "react-router-dom";
import { publicConfig } from "../lib/publicConfig";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-3">
    <h2 className="text-2xl text-dark-gold font-bold">{title}</h2>
    <div className="text-nude leading-7 flex flex-col gap-3">{children}</div>
  </section>
);

const PrivacyPolicy = () => (
  <>
    <Section title="Responsable del tratamiento">
      <p>{publicConfig.legalOwner}</p>
      <p>Contacto: {publicConfig.legalEmail}</p>
    </Section>
    <Section title="Datos y finalidades">
      <p>
        Tratamos los datos de cuenta, perfil, reservas, partidas, reseñas y
        comunicaciones necesarios para operar Fantasy Experience, mantener la
        seguridad y atender solicitudes de soporte.
      </p>
    </Section>
    <Section title="Base jurídica">
      <p>
        La gestión de la cuenta y de las reservas es necesaria para prestar el
        servicio solicitado. Los formularios de contacto se tramitan con el
        consentimiento de quien los envía. Las obligaciones legales y la
        defensa frente a reclamaciones pueden exigir conservar determinados
        datos durante los plazos aplicables.
      </p>
    </Section>
    <Section title="Proveedores y destinatarios">
      <p>
        Supabase presta autenticación, base de datos y almacenamiento.
        Web3Forms recibe los datos enviados voluntariamente mediante contacto o
        feedback. Stripe procesa los datos de pago en su página segura; Fantasy
        Experience conserva únicamente referencias técnicas, importe, moneda y
        estado para conciliar la reserva, nunca los datos completos de la
        tarjeta. El proveedor de alojamiento procesa los datos técnicos
        imprescindibles para servir la web. Deben revisarse sus ubicaciones y
        garantías contractuales antes del lanzamiento.
      </p>
    </Section>
    <Section title="Conservación y derechos">
      <p>
        Los datos de cuenta se conservan mientras la cuenta siga activa y,
        después, sólo durante los plazos necesarios para atender obligaciones
        o reclamaciones. Puedes solicitar acceso, rectificación, supresión,
        portabilidad, limitación u oposición escribiendo a
        {` ${publicConfig.legalEmail}`}. También puedes reclamar ante la Agencia
        Española de Protección de Datos.
      </p>
    </Section>
  </>
);

const CookiePolicy = () => (
  <>
    <Section title="Tecnologías utilizadas">
      <p>
        La aplicación conserva localmente la sesión de Supabase para mantener
        al usuario autenticado. Actualmente no integra cookies publicitarias ni
        analítica de comportamiento.
      </p>
      <p>
        Las fuentes de Google y los vídeos incrustados en modo de privacidad
        mejorada pueden generar conexiones técnicas con esos proveedores. Los
        formularios sólo envían información a Web3Forms cuando el usuario los
        remite expresamente.
      </p>
    </Section>
    <Section title="Cambios futuros">
      <p>
        Si se incorporan tecnologías no esenciales, se actualizará esta
        política y se solicitará el consentimiento antes de activarlas.
      </p>
    </Section>
  </>
);

const Terms = () => (
  <>
    <Section title="Objeto del servicio">
      <p>
        Fantasy Experience conecta jugadores y Másters, permite publicar
        partidas, reservar plazas, cobrar reservas mediante Stripe y valorar
        sesiones completadas. El precio total y la moneda se muestran antes de
        abandonar la web para completar el pago.
      </p>
    </Section>
    <Section title="Cuentas y contenido">
      <p>
        Cada usuario es responsable de aportar información veraz, proteger sus
        credenciales y publicar únicamente contenido sobre el que tenga
        derechos. No se permite suplantar identidades, acosar, discriminar,
        defraudar ni utilizar el servicio con fines ilícitos.
      </p>
    </Section>
    <Section title="Reservas y cancelaciones">
      <p>
        En partidas gratuitas, la reserva se confirma al apuntarse. En partidas
        de pago, la plaza se mantiene temporalmente durante el Checkout y sólo
        queda confirmada cuando Stripe notifica el cobro al servidor. Cancelar
        una partida provoca la devolución de las reservas cobradas al método de
        pago original; el plazo de abono efectivo depende de la entidad de pago.
        Para cancelar una reserva individual ya pagada debe contactarse con
        soporte, que aplicará la política de desistimiento y cancelación vigente
        antes de la fecha de la sesión. Las partes deben respetar la edad mínima
        y las condiciones claramente anunciadas.
      </p>
    </Section>
    <Section title="Moderación y disponibilidad">
      <p>
        Fantasy Experience puede retirar contenido o suspender cuentas que
        comprometan la seguridad o incumplan estas condiciones. No se garantiza
        disponibilidad ininterrumpida, aunque se aplicarán medidas razonables
        para mantener el servicio y proteger los datos.
      </p>
    </Section>
  </>
);

const LegalNotice = () => (
  <>
    <Section title="Titular del sitio">
      <p>Nombre o razón social: {publicConfig.legalOwner}</p>
      <p>NIF/CIF: {publicConfig.legalTaxId}</p>
      <p>Domicilio: {publicConfig.legalAddress}</p>
      <p>Correo electrónico: {publicConfig.legalEmail}</p>
    </Section>
    <Section title="Propiedad intelectual y responsabilidad">
      <p>
        El código, marca y contenidos propios están protegidos por la normativa
        aplicable. Los usuarios conservan la responsabilidad sobre el contenido
        que publican y sobre los servicios de dirección de partidas que ofrecen.
      </p>
    </Section>
  </>
);

const Legal = () => {
  const { pathname } = useLocation();
  const pendingLegalData = [
    publicConfig.legalOwner,
    publicConfig.legalTaxId,
    publicConfig.legalAddress,
  ].some((value) => value.includes("PENDIENTE"));

  const content =
    pathname === "/privacidad" ? (
      { title: "Política de privacidad", body: <PrivacyPolicy /> }
    ) : pathname === "/cookies" ? (
      { title: "Política de cookies", body: <CookiePolicy /> }
    ) : pathname === "/terminos" ? (
      { title: "Términos de uso", body: <Terms /> }
    ) : (
      { title: "Aviso legal", body: <LegalNotice /> }
    );

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-left font-titulo-2">
      <article className="max-w-4xl mx-auto flex flex-col gap-10">
        <header>
          <h1 className="text-4xl text-dark-gold font-bold">{content.title}</h1>
          <p className="text-nude mt-3">Última actualización: 30/08/2026</p>
        </header>
        {pendingLegalData && (
          <aside className="border border-red-500 rounded-lg p-4 text-red-300">
            Documento provisional: completa las variables VITE_LEGAL_* y
            solicita revisión profesional antes del lanzamiento comercial.
          </aside>
        )}
        {content.body}
      </article>
    </main>
  );
};

export default Legal;
