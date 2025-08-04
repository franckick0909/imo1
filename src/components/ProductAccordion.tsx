"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface AccordionItem {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
}

interface ProductAccordionProps {
  items: AccordionItem[];
}

export default function ProductAccordion({ items }: ProductAccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="grid gap-6">
      {items.map((item, index) => {
        const isOpen = openItems.includes(item.id);
        const isLast = index === items.length - 1;

        return (
          <motion.div
            key={item.id}
            className={`bg-gray-50 overflow-hidden ${!isLast ? "border-b border-gray-200" : ""}`}
            initial={{ opacity: 1, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              aria-label={`${isOpen ? "Fermer" : "Ouvrir"} le contenu de ${item.title}`}
              {...(isOpen
                ? { "aria-expanded": "true" }
                : { "aria-expanded": "false" })}
              type="button"
              onClick={() => toggleItem(item.id)}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex items-center gap-4">
                {/*  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 ">
                  {item.icon}
                </div> */}
                <h3 className="text-base-responsive font-light uppercase text-gray-900">
                  {item.title}
                </h3>
              </div>

              {/* Icône + qui se transforme en - avec Framer Motion */}
              <div className="flex-shrink-0 ml-4">
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="relative">
                    {/* Ligne horizontale (toujours visible) */}
                    <motion.div
                      className="w-4 h-0.5 bg-gray-600"
                      animate={{
                        rotate: isOpen ? 0 : 0,
                        scaleX: isOpen ? 1 : 1,
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                    {/* Ligne verticale (disparaît quand ouvert) */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 w-0.5 h-4 bg-gray-600 transform -translate-x-1/2 -translate-y-1/2"
                      animate={{
                        rotate: isOpen ? 90 : 0,
                        opacity: isOpen ? 0 : 1,
                        scale: isOpen ? 0.8 : 1,
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </div>
            </button>

            {/* Contenu avec animation Framer Motion */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                    transition: {
                      height: { duration: 0.4, ease: "easeInOut" },
                      opacity: { duration: 0.3, delay: 0.1 },
                    },
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    transition: {
                      height: { duration: 0.3, ease: "easeInOut" },
                      opacity: { duration: 0.2 },
                    },
                  }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <div className="pt-2">
                      <motion.p
                        className="text-gray-600 leading-relaxed whitespace-pre-line text-sm-responsive font-light"
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        {item.content}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
