import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import SimpleMDE to avoid SSR issues
const SimpleMDEEditor = dynamic(
  () =>
    import('react-simplemde-editor').then(mod => {
      // Import CSS only on client side
      import('simplemde/dist/simplemde.min.css');
      return mod;
    }),
  {
    ssr: false,
  }
);

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
  placeholder = 'Write your content here...',
  preview = 'edit',
  className = '',
  ...props
}) => {
  const options = {
    spellChecker: false,
    placeholder: placeholder,
    status: false,
    toolbar: [
      'bold',
      'italic',
      'heading',
      '|',
      'quote',
      'unordered-list',
      'ordered-list',
      '|',
      'link',
      'image',
      '|',
      'preview',
      'side-by-side',
      'fullscreen',
      '|',
      'guide',
    ],
    theme: 'dark',
  };

  return (
    <div className={`w-full ${className}`}>
      <SimpleMDEEditor value={value} onChange={onChange} options={options} {...props} />
      <style jsx global>{`
        /* Dark theme styling for SimpleMDE */
        .CodeMirror {
          background-color: #0d1117 !important;
          color: #c9d1d9 !important;
          border: 1px solid #30363d !important;
        }

        .CodeMirror-cursor {
          border-color: #c9d1d9 !important;
        }

        .CodeMirror-selected {
          background-color: #21262d !important;
        }

        .CodeMirror-gutters {
          background-color: #161b22 !important;
          border-right: 1px solid #30363d !important;
        }

        .CodeMirror-linenumber {
          color: #8b949e !important;
        }

        .editor-toolbar {
          background-color: #161b22 !important;
          border: 1px solid #30363d !important;
          border-bottom: none !important;
        }

        .editor-toolbar button {
          color: #c9d1d9 !important;
        }

        .editor-toolbar button:hover {
          background-color: #21262d !important;
        }

        .editor-toolbar button.active {
          background-color: #21262d !important;
        }

        .editor-preview {
          background-color: #0d1117 !important;
          color: #c9d1d9 !important;
        }

        .editor-preview h1,
        .editor-preview h2,
        .editor-preview h3,
        .editor-preview h4,
        .editor-preview h5,
        .editor-preview h6 {
          color: #c9d1d9 !important;
        }

        .editor-preview a {
          color: #58a6ff !important;
        }

        .editor-preview code {
          background-color: #21262d !important;
          color: #d4d4d4 !important;
        }

        .editor-preview pre {
          background-color: #1e1e1e !important;
          color: #d4d4d4 !important;
        }
      `}</style>
    </div>
  );
};

export default MarkdownEditor;
