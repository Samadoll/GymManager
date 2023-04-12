import React from "react";
import {Badge} from "evergreen-ui";

function CustomSpan(props) {
    const { children } = props;
    return (
        <span className="MuiTypography-root MuiTypography-caption MuiTypography-noWrap css-49fffr" style={{
            width: "100%"
        }}>
            {children}
        </span>
    );
}

export function EventPopup(f, event, userInfo, fn) {
    const fields = {
        "Coach": { value: event.coach, renderType: "span", svg: "../person.svg"},
        "Status": { value: (<Badge color={event.status === "ACTIVE" ? "green" : "red"}>{event.status}</Badge>), renderType: "span", svg: "../status.svg"},
        "Slots": { value: event.registeredSlots === event.availableSlots ? (<Badge color={"red"}>FULL</Badge>) : (event.registeredSlots || 0) + " / " + event.availableSlots, renderType: "span", svg: "../group.svg"},
        "Description": { value: event.description, renderType: "text", svg: "../text.svg"}
    };
    let action = "";
    if (userInfo.role === "COACH") {
        action = !event.published ? "PUBLISH" : (event.status === "ACTIVE" ? "CANCEL" : "ACTIVATE");
    } else {
        action = event.isRegistered ? "DEREGISTER" : "REGISTER";
    }
    return (
        <div>
            {
                Object.keys(fields).map((field, index) => (
                    <div style={{minHeight: "24px"}}>
                        {
                            fields[field].renderType === "span"
                                ? (
                                    <CustomSpan key={index} >
                                        <img src={fields[field].svg}
                                             width={"20px"}
                                             height={"20px"}
                                             style={{ verticalAlign: "middle", marginLeft: "2px", marginRight: "10px"}}/>
                                        {fields[field].value}
                                    </CustomSpan>
                                )
                                : (
                                    <CustomSpan key={index} >
                                        <img src={fields[field].svg}
                                             width={"20px"}
                                             height={"20px"}
                                             style={{ verticalAlign: "top", marginLeft: "2px", marginRight: "10px"}}
                                        />
                                        <textarea readOnly={true} style={{width: "340px", resize: "none", border: "1px solid #ccc"}} rows={4}>
                                            {fields[field].value}
                                        </textarea>
                                    </CustomSpan>
                                )
                        }
                    </div>
                ))
            }
            {
                action === "" || (event.status === "CANCELLED" && userInfo.role !== "COACH" && action !== "DEREGISTER") || event.start < Date.now()
                    ? null
                    : (
                        <button
                            onClick={() => { fn.apply(null, [event, action]) }}
                            className="login-register-button-primary"
                        >{action}</button>
                    )
            }
        </div>
    );
}
