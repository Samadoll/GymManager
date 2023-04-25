import React from "react";
import {EventPanel} from "../component/eventPanel";
import {InfoPanel} from "../component/infoPanel";
import {QuotaList} from "../component/quotaList";

export function MyInfo(props) {
    return (
        <div className="table-content" style={{position: "relative"}}>
            <InfoPanel logout={props.logout}/>
            <div className={"info-panel-divider"}></div>
            <EventPanel eventApi={"/api/v1/course/getTodayCourses"} userInfo={props.userInfo}/>
            <div className={"info-panel-divider"}></div>
            <QuotaList userInfo={props.userInfo} />
        </div>
    )
}
