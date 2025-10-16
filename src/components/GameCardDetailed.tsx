import {
  FunctionComponent,
  memo,
  useMemo,
  type CSSProperties,
} from "react";
import Button from "./button";

export type GameCardDetailedType = {
  className?: string;
  imageUrl?: string;
  badgeIcon?: string;
  badgeText?: string;
  title?: string;
  masterName?: string;
  gameSystem?: string;
  date?: string;
  description?: string;
  buttonText?: string;
  onClick?: () => void;
  backgroundColor?: string;
  showDescription?: boolean;

  /** Style props */
  propBackgroundImage?: CSSProperties["backgroundImage"];
};

const GameCardDetailed: FunctionComponent<GameCardDetailedType> = memo(
  ({
    className = "",
    imageUrl,
    badgeIcon,
    badgeText = "Presencial",
    title = "Partida Título",
    masterName = "Master name",
    gameSystem = "Sistema de partida",
    date = "Fecha",
    description,
    buttonText = "Ver detalles",
    onClick,
    backgroundColor = "#f2ecdd",
    showDescription = false,
    propBackgroundImage,
  }) => {
    const cardStyle: CSSProperties = useMemo(() => {
      return {
        backgroundColor: backgroundColor,
      };
    }, [backgroundColor]);

    const headerStyle: CSSProperties = useMemo(() => {
      return {
        backgroundImage: propBackgroundImage || (imageUrl ? `url('${imageUrl}')` : undefined),
      };
    }, [propBackgroundImage, imageUrl]);

    return (
      <div
        className={`w-[360px] shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl flex flex-col items-start justify-start pt-0 px-0 pb-[15px] box-border gap-3.5 min-w-[342px] max-w-full cursor-pointer text-center text-base text-black font-texto ${className}`}
        style={cardStyle}
        onClick={onClick}
      >
        <div className="self-stretch h-[480px] relative shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl hidden" style={cardStyle} />
        
        {/* Header with image and badge */}
        <div
          className="self-stretch rounded-t-xl rounded-b-none flex flex-row items-start justify-end pt-[7px] px-6 pb-[133px] box-border bg-cover bg-no-repeat bg-[top] max-w-full z-[1]"
          style={headerStyle}
        >
          <img
            className="h-60 w-[360px] relative rounded-t-xl rounded-b-none object-cover hidden max-w-full"
            alt=""
            src={imageUrl}
          />
          <div className="h-[100px] w-[100px] shadow-[0px_2px_2px_rgba(0,_0,_0,_0.25)] flex flex-col items-start justify-start relative gap-2.5 z-[2]">
            <img
              className="w-[120px] h-[120px] absolute !m-[0] right-[-20px] bottom-[-20px] rounded-lg"
              loading="lazy"
              alt=""
              src={badgeIcon}
            />
            <div className="w-[86.8px] h-[42px] absolute !m-[0] right-[3.2px] bottom-[4.24px] [text-decoration:underline] font-extrabold flex items-center justify-center [transform:_rotate(-20.1deg)] [transform-origin:0_0] z-[1]">
              {badgeText}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="self-stretch flex flex-col items-start justify-start max-w-full text-lg text-darkslategray">
          <h2 className="m-0 self-stretch relative text-11xl font-extrabold font-[inherit] text-black1 z-[1] mq450:text-lg mq450:leading-[14px] mq1000:text-5xl mq1000:leading-[19px]">
            {title}
          </h2>
          <div className="self-stretch flex flex-col items-start justify-start pt-0 px-0 pb-[3px] text-xl">
            <b className="self-stretch relative z-[1] mq450:text-base">
              {masterName}
            </b>
            <div className="self-stretch relative text-lg leading-[20px] z-[1]">
              {gameSystem}
            </div>
          </div>
          {date && (
            <div className="self-stretch relative leading-[20px] z-[1]">
              {date}
            </div>
          )}
          
          {/* Description (optional) */}
          {showDescription && description && (
            <div className="self-stretch flex flex-row items-start justify-start pt-0 px-2.5 pb-[9px] box-border max-w-full text-black">
              <div className="flex-1 relative leading-[25px] font-light [display:-webkit-inline-box] items-center justify-center overflow-hidden text-ellipsis [-webkit-line-clamp:2] [-webkit-box-orient:vertical] max-w-full z-[1]">
                {description}
              </div>
            </div>
          )}
          
          {/* Button */}
          <div className="flex flex-row items-start justify-start py-0 px-5">
            <Button
              button1={buttonText}
              button1Padding="4px 117.5px"
              button1Height="30px"
              button1Width="320px"
              button1Height1="22px"
              button1Width1="86px"
              button1FontSize="18px"
              button1BackgroundColor="#f2ecdd"
              button1Border="none"
              button1TextDecoration="unset"
              button1FontWeight="unset"
            />
          </div>
        </div>
      </div>
    );
  }
);

export default GameCardDetailed;

