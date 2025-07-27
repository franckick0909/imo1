"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

interface TitleAnimationGSAPProps {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  animationType?: "slideUp" | "fadeIn" | "typewriter" | "reveal" | "emerge";
  animationUnit?: "words" | "chars";
  delay?: number;
  duration?: number;
  stagger?: number;
  triggerStart?: string;
}

export default function TitleAnimationGSAP({
  title,
  subtitle,
  className = "",
  titleClassName = "",
  subtitleClassName = "",
  animationType = "slideUp",
  animationUnit = "words",
  delay = 0,
  duration = 1,
  stagger = 0.1,
}: TitleAnimationGSAPProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animation du titre
      if (titleRef.current) {
        let titleElements: Element[];

        if (animationUnit === "chars") {
          // Découpage par caractères
          const titleChars = titleRef.current.textContent?.split("") || [];
          titleRef.current.innerHTML = titleChars
            .map((char) => {
              if (char === " ") {
                return '<span class="char">&nbsp;</span>';
              }
              return `<span class="char">${char}</span>`;
            })
            .join("");
          titleElements = Array.from(
            titleRef.current.querySelectorAll(".char")
          );
        } else {
          // Découpage par mots (comportement par défaut)
          const titleWords = titleRef.current.textContent?.split(" ") || [];
          titleRef.current.innerHTML = titleWords
            .map((word) => `<span class="word">${word}</span>`)
            .join(" ");
          titleElements = Array.from(
            titleRef.current.querySelectorAll(".word")
          );
        }

        switch (animationType) {
          case "slideUp":
            gsap.fromTo(
              titleElements,
              {
                y: 100,
                opacity: 0,
                rotationX: 90,
              },
              {
                y: 0,
                opacity: 1,
                rotationX: 0,
                duration,
                delay,
                stagger,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: containerRef.current,
                  start: "top 80%",
                  end: "bottom 20%",
                  toggleActions: "play none none none",
                },
              }
            );
            break;

          case "fadeIn":
            gsap.fromTo(
              titleElements,
              {
                opacity: 0,
                scale: 0.8,
                filter: "blur(10px)",
              },
              {
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                duration,
                delay,
                stagger,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: containerRef.current,
                  start: "top 80%",
                  end: "bottom 20%",
                  toggleActions: "play none none none",
                },
              }
            );
            break;

          case "typewriter":
            gsap.fromTo(
              titleElements,
              {
                opacity: 0,
                x: -50,
              },
              {
                opacity: 1,
                x: 0,
                duration: 0.5,
                delay,
                stagger: animationUnit === "chars" ? 0.05 : 0.3,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: containerRef.current,
                  start: "top 80%",
                  end: "bottom 20%",
                  toggleActions: "play none none none",
                },
              }
            );
            break;

          case "reveal":
            gsap.fromTo(
              titleElements,
              {
                clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
                y: 30,
              },
              {
                clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
                y: 0,
                duration,
                delay,
                stagger,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: containerRef.current,
                  start: "top 80%",
                  end: "bottom 20%",
                  toggleActions: "play none none none",
                },
              }
            );
            break;

          case "emerge":
            // Effet "sortir de terre" avec clip-path polygon
            gsap.set(titleElements, {
              clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
              y: 50,
              opacity: 1,
            });

            gsap.to(titleElements, {
              clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
              y: 0,
              duration: duration * 1.2,
              delay,
              stagger: animationUnit === "chars" ? stagger / 2 : stagger,
              ease: "power4.out",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 85%",
                end: "bottom 20%",
                toggleActions: "play none none none",
              },
            });

            // Animation supplémentaire pour l'effet de "poussée"
            gsap.fromTo(
              titleElements,
              {
                scaleY: 0.6,
                transformOrigin: "bottom center",
              },
              {
                scaleY: 1,
                duration: duration * 0.8,
                delay: delay + 0.2,
                stagger: animationUnit === "chars" ? stagger / 2 : stagger,
                ease: "back.out(1.7)",
                scrollTrigger: {
                  trigger: containerRef.current,
                  start: "top 85%",
                  end: "bottom 20%",
                  toggleActions: "play none none none",
                },
              }
            );
            break;
        }
      }

      // Animation du sous-titre
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          {
            opacity: 1,
            y: "100%",
          },
          {
            opacity: 1,
            y: "0%",
            duration: 0.8,
            delay: delay + 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 85%",
              end: "bottom 20%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Animation du conteneur avec un effet de parallaxe léger
      gsap.to(containerRef.current, {
        y: -50,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [title, subtitle, animationType, animationUnit, delay, duration, stagger]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <h1
        ref={titleRef}
        className={`font-medium text-gray-800 tracking-tighter break-keep whitespace-nowrap text-[clamp(3rem,11vw,20rem)] ${titleClassName}`}
        style={{
          textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          perspective: "1000px",
        }}
      >
        {title}
      </h1>

      {subtitle && (
        <p
          ref={subtitleRef}
          className={` ${subtitleClassName}`}
          style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}
        >
          {subtitle}
        </p>
      )}

      <style jsx>{`
        .word {
          display: inline-block;
          margin-right: 0.25em;
          transform-origin: 50% 100%;
        }
        .char {
          display: inline-block;
          transform-origin: 50% 100%;
        }
      `}</style>
    </div>
  );
}
