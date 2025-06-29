import Link from 'next/link';
import React from 'react';

const Header = () => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#eaf3e7] px-10 py-3">
      <div className="flex items-center gap-4 text-[#111b0e]">
        <div className="size-4">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
          </svg>
        </div>
        <h2 className="text-[#111b0e] text-lg font-bold leading-tight tracking-[-0.015em]">AgriTotho</h2>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-9">
          <Link className="text-[#111b0e] text-sm font-medium leading-normal" href="/">Home</Link>
          <Link className="text-[#111b0e] text-sm font-medium leading-normal" href="/marketplace">Marketplace</Link>
          <Link className="text-[#111b0e] text-sm font-medium leading-normal" href="/guidance">Guidance</Link>
          <Link className="text-[#111b0e] text-sm font-medium leading-normal" href="/community">Community</Link>
        </div>
        <Link
          href="/register"
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#eaf3e7] text-[#111b0e] text-sm font-bold leading-normal tracking-[0.015em]"
        >
          <span className="truncate">Sign Up</span>
        </Link>
      </div>
    </header>
  );
};

export default Header; 