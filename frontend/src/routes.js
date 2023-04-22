import React, { useState, useEffect } from "react";
import {HashRouter, Routes, Route, Navigate} from "react-router-dom";
import { Login } from "./page/login";
import { Register } from "./page/register";
import { Header } from "./component/header";
import { Spinner } from "evergreen-ui";
import { Home } from "./page/home"
import { MyInfo } from "./page/myInfo";
import { MyCourses } from "./page/courses";
import JAxios from "./component/jAxios";
import { About } from "./page/about";

export function Routex() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState({
        username: "",
        uid: 0,
        role: ""
    });
    const [isLoading, setIsLoading] = useState(true)

    function login(userInfo) {
        setIsLoggedIn(true);
        setUserInfo(userInfo);
    }

    async function logout(flag=true) {
        if (flag) await JAxios.post("/api/v1/auth/logout", null);
        setUserInfo({
            username: "",
            uid: 0,
            role: ""
        });
        setIsLoggedIn(false);
    }

    async function initialFetch() {
        try {
            const res = await JAxios.get("/api/v1/auth/checkAuth");
            if (res.status === 200) {
                setUserInfo({
                    username: res.data.username,
                    uid: res.data.uid,
                    role: res.data.role
                });
                setIsLoggedIn(true);
            } else {
                logout(false);
            }
        } catch (e) {
            logout(false);
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
                                <Route exact path="/" element={
                                    isLoggedIn ? (<MyInfo isLoggedIn={isLoggedIn} userInfo={userInfo} logout={logout} />) : (<Home />)
                                }/>
                                <Route exact path="/myCourses" element={
                                    isLoggedIn ? (<MyCourses userInfo={userInfo} />) : (<Navigate to="/" />)
                                }/>
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