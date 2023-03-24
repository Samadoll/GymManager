import React, { useState, useEffect } from "react";
import {HashRouter, Routes, Route, Navigate} from "react-router-dom";
import { Login } from "./page/login";
import { Register } from "./page/register";
import { Header } from "./component/header";
import Axios from "axios";
import { Spinner } from "evergreen-ui";
import { About } from "./page/about";

export function Routex() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState({
        username: "",
        uid: 0
    });
    const [isLoading, setIsLoading] = useState(true)

    function login(userInfo) {
        setIsLoggedIn(true);
        setUserInfo(userInfo);
    }

    function logout() {
        localStorage.removeItem("Authorization");
        delete Axios.defaults.headers.Authorization;
        setUserInfo({
            username: "",
            uid: 0
        });
        setIsLoggedIn(false);
    }

    async function initialFetch() {
        const token = localStorage.getItem("Authorization") || "";
        if (token !== "") {
            try {
                Axios.defaults.headers.Authorization = localStorage.getItem("Authorization") || "";
                const res = await Axios.get("/api/user/checkAuth");
                const status = res.status;
                if (status === 200) {
                    setUserInfo({
                        username: res.data.data.username,
                        uid: res.data.data.uid
                    });
                    setIsLoggedIn(true);
                } else {
                    logout();
                }
            } catch (e) {
                logout();
            }
        }
        setIsLoading(false);
    }

    useEffect(() => {
        initialFetch();
    }, [])

    return (
        <HashRouter>
            <Header
                isLoggedIn={isLoggedIn}
                userInfo={userInfo}
                logout={logout}
            />
            <div className="content">
                {
                    isLoading
                        ? (
                            <div className="loading-container">
                                <div className="opblock-loading-animation">
                                    <Spinner marginX="auto" size={100}/>
                                </div>
                            </div>
                        )
                        : (
                            <Routes>
                                <Route exact path="/" element={(<About />)} />
                                <Route path="/loginPage" element={
                                    isLoggedIn ? (<Navigate to="/" />) : (<Login login={login} />)
                                }/>
                                <Route exact path="/registerPage" element={
                                    isLoggedIn ? (<Navigate to="/" />) : (<Register />)
                                }/>
                                <Route exact path="/about" element={<About />} />
                            </Routes>
                        )
                }
            </div>
        </HashRouter>
    );
}