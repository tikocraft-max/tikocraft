"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import type { PageId } from "@/lib/content";

interface RouterContextValue {
  currentPage: PageId;
  pageParam: string | null;
  navigate: (page: PageId, param?: string | null) => void;
  isTransitioning: boolean;
}

const RouterContext = createContext<RouterContextValue | null>(null);

const VALID_PAGES: PageId[] = [
  "home",
  "collections",
  "products",
  "atelier",
  "showroom",
  "contact",
  "product",
];

function readHashState(): { page: PageId; param: string | null } {
  if (typeof window === "undefined") {
    return { page: "home", param: null };
  }
  const hash = window.location.hash.replace("#", "");
  if (!hash) return { page: "home", param: null };
  const [page, param] = hash.split("/");
  if (VALID_PAGES.includes(page as PageId)) {
    return { page: page as PageId, param: param || null };
  }
  return { page: "home", param: null };
}

export function RouterProvider({ children }: { children: ReactNode }) {
  // Initialize lazily from URL hash so SSR + first render match
  const [currentPage, setCurrentPage] = useState<PageId>(() => readHashState().page);
  const [pageParam, setPageParam] = useState<string | null>(() => readHashState().param);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigate = useCallback(
    (page: PageId, param: string | null = null) => {
      if (page === currentPage && param === pageParam) return;
      setIsTransitioning(true);
      window.setTimeout(() => {
        setCurrentPage(page);
        setPageParam(param);
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        window.setTimeout(() => setIsTransitioning(false), 50);
      }, 600);
    },
    [currentPage, pageParam]
  );

  // Listen for back/forward button via hashchange
  useEffect(() => {
    const onHashChange = () => {
      const { page, param } = readHashState();
      setCurrentPage(page);
      setPageParam(param);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Sync hash when navigating (this is a controlled side-effect — we update
  // the URL bar, not React state)
  useEffect(() => {
    const newHash = pageParam ? `${currentPage}/${pageParam}` : currentPage;
    if (typeof window !== "undefined" && window.location.hash !== `#${newHash}`) {
      window.history.replaceState(null, "", `#${newHash}`);
    }
  }, [currentPage, pageParam]);

  return (
    <RouterContext.Provider
      value={{ currentPage, pageParam, navigate, isTransitioning }}
    >
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error("useRouter must be used within RouterProvider");
  }
  return ctx;
}
