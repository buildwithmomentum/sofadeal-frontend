"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface MarqueeItem {
  text: string;
  icon?: string;
}

interface MarqueeStripProps {
  items: MarqueeItem[];
  speed?: number;
  direction?: "left" | "right";
  className?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function MarqueeStrip({
  items,
  speed = 50,
  direction = "left",
  className = "",
  backgroundColor = "bg-blue",
  textColor = "text-white",
}: MarqueeStripProps) {
  // Create enough duplicates to ensure seamless loop
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className={`overflow-hidden ${backgroundColor} h-20 ${className} `}>
      <motion.div
        className="flex h-full items-center justify-center gap-16 whitespace-nowrap"
        animate={{
          x: direction === "left" ? [0, "-33.333%"] : ["-33.333%", 0],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          width: "280%",
          willChange: "transform",
        }}
      >
        {duplicatedItems.map((item, index) => (
          <div
            key={`${item.text}-${index}`}
            className={`flex items-center justify-center gap-4 ${textColor} font-bebas flex-shrink-0 text-[40px] leading-none`}
          >
            {item.icon && (
              <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center">
                <Image
                  src={item.icon}
                  alt=""
                  fill
                  className="object-contain brightness-0 invert filter"
                />
              </div>
            )}
            <span className="text-center tracking-wider uppercase">
              {item.text}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
