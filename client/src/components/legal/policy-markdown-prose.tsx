import ReactMarkdown from "react-markdown";
import type { PolicySection } from "./policy-page-layout";

type PolicyMarkdownProseProps = {
  markdown: string;
  sections: PolicySection[];
};

export function PolicyMarkdownProse({ markdown, sections }: PolicyMarkdownProseProps) {
  let headingIndex = -1;

  return (
    <div className="prose prose-gray max-w-none leading-8">
      <ReactMarkdown
        components={{
          h1: ({ ...props }) => (
            <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl" {...props} />
          ),
          h2: ({ ...props }) => {
            headingIndex += 1;
            const section = sections[headingIndex];
            return (
              <h2
                id={section?.slug}
                className="mt-2 mb-5 scroll-mt-28 text-xl leading-tight font-semibold text-[#2f2f96] sm:scroll-mt-24 sm:text-2xl lg:text-3xl"
                {...props}
              />
            );
          },
          h3: ({ ...props }) => (
            <h3 className="mt-7 mb-3 text-lg font-semibold text-[#2f2f96] sm:text-xl" {...props} />
          ),
          p: ({ ...props }) => (
            <p className="mb-4 text-sm leading-7 text-[#33377b] sm:text-[15px]" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="mb-6 list-disc space-y-2 pl-6 text-[#33377b] sm:pl-7" {...props} />
          ),
          li: ({ ...props }) => (
            <li className="text-sm leading-7 sm:text-[15px]" {...props} />
          ),
          hr: ({ ...props }) => <hr className="my-8 border-[#d4d8ea]" {...props} />,
          strong: ({ ...props }) => (
            <strong className="font-semibold text-[#2e2f95]" {...props} />
          ),
          a: ({ ...props }) => (
            <a className="text-[#2e2f95] underline hover:text-[#3f2ca4]" {...props} />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
