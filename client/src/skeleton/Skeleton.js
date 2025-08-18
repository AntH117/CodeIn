import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import Icons from '../icons/Icons';
import './Skeleton.css';

const SkeletonBox = ({width, height}) => {
    return <div className='skeleton-box' style={{width: width, height: height}}>
    </div>
}


const SkeletonCircle = ({width, height}) => {
    return <div className='skeleton-circle' style={{width: width, height: height}}>

    </div>
}

const SkeletonPill = ({width, height}) => {
    return <div className='skeleton-pill' style={{width: width, height: height}}>

    </div>
}

const SkeletonHeart = ({width, height}) => (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 16 16"
  >
    <defs>
      <linearGradient id="shimmer-gradient">
        <stop offset="0%" stopColor="#5c5b5b">
          <animate attributeName="offset" values="1; -2" dur="1.7s" repeatCount="indefinite" />
        </stop>
        <stop offset="50%" stopColor="#777">
          <animate attributeName="offset" values="2; -1" dur="1.7s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor="#5c5b5b">
          <animate attributeName="offset" values="3; 0" dur="1.7s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
    </defs>
     <path 
     fill="url(#shimmer-gradient)"
     d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1"
     />
  </svg>
)

const SkeletonComment = ({width, height}) => (

<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width={width} height={height} viewBox="0 0 16 16">
    <defs>
    <linearGradient id="shimmer-gradient">
        <stop offset="0%" stopColor="#5c5b5b">
          <animate attributeName="offset" values="1; -2" dur="1.7s" repeatCount="indefinite" />
        </stop>
        <stop offset="50%" stopColor="#777">
          <animate attributeName="offset" values="2; -1" dur="1.7s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor="#5c5b5b">
          <animate attributeName="offset" values="3; 0" dur="1.7s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
    </defs>
    <path 
    fill="url(#shimmer-gradient)"
    d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9 9 0 0 0 8 15">

    </path>
</svg>
)

const SkeletonShare = ({width, height}) => (
<svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill="currentColor" class="bi bi-share-fill" viewBox="0 0 16 16">
<defs>
    <linearGradient id="shimmer-gradient">
        <stop offset="0%" stopColor="#5c5b5b">
          <animate attributeName="offset" values="1; -2" dur="1.7s" repeatCount="indefinite" />
        </stop>
        <stop offset="50%" stopColor="#777">
          <animate attributeName="offset" values="2; -1" dur="1.7s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor="#5c5b5b">
          <animate attributeName="offset" values="3; 0" dur="1.7s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
    </defs>
  <path 
    fill="url(#shimmer-gradient)"
  d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5"/>
</svg>
)

const SkeletonPlus = ({width, height}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
        <defs>
            <linearGradient id="shimmer-gradient">
                <stop offset="0%" stopColor="#5c5b5b">
                <animate attributeName="offset" values="1; -2" dur="1.7s" repeatCount="indefinite" />
                </stop>
                <stop offset="50%" stopColor="#777">
                <animate attributeName="offset" values="2; -1" dur="1.7s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#5c5b5b">
                <animate attributeName="offset" values="3; 0" dur="1.7s" repeatCount="indefinite" />
                </stop>
            </linearGradient>
        </defs>
        <path 
        fill="url(#shimmer-gradient)"
        fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
    </svg>
)

const SkeletonIP = ({darkMode}) => {
    return (
    <div className={`skeleton-home-IP ${darkMode && 'dark'}`}>
        <div className='skeleton-IP-body'>
            <SkeletonBox width={'200px'} height={'30px'}/>
            <div className='skeleton-author-info'>
                <SkeletonCircle height={'40px'} width={'40px'}/>
                <SkeletonBox width={'200px'} height={'20px'}/>
                <SkeletonCircle height={'20px'} width={'20px'}/>
            </div>
            <SkeletonBox width={'350px'} height={'100px'}/>
            <div className='skeleton-IP-tags'>
                <SkeletonPill width={'80px'} height={'25px'}/>
                <SkeletonPill width={'80px'} height={'25px'}/>
            </div>
            <div className='skeleton-IP-socials'>
                {/* <SkeletonCircle height={'25px'} width={'25px'}/>
                <SkeletonCircle height={'25px'} width={'25px'}/>
                <SkeletonCircle height={'25px'} width={'25px'}/> */}
                <div className='skeleton-IP-socials-group'>
                 <SkeletonHeart height={'20px'} width={'20px'}/>
                 <SkeletonBox width={'15px'} height={'20'}/>
                </div>
                <div className='skeleton-IP-socials-group'>
                 <SkeletonComment height={'20px'} width={'20px'}/>
                 <SkeletonBox width={'15px'} height={'20'}/>
                </div>
                <div className='skeleton-IP-socials-group'>
                 <SkeletonShare height={'20px'} width={'20px'}/>
                 <SkeletonBox width={'15px'} height={'20'}/>
                </div>
            </div>
            <div className='skeleton-IP-interact'>
                <SkeletonBox width={'80px'} height={'25px'}/>
                <SkeletonBox width={'80px'} height={'25px'}/>
                <SkeletonBox width={'80px'} height={'25px'}/>
            </div>
        </div>
    </div>
    )
}

