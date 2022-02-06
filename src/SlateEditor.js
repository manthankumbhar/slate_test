import React, { useCallback, useMemo, useState } from "react";
import { createEditor, Editor, Transforms, Text } from "slate";
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
        return <li {...props.attributes}>{props.children}</li>;
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
    isBoldMarkActive(editor) {
      const [match] = Editor.nodes(editor, {
        match: (n) => n.bold === true,
        universal: true,
      });

      return !!match;
    },

    isCodeBlockActive(editor) {
      const [match] = Editor.nodes(editor, {
        match: (n) => n.code === true,
        universal: true,
      });

      return !!match;
    },

    isItalicActive(editor) {
      const [match] = Editor.nodes(editor, {
        match: (n) => n.italic === true,
        universal: true,
      });

      return !!match;
    },

    isUnderlineActive(editor) {
      const [match] = Editor.nodes(editor, {
        match: (n) => n.underline === true,
        universal: true,
      });

      return !!match;
    },

    isStrikeThroughActive(editor) {
      const [match] = Editor.nodes(editor, {
        match: (n) => n.strikeThrough === true,
        universal: true,
      });

      return !!match;
    },

    isHeadingOneActive(editor) {
      const [match] = Editor.nodes(editor, {
        match: (n) => n.type === "heading-one",
        universal: true,
      });

      return !!match;
    },

    isHeadingTwoActive(editor) {
      const [match] = Editor.nodes(editor, {
        match: (n) => n.type === "heading-two",
        universal: true,
      });

      return !!match;
    },

    isBulletedListActive(editor) {
      const [match] = Editor.nodes(editor, {
        match: (n) => n.type === "bulleted-list",
        universal: true,
      });

      return !!match;
    },

    isNumberedListActive(editor) {
      const [match] = Editor.nodes(editor, {
        match: (n) => n.type === "list-item",
        universal: true,
      });

      return !!match;
    },

    isBlockQuoteActive(editor) {
      const [match] = Editor.nodes(editor, {
        match: (n) => n.type === "block-quote",
        universal: true,
      });

      return !!match;
    },

    toggleBoldMark(editor) {
      const isActive = CustomEditor.isBoldMarkActive(editor);
      Transforms.setNodes(
        editor,
        { bold: isActive ? null : true },
        { match: (n) => Text.isText(n), split: true }
      );
    },

    toggleCodeBlock(editor) {
      const isActive = CustomEditor.isCodeBlockActive(editor);
      Transforms.setNodes(
        editor,
        { code: isActive ? null : true },
        { match: (n) => Text.isText(n), split: true }
      );
    },

    toggleItalicMark(editor) {
      const isActive = CustomEditor.isItalicActive(editor);
      Transforms.setNodes(
        editor,
        { italic: isActive ? null : true },
        { match: (n) => Text.isText(n), split: true }
      );
    },

    toggleUnderlineMark(editor) {
      const isActive = CustomEditor.isUnderlineActive(editor);
      Transforms.setNodes(
        editor,
        { underline: isActive ? null : true },
        { match: (n) => Text.isText(n), split: true }
      );
    },

    toggleStrikeThroughMark(editor) {
      const isActive = CustomEditor.isStrikeThroughActive(editor);
      Transforms.setNodes(
        editor,
        { strikeThrough: isActive ? null : true },
        { match: (n) => Text.isText(n), split: true }
      );
    },

    toggleHeadingOneMark(editor) {
      const isActive = CustomEditor.isHeadingOneActive(editor);
      Transforms.setNodes(
        editor,
        { type: isActive ? "paragraph" : "heading-one" },
        { match: (n) => Editor.isBlock(editor, n) }
      );
    },

    toggleHeadingTwoMark(editor) {
      const isActive = CustomEditor.isHeadingTwoActive(editor);
      Transforms.setNodes(
        editor,
        { type: isActive ? "paragraph" : "heading-two" },
        { match: (n) => Editor.isBlock(editor, n) }
      );
    },

    toggleBulletedListMark(editor) {
      const isActive = CustomEditor.isBulletedListActive(editor);
      Transforms.setNodes(
        editor,
        { type: isActive ? "paragraph" : "bulleted-list" },
        { match: (n) => Editor.isBlock(editor, n) }
      );
    },

    toggleNumberedListMark(editor) {
      const isActive = CustomEditor.isNumberedListActive(editor);
      const isList = LIST_TYPES.includes("numbered-list");
      const newProperties = {
        type: isActive ? "paragraph" : isList ? "list-item" : "paragraph",
      };
      Transforms.setNodes(editor, newProperties);
      if (!isActive && isList) {
        const block = { type: "numbered-list", children: [] };
        Transforms.wrapNodes(editor, block);
      }
    },

    toggleBlockQuoteMark(editor) {
      const isActive = CustomEditor.isBlockQuoteActive(editor);
      Transforms.setNodes(
        editor,
        { type: isActive ? "paragraph" : "block-quote" },
        { match: (n) => Editor.isBlock(editor, n) }
      );
    },
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
            CustomEditor.toggleBoldMark(editor);
          }}
        >
          Bold
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleCodeBlock(editor);
          }}
        >
          Code Block
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleItalicMark(editor);
          }}
        >
          Italic
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleStrikeThroughMark(editor);
          }}
        >
          Strike Through
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleHeadingOneMark(editor);
          }}
        >
          h1
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleHeadingTwoMark(editor);
          }}
        >
          h2
        </button>
        {/* <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleNumberedListMark(editor);
          }}
        >
          ordered
        </button> */}
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleNumberedListMark(editor);
          }}
        >
          numbered
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleBulletedListMark(editor);
          }}
        >
          bullets
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleBlockQuoteMark(editor);
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
              CustomEditor.toggleCodeBlock(editor);
              break;
            }

            case "b": {
              event.preventDefault();
              CustomEditor.toggleBoldMark(editor);
              break;
            }

            case "i": {
              event.preventDefault();
              CustomEditor.toggleItalicMark(editor);
              break;
            }

            case "u": {
              event.preventDefault();
              CustomEditor.toggleUnderlineMark(editor);
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
