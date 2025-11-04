// In app/hooks/useSideBarHandle.ts
'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

const SIDEBAR_RESTRICTED_ARRAY = ['/login', '/signup', '/shop'];

export function useSideBarHandle() {
  // 1. Get the current path using the Next.js hook
  const pathname = usePathname();

  // 2. Calculate if the sidebar should be hidden
  // useMemo ensures this only recalculates when the pathname changes
  const isSidebarHidden = useMemo(() => {
    return SIDEBAR_RESTRICTED_ARRAY.includes(pathname);
  }, [pathname]);

  // 3. Return the boolean value
  return { isSidebarHidden };
}