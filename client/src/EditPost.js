import './EditPost.css';
import React from 'react';
import image_upload from './images/image_upload.png'
import file_upload from './images/file-upload.png'
import { Link, Outlet, Navigate, useLocation, useNavigate, redirect} from 'react-router-dom';
import testImage from './images/Temp-profile-pic.png'
import { v4 as uuidv4 } from 'uuid';
import { auth, db } from './firebase';
import Icons from './icons/Icons';
import { useAuth } from "./AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import CodeEditor from './CodeEditor';
import TextSettings from './TextSettings';
import ShowAlert from './ShowAlert';
import notify from './Toast';


export default function EditPost() {
    const backendURL = process.env.REACT_APP_BACKEND_URL
    const [post, setPost] = React.useState()
    const [editedPost, setEditedPost] = React.useState()
    const [deletedFiles, setDeletedFiles] = React.useState([])
    const [userInfo, setUserInfo] = React.useState()
    const [alert ,setAlert] = React.useState(null)
    const APILINK = `${backendURL}/api/v1/codeIn`
    const navigate = useNavigate()
    const location = useLocation()
    const id = location.pathname.split('/').at(-2)
    const visibilityTypes = ['Public', 'Followers', 'Private']
    
    const postPath = location.pathname.split("/edit")[0];

    const { user } = useAuth();
    //Check for user
    React.useEffect(() => {
        if (!post || !user) return; // Wait until both are loaded
    
        if (user.uid !== post.user) {
            navigate(postPath);
            notify.error('Permission Denied')
        }
    }, [user, post, location]);

    //Obtain post data
    const getPost = async () => {
        try {
            const response = await fetch (`${APILINK}/posts/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const data = await response.json();
            setPost(data)
            setEditedPost(data.postContent)
        } catch (e) {
            console.error(`Unable to load post:`, e)
        }
    }
    React.useEffect(() => {
        getPost()
    }, [])

    //get user info
    async function getUserInfo(uid) {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return docSnap.data(); // { displayName, photoURL, email }
        } else {
            return null;
        }
    }
    async function getuserInfo() {
        const userInfo = await getUserInfo(post.user)
        setUserInfo(userInfo)
    }

    //get comment posters info
    React.useEffect(() => {
        if (post) {
            getuserInfo()
        }
    }, [post])

    function convertTime(time) {
        const date = new Date(time);
        const options = {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          };
          const formatted = new Intl.DateTimeFormat('en-US', options).format(date);
          return formatted
    }

    //IMPORTS
    function FileImports({name}) {
        const fileName = (typeof name === 'object' && name !== null) ? name.url : name
        const uniqueFile = (typeof name === 'object' && name !== null) ? fileName.split('/').at(-1) : fileName.slice(50)
        const fileType = fileName.includes('res.cloudinary.com') ? 'final' : 'temp'
        const deleteTempFile = async () => {
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
                setEditedPost((preVal) => ({
                    ...preVal,
                    files: preVal.files.filter((x) => (typeof x === 'object' ? x.url : x) !== fileName)
                }))
            } else {
                console.error('Unable to delete file')
            }
        }
        function deleteFinalFile() {
            setDeletedFiles((preVal) => [...preVal, name])
            setEditedPost((preVal) => ({
                ...preVal,
                files: preVal.files.filter((x) => x !== name)
            }))
        }

        return <div className='file-import-body'>
            <div className='file-import-name'>
                <p>
                    {uniqueFile}
                </p>
            </div>
            <div className='file-import-delete' onClick={() => {fileType == 'temp' ? deleteTempFile() : deleteFinalFile()}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                </svg>
            </div>
        </div>
    }
    
    function ImportsDisplay() {
        const handldeImageClick = () => {
            imagleInputRef.current.click();
        }
        const handleFileClick = () => {
            fileInputRef.current.click();
        }
        const imagleInputRef = React.useRef();
        const fileInputRef = React.useRef();
        return (
            <div className='edit-form-imports'>
                <button className={`form-import-button ${fileCD && 'CD'}`} type="button" onClick={handldeImageClick}>
                    <img src={image_upload}></img>
                    <input type='file' name='file' className='file-upload' onChange={handleFileChange} ref={imagleInputRef}></input>
                </button>
                <button className={`form-import-button ${fileCD && 'CD'}`} type="button" onClick={handleFileClick}>
                    <img src={file_upload}></img>
                    <input type='file' name='file' className='file-upload' onChange={handleFileChange} ref={fileInputRef}></input>
                </button>
            </div>
        )
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        e.preventDefault();
        setEditedPost((preVal) => ({
            ...preVal,
            [name]: value
        }))
      };
    

    const [fileCD, setFileCD] = React.useState(false)

    const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileCD(true)
    //validate file
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
        setFileCD(false)
        return
    }
            
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(`${APILINK}/temp-upload`, {
        method: 'POST',
        body: form
    });

    const data = await res.json();
    setFileCD(false)
    setEditedPost((preVal) => ({
            ...preVal,
            files: [...preVal.files, data.filePath]
    }))
    }

    const [editInProgress, setEditInProgress] = React.useState(false)
    const editPost = async () => {
        setEditInProgress(true)
        notify.progress('Saving post...')
        let finalEdit = editedPost;
        if (finalEdit?.codeSnippet) {
            finalEdit.codeSnippet = sanitiseCode(finalEdit?.codeSnippet)
        }
        const newPost = {
            ...editedPost,
            time: new Date().toISOString(),
            edited: true
        }
        try {
            const response = await fetch(`${APILINK}/posts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postContent: newPost,
                    user: post.user,
                    deletedFiles: deletedFiles
                }),
            });
            
            const result = await response.json();
            if (result.status === 'success') {
                setEditInProgress(false)
                navigate(postPath)
                notify.success('Post saved!', '💾')
            } else {
                console.error('Backend Error', result.error)
            }
        } catch (e) {
            setEditInProgress(false)
            console.error('failed to save post:', e)
        }
        };

    const [cancelConfirmation, setCancelConfirmation] = React.useState(null)

    function handleCancelEdits() {
        if (post?.postContent !== editedPost) {
            setCancelConfirmation(false)
        } else {
            navigate(postPath)
        }
    }

    const handleCodeChange = (value) => {
        setEditedPost((preVal) => ({
            ...preVal,
            ['codeSnippet']: value
        }))
    }
    function sanitiseCode(code) {
        return code
          .replace(/\s+$/gm, '')
          .replace(/\n{3,}/g, '\n\n');
      }

    //toggles
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

     //error checking for editing posts
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
            //  paragraphCharacters: 'Paragraph contains invalid characters',
             codeLanguage: 'Please select a language',
             tagLengthMin: 'Please include a tag name',
             tagLengthMax: 'Tag must not be more than 12 characters',
             tagExisting: 'Tag already exists'
         }

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
                editPost()
            } else {
                return
            }
        }
        const tagConditionsRef = React.useRef({
            lengthMin: null,
            lengthMax: null,
            notExisting: null
        })

        //tags
        function Tags() {
            const [triggerRender, setTriggerRender] = React.useState(0);
            function IndividualTag({name}) {
                function handleDeleteTag () {
                    setEditedPost((preVal) => {
                        return {
                            ...preVal,
                            ['tags']: preVal.tags.filter((x) => x!== name)
                        }
                    })
                }
                return <div className='form-individual-tag'>
                    <span style={{cursor: 'default'}}>{name}</span>
                    <div className='form-tag-delete' onClick={handleDeleteTag}>
                      <Icons.X />
                    </div>
                </div>
            }
    
    
            return <div className='edit-tag-outer-body'>
                <div className='edit-tag-body'>
                Tags
                {editedPost.tags.length > 0 && editedPost.tags.map((tag) => {
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
                        notExisting: !editedPost.tags.includes(tag)
                      };
                    // setTagConditions(conditions)
                    forceRerender()
                    const allTrue = Object.values(tagConditionsRef.current).every(value => value === true);
                    if (allTrue) {
                        setEditedPost((preVal) => {
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


    return <div className='EP-outer-body'>
       {cancelConfirmation == false && <ShowAlert confirm={true} message={'Discard all changes?'} setConfirmation={setCancelConfirmation} callback={() => navigate(postPath)}/>}
      {editedPost && <div className='EP-inner-body'>
                         <div className={`edit-post-title`}>Edit Post</div>
                          <div className='edit-title'>
                                <input type='text' value={editedPost.title} className='IP-title-input' onChange={handleChange} name='title'></input>
                                {submissionConditions.titleLengthMin === false && <div className='edit-error-message'>{errorMessages.titleLengthMin}</div>}
                                {submissionConditions.titleLengthMax === false && <div className='edit-error-message'>{errorMessages.titleLengthMax}</div>}
                                {submissionConditions.titleCharacters === false && <div className='edit-error-message'>{errorMessages.titleCharacters}</div>}
                           </div>
                            <div className='IP-author-visibility'>
                                <div className='IP-author-date'>
                                    <div className='IP-author-image'>
                                        <img src={userInfo?.photoURL}></img>
                                    </div>
                                    <h4><span style={{cursor: 'pointer'}}>{userInfo?.displayName || userInfo?.displayTag}</span> <span style={{fontWeight: '200'}}> &#9679; {convertTime(post.postContent.time)}</span></h4>
                                </div>
                                <div className='IP-visibility'>
                                        <select name='visibility' onChange={handleChange} value={editedPost.visibility}>
                                                {visibilityTypes.map((x) => (
                                                    <option key={x} value={x}>
                                                        {x}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                            </div>
                            <div className='edit-paragraph'>
                                <textarea className='IP-paragraph-textarea' value={editedPost.paragraph} onChange={handleChange} name='paragraph'></textarea>
                                <TextSettings setFormData={setEditedPost}/>
                                {submissionConditions.paragraphCharacters === false && <div className='edit-error-message'>{errorMessages.paragraphCharacters}</div>}
                            </div>
                            <div className='code-edit-body'>
                                <div className='form-description-toggle'>
                                    <h3 className='form-description-title'>Code snippet</h3>
                                    <button className='form-toggle-button' name='codeSnippet' onClick={handleToggle}>
                                        {toggle.codeSnippet ? <Icons.Minus /> : <Icons.Plus />}
                                    </button>
                                </div>
                                <div className={`form-code-editor ${toggle.codeSnippet !== null ? toggle.codeSnippet ? 'open' : 'closed' : ''}`}>
                                 <CodeEditor handleCodeChange={handleCodeChange} value={editedPost.codeSnippet} handleLanguageChange={handleChange} languageValue={editedPost.codeLanguage}/> 
                                </div>
                                {submissionConditions.codeLanguage === false && <div className='edit-error-message'>{errorMessages.codeLanguage}</div>} 
                            </div>
                            <Tags />
                            <button className={`cancel-button ${(editInProgress || fileCD) && 'disabled'}`} onClick={() => handleCancelEdits()} disabled={editInProgress || fileCD}>
                                <Icons.X />
                            </button>
                            {editedPost.files.length > 0 && <div className='file-imports-body'>
                                {editedPost.files.map((x) => {
                                return <FileImports name={x}/>
                            })}
                            {fileConditions.fileSize === false && <div className='edit-error-message'>{errorMessages.fileSize}</div>} 
                            {fileConditions.fileType === false && <div className='edit-error-message'>{errorMessages.fileType}</div>} 
                                </div>}
                            <ImportsDisplay />
                            <button className={`edit-button ${(editInProgress || fileCD) && 'progress'}`} onClick={() => validatePost(editedPost)} disabled={editInProgress || fileCD}>
                                Edit
                            </button>
                      </div>}
    </div>
}