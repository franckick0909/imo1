"use client";

import { useRef } from "react";
import ImageAnimation from "./ui/ImageAnimation";
import TitleAnimationFramer from "./ui/TitleAnimationFramer";

export default function TransparentSection() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative bg-gray-200 min-h-screen overflow-x-hidden pt-24 w-full"
    >
      {/* Titre principal imposant - Style TrueKind */}
      <div className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 w-full h-full">
        <div className="px-2 lg:px-4 xl:px-8 max-w-[100rem] mx-auto w-full h-full">
          {/* Première ligne - TRANSPARENCE */}
          <div className="title-line flex mb-1 lg:mb-2 text-center justify-center items-center">
            <TitleAnimationFramer
              text="TRANSPARENCE"
              className="font-medium text-gray-800 leading-[0.85] tracking-tighter break-keep whitespace-nowrap text-[clamp(3rem,12vw,20rem)]"
              delay={0}
              duration={0.6}
              stagger={0.1}
              splitBy="words"
            />
          </div>

          {/* Deuxième ligne - RADICALE */}
          <div className="title-line flex items-center justify-center mb-1 lg:mb-2">
            <TitleAnimationFramer
              text="RADICALE."
              className="font-medium text-gray-800 leading-[0.85] tracking-tighter text-[clamp(3rem,12vw,20rem)]"
              delay={0.2}
              duration={0.6}
              stagger={0.1}
              splitBy="words"
            />
          </div>

          {/* Troisième ligne avec première image - RIEN À */}
          <div className="title-line flex justify-end items-center mb-1 lg:mb-2 gap-2 sm:gap-4 lg:gap-6 px-6 lg:px-12 w-full">
            {/* Image avant "RIEN À" */}
            <ImageAnimation
              src="/images/creme-rose.png"
              alt="Image clippath"
              className="flex-shrink-0 mb-4 relative w-[clamp(4rem,8vw,12rem)] h-[clamp(4rem,6vw,12rem)] overflow-hidden"
              delay={0.4}
              duration={1}
              triggerStart="top 60%"
              animationType="clipLeft"
              sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, (max-width: 1280px) 128px, (max-width: 1536px) 160px, 192px"
            />

            <div className="flex gap-4">
              <TitleAnimationFramer
                text="RIEN"
                className="text-gray-800 leading-[1] italic font-cormorant font-light text-[clamp(3rem,12vw,20rem)] overflow-visible whitespace-nowrap tracking-tighter"
                delay={0.4}
                duration={0.6}
                stagger={0.1}
                splitBy="words"
              />
              <TitleAnimationFramer
                text="À"
                className="text-gray-800 leading-[1] tracking-wider font-normal text-[clamp(3rem,12vw,20rem)] overflow-visible whitespace-nowrap"
                delay={0.5}
                duration={0.6}
                stagger={0.1}
                splitBy="words"
              />
            </div>
          </div>

          {/* Quatrième ligne avec deuxième image - CACHER */}
          <div className="title-line flex items-center justify-center gap-2 sm:gap-4 lg:gap-6">
            <TitleAnimationFramer
              text="CACHER."
              className="font-medium text-gray-800 leading-[0.85] tracking-tighter text-[clamp(3rem,12vw,20rem)]"
              delay={0.6}
              duration={0.6}
              stagger={0.1}
              splitBy="words"
            />

            {/* Image après "CACHER" */}
            <ImageAnimation
              src="/images/creme-verte.png"
              alt="Image soir"
              className="flex-shrink-0 relative w-[clamp(4rem,8vw,12rem)] h-[clamp(3rem,6vw,12rem)]  overflow-hidden"
              delay={0.6}
              duration={1}
              triggerStart="top 50%"
              animationType="clipRight"
              sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, (max-width: 1280px) 128px, (max-width: 1536px) 160px, 192px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
