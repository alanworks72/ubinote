import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Preview.css';

const Preview = ({ content }) => {
  return (
    <div className="preview-container">
      <div className="preview-header">
        <h3>Preview</h3>
      </div>
      <div className="preview-content">
        {content.trim() ? (
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code({node, inline, className, children, ...props}) {
                return (
                  <code className={inline ? 'inline-code' : 'block-code'} {...props}>
                    {children}
                  </code>
                );
              },
              pre({children}) {
                return <pre className="code-block">{children}</pre>;
              }
            }}
          >
            {content}
          </ReactMarkdown>
        ) : (
          <div className="empty-preview">
            Start typing to see the preview...
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;