import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import EmbeddedProduct from '@/components/product/embedded-product';
import Image from 'next/image';

// Custom renderer for product embeds
const renderers = {
  code: ({ children = '', className = '', ...props }) => {
    const language = className.replace('language-', '');
    if (language === 'product') {
      const handle = children.trim();
      return <EmbeddedProduct handle={handle} />;
    }
    // Default rendering for other code blocks
    return (
      <code {...props} className={className}>
        {children}
      </code>
    );
  },
};

const MarkdownDisplay = ({ content, className = '' }) => {
  if (!content) return null;

  return (
    <div className={`markdown-body bg-gray-900 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />,
          img: ({ node, ...props }) => (
            <Image
              {...props}
              className="max-w-full rounded my-2"
              alt={props.alt || ''}
              width={props.width || 500}
              height={props.height || 300}
            />
          ),
          ...renderers,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownDisplay;
