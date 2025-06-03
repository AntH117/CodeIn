import Editor from "@monaco-editor/react";
import './CodeEditor.css';
import React from "react";

export default function CodeEditor({handleChange, value}) {
    const [language, setLanguage] = React.useState()
    
    return (
            <div className="code-section">
                <div className="language-selection">
                    <label htmlFor="language">Language:</label>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="java">Java</option>
                    </select>
                </div>

                <Editor
                height="300px"
                defaultLanguage={language}
                value={value}
                onChange={handleChange}
                theme="vs-light"
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                  }}
                />
            </div>
    )
}