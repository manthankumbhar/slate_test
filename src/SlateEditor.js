import React, { useCallback, useMemo, useState } from "react";
import {
  createEditor,
  Editor,
  Transforms,
  Element as SlateElement,
} from "slate";
import { Slate, Editable, withReact } from "slate-react";

export default function SlateEditor() {
  const editor = useMemo(() => withReact(createEditor()), []);
  const LIST_TYPES = ["numbered-list", "bulleted-list"];
  const [value, setValue] = useState(
    JSON.parse(localStorage.getItem("content")) || [
      {
        type: "paragraph",
        children: [{ text: "A line of text in a paragraph." }],
      },
    ]
  );

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "block-quote":
        return (
          <blockquote
            {...props.attributes}
            style={{
              borderLeft: "2px solid grey",
              color: "grey",
              paddingLeft: "10px",
              marginLeft: "0px",
            }}
          >
            {props.children}
          </blockquote>
        );
      case "bulleted-list":
        return <ul {...props.attributes}>{props.children}</ul>;
      case "heading-one":
        return <h1 {...props.attributes}>{props.children}</h1>;
      case "heading-two":
        return <h2 {...props.attributes}>{props.children}</h2>;
      case "list-item":
        return <li {...props.attributes}>{props.children}</li>;
      case "numbered-list":
        return <ol {...props.attributes}>{props.children}</ol>;
      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) {
      children = <strong>{children}</strong>;
    }

    if (leaf.code) {
      children = (
        <code style={{ backgroundColor: "lightgray" }}>{children}</code>
      );
    }

    if (leaf.italic) {
      children = <em>{children}</em>;
    }

    if (leaf.underline) {
      children = <u>{children}</u>;
    }

    if (leaf.strikeThrough) {
      children = <del>{children}</del>;
    }

    return <span {...attributes}>{children}</span>;
  };

  const CustomEditor = {
    isMarkActive(editor, format) {
      const marks = Editor.marks(editor);
      return marks ? marks[format] === true : false;
    },

    isBlockActive(editor, format) {
      const { selection } = editor;
      if (!selection) return false;

      const [match] = Array.from(
        Editor.nodes(editor, {
          at: Editor.unhangRange(editor, selection),
          match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            n.type === format,
        })
      );

      return !!match;
    },

    toggleMark(editor, format) {
      const isActive = CustomEditor.isMarkActive(editor, format);
      if (isActive) {
        Editor.removeMark(editor, format);
      } else {
        Editor.addMark(editor, format, true);
      }
    },

    toggleBlock(editor, format) {
      const isActive = CustomEditor.isBlockActive(editor, format);
      const isList = LIST_TYPES.includes(format);

      Transforms.unwrapNodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          LIST_TYPES.includes(n.type),
        split: true,
      });
      const newProperties = {
        type: isActive ? "paragraph" : isList ? "list-item" : format,
      };
      Transforms.setNodes(editor, newProperties);

      if (!isActive && isList) {
        const block = { type: format, children: [] };
        Transforms.wrapNodes(editor, block);
      }
    },

    // toggleBoldMark(editor) {
    //   const isActive = CustomEditor.isActive(editor, "bold");
    //   Transforms.setNodes(
    //     editor,
    //     { type: isActive ? null : "bold" },
    //     { match: (n) => Text.isText(n), split: true }
    //   );
    // },

    // toggleCodeBlock(editor) {
    //   const isActive = CustomEditor.isActive(editor, "code");
    //   Transforms.setNodes(
    //     editor,
    //     { type: isActive ? null : "code" },
    //     { match: (n) => Text.isText(n), split: true }
    //   );
    // },

    // toggleItalicMark(editor) {
    //   const isActive = CustomEditor.isActive(editor, "italic");
    //   Transforms.setNodes(
    //     editor,
    //     { type: isActive ? null : "italic" },
    //     { match: (n) => Text.isText(n), split: true }
    //   );
    // },

    // toggleUnderlineMark(editor) {
    //   const isActive = CustomEditor.isActive(editor, "underline");
    //   Transforms.setNodes(
    //     editor,
    //     { type: isActive ? null : "underline" },
    //     { match: (n) => Text.isText(n), split: true }
    //   );
    // },

    // toggleStrikeThroughMark(editor) {
    //   const isActive = CustomEditor.isActive(editor, "strikeThrough");
    //   Transforms.setNodes(
    //     editor,
    //     { type: isActive ? null : "strikeThrough" },
    //     { match: (n) => Text.isText(n), split: true }
    //   );
    // },

    // toggleHeadingOneMark(editor) {
    //   const isActive = CustomEditor.isBlockActive(editor, "heading-one");
    //   Transforms.setNodes(
    //     editor,
    //     { type: isActive ? "paragraph" : "heading-one" },
    //     { match: (n) => Editor.isBlock(editor, n) }
    //   );
    // },

    // toggleHeadingTwoMark(editor) {
    //   const isActive = CustomEditor.isBlockActive(editor, "heading-two");
    //   Transforms.setNodes(
    //     editor,
    //     { type: isActive ? "paragraph" : "heading-two" },
    //     { match: (n) => Editor.isBlock(editor, n) }
    //   );
    // },

    // toggleBulletedListMark(editor) {
    //   const isActive = CustomEditor.isBlockActive(editor, "bulleted-list");
    //   Transforms.setNodes(
    //     editor,
    //     { type: isActive ? "paragraph" : "bulleted-list" },
    //     { match: (n) => Editor.isBlock(editor, n) }
    //   );
    // },

    // toggleNumberedListMark(editor) {
    //   const isActive = CustomEditor.isBlockActive(editor, "list-item");
    //   const isList = LIST_TYPES.includes("numbered-list");
    //   const newProperties = {
    //     type: isActive ? "paragraph" : isList ? "list-item" : "paragraph",
    //   };
    //   Transforms.setNodes(editor, newProperties);
    //   if (!isActive && isList) {
    //     const block = { type: "numbered-list", children: [] };
    //     Transforms.wrapNodes(editor, block);
    //   }
    // },

    // toggleBlockQuoteMark(editor) {
    //   const isActive = CustomEditor.isBlockActive(editor, "block-quote");
    //   Transforms.setNodes(
    //     editor,
    //     { type: isActive ? "paragraph" : "block-quote" },
    //     { match: (n) => Editor.isBlock(editor, n) }
    //   );
    // },
  };

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
        const isAstChange = editor.operations.some(
          (op) => "set_selection" !== op.type
        );
        if (isAstChange) {
          const content = JSON.stringify(newValue);
          localStorage.setItem("content", content);
        }
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          marginTop: "20px",
        }}
      >
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleMark(editor, "bold");
          }}
        >
          Bold
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleMark(editor, "code");
          }}
        >
          Code Block
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleMark(editor, "italic");
          }}
        >
          Italic
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleMark(editor, "strikeThrough");
          }}
        >
          Strike Through
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleBlock(editor, "heading-one");
          }}
        >
          h1
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleBlock(editor, "heading-two");
          }}
        >
          h2
        </button>
        {/* <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleBlock(editor, "")
          }}
        >
          ordered
        </button> */}
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleBlock(editor, "numbered-list");
          }}
        >
          numbered
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleBlock(editor, "bulleted-list");
          }}
        >
          bullets
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleBlock(editor, "block-quote");
          }}
        >
          quote
        </button>
      </div>
      <Editable
        style={{
          border: "1px solid black",
          margin: "20px",
          borderRadius: "5px",
          backgroundColor: "#F0F0F0",
          textAlign: "left",
          padding: "10px",
        }}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(event) => {
          if (!event.ctrlKey) {
            return;
          }
          switch (event.key) {
            case "`": {
              event.preventDefault();
              CustomEditor.toggleMark(editor, "code");
              break;
            }

            case "b": {
              event.preventDefault();
              CustomEditor.toggleMark(editor, "bold");
              break;
            }

            case "i": {
              event.preventDefault();
              CustomEditor.toggleMark(editor, "italic");
              break;
            }

            case "u": {
              event.preventDefault();
              CustomEditor.toggleMark(editor, "underline");
              break;
            }

            default: {
              return null;
            }
          }
        }}
      />
    </Slate>
  );
}
