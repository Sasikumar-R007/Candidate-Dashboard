import { useState } from "react";
import { ChevronLeft, Menu, X } from "lucide-react";
import { Link } from "wouter";
import staffosLogo from "@/assets/staffos logo 4.png";
import type { ReactNode } from "react";

export type PolicySection = {
  title: string;
  slug: string;
};

type PolicyPageLayoutProps = {
  title: string;
  effectiveDate?: string;
  footerLabel: string;
  contentScrollId: string;
  sections: PolicySection[];
  activeSlug: string;
  onSectionClick: (slug: string) => void;
  children: ReactNode;
  showCandidateLogin?: boolean;
  titleClassName?: string;
};

function goBack() {
  if (window.history.length > 1) window.history.go(-1);
  else window.location.href = "/";
}

export function PolicyPageLayout({
  title,
  effectiveDate = "Effective May 10, 2026",
  footerLabel,
  contentScrollId,
  sections,
  activeSlug,
  onSectionClick,
  children,
  showCandidateLogin = true,
  titleClassName = "",
}: PolicyPageLayoutProps) {
  const [navMenuOpen, setNavMenuOpen] = useState(false);

  const closeNavMenu = () => setNavMenuOpen(false);

  return (
    <div className="min-h-screen overflow-y-auto scrollbar-hide scroll-smooth bg-[#dfe1f0]">
      <main className="w-full bg-[#eceef8] shadow-sm">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#3f2ca4] to-[#3b2b9f] pb-20 pt-4 text-white sm:pb-28 sm:pt-6 lg:pb-40 lg:pt-8">
          <div className="relative z-[2] mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-16">
            <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-3 sm:pb-4">
              <div className="flex min-w-0 items-center gap-1.5">
                <img
                  src={staffosLogo}
                  alt="StaffOS"
                  className="h-8 w-auto object-contain sm:h-11"
                />
                <span className="truncate text-sm font-semibold text-white/95 sm:text-base">
                  StaffOS
                </span>
              </div>

              <button
                type="button"
                onClick={() => setNavMenuOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <nav className="hidden flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90 lg:flex">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-1 transition hover:text-white hover:underline underline-offset-4"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                  Back
                </button>
                <Link href="/" className="transition hover:text-white hover:underline underline-offset-4">
                  Home
                </Link>
                {showCandidateLogin && (
                  <Link
                    href="/candidate-login"
                    className="transition hover:text-white hover:underline underline-offset-4"
                  >
                    Login
                  </Link>
                )}
                <Link
                  href="/employer-login"
                  className="transition hover:text-white hover:underline underline-offset-4"
                >
                  Employer
                </Link>
                <a
                  href="mailto:support@staffos.com"
                  className="rounded-[8px] border border-white bg-white px-4 py-1.5 text-xs font-semibold text-[#3f2ca4] transition hover:bg-transparent hover:text-white"
                >
                  Contact
                </a>
              </nav>
            </div>
          </div>

          {navMenuOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
                onClick={closeNavMenu}
              />
              <div className="fixed right-0 top-0 z-[61] flex h-full w-[min(100vw-3rem,280px)] flex-col bg-white shadow-2xl lg:hidden">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                  <span className="text-sm font-bold text-gray-900">Menu</span>
                  <button
                    type="button"
                    onClick={closeNavMenu}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="flex flex-col gap-1 p-3">
                  <button
                    type="button"
                    onClick={() => {
                      closeNavMenu();
                      goBack();
                    }}
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-500" />
                    Back
                  </button>
                  <Link
                    href="/"
                    onClick={closeNavMenu}
                    className="rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    Home
                  </Link>
                  {showCandidateLogin && (
                    <Link
                      href="/candidate-login"
                      onClick={closeNavMenu}
                      className="rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                    >
                      Login
                    </Link>
                  )}
                  <Link
                    href="/employer-login"
                    onClick={closeNavMenu}
                    className="rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    Employer Login
                  </Link>
                  <a
                    href="mailto:support@staffos.com"
                    onClick={closeNavMenu}
                    className="mx-1 mt-2 rounded-[8px] border border-[#3f2ca4] bg-[#3f2ca4] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#352394]"
                  >
                    Contact
                  </a>
                </nav>
              </div>
            </>
          )}

          <div className="relative z-[1] mx-auto max-w-3xl px-4 pt-6 text-center sm:px-6 sm:pt-10 lg:pt-12">
            <h1
              className={`text-2xl font-semibold tracking-tight sm:text-4xl lg:text-6xl ${titleClassName}`}
            >
              {title}
            </h1>
            <p className="mt-2 text-xs text-white/85 sm:mt-3 sm:text-base lg:text-lg">
              {effectiveDate}
            </p>
          </div>

          <svg
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-24 w-full sm:h-36 lg:h-52"
            aria-hidden
          >
            <path
              fill="#eceef8"
              d="M0,48L80,74.7C160,101,320,155,480,186.7C640,219,800,229,960,208C1120,187,1280,133,1360,106.7L1440,80L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            />
          </svg>
        </section>

        <section className="grid min-h-0 gap-3 px-4 pb-6 pt-2 sm:gap-4 sm:px-6 lg:sticky lg:top-0 lg:grid-cols-[260px,1fr] lg:gap-4 lg:px-8 lg:pb-3 lg:pt-1 xl:px-16 lg:[height:calc(100vh-2.25rem)]">
          <aside className="hidden min-h-0 rounded-lg bg-[#f6f7fd] p-4 lg:block lg:p-6">
            <div className="h-full max-h-[calc(100vh-14rem)] overflow-y-auto scrollbar-hide space-y-3 pr-2">
              {sections.map((section) => {
                const isActive = activeSlug === section.slug;
                return (
                  <a
                    key={`sidebar-${section.slug}`}
                    href={`#${section.slug}`}
                    onClick={() => onSectionClick(section.slug)}
                    className={`block border-b pb-2 text-sm leading-6 tracking-tight transition ${
                      isActive
                        ? "border-[#ea6f66] text-[#2c2d93]"
                        : "border-transparent text-[#2f318f] hover:border-[#ea6f66]/70"
                    }`}
                  >
                    {section.title}
                  </a>
                );
              })}
            </div>
          </aside>

          <div
            id={contentScrollId}
            className="min-h-[40vh] overflow-y-auto scrollbar-hide rounded-lg bg-white px-4 py-6 sm:px-8 sm:py-8 lg:col-span-1 lg:min-h-0 lg:max-h-[calc(100vh-14rem)] lg:px-10 lg:py-10"
          >
            {children}
          </div>
        </section>

        <footer className="border-t border-[#d4d8ea] bg-[#eceef8] px-4 py-3 text-center text-xs text-[#54588e] sm:px-8">
          <p>{footerLabel}</p>
        </footer>
      </main>
    </div>
  );
}
