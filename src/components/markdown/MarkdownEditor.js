import React from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import 'github-markdown-css/github-markdown-dark.css';

// Custom theme for MDEditor
const mdEditorDarkTheme = {
  markdown: '#fff',
  markdownH1: '#fff',
  markdownH2: '#fff',
  markdownH3: '#fff',
  markdownH4: '#fff',
  markdownH5: '#fff',
  markdownH6: '#fff',
  markdownParagraph: '#fff',
  markdownLink: '#58a6ff',
  markdownCode: '#fff',
  markdownList: '#fff',
  markdownBlockquote: '#fff',
  markdownTable: '#fff',
};

// Dynamically import MDEditor with custom theming
const MDEditor = dynamic(() => import('@uiw/react-md-editor').then(mod => {
  // Override the module's default theme
  if (mod.default) {
    mod.default.Markdown = {
      ...mod.default.Markdown,
      ...mdEditorDarkTheme
    };
  }
  return mod;
}), {
  ssr: false,
});

/**
 * A reusable markdown editor component with proper dark mode styling
 * 
 * @param {Object} props
 * @param {string} props.value - The markdown content
 * @param {Function} props.onChange - Callback function when content changes
 * @param {number} props.height - Height of the editor (default: 300)
 * @param {string} props.placeholder - Placeholder text for the editor
 * @param {string} props.preview - Preview mode ('edit', 'preview', 'live') (default: 'edit')
 * @param {string} props.className - Additional class names
 * @returns {JSX.Element}
 */
const MarkdownEditor = ({ 
  value, 
  onChange, 
  height = 300,
  placeholder = "Write your content here...",
  preview = "edit",
  className = "",
  ...props
}) => {
  return (
    <div data-color-mode="dark" className={`w-full ${className}`} style={{ colorScheme: 'dark' }}>
      <MDEditor
        value={value}
        onChange={onChange}
        height={height}
        preview={preview}
        className="md-editor-dark"
        textareaProps={{
          placeholder,
          style: { color: "white" }
        }}
        {...props}
      />
      <style jsx global>{`
        /* Force all text to white in editor */
        .w-md-editor * {
          color: white !important;
        }
        
        /* Reset preview text color */
        .w-md-editor-preview * {
          color: #c9d1d9 !important;
        }
        
        /* Editor backgrounds */
        .md-editor-dark {
          background-color: #0d1117 !important;
        }
        
        .w-md-editor-text-input {
          caret-color: white !important;
          -webkit-text-fill-color: white !important;
          color: white !important;
        }
        
        .w-md-editor-toolbar {
          background-color: #161b22 !important;
          border-bottom: 1px solid #30363d !important;
        }
        
        /* Preview styling */
        .w-md-editor-preview {
          background-color: #0d1117 !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        }
        
        /* Make code blocks maintain their styling */
        .w-md-editor-preview pre {
          background-color: #1e1e1e !important;
          color: #d4d4d4 !important;
          padding: 1em !important;
          border-radius: 5px !important;
        }
        
        .w-md-editor-preview code {
          font-family: 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace !important;
          color: #d4d4d4 !important;
        }
        
        /* Force anything with text-rendering to be white */
        [style*="text-rendering"] {
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default MarkdownEditor; 