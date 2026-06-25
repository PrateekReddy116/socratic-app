import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-2 last:mb-0">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-zinc-100">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic text-zinc-300">{children}</em>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc list-inside mb-2 space-y-0.5 text-zinc-300">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal list-inside mb-2 space-y-0.5 text-zinc-300">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li className="text-zinc-300">{children}</li>,
  code: ({ className, children }: { className?: string; children?: React.ReactNode }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <code className="block bg-zinc-950/80 border border-zinc-700/50 rounded-lg px-3 py-2 my-2 text-xs font-mono text-emerald-300/90 overflow-x-auto">
          {children}
        </code>
      );
    }
    return (
      <code className="bg-zinc-950/60 px-1.5 py-0.5 rounded text-xs font-mono text-emerald-300/90">
        {children}
      </code>
    );
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="my-2 overflow-x-auto">{children}</pre>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a href={href} className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2" target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-2 border-zinc-600 pl-3 my-2 text-zinc-400 italic">{children}</blockquote>
  ),
};

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-indigo-600/70 text-indigo-50 rounded-br-md shadow-sm shadow-indigo-900/20'
            : 'bg-zinc-800/50 text-zinc-200 rounded-bl-md border border-zinc-700/30'
        }`}
      >
        {!isUser && (
          <span className="block text-xs text-emerald-400/90 font-medium mb-1.5 tracking-wide">Socratic</span>
        )}
        {isUser ? (
          <span className="whitespace-pre-wrap">{content}</span>
        ) : (
          <div className="prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
