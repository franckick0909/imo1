import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import SophisticatedTitle from "./ui/SophisticatedTitle";

const features = [
  {
    title: "Ingrédients Purs",
    subtitle: "Au-delà de tout reproche",
    description:
      "Vraiment propres avec seulement des ingrédients vérifiés, exempts de plus de 1800 ingrédients douteux. Ce que vous appliquez sur votre peau compte.",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    position: "top-left",
    delay: 0.2,
  },
  {
    title: "Transparence Radicale",
    subtitle: "Rien à cacher",
    description:
      "Pas de boîtes noires, rien à cacher, nous divulguons nos formules complètes, vous ne devrez jamais deviner ce qu'il y a dedans et en quelle quantité.",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 12a3 3 0 11-6 0 3 3 0 616 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    ),
    position: "top-right",
    delay: 0.4,
  },
  {
    title: "Puissant & Polyvalent",
    subtitle: "Résultats réels",
    description:
      "Nos formules regorgent d'actifs, d'antioxydants et d'agents réparateurs soutenus par la science dermique qui visent à offrir des résultats réels.",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    position: "bottom-left",
    delay: 0.6,
  },
  {
    title: "Conscient & Responsable",
    subtitle: "Certifié végan",
    description:
      "Certifié végan et sans cruauté par PETA. Nos produits sont toujours emballés dans des emballages responsables et fabriqués de manière durable.",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
    position: "bottom-right",
    delay: 0.8,
  },
];

export default function FeatureSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Animation du clip-path rotatif comme TrueKind
  const clipPathRotation = useTransform(scrollYProgress, [0, 1], [45, 45]);

  // Animations simplifiées - une seule version pour éviter l'hydratation
  const clipPathY = useTransform(scrollYProgress, [0, 1], [250, -250]);

  // Animations des étiquettes - une seule version
  const topLeftY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const topRightY = useTransform(scrollYProgress, [0, 1], [0, 250]);
  const bottomLeftY = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const bottomRightY = useTransform(scrollYProgress, [0, 1], [0, -300]);

  const getFeatureTransforms = (position: string) => {
    switch (position) {
      case "top-left":
        return { y: topLeftY };
      case "top-right":
        return { y: topRightY };
      case "bottom-left":
        return { y: bottomLeftY };
      case "bottom-right":
        return { y: bottomRightY };
      default:
        return { y: 0 };
    }
  };

  return (
    <section
      ref={containerRef}
      className="py-32 bg-gradient-to-br from-gray-50 to-white overflow-hidden min-h-[200vh] w-full h-full relative"
    >
      <div className="w-full px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <SophisticatedTitle
            level="h2"
            variant="section"
            className="text-gray-900 mb-6"
          >
            Propre Conscient Performance
          </SophisticatedTitle>
          <p className="text-xl text-gray-600 font-light max-w-4xl mx-auto leading-relaxed">
            Des produits véritablement honnêtes qui fonctionnent, respectueux de
            la peau et de la planète – sans exception !
          </p>
        </motion.div>

        {/* Layout avec grande image centrale et étiquettes en escalier */}
        <div className="max-w-full mx-auto w-full h-full flex items-center justify-center">
          {/* Grande image centrale avec clip-path rotatif */}
          {/* Option 1: Framer Motion avec clip-path CSS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="w-96 h-96 md:w-[700px] md:h-[700px] lg:w-[75vw] lg:h-[160vh] z-10 relative"
          >
            {/* Image fixe en arrière-plan (cachée par défaut) */}
            <div className="w-full h-full absolute inset-0 opacity-0">
              <Image
                src="/images/hero.jpg"
                alt="Cosmétiques naturels premium"
                fill
                className="object-cover object-center"
              />
            </div>

            {/* Masque clip-path animé par-dessus */}
            <motion.div
              className="w-full h-full absolute inset-0 overflow-hidden"
              style={{
                y: clipPathY,
                rotate: clipPathRotation,
              }}
            >
              <motion.div
                className="w-full h-full relative"
                style={{
                  clipPath: "ellipse(35% 50% at 50% 50%)",
                  filter: "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15))",
                }}
              >
                <Image
                  src="/images/clippath.jpg"
                  alt="Cosmétiques naturels premium"
                  fill
                  className="object-cover object-center"
                  style={{ transform: "rotate(-45deg)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Étiquettes en escalier avec animations de scroll */}
          {features.map((feature) => {
            const positions: Record<string, string> = {
              "top-left":
                "absolute top-4 left-4 sm:top-8 sm:left-8 md:top-0 md:left-16 lg:top-[20%] lg:left-96",
              "top-right":
                "absolute top-16 right-4 sm:top-20 sm:right-8 md:bottom-20 md:right-16 lg:top-[50%] lg:right-20",
              "bottom-left":
                "absolute bottom-16 left-4 sm:bottom-20 sm:left-8 md:top-20 md:left-16 lg:top-[50%] lg:left-20",
              "bottom-right":
                "absolute bottom-4 right-4 sm:bottom-8 sm:right-8 md:bottom-0 md:right-16 lg:bottom-[0%] lg:right-96",
            };

            const transforms = getFeatureTransforms(feature.position);

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 1,
                  delay: feature.delay,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                viewport={{ once: true }}
                style={{
                  y: transforms.y, // Mouvement Y seulement
                }}
                className={`${positions[feature.position]} w-56 sm:w-60 md:w-72 lg:w-80 group z-50`}
              >
                <motion.div className="bg-zinc-100/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 min-h-[280px] sm:min-h-[320px] lg:min-h-[380px] max-w-[280px] sm:max-w-[320px] lg:max-w-[260px] flex flex-col">
                  {/* Icône */}
                  <div className="flex items-center justify-center mb-6">
                    <motion.div className="flex items-center justify-center w-20 h-20 bg-white text-emerald-600 rounded-full transition-all duration-300">
                      {feature.icon}
                    </motion.div>
                  </div>

                  {/* Contenu */}
                  <div className="text-center flex-1 flex flex-col justify-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-4">
                      {feature.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Bouton "Explorer" centré en bas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-12 py-4 rounded-full font-medium uppercase tracking-wider hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <span>Explorer</span>
            <motion.svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </motion.svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
