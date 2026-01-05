'use client'
import React from 'react'
import ShareButton from '../common/ShareButton'

const Share = () => {
  return (
    <ShareButton url={window.location.href}/>
  )
}

export default Share