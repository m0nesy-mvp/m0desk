import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Styled markdown renderer for knowledge notes.
 * Server-safe: no state, no browser APIs.
 */
export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose-custom text-[13.5px] leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