const SkeletonHome = ({darkMode}) => {
    return (
        <div className='skeleton-home-body'>
            <div className='skeleton-home-interaction'>
                <SkeletonPill width={'100px'} height={'2rem'}/>
                <SkeletonPill width={'80px'} height={'2rem'}/>
                <SkeletonPlus width={'1.5rem'} height={'1.5rem'}/>
                <SkeletonCircle width={'2rem'} height={'2rem'}/>
            </div>
            <SkeletonIP darkMode={darkMode}/>
            <SkeletonIP darkMode={darkMode} />
        </div>
    )
}

const SkeletonLiked = ({darkMode}) => {
    return (
        <div className='skeleton-home-body'>
            <SkeletonIP darkMode={darkMode}/>
            <SkeletonIP darkMode={darkMode} />
        </div>
    )
}

const SkeletonProfile = ({darkMode}) => {
    return (
    <div className={`skeleton-profile-body ${darkMode && 'dark'}`}>
        <div className='skeleton-profile-upper'>
            <div className='skeleton-profile-background'>
                <SkeletonBox width={'100%'} height={'100%'}/>
            </div>
            <div className='skeleton-profile-image'>
                <SkeletonCircle width={'100%'} height={'100%'}/>
            </div>
            <div className='skeleton-profile-info'>
                <SkeletonBox width={'30%'} height={'20%'}/>
                <SkeletonBox width={'40%'} height={'20%'}/>
                <SkeletonBox width={'50%'} height={'20%'}/>
                <SkeletonBox width={'40%'} height={'20%'}/>
            </div>
        </div>
        <div className='skeleton-profile-bottom'>
            <div className='skeleton-profile-tabs'>
                <SkeletonBox width={'24%'} height={'100%'}/>
                <SkeletonBox width={'24%'} height={'100%'}/>
                <SkeletonBox width={'24%'} height={'100%'}/>
                <SkeletonBox width={'24%'} height={'100%'}/>
            </div>
            <div className='skeleton-profile-outlet'>
              <SkeletonBox width={'100%'} height={'100%'}/>
            </div>
        </div>
    </div>
    )
}

