import { FunctionComponent, memo } from "react";
import { useTranslation } from "../i18n";

export type ContentType = {
  className?: string;
};

const Header: FunctionComponent<ContentType> = memo(({ className = "" }) => {
  const { t } = useTranslation();

  return (
    <section
      className={`self-stretch flex flex-row items-start justify-start pt-[50px] px-[80px] pb-[50px] box-border max-w-full text-center text-101xl text-black font-milonga relative mq750:pl-10 mq750:pr-10 mq750:pb-[42px] mq750:box-border ${className}`}
    >
      <img
        className="w-full h-full absolute !m-[0] top-[0px] bottom-[0px] right-[0px] left-[0px] max-w-full overflow-hidden shrink-0 object-cover"
        alt=""
        aria-hidden="true"
        src="/2hmediaz9jv6wrkrpaunsplash-1@2x.png"
      />
      <div className="flex-1 rounded-xl bg-oldlace-200 flex flex-col items-center justify-center pt-[125px] pb-[125px] pl-[200px] pr-[200px] box-border gap-[20px] max-w-full z-[1] min-h-[624px] lg:pl-[130px] lg:pr-[130px] lg:box-border mq750:pt-[133px] mq750:pb-[108px] mq750:pl-16 mq750:pr-16 mq750:box-border mq450:pl-5 mq450:pr-5 mq450:box-border">
        <div className="w-[1118px] h-[624px] relative rounded-xl bg-oldlace-200 hidden max-w-full" />
        <h1 className="!m-[0] text-23xl font-medium font-titulo-2 text-center z-[3] mq1050:text-15xl mq1050:leading-[32px] mq450:text-6xl mq450:leading-[24px]">
          {t.header.welcomeTo}
        </h1>
        <h1 className="m-0 relative text-inherit leading-[76.6%] font-normal font-[inherit] text-center [text-shadow:0px_2px_2px_rgba(245,_203,_92,_0.25)] z-[2] mq1050:text-29xl mq1050:leading-[55px] mq450:text-11xl mq450:leading-[37px]">
          <span className="[line-break:anywhere]">
            <p className="m-0">{t.common.brandName1}</p>
            <p className="m-0">{t.common.brandName2}</p>
          </span>
        </h1>
        <h1 className="m-0 mt-[40px] text-29xl font-titulo-2 text-center italic font-bold z-[2] mq1050:text-19xl mq1050:leading-[41px] mq450:text-10xl mq450:leading-[31px]">
          {t.header.tagline}
        </h1>
      </div>
    </section>
  );
});

export default Header;
