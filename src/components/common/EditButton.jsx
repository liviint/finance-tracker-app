'use client'
import React from 'react'
import Link from "next/link";

const EditButton = ({contentAuthor,href,loggedUser}) => {
    if (loggedUser === contentAuthor)  {
        return  (
            <div className="flex items-center gap-2">
                <Link
                    href={href}
                    className="text-yellow-600 hover:underline"
                >
                    Edit
                </Link>
            </div>)
    }
}

export default EditButton