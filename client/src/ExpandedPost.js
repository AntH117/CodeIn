import './ExpandedPost.css';
import React from 'react';
import { Link, Outlet, Navigate, useLocation, useNavigate} from 'react-router-dom';
import testImage from './images/Temp-profile-pic.png'
import { v4 as uuidv4 } from 'uuid';
import Icons from './icons/Icons';

export default function ExpandedPost () {
    const [post, setPost] = React.useState(null)
    const location  = useLocation()
    const id = location.pathname.split('/').at(-1)
    const navigate = useNavigate();
    const APILINK = `http://localhost:5000/api/v1/codeIn/posts/${id}`

    const getPost = async () => {
        try {
            const response = await fetch (APILINK, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const data = await response.json();
            setPost(data)
        } catch (e) {
            console.error(`Unable to load post:`, e)
        }
    }

    //icons
    React.useEffect(() => {
        getPost()
    }, [location])

    //Delete post
    const deletePost = async () => {
        try {
            const response = await fetch (APILINK, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            if (response.ok) {
                alert('Post deleted successfully.');
                navigate('/');
            } else {
                const errorText = await response.text();
                alert('Failed to delete post.');
                console.error(`Delete failed: ${response.status} - ${errorText}`);
            }
        } catch (e) {
            console.error(`Unable to load post:`, e)
        }
    }

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

    function DropDownMenu() {
        const [open, setOpen] = React.useState(false)

        return <>
        <div className='EP-delete' onClick={() => setOpen((preVal) => !preVal)}>
            <div className='dot'></div>
            <div className='dot'></div>
            <div className='dot'></div>
        </div>
        {open && <div className='EP-dropdown'>
                <div className='EP-dropdown-option'> <Icons.Edit /> Edit</div>
                <div className='EP-dropdown-option' onClick={() => deletePost()}>
                        <Icons.Trash />
                        Delete
                </div>
            </div>}
        </>
    }

    function Socials() {
        return (
        <div className='IP-socials'>
                <div className='IP-socials-individual'>
                    <Icons.Heart />
                    {post.postContent.socials.likes}
                </div>
                <div className='IP-socials-individual'>
                    <Icons.Comment />
                    {post.postContent.socials.comments.length}
                </div>
                <div className='IP-socials-individual'>
                    <Icons.Share />
                    {post.postContent.socials.shares}
                </div>
                </div>
        )
    }
    
    //create comment
    const saveComment = async (currentComment) => {
        const savedComment = {
            comment: currentComment,
            user: 'Anthony',
            time: new Date().toISOString(),
            commentId: uuidv4(),
        }
        const updatedPost = {
            ...post,
            postContent: {
                ...post.postContent,
                socials: {
                    ...post.postContent.socials,
                    comments: [...post.postContent.socials.comments, savedComment],
                },
            },
        }
        try {
            const response = await fetch(APILINK, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedPost)
            });
            
            const result = await response.json();
            if (result.status === 'success') {
                alert('Comment Saved')
                window.location.reload()
            } else {
                console.error('Backend Error', result.error)
            }
        } catch (e) {
            console.error('failed to save comment:', e)
        }
      };
      
      //delete comment
      const deleteComment = async (commentId) => {
        const updatedComments = post.postContent.socials.comments.filter(
            (comment) => comment.commentId !== commentId
        )
        const updatedPost = {
            ...post,
            postContent: {
                ...post.postContent,
                socials: {
                    ...post.postContent.socials,
                    comments: updatedComments,
                },
            },
        }
        try {
            const response = await fetch(APILINK, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedPost)
            });
            
            const result = await response.json();
            if (result.status === 'success') {
                alert('Comment deleted')
                window.location.reload()
            } else {
                console.error('Backend Error', result.error)
            }
        } catch (e) {
            console.error('failed to delete comment:', e)
        }
      };
      

    function Comments() {
        const [commentLimit, setCommentLimit] = React.useState(5)
        const [currentComment, setCurrentComment] = React.useState('')
        function IndividualComment({data}) {
            //If user, allow delete post
            return (
                <div className='IC-body'>
                    <div className='IC-delete' onClick={() => {deleteComment(data.commentId)}}>
                        <Icons.Trash />
                    </div>
                    <div className='IC-user-info'>
                        <div className='IC-user-image'>
                            <img src={testImage}></img>
                        </div>
                        <div className='IC-user-name-date'>
                         <h4><span style={{cursor: 'pointer'}}>{data.user}</span> <span style={{fontWeight: '200'}}> &#9679; {convertTime(data.time)}</span></h4>
                        </div>
                    </div>
                    <div className='IC-comment'>
                        <p>{data.comment}</p>
                    </div>
                </div>
            )
        }
        const postComments = post.postContent.socials.comments;

        return (
            <div className='EP-comments-body'>
                <div className='EP-add-comment'>
                    <input type='text' className='EP-comment-input' placeholder='Add a comment...' id='comment-input'  onChange={(e) => setCurrentComment(e.target.value)} value={currentComment}></input>
                    <button className='EP-comment-post' onClick={() => currentComment.length > 0 ? saveComment(currentComment) : console.error('Comment invalid')}>Post</button>
                </div>
                <div className='EP-comments'>
                    {postComments.length > 0 && postComments.slice().reverse().slice(0, commentLimit).map((x) => {
                        return <IndividualComment data = {x}/>
                    })}
                    {post.postContent.socials.comments.length == 0 && <p>No comments yet!</p>}
                    {postComments.length > commentLimit && <button className='load-comments-button' onClick={() => setCommentLimit((preval) => preval += 5)}>Load more</button>}
                </div>
            </div>
        )
    }

    return (<div className='EP-outer-body'>
    {post && <div className='EP-inner-body'>
                    <DropDownMenu />
                    <div className='IP-title'>
                            <h2>{post.postContent.title}</h2>
                        </div>
                        <div className='IP-author-date'>
                            <div className='IP-author-image'>
                                <img src={testImage}></img>
                            </div>
                            <h4><span style={{cursor: 'pointer'}}>{post.user}</span> <span style={{fontWeight: '200'}}> &#9679; {convertTime(post.postContent.time)}</span></h4>
                        </div>
                        <div className='IP-paragraph'>
                            <p>{post.postContent.paragraph}</p>
                        </div>
                        {post.postContent.files.length > 0 && <div className='IP-attachments'></div>}
                        <div className='IP-images'>
                            <div className='test-image'>

                            </div>
                        </div>
                        <Socials />
                        <div className='IP-interact' style={{marginBottom: '1rem'}}>
                            <h5>Like</h5>
                            <h5>Share</h5>
                        </div>
                        <Comments />
                </div>}
            </div>)
}