"use client";

import { admin, signOut, useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/ToastContainer";
import AuthModals from "@/components/AuthModals";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
}

// Définition des liens de navigation
const publicLinks = [
  { href: "/immo/achat", label: "Achat" },
  { href: "/immo/vente", label: "Vente" },
  { href: "/immo/location", label: "Location" },
  { href: "/contact", label: "Contact" },
];

const staggerMenuItems = {
  open: {
    transition: { staggerChildren: 0.09, delayChildren: 0.3 },
  },
  closed: {
    transition: { staggerChildren: 0.09, staggerDirection: -1 },
  },
};

const staggerAuthItems = {
  open: {
    transition: { staggerChildren: 0.09, delayChildren: 0.8 },
  },
  closed: {
    transition: { staggerChildren: 0.09, staggerDirection: -1 },
  },
};

const statusVariants = {
  initial: {
    scale: 0.8,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.76, 0, 0.24, 1],
    },
  },
  open: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.87, 0, 0.13, 1],
      delay: 0.7,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

const linkVariants = {
  initial: {
    y: "30vh",
    transition: {
      duration: 0.5,
      ease: [0.76, 0, 0.24, 1],
    },
  },
  open: {
    y: 0,
    transition: {
      duration: 1.2,
      ease: [0.87, 0, 0.13, 1],
    },
  },
  exit: {
    y: "30vh",
    transition: {
      duration: 0.5,
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

const containerVariants = {
  hidden: {
    width: 96,
    height: 32,
    transition: {
      duration: 1,
      ease: [0.87, 0, 0.13, 1],
      when: "afterChildren",
    },
  },
  visible: {
    width: 440,
    height: 550,
    transition: {
      duration: 0.8,
      ease: [0.87, 0, 0.13, 1],
      when: "beforeChildren",
      delayChildren: 0.3,
    },
  },
};

export default function Header({ onSignInClick, onSignUpClick }: HeaderProps) {
  const { data: session, isPending } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const { success } = useToast();
  const router = useTransitionRouter();
  const pathname = usePathname();

  // État des modales (seulement si pas de callbacks fournis)
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  // État du menu mobile
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fermer le menu quand on change de page
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session) {
        try {
          const response = await admin.hasPermission({
            permissions: {
              user: ["list"],
            },
          });
          setIsAdmin(!response.error);
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [session]);

  // Fonction d'animation pour les transitions de vue
  function slideInOut() {
    // Animation pour l'élément sortant
    document.documentElement.animate(
      [
        {
          opacity: 1,
          scale: 1,
          transform: "translateY(0)",
        },
        {
          opacity: 0.2,
          scale: 0.95,
          transform: "translateY(-35%)",
        },
      ],
      {
        duration: 1000,
        easing: "cubic-bezier(0.76, 0, 0.24, 1)",
        fill: "forwards",
        pseudoElement: "::view-transition-old(root)",
      }
    );

    // Animation pour l'élément entrant
    document.documentElement.animate(
      [
        {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        },
        {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        },
      ],
      {
        duration: 1000,
        easing: "cubic-bezier(0.76, 0, 0.24, 1)",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }

  const handleSignOut = async () => {
    await signOut();
    success("Déconnexion réussie !");
    setIsMenuOpen(false);
    router.push("/", {
      onTransitionReady: slideInOut,
    });
  };

  const handleSignInClick = () => {
    if (onSignInClick) {
      onSignInClick();
    } else {
      setShowSignIn(true);
    }
    setIsMenuOpen(false);
  };

  const handleSignUpClick = () => {
    if (onSignUpClick) {
      onSignUpClick();
    } else {
      setShowSignUp(true);
    }
    setIsMenuOpen(false);
  };

  const handleCloseModals = () => {
    setShowSignIn(false);
    setShowSignUp(false);
  };

  const handleToggleMode = () => {
    if (showSignIn) {
      setShowSignIn(false);
      setShowSignUp(true);
    } else if (showSignUp) {
      setShowSignUp(false);
      setShowSignIn(true);
    }
  };

  // Liens connectés (après connexion)
  const authenticatedLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profil" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300 h-16 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div className="w-full h-full px-4 flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              router.push("/", {
                onTransitionReady: slideInOut,
              });
            }}
            className="text-2xl font-bold text-gray-900 hover:text-indigo-600 transition-colors"
          >
            Immo1
          </Link>

          <div className="flex items-center gap-4">
            {/* Bouton de connexion pour utilisateurs non connectés */}
            {!session && !isPending && (
              <button
                type="button"
                onClick={handleSignInClick}
                className="bg-zinc-100 hover:bg-zinc-200 text-black px-4 h-9 rounded-full text-sm font-medium transition-colors duration-300 cursor-pointer"
              >
                Se connecter
              </button>
            )}

            {/* Bouton menu amélioré */}
            <motion.button
              type="button"
              aria-label="Menu navigation"
              className="relative z-50 focus:outline-none cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-24 h-9 flex flex-col justify-center items-center overflow-hidden">
                <motion.div
                  className="flex flex-col"
                  animate={{ y: isMenuOpen ? "-25%" : "25%" }}
                  transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
                >
                  <span className="h-9 w-24 flex items-center justify-center text-black font-medium rounded-full bg-white">
                    Menu
                  </span>
                  <span className="h-9 w-24 flex items-center justify-center font-medium rounded-full bg-black text-white">
                    Fermer
                  </span>
                </motion.div>
              </div>
            </motion.button>
          </div>

          {/* Menu avec animations améliorées */}
          <AnimatePresence mode="wait">
            {isMenuOpen && (
              <motion.div
                className="fixed top-4 right-4 bg-zinc-100 z-40 flex flex-col rounded-3xl min-w-24 min-h-8 overflow-hidden"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="flex flex-col h-full justify-center p-8">
                  {/* Affichage statut connecté en haut avec animation propre */}
                  {session && (
                    <div className="mb-8">
                      <motion.p
                        className="text-gray-800 text-sm uppercase font-medium tracking-wider"
                        variants={statusVariants}
                        initial="initial"
                        animate="open"
                        exit="exit"
                      >
                        Connecté :{" "}
                        <span className="text-amber-800 font-bold">
                          {session.user.name || session.user.email}
                        </span>
                      </motion.p>
                    </div>
                  )}

                  {/* Navigation publique */}
                  <motion.nav
                    className="flex flex-col space-y-4 items-start uppercase"
                    variants={staggerMenuItems}
                    initial="closed"
                    animate="open"
                    exit="closed"
                  >
                    {/* Liens publics */}
                    {publicLinks.map((link) => (
                      <div key={link.href} className="overflow-hidden relative">
                        <motion.div
                          variants={linkVariants}
                          initial="initial"
                          animate="open"
                          exit="initial"
                          className="relative"
                        >
                          <Link
                            href={link.href}
                            onClick={(e) => {
                              e.preventDefault();
                              setIsMenuOpen(false);
                              router.push(link.href, {
                                onTransitionReady: slideInOut,
                              });
                            }}
                            className="text-2xl text-gray-800 hover:text-gray-900 transition-colors inline-block relative group font-bold"
                          >
                            {link.label}
                            <motion.span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 transform origin-left transition-all duration-300 scale-x-0 group-hover:scale-x-100" />
                          </Link>
                        </motion.div>
                      </div>
                    ))}
                  </motion.nav>

                  {/* Séparation et navigation authentifiée */}
                  {session ? (
                    <>
                      {/* Divider élégant */}
                      <motion.div
                        className="flex items-center justify-center my-8"
                        variants={statusVariants}
                        initial="initial"
                        animate="open"
                        exit="exit"
                      >
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-800/60 to-transparent"></div>
                        <div className="mx-4 w-2 h-2 bg-gray-800/70 rounded-full"></div>
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-800/60 to-transparent"></div>
                      </motion.div>

                      {/* Navigation connectée avec animation séparée */}
                      <motion.nav
                        className="flex flex-col space-y-4 items-start uppercase"
                        variants={staggerAuthItems}
                        initial="closed"
                        animate="open"
                        exit="closed"
                      >
                        {authenticatedLinks.map((link) => (
                          <div
                            key={link.href}
                            className="overflow-hidden relative"
                          >
                            <motion.div
                              variants={linkVariants}
                              initial="initial"
                              animate="open"
                              exit="initial"
                              className="relative"
                            >
                              <Link
                                href={link.href}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setIsMenuOpen(false);
                                  router.push(link.href, {
                                    onTransitionReady: slideInOut,
                                  });
                                }}
                                className="text-2xl text-gray-800 hover:text-gray-900 transition-colors inline-block relative group"
                              >
                                {link.label}
                                <motion.span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 transform origin-left transition-all duration-300 scale-x-0 group-hover:scale-x-100" />
                              </Link>
                            </motion.div>
                          </div>
                        ))}

                        {/* Bouton déconnexion */}
                        <div className="overflow-hidden relative">
                          <motion.div
                            variants={linkVariants}
                            initial="initial"
                            animate="open"
                            exit="initial"
                            className="relative"
                          >
                            <button
                              type="button"
                              onClick={handleSignOut}
                              className="text-xl text-white bg-red-400 px-4 py-2 rounded-lg hover:bg-red-500 transition-colors inline-block relative group text-left uppercase"
                            >
                              Se déconnecter
                            </button>
                          </motion.div>
                        </div>
                      </motion.nav>
                    </>
                  ) : (
                    /* Navigation non connectée avec animation séparée */
                    <>
                      {/* Divider élégant */}
                      <motion.div
                        className="flex items-center justify-center my-8"
                        variants={statusVariants}
                        initial="initial"
                        animate="open"
                        exit="exit"
                      >
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-800/60 to-transparent"></div>
                        <div className="mx-4 w-2 h-2 bg-gray-800/70 rounded-full"></div>
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-800/60 to-transparent"></div>
                      </motion.div>

                      <motion.nav
                        className="flex flex-col space-y-6 items-start uppercase"
                        variants={staggerAuthItems}
                        initial="closed"
                        animate="open"
                        exit="closed"
                      >
                        <div className="overflow-hidden relative">
                          <motion.div
                            variants={linkVariants}
                            initial="initial"
                            animate="open"
                            exit="initial"
                            className="relative"
                          >
                            <button
                              type="button"
                              onClick={handleSignInClick}
                              className="text-xl text-gray-800 hover:text-gray-900 transition-colors inline-block relative group text-left uppercase"
                            >
                              Se connecter
                              <motion.span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 transform origin-left transition-all duration-300 scale-x-0 group-hover:scale-x-100" />
                            </button>
                          </motion.div>
                        </div>

                        <div className="overflow-hidden relative">
                          <motion.div
                            variants={linkVariants}
                            initial="initial"
                            animate="open"
                            exit="initial"
                            className="relative"
                          >
                            <button
                              type="button"
                              onClick={handleSignUpClick}
                              className="text-xl text-gray-800 hover:text-gray-900 transition-colors inline-block relative group text-left uppercase"
                            >
                              S&apos;inscrire
                              <motion.span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 transform origin-left transition-all duration-300 scale-x-0 group-hover:scale-x-100" />
                            </button>
                          </motion.div>
                        </div>
                      </motion.nav>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Modales d'authentification (seulement si pas de callbacks externes) */}
      {!onSignInClick && !onSignUpClick && (
        <AuthModals
          showSignIn={showSignIn}
          showSignUp={showSignUp}
          onClose={handleCloseModals}
          onToggleMode={handleToggleMode}
        />
      )}
    </>
  );
}
