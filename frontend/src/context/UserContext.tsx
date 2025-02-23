import React, { createContext } from 'react';

const UserContext = createContext({
    user: {},
    cambiarUser: () => {}
});

export default UserContext;