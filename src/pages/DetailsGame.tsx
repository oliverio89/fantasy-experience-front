import { FunctionComponent, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PartidaDetails from "../components/GameDetails";
import Button from "../components/button";
import Footer from "../components/Footer";

const PartidasDetallesV: FunctionComponent = () => {
  const navigate = useNavigate();
  const { partidaId } = useParams<{ partidaId?: string }>();

  const onInitTextClick = useCallback(() => {
    navigate("/home-v12");
  }, [navigate]);

  return (
    <div className="w-full relative bg-white overflow-hidden flex flex-col items-start justify-start leading-[normal] tracking-[normal]">
      <main className="self-stretch bg-black flex flex-col items-end justify-start pt-[5.187rem] px-[4.875rem] pb-[5.312rem] box-border gap-[3.125rem] max-w-full lg:pt-[3.375rem] lg:pb-[3.438rem] lg:box-border mq750:gap-[1.563rem] mq750:pt-[2.188rem] mq750:px-[2.438rem] mq750:pb-[2.25rem] mq750:box-border">
        <div className="w-[80rem] h-[79.938rem] relative bg-black hidden max-w-full" />
        <section className="self-stretch flex flex-col items-start justify-start gap-[2.062rem] max-w-full mq750:gap-[1rem]">
          <PartidaDetails />
        </section>
        <Button
          button1Padding="1.187rem 5.156rem"
          button1Height="4.5rem"
          button1Width="21.813rem"
          button1="Comprar partida"
          button1Height1="2.125rem"
          button1Width1="11.563rem"
          button1FontSize="1.75rem"
        />
      </main>
      <Footer />
    </div>
  );
};

export default PartidasDetallesV;
