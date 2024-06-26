import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from "react";
import { apiClient, executeBasicAuthentication, executeJwtAuthentication, getUserDetails } from "./api/apis";
import { UserData } from "./Interfaces";
import { cookies } from "./Utils";

interface AuthContextType {
    isAuthenticated: boolean;
    setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
    // login: (username: string, password: string) => Promise<boolean>; // Adjusted return type to Promise<boolean>
    login: (username: string, password: string) => Promise<boolean>; // Adjusted return type to Promise<boolean>
    logout: () => void;
    token: string | null;
    userData: UserData;
}

//   export const AuthContext = createContext<AuthContextType>({
//     isAuthenticated: false,
//     login: () => Promise.resolve(false), // Adjusted to return a Promise
//     logout: () => {},
//     token: null, // Adjusted to null instead of an empty string
//   });

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    setIsAuthenticated: () => {},
    login: () => Promise.resolve(false), // Adjusted to return a Promise
    logout: () => { },
    token: null, // Adjusted to null instead of an empty string
    userData: { userId: 0, email: '', password: '', todoHistory: [], name: '' },
});

export const useAuth = () => useContext(AuthContext)
interface Props {
    children?: ReactNode
    // any props that come into the component
}

export default function AuthProvider({ children }: Props) {

    const oneDay = 24 * 60 * 60 * 1000;
    const expirationDate = new Date(Date.now() + oneDay);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(cookies.get("basic_auth")? true : false);
    const [userData, setUserData] = useState<UserData>({ userId: 0, email: '', password: '', todoHistory: [], name: '' });
    const [token, setToken] = useState<string | null>(cookies.get("basic_auth")? cookies.get("basic_auth") : null) //check if i need this

    // const login = async (username: string, password: string): Promise<boolean> => {
    //     let data = await getUserDetails().then((res) => {
    //         if (res && res.data) {
    //             console.log(res.data);
    //             setUserData(res.data);

    //             if (username === 'srikar' && password === 'dummy') {
    //                 setIsAuthenticated(true);
    //                 return true;
    //             }
    //             else {
    //                 setIsAuthenticated(false)
    //                 return false
    //             }

    //         }
    //         return false
    //     })
    //     return data;
    // }

    useEffect(()=> {
        if(isAuthenticated){
            apiClient.interceptors.request.use((config) => {
                config.headers.Authorization = token
                return config
            })
            getUserDetails().then((res2) => {
                if (res2 && res2.data) {
                    setUserData(res2.data);
                    return true;
                }
            })
        }
      },[])

    const login = async (username: string, password: string): Promise<boolean> => {
        const baToken = 'Basic ' + window.btoa(username + ":" + password)

        let data = await executeBasicAuthentication(baToken).then(async (res) => {

            if (res && res.status === 200) {
                cookies.set("basic_auth", baToken, { expires: expirationDate })
                setIsAuthenticated(true)
                // sessionStorage.setItem('isAuthenticated', 'true')
                setToken(baToken) //check if i need this
                apiClient.interceptors.request.use((config) => {
                    config.headers.Authorization = baToken
                    return config
                })
                await getUserDetails().then((res2) => {
                    if (res2 && res2.data) {
                        setUserData(res2.data);
                        return true;
                    }
                })

            }
            else {
                console.log("wrong username or password");
                return false;
            }
            return true;
        })
        return data;
    }

    // const login = async (username: string, password: string): Promise<boolean> => {

    //     let data = await executeJwtAuthentication(username, password).then(async (res) => {
    //         console.log(res);

    //         if (res && res.status === 200) {
    //             const jwtToken = 'Basic ' + res.data.token
    //             setIsAuthenticated(true)
    //             setToken(jwtToken)
    //             apiClient.interceptors.request.use((config) => {
    //                 console.log("dfsdd");

    //                 config.headers.Authorization = jwtToken
    //                 return config
    //             })
    //             await getUserDetails().then((res) => {
    //                 if (res && res.data) {
    //                     console.log(res.data);
    //                     setUserData(res.data);
    //                     return true;
    //                 }
    //             })

    //         }
    //         else {
    //             console.log("wrong username or password");

    //             logout()
    //             return false
    //         }
    //     })
    //     return true;
    // }

    

    const logout = () => {
        cookies.remove("basic_auth");
        setIsAuthenticated(false);
        setToken(null);
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, login, logout, token, userData }}>
            {children}
        </AuthContext.Provider>
    )
} 

