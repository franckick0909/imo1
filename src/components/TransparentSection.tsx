"use client";

import { useRef } from "react";
import ImageAnimationGSAP from "./ui/ImageAnimationGSAP";
import TitleAnimationGSAP from "./ui/TitleAnimationGSAP";

export default function TransparentSection() {
  const transparentRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={transparentRef}
      id="transparent-section"
      className="relative bg-gray-200 min-h-screen overflow-x-hidden pt-24 w-full"
    >
      {/* Titre principal imposant - Style TrueKind */}
      <div className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 w-full h-full">
        <div className="px-2 lg:px-4 xl:px-8 max-w-[100rem] mx-auto w-full h-full leading-[0.8]">
          {/* Première ligne - TRANSPARENCE */}
          <div className="title-line flex mb-1 lg:mb-2 text-center justify-center items-center">
            <TitleAnimationGSAP
              text="TRANSPARENCE"
              className="font-medium text-gray-800 tracking-tighter break-keep whitespace-nowrap text-[clamp(3rem,11vw,20rem)]"
              delay={0}
              duration={0.8}
              stagger={0.15}
              splitBy="words"
              animationType="slideUp"
              triggerStart="top 80%"
              customTrigger="#transparent-section"
            />
          </div>

          {/* Deuxième ligne - RADICALE */}
          <div className="title-line flex items-center justify-center mb-1 lg:mb-2">
            <TitleAnimationGSAP
              text="RADICALE."
              className="font-medium text-gray-800 tracking-tighter text-[clamp(3rem,11vw,20rem)]"
              delay={0.3}
              duration={0.8}
              stagger={0.12}
              splitBy="chars"
              animationType="slideUp"
              triggerStart="top 75%"
              customTrigger="#transparent-section"
            />
          </div>

          {/* Troisième ligne avec première image - RIEN À */}
          <div className="title-line flex justify-end items-center mb-1 lg:mb-2 gap-2 sm:gap-4 lg:gap-6 px-6 lg:px-12 w-full">
            {/* Image avant "RIEN À" */}
            <ImageAnimationGSAP
              src="/images/creme-rose.png"
              alt="Crème rose"
              fill={true}
              priority={true}
              className="flex-shrink-0 mb-4 !relative w-[clamp(4rem,8vw,12rem)] h-[clamp(4rem,6vw,12rem)]"
              delay={0.5}
              duration={1.2}
              triggerStart="top 70%"
              animationType="clipLeft"
              sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, (max-width: 1280px) 128px, (max-width: 1536px) 160px, 192px"
              customTrigger="#transparent-section"
            />

            <div className="flex gap-4">
              <TitleAnimationGSAP
                text="RIEN"
                className="text-gray-800 italic font-cormorant font-light text-[clamp(3rem,11vw,20rem)] overflow-visible whitespace-nowrap tracking-tighter"
                delay={0.6}
                duration={0.7}
                stagger={0.08}
                splitBy="chars"
                animationType="slideLeft"
                triggerStart="top 65%"
                customTrigger="#transparent-section"
              />
              <TitleAnimationGSAP
                text="À"
                className="text-gray-800 tracking-wider font-normal text-[clamp(3rem,10vw,20rem)] overflow-visible whitespace-nowrap leading-[0.95]"
                delay={0.8}
                duration={0.6}
                stagger={0.1}
                splitBy="chars"
                animationType="scale"
                triggerStart="top 60%"
                customTrigger="#transparent-section"
              />
            </div>
          </div>

          {/* Quatrième ligne avec deuxième image - CACHER */}
          <div className="title-line flex items-center justify-center gap-2 sm:gap-4 lg:gap-6">
            <TitleAnimationGSAP
              text="CACHER."
              className="font-medium text-gray-800 tracking-tighter text-[clamp(3rem,11vw,20rem)]"
              delay={1.0}
              duration={0.9}
              stagger={0.1}
              splitBy="chars"
              animationType="slideUp"
              triggerStart="top 55%"
              customTrigger="#transparent-section"
            />

            {/* Image après "CACHER" */}
            <ImageAnimationGSAP
              src="/images/creme-verte.png"
              alt="Crème verte"
              fill={true}
              className="flex-shrink-0 !relative w-[clamp(4rem,8vw,12rem)] h-[clamp(3rem,6vw,12rem)]"
              delay={1.2}
              duration={1.3}
              triggerStart="top 50%"
              animationType="clipRight"
              sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, (max-width: 1280px) 128px, (max-width: 1536px) 160px, 192px"
              customTrigger="#transparent-section"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
