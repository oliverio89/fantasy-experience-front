import { FunctionComponent, memo, useMemo, type CSSProperties } from "react";

export type FrameComponent5Type = {
  className?: string;
  cedericVandenbergheDPhytVHw?: string;
  star1?: string;
  digital?: string;

  /** Style props */
  propBackgroundImage?: CSSProperties["backgroundImage"];
};

const FrameComponent5: FunctionComponent<FrameComponent5Type> = memo(
  ({
    className = "",
    cedericVandenbergheDPhytVHw,
    star1,
    digital,
    propBackgroundImage,
  }) => {
    const frameDiv1Style: CSSProperties = useMemo(() => {
      return {
        backgroundImage: propBackgroundImage,
      };
    }, [propBackgroundImage]);

    return (
      <div
        className={`self-stretch rounded-t-xl rounded-b-none flex flex-row items-start justify-end pt-[7px] px-6 pb-[133px] box-border bg-[url('/public/frame-5@3x.png')] bg-cover bg-no-repeat bg-[top] max-w-full z-[1] text-center text-base text-black font-texto ${className}`}
        style={frameDiv1Style}
      >
        <img
          className="h-60 w-[360px] relative rounded-t-xl rounded-b-none object-cover hidden max-w-full"
          alt=""
          src={cedericVandenbergheDPhytVHw}
        />
        <div className="h-[100px] w-[100px] shadow-[0px_2px_2px_rgba(0,_0,_0,_0.25)] flex flex-col items-start justify-start relative gap-2.5 z-[2]">
          <img
            className="w-[120px] h-[120px] absolute !m-[0] right-[-20px] bottom-[-20px] rounded-lg"
            loading="lazy"
            alt=""
            src={star1}
          />
          <div className="w-[86.8px] h-[42px] absolute !m-[0] right-[3.2px] bottom-[4.24px] [text-decoration:underline] font-extrabold flex items-center justify-center [transform:_rotate(-20.1deg)] [transform-origin:0_0] z-[1]">
            {digital}
          </div>
        </div>
      </div>
    );
  }
);

export default FrameComponent5;
