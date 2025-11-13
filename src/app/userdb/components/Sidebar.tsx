"use client";

import React from "react";
import Link from "next/link";
import {
  DashboardIcon,
  CalendarIcon,
  GiftIcon,
  LogoutIcon,
} from "./icons";

import Image from "next/image";

type RouteKey = "dashboard" | "history" | "redeem" ;

type NavLink = {
  key: RouteKey;
  label: string;
  icon: React.ReactNode;
  href: string;
};

type SidebarProps = {
  activeRoute: RouteKey;
};

const primaryLinks: NavLink[] = [
  { key: "dashboard", label: "Dashboard", icon: <DashboardIcon className="w-4 h-4" />, href: "/userdb" },
  { key: "history", label: "History", icon: <CalendarIcon className="w-4 h-4 opacity-70" />, href: "/userdb/history" },
  { key: "redeem", label: "Redeem", icon: <GiftIcon className="w-4 h-4"/>, href: "/userdb" }, // link to team 6's redeem page
];

export default function Sidebar({ activeRoute }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between p-6">
      <div>
        <div className="flex items-center gap-3 mb-10">
          <Image src="/images/tmu.jpg" alt="TMU Logo" width={100} height={100} className="rounded-md object-contain" />
          <div className="leading-tight">
            <div className="text-lg font-semibold">Campus</div>
            <div className="text-lg font-semibold -mt-1">Connect</div>
          </div>
        </div>

        <nav className="space-y-4">
          {primaryLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={
                `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  activeRoute === link.key
                    ? "bg-blue-500 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <span className="text-xs">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

      </div>

      <div className="space-y-3 text-sm text-gray-400">
        <button className="flex items-center gap-2 hover:text-white">
          <LogoutIcon className="w-4 h-4" />
          <span>Log Out</span> 
          {/* link this to the auth LOGOUT */}
        </button>
      </div>
    </aside>
  );
}
