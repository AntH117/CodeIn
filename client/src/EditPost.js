import './EditPost.css';
import React from 'react';
import image_upload from './images/image_upload.png'
import file_upload from './images/file-upload.png'
import { Link, Outlet, Navigate, useLocation, useNavigate} from 'react-router-dom';
import testImage from './images/Temp-profile-pic.png'
import { v4 as uuidv4 } from 'uuid';
import Icons from './icons/Icons';

export default function EditPost() {
    const [post, setPost] = React.useState()
    const [editedPost, setEditedPost] = React.useState()
    const [deletedFiles, setDeletedFiles] = React.useState([])
    const APILINK = `http://localhost:5000/api/v1/codeIn`
    const navigate = useNavigate()
    const location = useLocation()
    const id = location.pathname.split('/').at(-2)
    const visibilityTypes = ['Public', 'Friends', 'Private']
    
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
        const uniqueFile = name.includes('\\') ? name.split('\\').at(-1) : name.split('/').at(-1)
        const fileType = name.includes('\\') ? name.split('\\').at(1) : name.split('/').at(1)
        const originalName = uniqueFile.slice(37)
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
                setEditedPost((preVal) => ({
                    ...preVal,
                    files: preVal.files.filter((x) => x !== name)
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
                    {originalName}
                </p>
            </div>
            <div className='file-import-delete' onClick={() => fileType == 'temp' ? deleteTempFile() : deleteFinalFile()}>
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
                <button className='form-import-button' type="button" onClick={handldeImageClick}>
                    <img src={image_upload}></img>
                    <input type='file' name='file' className='file-upload' onChange={handleFileChange} ref={imagleInputRef}></input>
                </button>
                <button className='form-import-button' type="button" onClick={handleFileClick}>
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
    
    const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
            
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(`${APILINK}/temp-upload`, {
        method: 'POST',
        body: form
    });

    const data = await res.json();
        setEditedPost((preVal) => ({
            ...preVal,
            files: [...preVal.files, data.filePath]
    }))
    }
    const editPost = async () => {
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
                    alert('Post successfully edited')
                    navigate('/')
                } else {
                    console.error('Backend Error', result.error)
                }
            } catch (e) {
                console.error('failed to save post:', e)
            }
          };

    function handleCancelEdits() {
        if (post?.postContent !== editedPost) {
            if (!window.confirm("Are you sure you undo all edits?")) {
                return
              }
        }
        navigate(-1)
    }

    return <div className='EP-outer-body'>
      {editedPost && <div className='EP-inner-body'>
                         <div className='edit-post-title'>Edit Post</div>
                          <div className='IP-title'>
                                <input type='text' value={editedPost.title} className='IP-title-input' onChange={handleChange} name='title'></input>
                            </div>
                            <div className='IP-author-visibility'>
                                <div className='IP-author-date'>
                                    <div className='IP-author-image'>
                                        <img src={testImage}></img>
                                    </div>
                                    <h4><span style={{cursor: 'pointer'}}>{post.user}</span> <span style={{fontWeight: '200'}}> &#9679; {convertTime(post.postContent.time)}</span></h4>
                                </div>
                                <div className='IP-visibility'>
                                        <select name='visibility' onChange={handleChange}>
                                                {visibilityTypes.map((x) => (
                                                    <option key={x} value={x}>
                                                        {x}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                            </div>
                            <div className='IP-paragraph'>
                                <textarea className='IP-paragraph-textarea' value={editedPost.paragraph} onChange={handleChange} name='paragraph'></textarea>
                            </div>
                            <button className='cancel-button' onClick={() => handleCancelEdits()}>
                                <Icons.X />
                            </button>
                            {editedPost.files.length > 0 && <div className='file-imports-body'>
                                {editedPost.files.map((x) => {
                                return <FileImports name={x}/>
                            })}
                                </div>}
                            <ImportsDisplay />
                            <button className='edit-button' onClick={() => editPost()}>
                                Edit
                            </button>
                      </div>}
    </div>
}