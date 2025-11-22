"use client";

import { Button } from "./ui/button";
import Image from "next/image";
import SearchButton from "./searchButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

import { useUserStore } from "@/store/user";

export default function Sidebar() {
  const { name } = useUserStore();

  if (!name) {
    return null;
  }
  return (
    <main className=" min-w-[18rem] h-full flex flex-col bg-neutral-50 border-r px-2 pt-10">
      <div className=" flex flex-col gap-y-1 h-fit">
        <Button className=" w-full justify-start text-base bg-transparent hover:bg-neutral-200/70 rounded-lg font-semibold">
          <Image src="/newNote.png" alt="New Note" width={18} height={18} />
          New Note
        </Button>
        <SearchButton />
        <Button className=" w-full justify-start text-base bg-transparent hover:bg-neutral-200/70 rounded-lg font-semibold">
          <Image src="/gallery.svg" alt="Gallery" width={18} height={18} />
          Gallery
        </Button>
      </div>
      <div className=" mt-5 h-fit min-h-80">
        <h1 className=" px-4 text-sm font-medium text-black/40">Your Notes</h1>
        <div className=" h-full relative w-full">
          <p className=" absolute font-semibold text-black/50 right-0 left-0 mx-auto w-fit bottom-0 my-auto h-min top-0">
            No notes available
          </p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="">
          <Button className=" bg-neutral-50 px-2 hover:bg-neutral-200/70 rounded-lg mt-auto mb-2 h-11 w-full justify-start text-base font-semibold gap-x-2">
            <div className=" bg-linear-to-b from-neutral-400/70 to-neutral-400 rounded-full border border-neutral-400 size-8 font-medium flex text-sm items-center justify-center text-white">
              PS
            </div>
            <p>Pawel Sarzynski</p>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className=" bg-white rounded-xl min-w-[14rem]">
          <DropdownMenuItem
            variant="destructive"
            className=" justify-between font-semibold rounded-lg hover:!bg-neutral-200/70"
          >
            Logout
            <LogOut className=" w-4 h-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </main>
  );
}
