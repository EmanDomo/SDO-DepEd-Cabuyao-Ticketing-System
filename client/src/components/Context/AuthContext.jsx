// import { createContext, useContext, useEffect, useState } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);

//     useEffect(() => {
//         const token = localStorage.getItem("token");
//         if (token) {
//             try {
//                 const decodedUser = JSON.parse(atob(token.split('.')[1])); // Decode JWT
//                 console.log(decodedUser);  // Verify the decoded token structure
//                 setUser(decodedUser);  // Set user from decoded token
//             } catch (error) {
//                 console.error("Invalid token");
//                 localStorage.removeItem("token");
//             }
//         }
//     }, []);

//     const login = (token) => {
//         localStorage.setItem("token", token);
//         const decodedUser = JSON.parse(atob(token.split('.')[1]));  // Decode JWT
//         setUser(decodedUser);  // Set the user from the decoded JWT
//     };

//     const logout = () => {
//         localStorage.removeItem("token");
//         setUser(null);
//     };

//     return (
//         <AuthContext.Provider value={{ user, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser); // Set user from localStorage if available
            } catch (error) {
                console.error("Error reading user data from localStorage", error);
                // Clean up invalid token/user data
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }
    }, []);

    const login = (token) => {
        localStorage.setItem("token", token);
        const decodedUser = JSON.parse(atob(token.split('.')[1]));  // Decode JWT
        localStorage.setItem("user", JSON.stringify(decodedUser)); // Store user info in localStorage
        setUser(decodedUser); // Set the user in state
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null); // Reset the user state
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

