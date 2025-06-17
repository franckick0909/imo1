import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SophisticatedTitleProps {
  children: ReactNode;
  level?: "h1" | "h2" | "h3";
  variant?: "hero" | "section" | "feature";
  className?: string;
  animated?: boolean;
}

interface TitleWord {
  text: string;
  style: "bold" | "script" | "normal";
  ornament?: "star" | "plus" | "none";
}

export default function SophisticatedTitle({
  children,
  level = "h2",
  variant = "section",
  className = "",
  animated = true,
}: SophisticatedTitleProps) {
  // Parse le texte pour identifier les mots à styliser
  const parseTitle = (text: string): TitleWord[] => {
    const words = text.split(" ");
    return words.map((word, index) => {
      // Règles de stylisation basées sur la position et le contenu
      if (variant === "hero") {
        if (index === words.length - 1) {
          return { text: word, style: "script", ornament: "star" };
        } else if (index === 0) {
          return { text: word, style: "bold", ornament: "none" };
        }
      } else if (variant === "section") {
        if (
          word.toLowerCase().includes("nature") ||
          word.toLowerCase().includes("beauté") ||
          word.toLowerCase().includes("soin") ||
          word.toLowerCase().includes("performance") ||
          word.toLowerCase().includes("sommeil")
        ) {
          return { text: word, style: "script", ornament: "star" };
        } else if (index === 0) {
          return { text: word, style: "bold", ornament: "plus" };
        }
      }
      return { text: word, style: "normal", ornament: "none" };
    });
  };

  const titleWords = typeof children === "string" ? parseTitle(children) : [];

  const getBaseClasses = () => {
    const base = "title-mixed";

    switch (variant) {
      case "hero":
        return `${base} text-5xl md:text-7xl lg:text-8xl font-light`;
      case "section":
        return `${base} text-4xl md:text-5xl lg:text-6xl font-light`;
      case "feature":
        return `${base} text-3xl md:text-4xl lg:text-5xl font-light`;
      default:
        return base;
    }
  };

  const renderWord = (word: TitleWord, index: number) => {
    const getWordClasses = () => {
      switch (word.style) {
        case "bold":
          return "title-bold";
        case "script":
          return "title-script";
        default:
          return "";
      }
    };

    const getOrnamentClasses = () => {
      switch (word.ornament) {
        case "star":
          return "title-ornament";
        case "plus":
          return "title-plus";
        default:
          return "";
      }
    };

    if (animated) {
      return (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: index * 0.1,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className={`inline-block ${getWordClasses()} ${getOrnamentClasses()}`}
          style={{
            marginRight: index < titleWords.length - 1 ? "0.25em" : "0",
          }}
        >
          {word.text}
        </motion.span>
      );
    }

    return (
      <motion.span
        key={index}
        className={`inline-block ${getWordClasses()} ${getOrnamentClasses()}`}
        style={{ marginRight: index < titleWords.length - 1 ? "0.25em" : "0" }}
      >
        {word.text}
      </motion.span>
    );
  };

  const Component = level;

  if (typeof children === "string") {
    return (
      <Component className={`${getBaseClasses()} ${className}`}>
        {titleWords.map(renderWord)}
      </Component>
    );
  }

  // Fallback pour du contenu JSX
  return (
    <Component className={`${getBaseClasses()} ${className}`}>
      {children}
    </Component>
  );
}
