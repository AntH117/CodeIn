import './Home.css';
import React from 'react';
import { Link, Outlet, Navigate, useLocation, useNavigate} from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();
     
    const [posts, setPosts] = React.useState([])

    //Temp looking for posts with Anthony
    const APILINK = `http://localhost:5000/api/v1/codeIn/user/Anthony`

    const getPosts = async () => {
        try {
            const response = await fetch(APILINK, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setPosts(data)
        } catch (e) {
            console.error('Unable to load posts:', e)
        }
      };


    console.log(posts)
    React.useEffect(() => {
        getPosts()
    }, [location])

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

    function IndividualPost({data}) {
        return <div className='IP-body'>
            <div className='IP-title' onClick={() => navigate(`/posts/${data._id}`)}>
                <h2>{data.postContent.title}</h2>
            </div>
            <div className='IP-author-date'>
                <h4><span style={{cursor: 'pointer'}}>{data.user}</span> <span style={{fontWeight: '200'}}> &#9679; {convertTime(data.postContent.time)}</span></h4>
            </div>
            <div className='IP-paragraph'>
                <p>{data.postContent.paragraph}</p>
            </div>
            {data.postContent.files.length > 0 && <div className='IP-attachments'></div>}
            <div className='IP-images'>
                <div className='test-image'>

                </div>
            </div>
            <div className='IP-interact'>
                <h5>Like</h5>
                <h5 onClick={() => navigate(`/posts/${data._id}`)}>Comment</h5>
                <h5>Share</h5>
            </div>
        </div>
    }

    return <div className='home'>
        <div className='nav-bar'>
            <Link to={'/'}>Home</Link>
            <Link to={'/login'}>Login</Link>
        </div>
        <div className='news-feed-body'>
                <div className='news-feed'>
                {(location.pathname == '/' || location.pathname == '/post') && posts.slice().reverse().map((data) => {
                        return <IndividualPost data={data}/>
                    })}
                    {
                    location.pathname == '/' && <div className='create-post'>
                    <button className='create-post-button'>
                        <Link to={'/post'}>Create Post</Link>
                    </button>
                </div>
                    }
                </div>
                {
                location.pathname !== '/' && 
                <div className='outlet'>
                    <Outlet />
                </div>
                }
            </div>
    </div>
}