const SkeletonExpandedPost = ({darkMode}) => {
    return (
        <div className='skeleton-EP-outer'>
            <div className={`skeleton-EP-body ${darkMode && 'dark'}`}>
                <div className='skeleton-EP-content'>
                        <SkeletonBox width={'200px'} height={'30px'}/>
                    <div className='skeleton-author-info'>
                        <SkeletonCircle height={'40px'} width={'40px'}/>
                        <SkeletonBox width={'200px'} height={'20px'}/>
                        <SkeletonCircle height={'20px'} width={'20px'}/>
                    </div>
                    <SkeletonBox width={'100%'} height={'150px'}/>
                    <div className='skeleton-IP-tags'>
                        <SkeletonPill width={'80px'} height={'25px'}/>
                        <SkeletonPill width={'80px'} height={'25px'}/>
                    </div>
                    <div className='skeleton-IP-socials'>
                        <div className='skeleton-IP-socials-group'>
                        <SkeletonHeart height={'20px'} width={'20px'}/>
                        <SkeletonBox width={'15px'} height={'20'}/>
                        </div>
                        <div className='skeleton-IP-socials-group'>
                        <SkeletonComment height={'20px'} width={'20px'}/>
                        <SkeletonBox width={'15px'} height={'20'}/>
                        </div>
                        <div className='skeleton-IP-socials-group'>
                        <SkeletonShare height={'20px'} width={'20px'}/>
                        <SkeletonBox width={'15px'} height={'20'}/>
                        </div>
                    </div>
                    <div className='skeleton-IP-interact'>
                        <SkeletonBox width={'80px'} height={'25px'}/>
                        <SkeletonBox width={'80px'} height={'25px'}/>
                    </div>
                    <div className='skeleton-EP-comment'>
                        <div className='skeleton-author-info'>
                            <SkeletonCircle height={'40px'} width={'40px'}/>
                            <SkeletonBox width={'200px'} height={'20px'}/>
                        </div>
                        <SkeletonBox width={'200px'} height={'20px'}/>
                    </div>
                    <div className='skeleton-EP-comment'>
                        <div className='skeleton-author-info'>
                            <SkeletonCircle height={'40px'} width={'40px'}/>
                            <SkeletonBox width={'150px'} height={'20px'}/>
                        </div>
                        <SkeletonBox width={'300px'} height={'20px'}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

const SkeletonComments = () => {

    return (
        <div className='skeleton-comments-body'>
            <SkeletonBox width={'80%'} height={'50px'}/>
            <div className='skeleton-comments-post'>
                <SkeletonBox width={'80px'} height={'35px'}/>
            </div>
            <div className='skeleton-comments-individual'>
                <div className='skeleton-comments-author'>
                    <SkeletonCircle width={'2rem'} height={'2rem'}/>
                    <SkeletonBox width={'10rem'} height={'1rem'}/>
                </div>
                <SkeletonBox width={'10rem'} height={'1.5rem'}/>
            </div>
        </div>
    )
}

const SkeletonEditPost = ({darkMode}) => {
    return (
        <div className={`skeleton-edit-post-body ${darkMode && 'dark'}`}>
            <div className='skeleton-edit-title'>
                <SkeletonBox width={'80%'} height={'2.5rem'}/>
            </div>
            <div className='skeleton-edit-author'>
                <SkeletonCircle height={'40px'} width={'40px'}/>
                <SkeletonBox width={'200px'} height={'20px'}/>
                <SkeletonBox width={'70px'} height={'20px'}/>
            </div>
            <SkeletonBox width={'80%'} height={'6rem'}/>
            <div className='skeleton-edit-tags'>
                <span style={{display: 'flex', flexDirection: 'row', gap:'10px'}}>
                    <SkeletonBox width={'50px'} height={'1.5rem'}/>
                    <SkeletonPill width={'80px'} height={'1.5rem'}/>
                    <SkeletonPill width={'80px'} height={'1.5rem'}/>
                    <SkeletonPill width={'80px'} height={'1.5rem'}/>
                    <SkeletonCircle width={'1.5rem'} height={'1.5rem'}/>
                </span>
                <span style={{display: 'flex', flexDirection: 'row', gap:'10px'}}>
                    <SkeletonBox width={'150px'} height={'1.5rem'}/>
                    <SkeletonBox width={'1.5rem'} height={'1.5rem'}/>
                </span>
                <span style={{display: 'flex', flexDirection: 'row', gap:'10px'}}>
                    <SkeletonCircle width={'2rem'} height={'2rem'}/>
                    <SkeletonCircle width={'2rem'} height={'2rem'}/>
                </span>
            </div>
            <div className='skeleton-edit-button'>
                <SkeletonBox width={'70px'} height={'30px'}/>
            </div>
            <div className='skeleton-edit-cancel'>
             <SkeletonCircle width={'30px'} height={'30px'}/>
            </div>
        </div>
    )
}

const SkeletonSettings = ({darkMode, isDesktop}) => {

    function SkeletonSettingsInput() {
        return (
            <div className='skeleton-settings-input'>
            <SkeletonBox width={'4rem'} height={'1rem'}/>
            <SkeletonBox width={isDesktop ? '50%' : '100%'} height={'2rem'}/>
        </div>
        )
    }

    function SkeletonSettingsToggle() {
        return (
            <div className='skeleton-settings-toggle'
            style={isDesktop ? {width: '50%'} : {width: '100%'}}
        >
            <SkeletonBox width={'8rem'} height={'1.5rem'}/>
            <SkeletonPill width={'4rem'} height={'2rem'}/>
        </div>
        )
    }

    return <div className={`skeleton-settings-body ${darkMode && 'dark'}`}>
        <SkeletonBox width={'9rem'} height={'2rem'}/>
        <SkeletonBox width={'7rem'} height={'1.5rem'}/>
        <SkeletonSettingsInput />
        <SkeletonSettingsInput />
        <SkeletonSettingsInput />
        <div style={{width: '0px', height: '1rem'}}></div>
        <SkeletonBox width={'7rem'} height={'1.5rem'}/>
        <SkeletonSettingsToggle />
        <SkeletonSettingsToggle />
    </div>
}

const Skeleton = {
    Profile: SkeletonProfile,
    Home: SkeletonHome,
    ExpandedPost: SkeletonExpandedPost,
    Circle: SkeletonCircle,
    Comments: SkeletonComments,
    EditPost: SkeletonEditPost,
    Liked: SkeletonLiked,
    Settings: SkeletonSettings,
}
export default Skeleton;