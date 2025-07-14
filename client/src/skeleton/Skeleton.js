import './Skeleton.css';

const SkeletonBox = ({width, height}) => {
    return <div className='skeleton-box' style={{width: width, height: height}}>

    </div>
}


const SkeletonCircle = ({width, height}) => {
    return <div className='skeleton-circle' style={{width: width, height: height}}>

    </div>
}

const SkeletonProfile = () => {
    return (
    <div className='skeleton-profile-body'>
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

const Skeleton = {
    Profile: SkeletonProfile
}
export default Skeleton;