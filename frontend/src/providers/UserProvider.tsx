import { useState } from 'react';
import UserContext from "../context/UserContext.tsx";

function UserProvider({ children }) {
    const [user, setUser] = useState(null);

    const cambiarUser = (userObj:object) => {
        setUser(userObj);
    };

    return (
        <UserContext.Provider value={{ user, cambiarUser }}>
            {children}
        </UserContext.Provider>
    );
}

export default UserProvider;