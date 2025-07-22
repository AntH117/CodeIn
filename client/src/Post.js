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
import 'emoji-picker-element';
import TextSettings from './TextSettings';
import ShowAlert from './ShowAlert';
import { Toaster, toast } from 'react-hot-toast';

export default function Post() {
    const { user } = useAuth();
    const backendURL = process.env.REACT_APP_BACKEND_URL
    const APILINK = `${backendURL}/api/v1/codeIn`
    const navigate = useNavigate();
    const [formData, setFormData] = React.useState({
        title: '',
        visibility: 'Public',
        paragraph: '',
        codeSnippet: null,
        codeLanguage: '',
        tags: [],
        files: []
    })


    //Add tag on language Change
    React.useEffect(() => {
        const currentLanguage = formData.codeLanguage;
        const languages = ['javascript', 'python', 'html', 'css', 'java']
        if (currentLanguage !== '') {
            setFormData((preVal) => {
                return {
                    ...preVal,
                    ['tags']: [...preVal.tags.filter((tag) => !languages.includes(tag)), currentLanguage]
                }
            })
        }
    }, [formData.codeLanguage])

        
    const [submissionConditions, setSubmissionConditions] = React.useState({
        titleLengthMin: null,
        titleLengthMax: null,
        titleCharacters: null,
        paragraphCharacters: null,
        codeLanguage: null,
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
        paragraphCharacters: 'Paragraph contains invalid characters',
        codeLanguage: 'Please select a language',
        tagLengthMin: 'Please include a tag name',
        tagLengthMax: 'Tag must not be more than 12 characters',
        tagExisting: 'Tag already exists'
    }
    function sanitiseCode(code) {
        return code
          .replace(/\s+$/gm, '')
          .replace(/\n{3,}/g, '\n\n');
      }
    const savePost = async (newPost) => {
        let finalPost = newPost
        if (finalPost.codeSnippet) {
            finalPost.codeSnippet = sanitiseCode(finalPost.codeSnippet)
        }
        const postWithTime = {
            ...finalPost,
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
            if (result.insertedId) {
                navigate(`/posts/${result.insertedId}`)
                toast.success('Post Created', {
                    duration: 4000,
                    position: 'bottom-right',
                    icon: '🎉',
                  });
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
            // paragraphCharacters:  postData?.paragraph === '' || /^[a-zA-Z0-9 !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(postData?.paragraph),
            codeLanguage: (postData.codeSnippet && postData.codeLanguage !== '') || (!postData.codeSnippet)
        }
        setSubmissionConditions(conditions)
        const allTrue = Object.values(conditions).every(value => value === true);
        if (allTrue) {
            savePost(formData)
        } else {
            return
        }
    }

    const [fileCD, setFileCD] = React.useState(false)

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return
        setFileCD(true)
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
            const maxFileSizeMb = 10;
        
        const valid = {
            fileSize: file.size <= maxFileSizeMb * 1024 * 1024, 
            fileType: validFiles.includes(file.type),
        }
        setFileConditions(valid)
        const allTrue = Object.values(valid).every(value => value === true);
        if (!allTrue) {
            setFileCD(false)
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
        setFileCD(false)
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

    const visibilityTypes = ['Public', 'Followers', 'Private']
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
                <Icons.X />
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
    const tagConditionsRef = React.useRef({
        lengthMin: null,
        lengthMax: null,
        notExisting: null
    })

    function Tags() {
        const [triggerRender, setTriggerRender] = React.useState(0);
        function IndividualTag({name}) {
            function handleDeleteTag () {
                setFormData((preVal) => {
                    return {
                        ...preVal,
                        ['tags']: preVal.tags.filter((x) => x!== name)
                    }
                })
            }
            return <div className='form-individual-tag'>
                {name}
                <div className='form-tag-delete' onClick={handleDeleteTag}>
                  <Icons.X />
                </div>
            </div>
        }

        return <div className='form-tag-outer-body'>
            <div className='form-tag-body'>
            Tags
            {formData.tags.length > 0 && formData.tags.map((tag) => {
                return <IndividualTag name={tag}/>
            })}
            <AddTag forceRerender={() => setTriggerRender(prev => prev + 1)}/>
        </div>
        {tagConditionsRef.current.lengthMin === false && <div className='edit-error-message'>{errorMessages.tagLengthMin}</div>}
        {tagConditionsRef.current.lengthMax === false && <div className='edit-error-message'>{errorMessages.tagLengthMax}</div>}
        {tagConditionsRef.current.notExisting === false && <div className='edit-error-message'>{errorMessages.tagExisting}</div>}
        </div>
    }

    function AddTag({forceRerender}) {
        const [expanded, setExpanded] = React.useState(false)
        const [tag, setTag] = React.useState('')

        const handleTagChange = (e) => {
           const {value} = e.target
           setTag(value)
        }
        function handleClick() {
            if (!expanded) {
                setExpanded(true)
            } else if (expanded) {
                tagConditionsRef.current = {
                    lengthMin: tag.length > 0,
                    lengthMax: tag.length <= 12,
                    notExisting: !formData.tags.includes(tag)
                  };
                // setTagConditions(conditions)
                forceRerender()
                const allTrue = Object.values(tagConditionsRef.current).every(value => value === true);
                if (allTrue) {
                    setFormData((preVal) => {
                        return {
                            ...preVal,
                            ['tags']: [...preVal.tags, tag]
                        }
                    })
                } else {
                    return
                }
            }
        }
        return <div className={`form-add-tag-body ${expanded ? 'expanded' : ''}`}>
            <input className={`form-tag-input ${expanded ? 'expanded' : ''}`} type ='text' placeholder='Tag' value={tag} onChange={handleTagChange}></input>
            <div className='form-add-tag' onClick={handleClick}>
              <Icons.Plus />
            </div>
        </div>
    }

    return <div className='post-outer-body'>
        <div className='post-body'>
        <button className={`cancel-button ${fileCD && 'disabled'}`} disabled={fileCD} onClick={() => {
            cancelPost();
            navigate(-1)
        }}>
            <Icons.X />
        </button>
        <form className='form-body'>
            <h2>Create a New Post</h2>
            <div className='form-top'>
                <div className='form-title'>
                    <h3>Title</h3>
                    <input type='text' className='form-title-input' name='title' onChange={handleChange}></input>
                </div>
                <div className='form-title-error'>
                        <span>{submissionConditions.titleLengthMin === false && errorMessages.titleLengthMin}</span>
                        <span>{submissionConditions.titleLengthMax === false && errorMessages.titleLengthMax}</span>
                        <span>{submissionConditions.titleCharacters === false && errorMessages.titleCharacters}</span>
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
                <div className={`form-paragraph ${toggle.description !== null ? toggle.description ? 'open' : 'closed' : ''}`}>
                    <textarea className='form-paragraph-textarea' name='paragraph' onChange={handleChange} disabled={!toggle.description} value={formData.paragraph}>
                    </textarea>
                </div>
                {toggle.description && <TextSettings setFormData={setFormData}/>}
                {submissionConditions.paragraphCharacters === false && <div className='form-paragraph-error'>
                    <p>{errorMessages.paragraphCharacters}</p>
                </div>}
            </div>
            <div className='form-description' style={{marginTop: '5px'}}>
                <div className='form-description-toggle'>
                    <h3 className='form-description-title'>Code snippet</h3>
                    <button className='form-toggle-button' name='codeSnippet' onClick={handleToggle}>
                        {toggle.codeSnippet ? <Icons.Minus /> : <Icons.Plus />}
                    </button>
                </div>
                <div className={`form-code-editor ${toggle.codeSnippet !== null ? toggle.codeSnippet ? 'open' : 'closed' : ''}`}>
                 <CodeEditor handleCodeChange={handleCodeChange} value={formData.codeSnippet} handleLanguageChange={handleChange} languageValue={formData.codeLanguage}/>  
                </div>
                {submissionConditions.codeLanguage === false && <div className='form-language-error'>
                    <p>{errorMessages.codeLanguage}</p>
                </div>}
            </div>
            
            <div className='form-bottom'>
                <Tags />
                <div className='imported-content'>
                        {formData.files.length > 0 && formData.files.map((x) => {
                            return <FileImports name={x}/>
                        })}
                </div>
                <div className='form-imports'>
                    <button className={`form-import-button ${fileCD && 'CD'}`} type="button" onClick={handleImageClick} disabled={fileCD}>
                        <img src={image_upload}></img>
                        <input type='file' name='file' className='file-upload' onChange={handleFileChange} ref={imageInputRef}></input>
                    </button>
                    <button className={`form-import-button ${fileCD && 'CD'}`} type="button" onClick={handleFileClick} disabled={fileCD}>
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
        <button className={`post-button ${fileCD && 'disabled'}`} onClick={() => validatePost(formData)} disabled={fileCD}>
            Post
        </button>
    </div>
    </div>
}