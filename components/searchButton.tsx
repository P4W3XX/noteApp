"use client";

import { Button } from "./ui/button";
import Image from "next/image";
import { useSearchOpen } from "@/store/searchOpen";

export default function SearchButton() {
  const { openSearch } = useSearchOpen();
  return (
    <Button
      onClick={() => openSearch()}
      className=" w-full justify-start text-base bg-transparent hover:bg-neutral-200/70 rounded-lg font-semibold"
    >
      <Image src="/search.svg" alt="Search Notes" width={18} height={18} />
      Search Notes
    </Button>
  );
}