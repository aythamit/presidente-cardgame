import React, { createContext } from 'react';

interface UserData {
    id: string;
    name: string;
}

interface UserContextType {
    user: UserData | null;
    cambiarUser: (user: UserData | null) => void;
}

const UserContext = createContext<UserContextType>({
    user: null,
    cambiarUser: () => {}
});

export default UserContext;
