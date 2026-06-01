import { employeeAgreement } from "@/policies/employee-agreement";
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

export default function EmployeeAgreementPage() {
  const sections = useMemo(
    () =>
      Array.from(employeeAgreement.matchAll(/^##\s+(.+)$/gm), (match, index) => {
        const title = match[1].trim();
        return { title, slug: `${slugify(title)}-${index + 1}` };
      }),
    [],
  );
  const [activeSlug, setActiveSlug] = useState<string>(sections[0]?.slug || "");

  useEffect(() => {
    if (!sections.length) return;

    const scrollRoot = document.getElementById("employee-content-scroll");
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
      title="Employee Compliance Agreement"
      footerLabel="StaffOS by ScalingTheory • Employee Compliance Agreement"
      contentScrollId="employee-content-scroll"
      sections={sections}
      activeSlug={activeSlug}
      onSectionClick={setActiveSlug}
    >
      <PolicyMarkdownProse markdown={employeeAgreement} sections={sections} />
    </PolicyPageLayout>
  );
}
