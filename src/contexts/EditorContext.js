import React, { createContext, useContext, useState } from 'react';

const EditorContext = createContext();

export const EditorProvider = ({ children }) => {
  const [editorState, setEditorState] = useState({
    zoom: 1,
    rotation: 0,
    position: { x: 0.5, y: 0.5 },
    dimensions: {
      width: 0,
      height: 0,
      zoom: 1,
      dpi_ratio: 1
    }
  });

  return (
    <EditorContext.Provider value={{ editorState, setEditorState }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => useContext(EditorContext);