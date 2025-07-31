import Editor from "@monaco-editor/react";
import './CodeEditor.css';
import React from "react";

export default function CodeEditor({handleCodeChange, value, handleLanguageChange, languageValue, darkMode}) {
    return (
            <div className="code-section">
                <div className="language-selection">
                    <label htmlFor="language">Language:</label>
                    <select value={languageValue} onChange={handleLanguageChange} name="codeLanguage"
                    style={darkMode ? {backgroundColor: '#1E1E1E', color: '#EDEDED'} : {backgroundColor: 'rgba(253, 245, 234, 255)'}}
                    >
                    <option value="" disabled>
                      -- Select a language --
                    </option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="java">Java</option>
                    </select>
                </div>
                <Editor
                height="300px"
                defaultLanguage={languageValue}
                value={value}
                onChange={handleCodeChange}
                theme={darkMode ? "vs-dark" : "vs-light"}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    scrollbar: {
                      vertical: 'auto',
                      horizontal: 'auto',
                    },
                  }}
                />
            </div>
    )
}