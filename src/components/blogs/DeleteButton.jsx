'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import DeleteButton from '../common/DeleteButton'
import { api } from 'api'

const DeleteBlog = ({id}) => {
    const router = useRouter()
    const handleDelete = async() =>  {
        try {
            await api.delete(`blogs/${id}/`);
            router.push("/blog/my-blogs"); 
        } catch (err) {
            console.error("Error deleting blog:", err);
        }
    }
    return <DeleteButton item='blog' handleOk={handleDelete} />
}

export default DeleteBlog