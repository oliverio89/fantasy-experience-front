import { FunctionComponent, memo } from "react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate

export type SocialContainerType = {
  className?: string;
};

const Footer: FunctionComponent<SocialContainerType> = memo(
  ({ className = "" }) => {
    const navigate = useNavigate(); // Hook para redirigir

    // Funciones para manejar las redirecciones
    const onNuestrosMastersClick = () => {
      navigate("/ourmasters"); // Redirige a /masters
    };

    const onPartidasClick = () => {
      navigate("/nextgames"); // Redirige a /nextgames
    };

    const onContactoClick = () => {
      navigate("/contacto"); // Redirige a /contacto
    };

    return (
      <footer
        className={`self-stretch h-80 bg-black shrink-0 flex flex-row items-end justify-between pt-[50px] pb-[94px] pl-[186px] pr-[171px] box-border max-w-full gap-5 text-center text-5xl text-oldlace-100 font-titulo-2 mq750:pl-[93px] mq750:pr-[85px] mq750:box-border mq1050:flex-wrap mq450:pl-5 mq450:pr-5 mq450:box-border ${className}`}
      >
        <div className="h-80 w-[1280px] relative bg-black hidden max-w-full" />
        <div className="h-[141px] w-[250px] flex flex-col items-start justify-end pt-0 px-0 pb-[34px] box-border">
          <div className="self-stretch flex-1 flex flex-col items-end justify-start gap-px">
            <div className="self-stretch relative font-medium z-[1] mq450:text-lgi">
              Síguenos en redes sociales
            </div>
            <div className="self-stretch flex flex-row items-start justify-end py-0 pl-[77px] pr-[75px]">
              <div className="flex-1 flex flex-row items-start justify-between gap-5">
                <img
                  className="h-[30px] w-[30px] relative z-[1] cursor-pointer"
                  loading="lazy"
                  alt="Instagram"
                  src="/instagram.svg"
                  onClick={() => window.open('https://www.instagram.com', '_blank')} // Abre Instagram en una nueva pestaña
                />
                <div className="flex flex-col items-start justify-start pt-[1.5px] px-0 pb-0">
                  <img
                    className="w-[33px] h-[26.9px] relative z-[1] cursor-pointer"
                    loading="lazy"
                    alt="Twitter"
                    src="/twitter.svg"
                    onClick={() => window.open('https://www.twitter.com', '_blank')} // Abre Twitter en una nueva pestaña
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Sección de navegación */}
        <div className="self-stretch w-[236px] flex flex-col items-start justify-start py-0 pl-0 pr-[30px] box-border">
          <div className="self-stretch relative font-medium z-[1] mq450:text-lgi">
            <p className="m-0 cursor-pointer" onClick={onNuestrosMastersClick}>Nuestros másters</p>
            <p className="m-0">&nbsp;</p>
            <p className="m-0 cursor-pointer" onClick={onPartidasClick}>Partidas</p>
            <p className="m-0">&nbsp;</p>
            <p className="m-0 cursor-pointer" onClick={onContactoClick}>Contacto</p>
          </div>
        </div>
        
        <div className="h-[127px] w-[177px] flex flex-col items-start justify-start text-13xl text-dark-gold font-milonga">
          <h2 className="m-0 self-stretch relative text-inherit leading-[76.6%] font-normal font-[inherit] [display:-webkit-inline-box] items-center overflow-hidden text-ellipsis [-webkit-line-clamp:3] [-webkit-box-orient:vertical] z-[1] mq1050:text-7xl mq1050:leading-[20px] mq450:text-lgi mq450:leading-[15px] cursor-pointer">
            <span className="[line-break:anywhere]">
              <p className="m-1" onClick={() => navigate("/")}>Fantasy</p>
              <p className="m-1" onClick={() => navigate("/")}>Experience</p>
            </span>
          </h2>
        </div>
      </footer>
    );
  }
);

export default Footer;
