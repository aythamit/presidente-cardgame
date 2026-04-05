import { ReactNode, useState } from 'react';
import UserContext from "../context/UserContext.tsx";

interface UserData {
    id: string;
    name: string;
}

function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);

    const cambiarUser = (userObj: UserData | null) => {
        setUser(userObj);
    };

    return (
        <UserContext.Provider value={{ user, cambiarUser }}>
            {children}
        </UserContext.Provider>
    );
}

export default UserProvider;
