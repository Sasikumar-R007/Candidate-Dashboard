import { platformTerms } from "@/policies/platform-terms";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "wouter";
import staffosLogo from "@/assets/staffos logo 4.png";

type TermsSection = {
  title: string;
  slug: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function PlatformTermsPage() {
  const sections: TermsSection[] = useMemo(
    () =>
      Array.from(platformTerms.matchAll(/^##\s+(.+)$/gm), (match, index) => {
        const title = match[1].trim();
        return { title, slug: `${slugify(title)}-${index + 1}` };
      }),
    [],
  );
  const [activeSlug, setActiveSlug] = useState<string>(sections[0]?.slug || "");
  const contentSectionHeight = "calc(100vh - 36px)";

  useEffect(() => {
    if (!sections.length) return;

    const scrollRoot = document.getElementById("terms-content-scroll");
    if (!scrollRoot) return;

    const onScroll = () => {
      const rootTop = scrollRoot.getBoundingClientRect().top;
      let nextActive = sections[0]?.slug || "";
      let smallestDistance = Number.POSITIVE_INFINITY;

      for (const section of sections) {
        const el = document.getElementById(section.slug);
        if (!el) continue;
        const distance = Math.abs(el.getBoundingClientRect().top - rootTop - 24);
        if (distance < smallestDistance) {
          smallestDistance = distance;
          nextActive = section.slug;
        }
      }

      setActiveSlug(nextActive);
    };

    onScroll();
    scrollRoot.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollRoot.removeEventListener("scroll", onScroll);
  }, [sections]);

  let headingIndex = -1;

  return (
    <div className="h-screen overflow-y-auto scrollbar-hide scroll-smooth bg-[#dfe1f0]">
      <main className="w-full bg-[#eceef8] shadow-sm">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#3f2ca4] to-[#3b2b9f] pb-32 pt-6 text-white sm:pb-40 sm:pt-8">
          <div className="mx-auto flex max-w-[1360px] items-center justify-between border-b border-white/15 px-16 pb-4">
            <div className="flex items-center gap-1.5">
              <img src={staffosLogo} alt="StaffOS" className="h-11 w-auto object-contain" />
              <span className="text-base font-semibold text-white/95">StaffOS</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/90">
              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 1) window.history.go(-1);
                  else window.location.href = "/";
                }}
                className="transition hover:text-white hover:underline underline-offset-4"
              >
                Home
              </button>
              <Link href="/candidate-login" className="transition hover:text-white hover:underline underline-offset-4">
                Login
              </Link>
              <Link href="/employer-login" className="transition hover:text-white hover:underline underline-offset-4">
                Employee Login
              </Link>
              <a
                href="mailto:support@staffos.com"
                className="rounded-[8px] border border-white bg-white px-4 py-1.5 text-xs font-semibold text-[#3f2ca4] transition hover:bg-transparent hover:text-white"
              >
                Contact
              </a>
            </div>
          </div>

          <div className="mx-auto max-w-3xl px-6 pt-10 text-center sm:pt-12">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Platform Terms of Use</h1>
            <p className="mt-3 text-sm text-white/85 sm:text-lg">Effective May 10, 2026</p>
          </div>

          <svg
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            className="absolute inset-x-0 bottom-[-1px] h-52 w-full sm:h-64"
            aria-hidden="true"
          >
            <path
              fill="#eceef8"
              d="M0,48L80,74.7C160,101,320,155,480,186.7C640,219,800,229,960,208C1120,187,1280,133,1360,106.7L1440,80L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            />
          </svg>
        </section>

        <section
          className="sticky top-0 grid min-h-0 gap-4 px-15 pb-3 pt-1 sm:px-20 lg:grid-cols-[260px,1fr]"
          style={{ height: contentSectionHeight }}
        >
          <aside className="hidden min-h-0 rounded-lg bg-[#f6f7fd] p-6 lg:block">
            <div className="h-full overflow-y-auto scrollbar-hide space-y-3 pr-2">
              {sections.map((section) => {
                const isActive = activeSlug === section.slug;
                return (
                  <a
                    key={`sidebar-${section.slug}`}
                    href={`#${section.slug}`}
                    onClick={() => setActiveSlug(section.slug)}
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
            id="terms-content-scroll"
            className="min-h-0 overflow-y-auto scrollbar-hide rounded-lg bg-white px-6 py-8 sm:px-10 lg:py-10"
          >
            <div className="prose prose-gray max-w-none leading-8">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl" {...props} />
                  ),
                  h2: ({ node, ...props }) => {
                    headingIndex += 1;
                    const section = sections[headingIndex];
                    return (
                      <h2
                        id={section?.slug}
                        className="mt-2 mb-5 scroll-mt-24 text-2xl leading-tight font-semibold text-[#2f2f96] sm:text-3xl"
                        {...props}
                      />
                    );
                  },
                  h3: ({ node, ...props }) => (
                    <h3 className="mt-7 mb-3 text-xl font-semibold text-[#2f2f96]" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="mb-4 text-sm leading-7 text-[#33377b] sm:text-[15px]" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="mb-6 list-disc space-y-2 pl-7 text-[#33377b]" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="text-sm leading-7 sm:text-[15px]" {...props} />
                  ),
                  hr: ({ node, ...props }) => <hr className="my-8 border-[#d4d8ea]" {...props} />,
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold text-[#2e2f95]" {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a className="text-[#2e2f95] underline hover:text-[#3f2ca4]" {...props} />
                  ),
                }}
              >
                {platformTerms}
              </ReactMarkdown>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#d4d8ea] bg-[#eceef8] px-6 py-3 text-center text-xs text-[#54588e] sm:px-8">
          <p>StaffOS by ScalingTheory • Platform Terms of Use</p>
        </footer>
      </main>
    </div>
  );
}
