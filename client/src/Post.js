import './Post.css';
import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import image_upload from './images/image_upload.png'
import file_upload from './images/file-upload.png'
import { v4 as uuidv4 } from 'uuid';

export default function Post() {
    const APILINK = `http://localhost:5000/api/v1/codeIn/posts`

    const navigate = useNavigate();
    const [formData, setFormData] = React.useState({
        title: '',
        visibility: 'Public',
        paragraph: '',
        files: []
    })
    
    const savePost = async (newPost) => {
        const postWithTime = {
            ...newPost,
            time: new Date().toISOString(),
            postId: uuidv4(),
            socials: {
                likes: 0,
                comments: [],
                shares: 0
            }
        }
        try {
            const response = await fetch(APILINK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postContent: postWithTime,
                    user: 'Anthony' || 'Anonymous'
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
        setFormData((preVal) => ({
            ...preVal,
            files: [...preVal.files, data.filePath]
       }))
    }
    console.log(formData)

    const handleChange = (e) => {
        const { name, value } = e.target;
        e.preventDefault();
        setFormData((preVal) => ({
            ...preVal,
            [name]: value
        }))
      };

    const visibilityTypes = ['Public', 'Friends', 'Private']
    const imagleInputRef = React.useRef();
    const fileInputRef = React.useRef();
    const handldeImageClick = () => {
        imagleInputRef.current.click();
    }
    const handleFileClick = () => {
        fileInputRef.current.click();
    }


    return <div className='post-outer-body'>
        <div className='post-body'>
        <button className='cancel-button' onClick={() => navigate('/')}>
            X
        </button>
        <form className='form-body'>
            <div className='form-top'>
                <div className='form-title'>
                    <h3>Title</h3>
                    <input type='text' className='form-title-input' name='title' onChange={handleChange}></input>
                </div>
                <div className='form-visibility'>
                    <h3>Visibility</h3>
                   <select name='visibility' onChange={handleChange}>
                        {visibilityTypes.map((x) => (
                            <option key={x} value={x}>
                                {x}
                            </option>
                        ))}
                   </select>
                </div>
            </div>
            <div className='form-middle'>
                <textarea className='form-paragraph' name='paragraph' onChange={handleChange}>

                </textarea>
            </div>
        
            <div className='form-bottom'>
                <div className='imported-content'>

                </div>
                <div className='form-imports'>
                    <button className='form-import-button' type="button" onClick={handldeImageClick}>
                        <img src={image_upload}></img>
                        <input type='file' name='file' className='file-upload' onChange={handleFileChange} ref={imagleInputRef}></input>
                    </button>
                    <button className='form-import-button' type="button" onClick={handleFileClick}>
                        <img src={file_upload}></img>
                        <input type='file' name='file' className='file-upload' onChange={handleFileChange} ref={fileInputRef}></input>
                    </button>
                </div>
            </div>
        </form>
        <button className='post-button' onClick={() => savePost(formData)}>
            Post
        </button>
    </div>
    </div>
}