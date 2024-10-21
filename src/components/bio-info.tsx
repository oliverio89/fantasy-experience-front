import { FunctionComponent, memo, useMemo, type CSSProperties } from "react";

export type BioInfoType = {
  className?: string;
  bio?: string;
  loremIpsumDolorSitAmetConsect?: string;

  /** Style props */
  propGap?: CSSProperties["gap"];
  propHeight?: CSSProperties["height"];
  propMinHeight?: CSSProperties["minHeight"];
};

const BioInfo: FunctionComponent<BioInfoType> = memo(
  ({
    className = "",
    bio,
    loremIpsumDolorSitAmetConsect,
    propGap,
    propHeight,
    propMinHeight,
  }) => {
    const bioInfoStyle: CSSProperties = useMemo(() => {
      return {
        gap: propGap,
      };
    }, [propGap]);

    const rectangleDivStyle: CSSProperties = useMemo(() => {
      return {
        height: propHeight,
      };
    }, [propHeight]);

    const frameDivStyle: CSSProperties = useMemo(() => {
      return {
        minHeight: propMinHeight,
      };
    }, [propMinHeight]);

    return (
      <div
        className={`self-stretch rounded-xl bg-darkslategray flex flex-col items-start justify-start pt-6 px-0 pb-[26px] box-border gap-5 max-w-full text-center text-15xl text-nude font-texto-2 ${className}`}
        style={bioInfoStyle}
      >
        <div
          className="self-stretch h-[274px] relative rounded-xl bg-darkslategray hidden"
          style={rectangleDivStyle}
        />
        <h2 className="m-0 self-stretch relative text-inherit font-bold font-[inherit] z-[1] mq450:text-xl mq900:text-8xl">
          {bio}
        </h2>
        <div
          className="self-stretch flex flex-row items-start justify-start py-0 px-[18px] box-border min-h-[164px] max-w-full text-left text-lg"
          style={frameDivStyle}
        >
          <div className="flex-1 relative leading-[26px] whitespace-pre-wrap inline-block max-w-full z-[1]">
            {loremIpsumDolorSitAmetConsect}
          </div>
        </div>
      </div>
    );
  }
);

export default BioInfo;
