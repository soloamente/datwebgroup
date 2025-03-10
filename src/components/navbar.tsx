import Link from "next/link";

export default async function Navbar() {
  return (
    <nav className="mb-9 flex w-full grid-cols-3 items-center justify-between">
      <div className="flex items-center transition-all duration-500 hover:opacity-40">
        <Link href="/" className="text-[12px]">
          FAVORITES
        </Link>
      </div>
      <div className="flex flex-row items-center justify-center gap-4 text-[12px]">
        <div className="cursor-not-allowed transition-all duration-500 hover:opacity-40">
          ABOUT
        </div>

        <Link
          href={"/users"}
          className="transition-all duration-500 hover:opacity-40"
        >
          USERS
        </Link>
        <div className="cursor-not-allowed transition-all duration-500 hover:opacity-40">
          CONTACT
        </div>
      </div>
      <div className="flex items-center transition-all duration-500 hover:opacity-40">
        <Link href="/auth/sign-in" className="text-[12px]">
          LOGIN
        </Link>
      </div>
    </nav>
  );
}
