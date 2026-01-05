import React from 'react'
import { useSelector } from 'react-redux';
import Link from 'next/link';
import classes from "./loginFirst.module.css"

const LoginFirst = () => {
    const user = useSelector(state => state?.user?.userDetails)
    return (
        <>
            {!user ? 
                <p className={classes["login-hint"]}>
                    <Link href="/login" >Login</Link> to post
                </p>
                : ""
            }
        </>
    )
}

export default LoginFirst