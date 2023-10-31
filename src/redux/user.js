import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userData: {},
};

export const userReducer = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setUserData } = userReducer.actions;

export const getUser = (state) => state.userData;

export default userReducer.reducer;
