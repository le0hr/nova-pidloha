import type { ReactNode } from "react";
import type { HeroBlock } from "@/types/home";
import { heroLink } from "@/lib/catalog/hero";

export default function HeroBody({ blocks }: { blocks: HeroBlock[] }) {
  const render = (node: HeroBlock, index: number): ReactNode => {
    if (!node || typeof node !== "object") return null;
    const children = node.children?.map(render);
    if (node.type === "text") {
      let result: ReactNode = node.text ?? "";
      if (node.bold) result = <strong>{result}</strong>;
      if (node.italic) result = <em>{result}</em>;
      if (node.underline) result = <u>{result}</u>;
      if (node.strikethrough) result = <s>{result}</s>;
      return <span key={index}>{result}</span>;
    }
    if (node.type === "link") {
      const href = heroLink(node.url);
      return href ? <a key={index} href={href} className="underline">{children}</a> : <span key={index}>{children}</span>;
    }
    if (node.type === "list") return node.format === "ordered"
      ? <ol key={index} className="list-decimal pl-5">{children}</ol>
      : <ul key={index} className="list-disc pl-5">{children}</ul>;
    if (node.type === "list-item") return <li key={index}>{children}</li>;
    if (node.type === "heading") return <p key={index} className="text-xl font-bold">{children}</p>;
    if (node.type === "quote") return <blockquote key={index} className="border-l-2 pl-3">{children}</blockquote>;
    return <p key={index}>{children}</p>;
  };
  return <div className="space-y-2 text-sm leading-relaxed md:text-lg">{blocks.map(render)}</div>;
}
