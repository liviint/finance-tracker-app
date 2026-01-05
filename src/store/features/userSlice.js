import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { safeLocalStorage } from '@/utils/storage';

const initialState = {
    userDetails: safeLocalStorage.getItem('userDetails') ? JSON.parse(safeLocalStorage.getItem('userDetails')) : null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserDetails: (state, action) => {
            state.userDetails = action.payload;
            safeLocalStorage.setItem("userDetails",JSON.stringify(action.payload))
            Cookies.set('authToken',action.payload.access, {
                expires: 365, 
                secure: true,
                sameSite: 'none',
                domain: window.location.hostname.includes('liviint.com') ? '.liviint.com' : 'localhost'
            });
            Cookies.set('refreshToken',action.payload.access, {
                expires: 365, 
                secure: true,
                sameSite: 'none',
                domain: window.location.hostname.includes('liviint.com') ? '.liviint.com' : 'localhost'
            });
        },
        clearUserDetails: (state) => {
            state.userDetails = null;
            safeLocalStorage.clear()

            const domain = window.location.hostname.includes('liviint.com')
                ? '.liviint.com'
                : 'localhost';

            Cookies.remove('authToken', { domain });
            Cookies.remove('authToken', { domain, sameSite: 'none', secure: true });
            Cookies.remove('refreshToken', { domain });
            Cookies.remove('refreshToken', { domain, sameSite: 'none', secure: true });
        },
    },
});

export const { setUserDetails, clearUserDetails } = userSlice.actions;
export default userSlice.reducer;
