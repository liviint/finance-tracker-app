'use client';
import React,{useState, useEffect } from 'react';
import styles from './profile.module.css';
import { useSelector } from 'react-redux';
import { api } from 'api';
import { useRouter } from 'next/navigation';
import { clearUserDetails } from '@/store/features/userSlice';
import { useDispatch } from 'react-redux';
import Interests from '@/components/profile/Interests';

const ProfileView = () => {
    const router = useRouter()
    const dispatch = useDispatch()
    const user = useSelector(state => state?.user?.userDetails)
    const [userData,setUserData] = useState({})
    const [canUserAddBlogs,setCanUserAddBlogs] = useState(false)

    const handleLogout = () => {
      let refereshToken = JSON.parse(localStorage.getItem("userDetails")).refresh
      api({
            url:"accounts/logout/",
            method:"POST",
            data:{refresh: refereshToken}
        }).then(res => {
          console.log(res,"hello res")
        }).catch(error => console.log(error))
        .finally(() => {
          dispatch(clearUserDetails())
          router.push("/")
        })
    }

    const getUserData = () => {
        api({
            url:"accounts/profile/",
            method:"GET",
            headers: {
                Authorization: `Bearer ${user.access}`,
            },
        }).then(res => {
            setUserData(res.data)
            setCanUserAddBlogs(res.data.groups.some(group => group.name === "Blog Author"))
        }).catch(error => console.log(error))
    }

    useEffect(() => {
        getUserData()
    },[])

  return (
    <div className={styles["profile-container"]}>
      <div className={styles.card}>
        {userData.profilePic ? <div className={styles.avatarWrapper}>
          <img
            src={userData.profilePic}
            alt={`${userData.name}'s profile`}
            className={styles.avatar}
          />
        </div> : ""}
        <h2 className={styles.email}>{userData.username}</h2>
        <p className={styles.bio}>{userData.bio}</p>

        {/* <Interests interests={userData.interests || []} /> */}

        <div className={styles['btnGroup']}>
            <button  
              className={"btn"}
              onClick={() => router.push("profile/edit")}
            >
            Update profile
          </button>
          <button  
              className={"btn"}
              onClick={() => router.push("journal")}
            >
            My Journal
          </button> 
          <button  
              className={"btn"}
              onClick={() => router.push("habits/entries")}
            >
            My Habits tracker
          </button> 
          {
            canUserAddBlogs ? 
                <button  
                  className={"btn"}
                  onClick={() => router.push("blog/my-blogs")}
                >
                My blogs
              </button> : ""
            }
          <button  
          className={"btn"}
          onClick={handleLogout}
        >
          Log out 
        </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
