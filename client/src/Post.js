import './Post.css';
import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import image_upload from './images/image_upload.png'
import file_upload from './images/file-upload.png'
import { v4 as uuidv4 } from 'uuid';
import Icons from './icons/Icons';
import { useAuth } from "./AuthContext";
import Editor from "@monaco-editor/react";
import CodeEditor from './CodeEditor';

export default function Post() {
    const { user } = useAuth();
    const APILINK = `http://localhost:5000/api/v1/codeIn`

    const navigate = useNavigate();
    const [formData, setFormData] = React.useState({
        title: '',
        visibility: 'Public',
        paragraph: '',
        codeSnippet: null,
        codeLanguage: 'javascript',
        files: []
    })
    console.log(formData)
    const [submissionConditions, setSubmissionConditions] = React.useState({
        titleLengthMin: null,
        titleLengthMax: null,
        titleCharacters: null,
        paragraphCharacters: null,
    })

    const [fileConditions, setFileConditions] = React.useState({
        fileSize: null,
        fileType: null
    })

    const errorMessages = {
        titleLengthMin: 'Please include a title',
        titleLengthMax: 'Title must not be more than 30 characters',
        titleCharacters: 'Title contains invalid characters',
        fileSize: 'File must be less than 35mb',
        fileType: 'Invalid file format',
        paragraphCharacters: 'Paragraph contains invalid characters'
    }
    
    const savePost = async (newPost) => {
        const postWithTime = {
            ...newPost,
            time: new Date().toISOString(),
            postId: uuidv4(),
            socials: {
                likes: 0,
                comments: 0,
                shares: 0
            }
        }
        try {
            const response = await fetch(`${APILINK}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postContent: postWithTime,
                    user: user.uid
                }),
            });
            
            const result = await response.json();
            if (result.status === 'success') {
                alert('Post successfully saved')
                navigate('/')
            } else {
                console.error('Backend Error', result.error)
            }
        } catch (e) {
            console.error('failed to save post:', e)
        }
      };
    //validate if all post conditions are met
    function validatePost(postData) {
        const conditions = {
            titleLengthMin: postData.title?.length > 0,
            titleLengthMax: postData.title?.length <= 30,
            titleCharacters: /^[a-zA-Z0-9 !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(postData?.title),
        }
        setSubmissionConditions(conditions)
        const allTrue = Object.values(conditions).every(value => value === true);
        if (allTrue) {
            savePost(formData)
        } else {
            return
        }
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        //file conditions
        const validFiles = [  
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/gif",
            "application/pdf",
            "application/javascript",   // for .js
            "text/javascript",          // sometimes also used for .js
            "text/css",                 // for .css
            "text/html",                // for .html
            "application/json",         // for .json
            "text/plain",    ]
            const maxFileSizeMb = 35;
        
        const valid = {
            fileSize: file.size <= maxFileSizeMb * 1024 * 1024, 
            fileType: validFiles.includes(file.type),
        }
        setFileConditions(valid)
        const allTrue = Object.values(valid).every(value => value === true);
        if (!allTrue) {
            return
        }

        //post file
        const form = new FormData();
        form.append('file', file);

        const res = await fetch(`${APILINK}/temp-upload`, {
            method: 'POST',
            body: form
        });

        const data = await res.json();
            setFormData((preVal) => ({
                ...preVal,
                files: [...preVal.files, data.filePath]
        }))
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        e.preventDefault();
        setFormData((preVal) => ({
            ...preVal,
            [name]: value
        }))
      };

    const handleCodeChange = (value) => {
        setFormData((preVal) => ({
            ...preVal,
            ['codeSnippet']: value
        }))
    }

    const visibilityTypes = ['Public', 'Friends', 'Private']
    const imageInputRef = React.useRef();
    const fileInputRef = React.useRef();
    const handleImageClick = () => {
        imageInputRef.current.click();
    }
    const handleFileClick = () => {
        fileInputRef.current.click();
    }
    //IMPORTS
    function FileImports({name}) {
        const uniqueFile = name.split('/').at(-1)
        const originalName = name.slice(50)
        const deleteTempFile = async (e) => {
            const res = await fetch(`${APILINK}/temp-upload`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fileName: uniqueFile
                })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setFormData((preVal) => ({
                    ...preVal,
                    files: preVal.files.filter((x) => x !== name)
                }))
            } else {
                console.error('Unable to delete file')
            }
        }

        return <div className='file-import-body'>
            <div className='file-import-name'>
                <p>
                    {originalName}
                </p>
            </div>
            <div className='file-import-delete' onClick={() => deleteTempFile()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                </svg>
            </div>
        </div>
    }
    const cancelPost = async() => {
        if (formData.files.length > 0) {
            const deleteRequests = formData.files.map(async (filePath) => {
                const uniqueFile = filePath.split('/').at(-1)
                const res = await fetch(`${APILINK}/temp-upload`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ fileName: uniqueFile })
                });
        
                const data = await res.json();
                if (data.status !== 'success') {
                    console.error(`Failed to delete: ${uniqueFile}`);
                }
            });
            await Promise.all(deleteRequests);
        }
    }
    
    const [toggle, setToggle] = React.useState({
        description: null,
        codeSnippet: null
    })
    const handleToggle = (e) => {
       const {name} = e.target;
       e.preventDefault()
       setToggle((preVal) => {
        return {
            ...preVal,
            [name]: toggle[name] == null ? true : !toggle[name]
        }
       })
    }

    return <div className='post-outer-body'>
        <div className='post-body'>
        <button className='cancel-button' onClick={() => {
            cancelPost();
            navigate('/')
        }}>
            <Icons.X />
        </button>
        <form className='form-body'>
            <h2>Create a New Post</h2>
            <div className='form-top'>
                <div className='form-title'>
                    <h3>Title</h3>
                    <input type='text' className='form-title-input' name='title' onChange={handleChange}></input>
                    <div className='form-title-error'>
                        {submissionConditions.titleLengthMin === false && errorMessages.titleLengthMin}
                        {submissionConditions.titleLengthMax === false && errorMessages.titleLengthMax}
                        {submissionConditions.titleCharacters === false && errorMessages.titleCharacters}
                    </div>
                </div>
                <div className='form-visibility'>
                    <h3 className='form-visibility-title'>Visibility</h3>
                   <select name='visibility' onChange={handleChange}>
                        {visibilityTypes.map((x) => (
                            <option key={x} value={x}>
                                {x}
                            </option>
                        ))}
                   </select>
                </div>
            </div>
            <div className='form-description'>
                <div className='form-description-toggle'>
                    <h3 className='form-description-title'>Description</h3>
                    <button className='form-toggle-button' name='description' onClick={handleToggle}>
                        {toggle.description ? <Icons.Minus /> : <Icons.Plus />}
                    </button>
                </div>
                <textarea className={`form-paragraph ${toggle.description !== null ? toggle.description ? 'open' : 'closed' : ''}`} name='paragraph' onChange={handleChange} disabled={!toggle.description}>
                </textarea>
                {submissionConditions.paragraphCharacters === false && <div className='form-paragraph-error'>
                    <p>{errorMessages.paragraphCharacters}</p>
                </div>}
            </div>
            <div className='form-description'>
                <div className='form-description-toggle'>
                    <h3 className='form-description-title'>Code snippet</h3>
                    <button className='form-toggle-button' name='codeSnippet' onClick={handleToggle}>
                        {toggle.codeSnippet ? <Icons.Minus /> : <Icons.Plus />}
                    </button>
                </div>
                <div className={`form-code-editor ${toggle.codeSnippet !== null ? toggle.codeSnippet ? 'open' : 'closed' : ''}`}>
                 <CodeEditor handleCodeChange={handleCodeChange} value={formData.codeSnippet} handleLanguageChange={handleChange}/>  
                </div>
                {submissionConditions.paragraphCharacters === false && <div className='form-paragraph-error'>
                    <p>{errorMessages.paragraphCharacters}</p>
                </div>}
            </div>
        
            <div className='form-bottom'>
                <div className='imported-content'>
                        {formData.files.length > 0 && formData.files.map((x) => {
                            return <FileImports name={x}/>
                        })}
                </div>
                <div className='form-imports'>
                    <button className='form-import-button' type="button" onClick={handleImageClick}>
                        <img src={image_upload}></img>
                        <input type='file' name='file' className='file-upload' onChange={handleFileChange} ref={imageInputRef}></input>
                    </button>
                    <button className='form-import-button' type="button" onClick={handleFileClick}>
                        <img src={file_upload}></img>
                        <input type='file' name='file' className='file-upload' onChange={handleFileChange} ref={fileInputRef}></input>
                    </button>
                    <div className='form-imports-error'>
                        {fileConditions.fileSize === false && <p>{errorMessages.fileSize}</p>}
                        {fileConditions.fileType === false && <p>{errorMessages.fileType}</p>}
                    </div>
                </div>
            </div>
        </form>
        <button className='post-button' onClick={() => validatePost(formData)}>
            Post
        </button>
    </div>
    </div>
}