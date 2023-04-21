import React from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {Avatar, Menu, Popover, Position} from "evergreen-ui";

function HeaderButtonGroup(props) {
    const navigate = useNavigate();
    const location = useLocation();

    function handleLogOut() {
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
        {name: "Courses", href: "#/myCourses", loginRequired: true},
        // {name: "About", href: "#/about", loginRequired: false}
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
            <img src={"../media/logo.png"} style={{height: "55px", left: "calc(50% - 55px)", position: "fixed"}}/>
            <HeaderButtonGroup {...props} />
        </div>
    )
}