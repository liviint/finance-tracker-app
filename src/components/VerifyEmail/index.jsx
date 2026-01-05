'use client'
import { useEffect, useState } from 'react';
import { api } from 'api';
import { useDispatch } from 'react-redux'
import { setUserDetails } from '../../store/features/userSlice';
import { useRouter,useSearchParams } from 'next/navigation'

function VerifyEmail() {
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('loading'); 
    const [message, setMessage] = useState('');
    const router = useRouter();
    const source = searchParams.get('source');

    useEffect(() => {
      const uid = searchParams.get('uid');
      const token = searchParams.get('token');
      if (source === 'app') return

      if (!uid || !token) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      api
        .get(`/accounts/verify-email/?uid=${uid}&token=${token}`)
        .then((res) => {
            if(res?.data?.detail){
              setMessage(res.data.detail);
              setStatus('success');
              return 
            }
            dispatch(setUserDetails(res.data))
            console.log(res.data,"hello res data here")
            localStorage.setItem("token",res.data.access)
            setStatus('success');
            setMessage('Email verified and logged in! Redirecting...');
            setTimeout(() => router.push('/profile'), 3000);
        })
      .catch((err) => {
        console.log(err,"hello error")
        setStatus('error');
        setMessage(err.response?.data?.detail || 'Verification failed.');
      });
}, [searchParams, router.push]);


  return (
    <div style={{ textAlign: 'center', marginTop: '80px', height:"100vh" }}>
      {status === 'loading' && 
      source === 'app' ? (
        <p>Opening in the ZeniaHub app…</p>
      ) : (
        <p>Verifying your email...</p>
      )
}
      {status === 'success' && (
        <p style={{ color: 'green' }}>{message}</p>
      )}
      {status === 'error' && (
        <p style={{ color: 'red' }}>{message}</p>
      )}
    </div>
  );
}

export default VerifyEmail;


