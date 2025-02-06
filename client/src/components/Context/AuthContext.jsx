import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedUser = JSON.parse(atob(token.split('.')[1])); // Decode JWT
                console.log(decodedUser);  // Verify the decoded token structure
                setUser(decodedUser);  // Set user from decoded token
            } catch (error) {
                console.error("Invalid token");
                localStorage.removeItem("token");
            }
        }
    }, []);

    const login = (token) => {
        localStorage.setItem("token", token);
        const decodedUser = JSON.parse(atob(token.split('.')[1]));  // Decode JWT
        setUser(decodedUser);  // Set the user from the decoded JWT
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
