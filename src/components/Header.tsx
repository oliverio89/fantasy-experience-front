import { FunctionComponent, memo } from "react";

export type ContentType = {
  className?: string;
};

const Header: FunctionComponent<ContentType> = memo(({ className = "" }) => {
  return (
    <section
      className={`self-stretch flex flex-row items-start justify-start pt-0 px-[81px] pb-[58px] box-border max-w-full text-center text-101xl text-black font-milonga mq750:pl-10 mq750:pr-10 mq750:pb-[42px] mq750:box-border ${className}`}
    >
      <div className="flex-1 rounded-xl bg-oldlace-200 flex flex-col items-end justify-start pt-[204px] pb-[166px] pl-[259px] pr-[260px] box-border gap-[9px] max-w-full z-[1] lg:pl-[129px] lg:pr-[130px] lg:box-border mq750:pt-[133px] mq750:pb-[108px] mq750:pl-16 mq750:pr-[65px] mq750:box-border mq450:pl-5 mq450:pr-5 mq450:box-border">
        <div className="w-[1118px] h-[624px] relative rounded-xl bg-oldlace-200 hidden max-w-full" />
        <div className="self-stretch flex flex-row items-start justify-start relative max-w-full">
          <h1 className="m-0 h-[194px] flex-1 relative text-inherit leading-[76.6%] font-normal font-[inherit] flex items-center [text-shadow:0px_2px_2px_rgba(245,_203,_92,_0.25)] max-w-full z-[2] mq1050:text-29xl mq1050:leading-[55px] mq450:text-11xl mq450:leading-[37px]">
            <span className="[line-break:anywhere]">
              <p className="m-0">Fantasy</p>
              <p className="m-0">Experience</p>
            </span>
          </h1>
          <h1 className="!m-[0] w-[238px] absolute top-[-37px] right-[89px] text-23xl font-medium font-titulo-2 text-right inline-block z-[3] mq1050:text-15xl mq1050:leading-[32px] mq450:text-6xl mq450:leading-[24px]">
            Bienvenidos a
          </h1>
        </div>
        <div className="w-[494px] flex flex-row items-start justify-end py-0 pl-[89px] pr-[90px] box-border max-w-full text-right text-29xl font-titulo-2 mq750:pl-11 mq750:pr-[45px] mq750:box-border">
          <h1 className="m-0 flex-1 relative text-inherit italic font-bold font-[inherit] z-[2] mq1050:text-19xl mq1050:leading-[41px] mq450:text-10xl mq450:leading-[31px]">
            Rol play games
          </h1>
        </div>
      </div>
    </section>
  );
});

export default Header;
