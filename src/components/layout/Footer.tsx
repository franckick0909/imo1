"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { CircleButton } from "../ui/ExploreButton";

gsap.registerPlugin(ScrollTrigger);

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Tous les produits", href: "/products" },
  { label: "Hydratation", href: "/products?category=hydratation" },
  { label: "Purification", href: "/products?category=purification" },
  { label: "Anti-âge", href: "/products?category=anti-age" },
  { label: "Soins des mains", href: "/products?category=mains" },
  { label: "Soins du corps", href: "/products?category=corps" },
  { label: "Protection solaire", href: "/products?category=solaire" },
];

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
];

export default function Footer() {
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();

  useGSAP(() => {
    // Animation des colonnes du footer
    colRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: i * 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // Effet parallax sur l'image de fond
    gsap.fromTo(
      imgRef.current,
      { y: -200 },
      {
        y: 200,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          scrub: true,
          start: "top bottom",
          end: "bottom top",
        },
      }
    );

    // Effet parallax sur le contenu de la newsletter
    gsap.fromTo(
      contentRef.current,
      { y: 300 },
      {
        y: -300,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      }
    );
  }, []);

  return (
    <>
      {/* Section Parallax */}
      <section
        ref={containerRef}
        className="relative w-full min-h-[85vh] h-full overflow-hidden"
      >
        {/* ParallaxBanner en arrière-plan */}
        <div
          ref={imgRef}
          className="absolute inset-0 will-change-transform"
        >
          <Image
            src="/images/banner.jpg"
            alt="Visuel inspirant"
            fill
            className="object-cover object-center select-none pointer-events-none"
            priority
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 pt-16 pb-8 relative">
        <div className="max-w-screen-2xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Col 1 : Logo + slogan */}
          <div
            ref={(el) => {
              colRefs.current[0] = el;
            }}
          >
            <Link
              href="/"
              className="text-3xl font-pinyon text-zinc-900 mb-2 block"
            >
              Bio<span className="text-emerald-500">Crème</span>
            </Link>
            <p className="text-zinc-900 text-base-responsive font-light mt-2 max-w-sm">
              Soins naturels, transparents et efficaces pour toutes les peaux.
            </p>
          </div>
          {/* Col 2 : Navigation */}
          <div
            ref={(el) => {
              colRefs.current[1] = el;
            }}
          >
            <h3 className="text-zinc-900 mb-4 font-light tracking-tight heading-sm uppercase">
              Navigation
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-zinc-900 font-light font-metal hover:text-emerald-600 transition-colors text-lg-responsive relative inline-block after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[2px] after:bg-emerald-500 after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300 after:ease-out"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Col 3 : Suivi & Contact */}
          <div
            ref={(el) => {
              colRefs.current[2] = el;
            }}
          >
            <h3 className="text-zinc-900 font-light mb-4 tracking-tight heading-sm uppercase">
              Suivez-nous
            </h3>
            <div className="flex gap-3 mb-4 md:mb-8 z-50">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 relative overflow-hidden group"
                    aria-label={social.label}
                  >
                    {/* BG animé */}
                    <div className="absolute inset-0 bg-zinc-700 scale-0 group-hover:scale-100 transition-transform duration-500 ease-out rounded-full z-0" />
                    {/* Icône au-dessus */}
                    <Icon className="w-5 h-5 z-10 relative group-hover:text-zinc-100 transition-colors duration-200" />
                  </a>
                );
              })}
            </div>
            <h3 className="text-zinc-900 font-light mb-4 tracking-tight heading-sm uppercase">
              Contact
            </h3>
            <ul className="space-y-1 text-zinc-900 text-base-responsive font-light">
              <li className="flex items-center">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-zinc-600" />{" "}
                contact@biocreme.fr
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-zinc-600" />{" "}
                +33 1 23 45 67 89
              </li>
              <li className="flex items-center">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-zinc-600" />{" "}
                123 Avenue des Champs, 75008 Paris
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-500 flex items-center justify-between gap-2 max-w-screen-2xl mx-auto px-4">
          <div>
            © {currentYear} BioCrème. Tous droits réservés. |{" "}
            <Link href="/mentions-legales" className="hover:text-emerald-600">
              Mentions légales
            </Link>{" "}
            |{" "}
            <Link href="/confidentialite" className="hover:text-emerald-600">
              Confidentialité
            </Link>
          </div>
          <div>
            <Link
              href="https://portfolio-v3-delta-black.vercel.app/"
              target="_blank"
              className="text-zinc-500"
            >
              Webdesign by{" "}
              <span className="text-zinc-600 font-medium">Franckick</span>
            </Link>
          </div>
        </div>

        {/* Newsletter Overlay - par-dessus le footer */}
        <div className="absolute -top-20 right-4 lg:-top-32 lg:right-8 xl:-top-40 xl:right-8 z-30">
          <div ref={contentRef} className="max-w-md">
            <div className="bg-black text-white p-8 shadow-2xl rounded-lg">
              <div className="text-center mb-6">
                <h2 className="text-xl font-light tracking-tight mb-3 uppercase">
                  En savoir plus sur nous
                </h2>
                <p className="text-zinc-100 text-sm font-light">
                  Recevez les dernières nouvelles sur nos conseils beauté et nos
                  nouveaux produits.
                </p>
              </div>

              <form className="flex flex-col gap-4 items-center justify-center max-w-sm mx-auto border-b border-white pb-6">
                <input
                  type="email"
                  placeholder="ENTER YOUR EMAIL"
                  className="flex-1 px-4 py-3 bg-zinc-950 text-white placeholder-zinc-400 border border-zinc-600 rounded-full focus:outline-none focus:border-zinc-400 text-sm w-full"
                />
                <CircleButton
                  href="#"
                  variant="dark"
                  size="large"
                  className="text-zinc-800 -rotate-45 hover:text-zinc-900"
                />
              </form>

              <p className="text-center text-zinc-50 text-xs mt-4 font-thin">
                Pas de spam, que des conseils beauté pour vous aider à être plus
                radieuse.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
