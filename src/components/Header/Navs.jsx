'use client'
import {useState } from "react"
import { useSelector } from "react-redux"
import classes from './header.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Navs = () => {
    const pathname = usePathname()
    const isActive = (href) => pathname === href
    const userDetails = useSelector(state => state?.user?.userDetails);
    return (
        <>
            <LargeScreenNav isActive={isActive}  userDetails={userDetails}/>
            <SmallScreenNav isActive={isActive} userDetails={userDetails}/>
        </>
    )
}

const LargeScreenNav = ({userDetails,isActive}) => {
    return (
    <div className={`${classes["nav-large-screen"]} ${classes["nav"]}` }>
        <Link 
            className={isActive("/") ? classes['active-nav'] : ""}  
            href="/"
        >
            Home
        </Link> 
        <Link 
            className={isActive("/feedback") ? classes['active-nav'] : ""}  
            href="/feedback"
            onClick={() => setIsPopOpen(!isPopOpen)}
        >
            Feedback
        </Link>
        {
            userDetails ? 
            <Link 
                className={isActive("/profile") ? classes['active-nav'] : ""}  
                href="/profile" 
            >
                    Profile
            </Link> :
            <Link 
                className={isActive("/login") ?  classes['active-nav'] : ""}  
                href="/login" 
            >
                Login
            </Link>
        }
    </div>
    )
}

const SmallScreenNav = ({userDetails,isActive}) => {
    const [isPopOpen,setIsPopOpen] = useState(false)
    return (
    <div className={classes["nav-small-screen-container"]} >
        <div onClick={() => setIsPopOpen(!isPopOpen)}  className={classes["hurmbugger-container"]}>
                <img alt={isPopOpen ? "Close" : "Open menu"} src={!isPopOpen ? '/images/hamburger.png' : '/images/close.png'}/>
            </div>
        <div 
            className={isPopOpen ? `${classes["nav-small-screen"]} ${classes["nav"]} ${classes["nav-small-screen-open"]}` : `${classes["nav-small-screen"]} ${classes["nav"]}`}>
            <Link 
                className={isActive("/") ? classes['active-nav'] : ""}  
                href="/" 
                onClick={() => setIsPopOpen(!isPopOpen)}
            >
                Home
            </Link> 
            <Link 
                className={isActive("/feedback") ? classes['active-nav'] : ""}  
                href="/feedback"
                onClick={() => setIsPopOpen(!isPopOpen)}
            >
                Feedback
            </Link>
            {
            userDetails ? 
            <Link 
                className={isActive("/profile") ? classes['active-nav'] : ""}  
                href="/profile" 
                onClick={() => setIsPopOpen(!isPopOpen)}
            >
                    Profile
            </Link> :
            <Link 
                className={isActive("/login") ?  classes['active-nav'] : ""}  
                href="/login" 
                onClick={() => setIsPopOpen(!isPopOpen)}
            >
                Login
            </Link>
        }
        </div>
    </div>
)
}



export default Navs
