import { clientAgreement } from "@/policies/client-agreement";
import { useEffect, useMemo, useState } from "react";
import { PolicyPageLayout } from "@/components/legal/policy-page-layout";
import { PolicyMarkdownProse } from "@/components/legal/policy-markdown-prose";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function ClientAgreementPage() {
  const sections = useMemo(
    () =>
      Array.from(clientAgreement.matchAll(/^##\s+(.+)$/gm), (match, index) => {
        const title = match[1].trim();
        return { title, slug: `${slugify(title)}-${index + 1}` };
      }),
    [],
  );
  const [activeSlug, setActiveSlug] = useState<string>(sections[0]?.slug || "");

  useEffect(() => {
    if (!sections.length) return;

    const scrollRoot = document.getElementById("client-agreement-content-scroll");
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

  return (
    <PolicyPageLayout
      title="Client Access Agreement"
      footerLabel="StaffOS by ScalingTheory • Client Access Agreement"
      contentScrollId="client-agreement-content-scroll"
      sections={sections}
      activeSlug={activeSlug}
      onSectionClick={setActiveSlug}
      titleClassName="sm:whitespace-nowrap"
    >
      <PolicyMarkdownProse markdown={clientAgreement} sections={sections} />
    </PolicyPageLayout>
  );
}
