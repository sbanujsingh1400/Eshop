'use client'
import React, { useEffect, useRef, useState } from "react";
// @ts-ignore
import "react-quill-new/dist/quill.snow.css"; // Import styles
import ReactQuill from "react-quill-new";

// NOTE: All logic and JSX structure are IDENTICAL.
// The className for the wrapper has been updated, and the inline CSS has been refined for a better dark theme.

const RichTextEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) => {
  // State to manage the editor's content
  const [editorValue, setEditorValue] = useState(value || "");
  // Ref to track if the component has mounted to prevent duplicate toolbars
  const quillRef = useRef(false);

  // This effect runs once after the component mounts
  useEffect(() => {
    // Check if this is the first mount
    if (!quillRef.current) {
      quillRef.current = true; // Mark as mounted

      // Fix: Ensure only one toolbar is present after hot-reloads
      // A short delay ensures Quill is fully initialized before we check
      setTimeout(() => {
        document
          .querySelectorAll(".ql-toolbar")
          .forEach((toolbar, index) => {
            // If more than one toolbar exists, remove the extras
            if (index > 0) {
              toolbar.remove();
            }
          });
      }, 100);
    }
  }, []); // Empty dependency array means this runs only once

  // Configuration for the Quill toolbar
  const modules = {
    toolbar: [
      [{ font: [] }], // Font picker
      [{ header: [1, 2, 3, 4, 5, 6, false] }], // Headers
      [{ size: ["small", false, "large", "huge"] }], // Font sizes
      ["bold", "italic", "underline", "strike"], // Basic text styling
      [{ color: [] }, { background: [] }], // Font & Background colors
      [{ script: "sub" }, { script: "super" }], // Subscript / Superscript
      [{ list: "ordered" }, { list: "bullet" }], // Lists
      [{ indent: "-1" }, { indent: "+1" }], // Indentation
      [{ align: [] }], // Text alignment
      ["blockquote", "code-block"], // Blockquote & Code Block
      ["link", "image", "video"], // Insert Link, Image, Video
      ["clean"], // Remove formatting
    ],
  };

  return (
    <div className="relative bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition">
      {/* ReactQuill component */}
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={(content) => {
          setEditorValue(content);
          onChange(content);
        }}
        modules={modules}
        placeholder="Write a detailed product description here..."
        className="[&_.ql-editor]:min-h-[250px]"
        // The style prop is removed in favor of the style block and wrapper classNames
      />

      {/* Inline styles to create a dark theme for the editor */}
      <style>
        {`
          .ql-toolbar {
            background: #1e293b; /* slate-800 */
            border-bottom: 1px solid #334155 !important; /* slate-700 */
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
            border: none !important;
          }
          .ql-container {
            background: transparent !important;
            color: #cbd5e1; /* slate-300 */
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
            border: none !important;
          }
          .ql-picker-label, .ql-picker-item {
            color: #cbd5e1 !important; /* slate-300 */
          }
          .ql-picker-options {
            background-color: #334155 !important; /* slate-700 */
            border-color: #475569 !important; /* slate-600 */
          }
          .ql-editor.ql-blank::before {
            color: #64748b !important; /* slate-500 */
            font-style: normal !important;
          }
          .ql-stroke {
            stroke: #cbd5e1 !important; /* slate-300 */
          }
          .ql-active .ql-stroke {
            stroke: #3b82f6 !important; /* blue-500 */
          }
          .ql-active .ql-fill {
            fill: #3b82f6 !important; /* blue-500 */
          }
        `}
      </style>
    </div>
  );
};

export default RichTextEditor;