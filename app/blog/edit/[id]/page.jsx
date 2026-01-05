'use client'
import React from 'react'
import { useParams } from 'next/navigation'
import AddEditBlogForm from '@/components/blogs/AddEditBlogForm'

const page = () => {
    const {id} = useParams()
  return (
    <>
      <AddEditBlogForm blogId={id}  />
    </>
  )
}

export default page