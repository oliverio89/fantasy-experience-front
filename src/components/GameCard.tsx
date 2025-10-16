import {
  FunctionComponent,
  memo,
  useMemo,
  type CSSProperties,
} from "react";
import Button from "./button";

export type GameCardVariant = "simple" | "absolute" | "flex" | "detailed";

export type GameCardProps = {
  className?: string;
  variant?: GameCardVariant;
  
  // Content props
  imageUrl?: string;
  badgeIcon?: string;
  badgeText?: string;
  title?: string;
  masterName?: string;
  gameSystem?: string;
  date?: string;
  description?: string;
  
  // Button props
  buttonText?: string;
  useButtonComponent?: boolean;
  button1Padding?: string;
  button1Height?: string;
  button1Width?: string;
  button1Height1?: string;
  button1Width1?: string;
  button1FontSize?: string;
  button1BackgroundColor?: string;
  
  // Style props
  backgroundColor?: string;
  propBackgroundImage?: CSSProperties["backgroundImage"];
  propLeft?: CSSProperties["left"];
  propMinWidth?: CSSProperties["minWidth"];
  
  // Feature flags
  showDescription?: boolean;
  showButton?: boolean;
  
  // Events
  onClick?: () => void;
  onDoubleClick?: () => void;
};

const GameCard: FunctionComponent<GameCardProps> = memo(
  ({
    className = "",
    variant = "detailed",
    
    // Content
    imageUrl,
    badgeIcon = "/star-1.svg",
    badgeText = "Presencial",
    title = "Partida Título",
    masterName = "Master name",
    gameSystem = "Sistema de partida",
    date = "Fecha",
    description = "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
    
    // Button
    buttonText = "Ver detalles",
    useButtonComponent = true,
    button1Padding = "4px 117.5px",
    button1Height = "30px",
    button1Width = "320px",
    button1Height1 = "22px",
    button1Width1 = "86px",
    button1FontSize = "18px",
    button1BackgroundColor = "#f2ecdd",
    
    // Styles
    backgroundColor = "#f2ecdd",
    propBackgroundImage,
    propLeft,
    propMinWidth,
    
    // Features
    showDescription = false,
    showButton = true,
    
    // Events
    onClick,
    onDoubleClick,
  }) => {
    // Determine container classes based on variant
    const containerClass = useMemo(() => {
      switch (variant) {
        case "simple":
          return "w-[360px] shrink-0 flex flex-col items-start justify-start min-h-[480px] max-w-full";
        case "absolute":
          return "absolute top-[93px] left-[391px] w-[340px] flex flex-row items-start justify-start max-w-full";
        case "flex":
          return "flex-1 shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl flex flex-col items-start justify-start pt-0 px-0 pb-[18.2px] box-border gap-[18.9px] max-w-full";
        case "detailed":
        default:
          return "w-[360px] shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl flex flex-col items-start justify-start pt-0 px-0 pb-[15px] box-border gap-3.5 min-w-[342px] max-w-full";
      }
    }, [variant]);

    const containerStyle: CSSProperties = useMemo(() => {
      const style: CSSProperties = {};
      if (variant === "absolute" && propLeft) style.left = propLeft;
      if (variant === "flex" && propMinWidth) style.minWidth = propMinWidth;
      return style;
    }, [variant, propLeft, propMinWidth]);

    const cardStyle: CSSProperties = useMemo(() => {
      return {
        backgroundColor: variant === "simple" ? "#DAB16A" : backgroundColor,
      };
    }, [backgroundColor, variant]);

    const headerStyle: CSSProperties = useMemo(() => {
      return {
        backgroundImage: propBackgroundImage || (imageUrl ? `url('${imageUrl}')` : undefined),
      };
    }, [propBackgroundImage, imageUrl]);

    // Inner card wrapper (needed for absolute and flex variants)
    const needsInnerWrapper = variant === "absolute" || variant === "flex";
    
    // Padding settings based on variant
    const cardPadding = variant === "flex" || variant === "absolute" ? "pb-[18.2px]" : variant === "simple" ? "pb-[54px]" : "pb-[15px]";
    const headerPadding = variant === "flex" || variant === "absolute" ? "pt-1.5 px-[21px] pb-[97.1px]" : "pt-[7px] px-6 pb-[133px]";

    const renderContent = () => (
      <>
        {/* Header with image and badge */}
        <div
          className={`self-stretch rounded-t-xl rounded-b-none flex flex-row items-start justify-end ${headerPadding} box-border bg-cover bg-no-repeat bg-[top] max-w-full z-[1]`}
          style={headerStyle}
        >
          <img
            className="h-60 w-full relative rounded-t-xl rounded-b-none object-cover max-w-full"
            alt=""
            src={imageUrl}
          />
          <div className="relative z-[2]">
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

        {/* Content section */}
        <div className={`self-stretch flex flex-col items-start justify-start ${variant === "flex" || variant === "absolute" ? "gap-[46.6px]" : "gap-2"} max-w-full text-lg text-darkslategray ${variant === "flex" ? "mq450:gap-[23px]" : ""}`}>
          <div className={`self-stretch flex flex-col items-start justify-start ${variant === "flex" || variant === "absolute" ? "gap-[6.8px]" : "gap-px"}`}>
            <h2 className={`m-0 self-stretch relative ${variant === "simple" ? "text-13xl" : "text-11xl"} font-${variant === "simple" ? "bold" : "extrabold"} font-[inherit] text-black1 z-[1] mq450:text-lg mq450:leading-[14px] ${variant === "simple" ? "mq1050:text-7xl mq1050:leading-[19px]" : "mq1000:text-5xl mq1000:leading-[19px]"}`}>
              {title}
            </h2>
            
            <div className={`self-stretch flex flex-col items-start justify-start ${variant === "detailed" ? "pt-0 px-0 pb-[3px]" : ""} text-xl`}>
              <b className="self-stretch relative z-[1] mq450:text-base">
                {masterName}
              </b>
              <div className={`self-stretch ${variant === "flex" || variant === "absolute" ? "flex flex-col items-start justify-start gap-[10.1px]" : ""} text-lg`}>
                <div className="self-stretch relative leading-[20px] z-[1]">
                  {gameSystem}
                </div>
                {date && (
                  <div className="self-stretch relative leading-[20px] z-[1]">
                    {date}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Description (optional) */}
          {showDescription && description && (
            <div className="self-stretch flex flex-row items-start justify-start pt-0 px-2.5 pb-[9px] box-border max-w-full text-base text-black">
              <div className="flex-1 relative leading-[24px] font-light [display:-webkit-inline-box] items-center justify-center overflow-hidden text-ellipsis [-webkit-line-clamp:2] [-webkit-box-orient:vertical] max-w-full z-[1]">
                {description}
              </div>
            </div>
          )}
          
          {/* Button */}
          {showButton && (
            <div className={`${variant === "simple" ? "self-stretch" : ""} flex flex-row items-start justify-start py-0 ${variant === "simple" ? "pl-4 pr-6 mt-[-45px]" : variant === "flex" ? "pl-[7px] pr-[11px]" : variant === "absolute" ? "pl-2 pr-3" : "px-5"}`}>
              <Button className="w-[320px]" />
            </div>
          )}
        </div>
      </>
    );

    // Render based on variant
    if (variant === "absolute" || variant === "flex") {
      return (
        <div
          className={`${containerClass} cursor-pointer z-[1] text-center text-base text-black font-titulo-2 ${className}`}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          style={containerStyle}
        >
          <div className={`${variant === "flex" ? "flex-1" : ""} shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl flex flex-col items-start justify-start pt-0 px-0 ${cardPadding} box-border gap-[18.9px] max-w-full`} style={cardStyle}>
            <div className={`self-stretch h-[413px] relative shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl hidden`} style={cardStyle} />
            {renderContent()}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`${containerClass} cursor-pointer text-center text-base text-black font-titulo-2 ${className}`}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        style={containerStyle}
      >
        <div className={`self-stretch shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl flex flex-col items-start justify-start pt-0 px-0 ${cardPadding} box-border ${variant === "detailed" ? "gap-3.5" : "gap-2"} max-w-full ${variant === "simple" ? "mq750:pb-[35px] mq750:box-border" : ""}`} style={cardStyle}>
          <div className={`self-stretch ${variant === "simple" ? "h-[280px]" : "h-[480px]"} relative shadow-[0px_6px_10px_4px_rgba(0,_0,_0,_0.15),_0px_2px_3px_rgba(0,_0,_0,_0.3)] rounded-xl hidden`} style={cardStyle} />
          {renderContent()}
        </div>
      </div>
    );
  }
);

export default GameCard;

