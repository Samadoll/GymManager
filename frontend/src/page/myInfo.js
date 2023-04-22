import React, {useEffect, useState} from "react";
import Axios from "axios";
import {Avatar, Badge} from "evergreen-ui";
import JNotification from "../component/jNotification";
import {EventPanel} from "../component/eventPanel";

function PasswordInput(props) {
    return (
        <>
            <div>
                <label className="input-field-label">{props.name}:</label>
            </div>
            <input
                className="input-field"
                maxLength="20"
                required
                placeholder={props.placeholder}
                type="password"
                onChange={e => props.setValueFn(e.target.value)}
                value={props.value}
            />
        </>
    )
}

function InfoPanel(props) {
    const [info, setInfo] = useState({});
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);

    async function fetchUserData() {
        try {
            const res = await Axios.get("/api/v1/user/getInfo");
            const status = res.data.status;
            if (status === 200) {
                const data = res.data.data;
                setInfo(data);
            }
        } catch (err) {
            JNotification.danger(err.response.data.message);
        }
    }

    useEffect(() => {
        fetchUserData();
    }, [])

    function handleChangePassword() {
        if (oldPassword === "" || newPassword === "" || confirmPassword === "") {
            JNotification.danger("Please enter valid password.");
            return;
        }
        if (newPassword !== confirmPassword) {
            JNotification.danger("Password Not Match");
            return;
        }

        const loginQuery = new FormData();
        loginQuery.append("username", info.username);
        loginQuery.append("password", oldPassword);
        Axios({
            method: "post",
            url: "/api/v1/auth/authenticate",
            data: loginQuery,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (res.status === 200) {
                const query = new FormData();
                query.append("password", newPassword);
                Axios({
                    method: "put",
                    url: "/api/v1/auth/password",
                    data: query,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then((res) => {
                    if (res.status === 200) {
                        JNotification.success("Password is changed. Please login.");
                        props.logout();
                    }
                }).catch((err) => {
                    JNotification.danger("Failed to Change Password");
                })
            }
        }).catch(error => {
            JNotification.danger("Failed to Change Password");
        })
    }

    return (
        <div className={"info-panel"}>
            <Avatar
                name={info.username}
                size={100}
                marginTop="5px"
            />
            <br/>
            <label>{info.username}</label>
            <br/>
            <Badge color={info.role === "COACH" ? "yellow" : "green"}
                   style={{fontSize: "16px", height: "16px"}}>{info.role}</Badge>
            <br/>
            <label style={{fontSize: "15px"}}>Member
                Since: {new Date(info["registerTime"]).toLocaleString().split(",")[0]}</label>
            <hr style={{borderTop: "1px solid #EDF0F2"}}/>
            <div style={{
                width: "80%",
                margin: "10px auto"
            }}>
                {
                    !showChangePasswordForm
                        ? (
                            <button
                                onClick={() => setShowChangePasswordForm(true)}
                                className="login-register-button-primary"
                            >Change Password</button>
                        )
                        : (
                            <div>
                                <form>
                                    <PasswordInput name={"Old Password"} placeholder={"Enter Old Password..."}
                                                   value={oldPassword} setValueFn={setOldPassword}/>
                                    <br/>
                                    <PasswordInput name={"New Password"} placeholder={"Enter New Password..."}
                                                   value={newPassword} setValueFn={setNewPassword}/>
                                    <br/>
                                    <PasswordInput name={"Confirm Password"} placeholder={"Re-Enter Password..."}
                                                   value={confirmPassword} setValueFn={setConfirmPassword}/>
                                </form>
                                <button
                                    style={{marginBottom: 10}}
                                    onClick={() => handleChangePassword()}
                                    className="login-register-button-primary"
                                >Submit
                                </button>
                                <button
                                    onClick={() => {
                                        setShowChangePasswordForm(false);
                                        setOldPassword("");
                                        setNewPassword("");
                                        setConfirmPassword("");
                                    }}
                                    className="login-register-button-secondary"
                                >Cancel
                                </button>
                            </div>
                        )
                }
            </div>
        </div>
    )
}

export function MyInfo(props) {
    return (
        <div className="table-content">
            <InfoPanel logout={props.logout}/>
            <EventPanel eventApi={"/api/v1/course/getTodayCourses"} userInfo={props.userInfo}/>
        </div>
    )
}