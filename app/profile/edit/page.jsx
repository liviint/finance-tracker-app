'use client';
import React, { useState, useEffect } from 'react';
import { api } from 'api';
import { useSelector } from 'react-redux';
import classes from "../profile.module.css"
import { useRouter } from 'next/navigation';

const ProfilePage = () => {
  const router = useRouter()
  const user = useSelector(state => state?.user?.userDetails)
  const [availableInterests, setAvailableInterests] = useState([]);
  const [formData, setFormData] = useState({
    username:"",
    profilePic:null,
    phone_number:"",
    groups:[],
    bio:"",
    interests:[],
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewProfilePic,setPreviewProfilePic] = useState(null)

  const getUserData = () => {
    api({
        url:"accounts/profile/",
        method:"GET",
        headers: {
            Authorization: `Bearer ${user.access}`,
        },
    }).then(res => {
        console.log(res,"hello res")
        setFormData(res.data)
        setPreviewProfilePic(res.data.profilePic)
    }).catch(error => console.log(error))
    .finally(() => setLoading(false))
  }

  useEffect(() => {
      getUserData()
  },[])

  useEffect(() => {
    const fetchIntrests = () => {
      api.get( "accounts/interests/")
      .then(res => {
        setAvailableInterests(res.data.results)
      })
      .catch(err => console.log(err));
    }
    fetchIntrests()
  }, []);

  const handleChange = (e) => {
    const {name,value,files, type} = e.target
    setFormData(prev => ({
        ...prev,
        [name]:type === "file" ? files[0] : value
    }))
    if(name === "phone_number"){
        setMessage(prev => ({
            ...prev,
            phone_number:""
        }))
    }
    if(type === "file"){
        setPreviewProfilePic(URL.createObjectURL(files[0]))
    }
    setError("")
    setSuccess(false)
  };

  const handleInterestToggle = (id) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests?.some(i => i.id === id)
        ? prev.interests.filter((i) => i.id !== id)
        : [...(prev.interests || []), {id}],
    }));
  };


  const handleSubmit = (e) => {
      e.preventDefault()
      const data = new FormData();
      data.append("username", formData.username);
      data.append("phone_number", formData.phone_number);
      data.append("bio", formData.bio);
      formData.profilePic && formData.profilePic instanceof File && data.append("profilePic", formData.profilePic);
      formData.interests?.forEach(i => data.append("interests_ids", i.id));

      api({
          url:`accounts/profile/`,
          method:"PATCH",
          headers: {
              Authorization: `Bearer ${user.access}`,
              'content-type': 'multipart/form-data'
          },
          data,
      }).then(res => {
          setFormData(res.data)
          router.push("/profile")
      }).catch(error => {
        console.log(error)
        setError(error?.response?.data?.username?.[0] || "An error occurred.")
      })
    }

  if (loading) {
    return <div className={"form-container"}><p>Loading profile...</p></div>;
  }

  return (
    <div className={"form-container"}>
      <div className={"form"} >
        <h2>Profile form</h2>

        {error && <p className={"error"}>{error}</p>}
        {success && <p className={"success"}>{success}</p>}

        <div className={"formGroup"}>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
          />
        </div>

        <div className={"formGroup"}>
          <label>Bio</label>
          <textarea
            name="bio"
            rows="3"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us a little about yourself..."
          />
        </div>
        <div>
          <label for="username">Profile photo</label>
          <div className={classes['profilePic-container-outer']}>
              <input 
                  type="file" 
                  name="profilePic" 
                  placeholder="Profile picture" 
                  onChange={handleChange}
              />
              {
              previewProfilePic ? 
                  <div className={classes['profilePic-container-inner']}>
                      <img src={previewProfilePic} alt="Profile photo" />
                  </div> : ""
              }
          </div>
        </div>

        {/* <div className="formGroup">
          <label>Interests</label>
          <div className={classes["interests-container"]}>
            {availableInterests.map((interest) => {
              const selected = formData.interests?.some(i => i.id === interest.id)
              return (
                <button
                  type="button"
                  key={interest.id}
                  className={`${classes['interest-item']} ${selected ?  classes['selected'] : "" }`}
                  onClick={() => handleInterestToggle(interest.id)}
                >
                  {interest.name}
                </button>
              );
            })}
          </div>
        </div> */}

        <button 
          className={"btn"} 
          disabled={updating} 
          onClick={handleSubmit}
        >
          {updating ? 'Updating...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;



