import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import 'github-markdown-css/github-markdown-dark.css';

const MarkdownDisplay = ({ content, className = "" }) => {
  if (!content) return null;
  
  return (
    <div className={`markdown-body bg-gray-900 ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" {...props} />,
          img: ({node, ...props}) => <img {...props} className="max-w-full rounded my-2" />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownDisplay; 