import {
  FunctionComponent,
  memo,
  useMemo,
  useCallback,
  type CSSProperties,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

export type CardDigitalType = {
  className?: string;
  star1?: string;

  /** Style props */
  propBackgroundImage?: CSSProperties["backgroundImage"];
};

const CardDigital: FunctionComponent<CardDigitalType> = memo(
  ({ className = "", propBackgroundImage, star1 }) => {
    const frameDiv1Style: CSSProperties = useMemo(() => {
      return {
        backgroundImage: propBackgroundImage,
      };
    }, [propBackgroundImage]);

    const navigate = useNavigate(); // Hook para redireccionar

    const onSlide1ContainerClick = useCallback(() => {
      navigate("/nextgames");
    }, [navigate]);
    return (
      <div
        className={`w-[360px] cursor-pointer shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-darkslategray shrink-0 flex flex-col items-start justify-start pt-0 px-0 pb-[15px] box-border gap-3.5 max-w-full text-center text-base text-oldlace-100 font-titulo-2 ${className}`}
        onDoubleClick={onSlide1ContainerClick}
      >
        <div className="self-stretch h-[480px] relative shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl bg-darkslategray hidden" />
        <div
          className="self-stretch rounded-t-xl rounded-b-none flex flex-row items-start justify-end pt-[7px] px-6 pb-[133px] box-border bg-cover bg-no-repeat bg-[top] max-w-full z-[1] text-black"
          style={frameDiv1Style}
        >
          <div className="h-[100px] w-[100px] flex flex-row items-start justify-start relative gap-2.5 z-[2]">
            <img
              className="h-[120px] w-[120px] absolute !m-[0] right-[-20px] bottom-[-20px] rounded-lg"
              alt=""
              src={star1}
            />
            <div className="h-[42px] w-[86.8px] absolute !m-[0] right-[3.2px] bottom-[4.24px] [text-decoration:underline] font-extrabold flex items-center justify-center [transform:_rotate(-20.1deg)] [transform-origin:0_0] z-[1]">
              Digital
            </div>
          </div>
        </div>
        <div className="self-stretch flex flex-col items-start justify-start pt-0 px-0 pb-[21px] relative gap-px text-13xl">
          <h2 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] text-goldenrod z-[1] mq1050:text-7xl mq1050:leading-[19px] mq450:text-lgi mq450:leading-[14px]">
            Partida Título
          </h2>
          <b className="self-stretch relative text-xl z-[1] mq450:text-base">
            Master name
          </b>
          <div className="self-stretch relative text-lg leading-[20px] z-[1]">
            Sistema de partida
          </div>
          <img
            className="w-[30px] h-[30px] absolute !m-[0] bottom-[-14px] left-[85px] rounded-12xs z-[1]"
            alt=""
            src="/rating-star.svg"
          />
          <img
            className="w-[30px] h-[30px] absolute !m-[0] bottom-[-14px] left-[124.8px] rounded-12xs z-[1]"
            alt=""
            src="/rating-star.svg"
          />
          <img
            className="w-[30px] h-[30px] absolute !m-[0] bottom-[-14px] left-[164.5px] rounded-12xs z-[1]"
            alt=""
            src="/rating-star-empty.svg"
          />
          <img
            className="w-[30px] h-[30px] absolute !m-[0] right-[125.7px] bottom-[-14px] rounded-12xs z-[1]"
            alt=""
            src="/rating-star-empty.svg"
          />
          <img
            className="w-[30px] h-[30px] absolute !m-[0] right-[86px] bottom-[-14px] rounded-12xs z-[2]"
            alt=""
            src="/rating-star-empty.svg"
          />
        </div>
        <div className="self-stretch flex flex-row items-start justify-start py-0 px-2.5 box-border max-w-full">
          <div className="flex-1 flex flex-col items-start justify-start gap-[9px] max-w-full">
            <div className="self-stretch relative leading-[24px] font-light [display:-webkit-inline-box] items-center justify-center overflow-hidden text-ellipsis [-webkit-line-clamp:2] [-webkit-box-orient:vertical] z-[1]">
              Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
              consectetur, adipisci velit, sed quia non numquam eius modi
              tempora incidunt ut labore et dolore magnam aliquam quaerat
              voluptatem.
            </div>
            <div className="self-stretch flex flex-row items-start justify-start py-0 px-2.5 text-lg text-black1">
              <div className="flex-1 rounded-xl bg-oldlace-100 flex flex-row items-start justify-start z-[1]">
                <div className="h-[30px] w-80 relative rounded-xl bg-oldlace-100 hidden" />
                <b className="flex-1 relative inline-block max-w-full z-[2]">
                  Ver más detalles
                </b>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default CardDigital;
