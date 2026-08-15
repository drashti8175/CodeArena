"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const AUTH_ROUTES = ["/login", "/signup"];

export default function NavbarWrapper() {
  const path = usePathname();
  if (AUTH_ROUTES.includes(path)) return null;
  return (
    <>
      <Navbar />
      <div className="pt-14" />
    </>
  );
}
