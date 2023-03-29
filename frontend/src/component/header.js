import React from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {Avatar, Menu, Popover, Position} from "evergreen-ui";
import Axios from "axios";

function HeaderButtonGroup(props) {
    const navigate = useNavigate();
    const location = useLocation();

    function handleLogOut() {
        Axios.defaults.headers.Authorization = localStorage.getItem("Authorization");
        // Axios.post("/api/v1/auth/logout"); TODO: used to evict authorization token
        props.logout();
        navigate("/")
    }

    return props.isLoggedIn
        ? (
            <div className="header-button-group">
                <Popover
                    position={Position.BOTTOM_LEFT}
                    content={
                        <Menu>
                            {/*<Menu.Group>*/}
                            {/*    <Menu.Item icon="person" onSelect={() => navigate("/myAccount")}>My Account</Menu.Item>*/}
                            {/*</Menu.Group>*/}
                            {/*<Menu.Divider />*/}
                            <Menu.Group>
                                <Menu.Item
                                    icon="key"
                                    intent="danger"
                                    onSelect={() => handleLogOut()}
                                >
                                    Sign Out
                                </Menu.Item>
                            </Menu.Group>
                        </Menu>
                    }
                >
                    <Avatar
                        name={props.userInfo.username}
                        size={40}
                        marginTop="5px"
                    />
                </Popover>
            </div>
        )
        : (
            <div className="header-button-group">
                <button
                    onClick={() => {
                        if (location.pathname === "/loginPage") return;
                        navigate("/loginPage");
                    }}
                    className="header-button"
                >Sign In</button>
                <button
                    onClick={() => {
                        if (location.pathname === "/registerPage") return;
                        navigate("/registerPage");
                    }}
                    className="header-button"
                >Sign Up</button>
            </div>
        )
}

export function Header(props) {
    const pages = [
        {name: "Home", href: "#/", loginRequired: false},
        {name: "My Courses", href: "#/myCourses", loginRequired: true},
        {name: "About", href: "#/about", loginRequired: false}
    ];
    return (
        <div id="header" className="sticky-header">
            {
                pages.filter(page => !page.loginRequired || page.loginRequired === props.isLoggedIn)
                    .map(page =>
                        <div key={page.name} className="header-pages">
                            <a href={page.href}>
                                <label>{page.name}</label>
                            </a>
                        </div>
                    )
            }
            <HeaderButtonGroup {...props} />
        </div>
    )
}