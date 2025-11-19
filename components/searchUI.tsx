"use client";

import { useSearchOpen } from "@/store/searchOpen";
import { motion } from "motion/react";
import { useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import Image from "next/image";

export default function SearchUI() {
  const { isSearchOpen, closeSearch } = useSearchOpen();
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        closeSearch();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      // Dodaj małe opóźnienie żeby animacja się zakończyła
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);
  return (
    <motion.main
      initial={false}
      animate={{
        display: isSearchOpen ? "block" : "none",
      }}
      className=" absolute w-full h-full"
    >
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{
          opacity: isSearchOpen ? 1 : 0,
          scale: isSearchOpen ? 1 : 1.1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className=" max-w-200 h-full max-h-120 border border-zinc-300 shadow-[0_0_30px_20px_rgba(0,0,0,0.15)] w-full absolute right-0 left-0 top-0 bottom-0 my-auto rounded-2xl mx-auto bg-white flex flex-col overflow-hidden"
      >
        <div className=" border-b border-zinc-300 px-2 pl-6 flex items-center shrink-0">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search notes..."
            className=" w-full h-15 rounded-t-3xl placeholder:text-zinc-400 font-medium focus:outline-none caret-amber-500"
          />
          <Button
            onClick={() => closeSearch()}
            size={"icon-lg"}
            className=" bg-transparent hover:bg-neutral-200/70"
          >
            <X size={24} />
          </Button>
        </div>
        <div className=" px-2 pt-2 pb-2 overflow-auto flex-1 min-h-0">
          <Button className=" w-full h-11 rounded-xl bg-transparent text-base font-semibold justify-start hover:bg-neutral-200/70">
            <Image src="/newNote.png" alt="New Note" width={18} height={18} />
            New Note
          </Button>
          <div className=" mt-4">
            <h1 className=" px-4 text-xs text-zinc-400 font-medium mb-2">
              Today
            </h1>
            <Button className=" w-full h-11 rounded-xl bg-transparent text-base font-semibold justify-start hover:bg-neutral-200/70">
              <Image src="/notes.png" alt="New Note" width={18} height={18} />
              How to use AI Notes
            </Button>
            <Button className=" w-full h-11 rounded-xl bg-transparent text-base font-semibold justify-start hover:bg-neutral-200/70">
              <Image src="/notes.png" alt="New Note" width={18} height={18} />
              How to use AI Notes
            </Button>
            <Button className=" w-full h-11 rounded-xl bg-transparent text-base font-semibold justify-start hover:bg-neutral-200/70">
              <Image src="/notes.png" alt="New Note" width={18} height={18} />
              How to use AI Notes
            </Button>{" "}
            <Button className=" w-full h-11 rounded-xl bg-transparent text-base font-semibold justify-start hover:bg-neutral-200/70">
              <Image src="/notes.png" alt="New Note" width={18} height={18} />
              How to use AI Notes
            </Button>
          </div>
          <div className=" mt-4">
            <h1 className=" px-4 text-xs font-medium text-zinc-400 mb-2">
              Yesterday
            </h1>
            <Button className=" w-full h-11 rounded-xl bg-transparent text-base font-semibold justify-start hover:bg-neutral-200/70">
              <Image src="/notes.png" alt="New Note" width={18} height={18} />
              How to use AI Notes
            </Button>
            <Button className=" w-full h-11 rounded-xl bg-transparent text-base font-semibold justify-start hover:bg-neutral-200/70">
              <Image src="/notes.png" alt="New Note" width={18} height={18} />
              How to use AI Notes
            </Button>
            <Button className=" w-full h-11 rounded-xl bg-transparent text-base font-semibold justify-start hover:bg-neutral-200/70">
              <Image src="/notes.png" alt="New Note" width={18} height={18} />
              How to use AI Notes
            </Button>{" "}
            <Button className=" w-full h-11 rounded-xl bg-transparent text-base font-semibold justify-start hover:bg-neutral-200/70">
              <Image src="/notes.png" alt="New Note" width={18} height={18} />
              How to use AI Notes
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.main>
  );
}
