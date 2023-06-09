import React from "react";
import {Badge} from "evergreen-ui";

function CustomSpan(props) {
    const { children } = props;
    return (
        <span className="event-popup">
            {children}
        </span>
    );
}

export function EventPopup(f, event, userInfo, fn) {
    const fields = {
        "Coach": { value: event.coach, renderType: "span", svg: "../media/person.svg"},
        "Status": { value: (<Badge color={event.status === "ACTIVE" ? "green" : "red"}>{event.status}</Badge>), renderType: "span", svg: "../media/status.svg"},
        "Slots": { value: event.registeredSlots === event.availableSlots ? (<Badge color={"red"}>FULL</Badge>) : (event.registeredSlots || 0) + " / " + event.availableSlots, renderType: "span", svg: "../media/group.svg"},
        "Description": { value: event.description, renderType: "text", svg: "../media/text.svg"}
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
                Object.keys(fields).map((field, index) => {
                    let isSpan = fields[field].renderType === "span";
                    let verticalAlign = isSpan ? "middle" : "top";
                    return (
                        <div style={{minHeight: "24px"}}>
                            <CustomSpan key={index} >
                                <img src={fields[field].svg}
                                     width={"20px"}
                                     height={"20px"}
                                     style={{ verticalAlign: verticalAlign, marginLeft: "2px", marginRight: "10px"}}/>
                                {
                                    isSpan
                                        ? fields[field].value
                                        : (
                                            <textarea readOnly={true} style={{width: "340px", resize: "none", border: "1px solid #ccc"}} rows={4}>
                                                {fields[field].value}
                                            </textarea>
                                        )
                                }
                            </CustomSpan>
                        </div>
                    );
                })
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
