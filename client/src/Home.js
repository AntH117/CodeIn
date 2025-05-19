import './Home.css';
import React from 'react';
import { Link, Outlet, Navigate, useLocation, useNavigate} from 'react-router-dom';
import testImage from './images/Temp-profile-pic.png'

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
            <div className='IP-title'>
                <h2 onClick={() => navigate(`/posts/${data._id}`)}>{data.postContent.title}</h2>
            </div>
                <div className='IP-author-date'>
                    <div className='IP-author-image'>
                        <img src={testImage}></img>
                    </div>
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
            <div className='IP-socials'>
                <div className='IP-socials-individual'>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd"
                        d="M12.0122 5.57169L10.9252 4.48469C8.77734 2.33681 5.29493 2.33681 3.14705 4.48469C0.999162 6.63258 0.999162 10.115 3.14705 12.2629L11.9859 21.1017L11.9877 21.0999L12.014 21.1262L20.8528 12.2874C23.0007 10.1395 23.0007 6.65711 20.8528 4.50923C18.705 2.36134 15.2226 2.36134 13.0747 4.50923L12.0122 5.57169ZM11.9877 18.2715L16.9239 13.3352L18.3747 11.9342L18.3762 11.9356L19.4386 10.8732C20.8055 9.50635 20.8055 7.29028 19.4386 5.92344C18.0718 4.55661 15.8557 4.55661 14.4889 5.92344L12.0133 8.39904L12.006 8.3918L12.005 8.39287L9.51101 5.89891C8.14417 4.53207 5.92809 4.53207 4.56126 5.89891C3.19442 7.26574 3.19442 9.48182 4.56126 10.8487L7.10068 13.3881L7.10248 13.3863L11.9877 18.2715Z"
                        fill="currentColor"
                    /></svg>
                    {data.postContent.socials.likes}
                </div>
                <div className='IP-socials-individual'>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 9H7V7H17V9Z" fill="currentColor" />
                    <path d="M7 13H17V11H7V13Z" fill="currentColor" />
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M2 18V2H22V18H16V22H14C11.7909 22 10 20.2091 10 18H2ZM12 16V18C12 19.1046 12.8954 20 14 20V16H20V4H4V16H12Z"
                        fill="currentColor"
                    /></svg>
                    {data.postContent.socials.comments.length}
                </div>
                <div className='IP-socials-individual'>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path
                    d="M18 9C19.6569 9 21 7.65685 21 6C21 4.34315 19.6569 3 18 3C16.3431 3 15 4.34315 15 6C15 6.12549 15.0077 6.24919 15.0227 6.37063L8.08261 9.84066C7.54305 9.32015 6.80891 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15C6.80891 15 7.54305 14.6798 8.08261 14.1593L15.0227 17.6294C15.0077 17.7508 15 17.8745 15 18C15 19.6569 16.3431 21 18 21C19.6569 21 21 19.6569 21 18C21 16.3431 19.6569 15 18 15C17.1911 15 16.457 15.3202 15.9174 15.8407L8.97733 12.3706C8.99229 12.2492 9 12.1255 9 12C9 11.8745 8.99229 11.7508 8.97733 11.6294L15.9174 8.15934C16.457 8.67985 17.1911 9 18 9Z"
                    fill="currentColor"
                    /> </svg>
                    {data.postContent.socials.shares}
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
            <Link to={'/'} style={{color: 'black', textDecoration: 'none'}}>Home</Link>
            <Link to={'/login'} style={{color: 'black', textDecoration: 'none'}}>Login</Link>
        </div>
        <div className='news-feed-body'>
                <div className='news-feed'>
                {(location.pathname == '/' || location.pathname == '/post') && posts.slice().reverse().map((data) => {
                        return <IndividualPost data={data}/>
                    })}
                    {
                    location.pathname == '/' && <div className='create-post'>
                    <button className='create-post-button'>
                        <Link to={'/post'} style={{color: 'white', textDecoration: 'none'}}>Create Post</Link>
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