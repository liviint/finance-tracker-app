"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { blogApi } from "api";
import Interests from "@/components/profile/Interests";
import Loader from "@/components/common/FullScreenLoader";

export default function UserProfile() {
  const { id } = useParams(); 
  const loggedUser = useSelector(state => state?.user?.userDetails)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
        await blogApi.get(`users/${id}/`)
        .then(res => {
          setUser(res.data)
        })
      .catch( err => {
        console.error(err);
      })
      setLoading(false);
    }

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <Loader />
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-[#333333] text-lg">User not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-[#FAF9F7] rounded-2xl shadow-lg mt-8 min-h-[100vh]">
      <div className="flex items-center gap-6">
        <img
          src={user.profilePic || "https://liviints.sgp1.cdn.digitaloceanspaces.com/media/profile_pics/Portrait_Placeholder.png"}
          alt={`${user.username} avatar`}
          className="w-24 h-24 rounded-full border-2 border-[#FF6B6B]"
        />

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-poppins font-bold text-[#333333]">
            {user.username}
          </h1>
          <p className="text-[#333333] font-inter text-sm">
            {
              user.bio || ""
            }
          </p>
          <Interests interests={user.interests} />
        </div>
      </div>
    </div>
  );
}
