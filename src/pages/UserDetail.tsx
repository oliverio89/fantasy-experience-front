import { FunctionComponent, memo, useCallback } from "react";
import LoginCredentials from "../components/login-credentials";
import Button from "../components/button";
import GroupComponent from "../components/group-component";

export type RootType = {
  className?: string;
};

const Root: FunctionComponent<RootType> = memo(({ className = "" }) => {
  const onMatchSeparatorClick = useCallback(() => {
    // Please sync "Partidas v1.2" to the project
  }, []);

  return (
    <div
      className={`w-[1120px] max-w-full flex flex-col items-start justify-start gap-[41px] leading-[normal] tracking-[normal] mq700:gap-5 ${className}`}
    >
      <section className="self-stretch rounded-xl bg-darkslategray flex flex-col items-end justify-start pt-[50px] px-[94px] pb-[39px] box-border gap-[79px] max-w-full text-left text-xl text-white font-titulo-2 mq450:gap-5 mq450:pl-5 mq450:pr-5 mq450:box-border mq700:gap-[39px] mq700:pl-[47px] mq700:pr-[47px] mq700:box-border mq925:pt-8 mq925:pb-[25px] mq925:box-border">
        <div className="w-[1120px] h-[754px] relative rounded-xl bg-darkslategray hidden max-w-full" />
        <div className="self-stretch flex flex-row items-start justify-end py-0 px-[3px] box-border max-w-full">
          <div className="flex-1 flex flex-col items-end justify-start gap-[85px] max-w-full mq450:gap-[21px] mq925:gap-[42px]">
            <div className="self-stretch flex flex-row items-start justify-end py-0 pl-[339px] pr-[337px] mq450:pl-[84px] mq450:pr-[84px] mq450:box-border mq925:pl-[169px] mq925:pr-[168px] mq925:box-border">
              <div className="w-[250px] rounded-181xl flex flex-row items-start justify-end pt-[190px] px-[11px] pb-0 box-border bg-[url('/public/login-number@3x.png')] bg-cover bg-no-repeat bg-[top] z-[1]">
                <img
                  className="h-[250px] w-[250px] relative rounded-181xl object-cover hidden"
                  alt=""
                  src="/konradkollerlctjo2d9-2cunsplash-2@2x.png"
                />
                <img
                  className="h-[60px] w-[60px] relative rounded-31xl overflow-hidden shrink-0 z-[2]"
                  loading="lazy"
                  alt=""
                  src="/edit2.svg"
                />
              </div>
            </div>
            <div className="self-stretch flex flex-row items-start justify-start gap-10 max-w-full mq450:gap-5 mq925:flex-wrap">
              <div className="flex-1 flex flex-col items-start justify-start gap-[85px] min-w-[288px] max-w-full mq450:gap-[42px]">
                <LoginCredentials
                  nombreDeUsuario="Nombre de usuario"
                  johnPlaceholder="John"
                />
                <LoginCredentials
                  nombreDeUsuario="Contraseña"
                  johnPlaceholder="*************"
                  propPadding="unset"
                />
              </div>
              <div className="flex-1 flex flex-col items-start justify-start gap-28 min-w-[288px] max-w-full mq450:gap-14">
                <LoginCredentials
                  nombreDeUsuario="Correo Electrónico"
                  johnPlaceholder="John@mail.com"
                  propPadding="0"
                />
                <div className="self-stretch relative [text-decoration:underline] font-medium z-[1] mq450:text-base">
                  Cambiar contraseña
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row items-start justify-start gap-[42px] max-w-full mq450:gap-[21px] mq700:flex-wrap">
          <Button
            button1="Editar perfil"
            button1Padding="10px 81.5px"
            button1Height="42px"
            button1Width="250px"
            button1Height1="22px"
            button1Width1="88px"
            button1FontSize="18px"
            button1BackgroundColor="#cd9c20"
          />
          <button className="cursor-pointer border-dark-gold border-[1px] border-solid py-2 px-11 bg-[transparent] h-[42px] rounded-31xl box-border overflow-hidden flex flex-row items-start justify-start z-[1] hover:bg-darkgoldenrod-200 hover:border-darkgoldenrod-100 hover:border-[1px] hover:border-solid hover:box-border">
            <b className="flex-1 relative text-lg inline-block font-titulo-2 text-dark-gold text-center min-w-[64px]">
              Cancelar
            </b>
          </button>
        </div>
      </section>
      <section className="self-stretch h-[536px] relative max-w-full text-center text-15xl text-nude font-titulo-2">
        <div
          className="absolute top-[0px] left-[0px] rounded-xl bg-darkslategray w-full h-full cursor-pointer"
          onClick={onMatchSeparatorClick}
        />
        <h2 className="m-0 absolute top-[24px] left-[0px] text-inherit font-bold font-[inherit] flex items-center justify-center w-[1121px] h-[42px] z-[1] mq450:text-xl mq925:text-8xl">
          Próximas partidas
        </h2>
        <GroupComponent
          cedericVandenbergheDPhytVHw="/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png"
          matchImportance="/star-1.svg"
          button1="Ver detalles"
          button1Padding="6px 117.5px 6.1px"
          button1Height="34.1px"
          button1Width="320px"
          button1Height1="22px"
          button1Width1="86px"
          button1FontSize="18px"
          button1BackgroundColor="#f2ecdd"
        />
        <div
          className="absolute top-[93px] left-[36px] w-[340px] flex flex-row items-start justify-start max-w-full cursor-pointer z-[1] text-base text-black"
          onClick={onMatchSeparatorClick}
        >
          <div className="flex-1 shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-light-gold flex flex-col items-start justify-start pt-0 px-0 pb-[18.2px] box-border gap-[18.9px] max-w-full">
            <div className="self-stretch h-[413px] relative shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-light-gold hidden" />
            <div className="self-stretch rounded-t-xl rounded-b-none flex flex-row items-start justify-end pt-1.5 px-[22px] pb-[97.1px] box-border bg-[url('/public/frame-2@3x.png')] bg-cover bg-no-repeat bg-[top] max-w-full z-[1]">
              <img
                className="h-[189.1px] w-[340px] relative rounded-t-xl rounded-b-none object-cover hidden max-w-full"
                alt=""
                src="/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png"
              />
              <div className="h-[86px] w-[94.4px] shadow-[0px_2px_2px_rgba(0,_0,_0,_0.25)] flex flex-col items-start justify-start relative gap-2.5 z-[2]">
                <img
                  className="w-[120px] h-[120px] absolute !m-[0] right-[-25.6px] bottom-[-34px] rounded-lg"
                  loading="lazy"
                  alt=""
                  src="/star-1-1.svg"
                />
                <div className="w-[86.8px] h-[42px] absolute !m-[0] right-[-2.4px] bottom-[-9.76px] [text-decoration:underline] font-extrabold flex items-center justify-center [transform:_rotate(-20.1deg)] [transform-origin:0_0] z-[1]">
                  Presencial
                </div>
              </div>
            </div>
            <div className="self-stretch flex flex-col items-start justify-start pt-0 px-0 pb-[27.7px] box-border gap-[6.9px] max-w-full text-11xl text-black1">
              <h2 className="m-0 self-stretch h-[20.6px] relative text-inherit font-extrabold font-[inherit] flex items-center justify-center shrink-0 z-[1] mq450:text-lg mq925:text-5xl">
                Partida Título
              </h2>
              <div className="self-stretch flex flex-col items-start justify-start gap-[3.3px] max-w-full text-lg text-darkslategray">
                <b className="self-stretch relative text-xl z-[1] mq450:text-base">
                  Master name
                </b>
                <div className="self-stretch flex flex-row items-start justify-start pt-0 px-0 pb-[6.8px] box-border max-w-full">
                  <div className="flex-1 relative leading-[20px] inline-block max-w-full z-[1]">
                    Sistema de partida
                  </div>
                </div>
                <div className="self-stretch relative leading-[20px] z-[1]">
                  Fecha
                </div>
              </div>
            </div>
            <div className="flex flex-row items-start justify-start py-0 pl-2 pr-3">
              <Button
                button1="Ver detalles"
                button1Padding="6px 117.5px 6.1px"
                button1Height="34.1px"
                button1Width="320px"
                button1Height1="22px"
                button1Width1="86px"
                button1FontSize="18px"
                button1BackgroundColor="#f2ecdd"
              />
            </div>
          </div>
        </div>
        <GroupComponent
          cedericVandenbergheDPhytVHw="/cedericvandenberghe21dp3hytvhwunsplash-1@2x.png"
          matchImportance="/star-1-2.svg"
          propLeft="746px"
          propBackgroundImage="url('/frame-3@3x.png')"
          button1="Ver detalles"
          button1Padding="6px 117.5px 6.1px"
          button1Height="34.1px"
          button1Width="320px"
          button1Height1="22px"
          button1Width1="86px"
          button1FontSize="18px"
          button1BackgroundColor="#f2ecdd"
        />
      </section>
    </div>
  );
});

export default Root;
