"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";

export default function Home() {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [isScrolling, setIsScrolling] = useState(false);
  const contextRef = useRef<HTMLTextAreaElement | null>(null);
  const [createdDate] = useState<Date>(new Date());

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollTop = target.scrollTop;
      setIsScrolling(scrollTop > 0);
    };

    const container = document.querySelector(".w-full.h-full.overflow-auto");
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div className=" w-full h-full overflow-auto">
      <motion.div
        className={`w-full px-4 pt-4 min-h-14 ${
          isScrolling ? "border-b bg-zinc-50" : ""
        } h-auto sticky bg-white -top-3 overflow-hidden`}
      >
        {/*
        <h1 className=" absolute top-1 text-black/50 right-0 left-0 mx-auto w-min text-sm font-semibold whitespace-nowrap">
          {createdDate.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          at{" "}
          {createdDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </h1>
        */}
        {!title && (
          <motion.h1
            initial={true}
            className=" font-bold text-3xl text-black/20 -z-10 top-3 h-min bottom-0 my-auto left-4 absolute select-none pointer-events-none"
          >
            Title
          </motion.h1>
        )}
        <motion.textarea
          key={"Title"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className=" w-full min-h-14 caret-amber-500 bg-transparent text-3xl z-20 font-bold focus:outline-none resize-none p-0 py-2.5"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              contextRef.current?.focus();
            }
          }}
          onInput={(e) => {
            e.currentTarget.style.height = "auto";
            e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
          }}
        />
      </motion.div>
      <motion.textarea
        key={"Context"}
        ref={contextRef}
        value={context}
        onChange={(e) => setContext(e.target.value)}
        className=" w-full caret-amber-500 resize-none focus:outline-none px-4"
        onInput={(e) => {
          e.currentTarget.style.height = "auto";
          e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
        }}
      />
    </div>
  );
}
