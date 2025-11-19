import { Button } from "./ui/button";
import Image from "next/image";
import SearchButton from "./searchButton";

export default function Sidebar() {
  return (
    <main className=" min-w-[18rem] h-svh flex flex-col bg-neutral-50 border-r px-2 pt-10">
      <div className=" flex flex-col gap-y-1">
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
      <div className=" mt-5">
        <h1 className=" px-4 text-sm font-medium text-black/40">Your Notes</h1>
      </div>
    </main>
  );
}
