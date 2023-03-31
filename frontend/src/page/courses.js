import React, {useEffect, useRef, useState} from "react";
import Axios from "axios";
import Scheduler from "@aldabil/react-scheduler";
import JNotification from "../component/jNotification";
import { Button } from "@mui/material";

function EventPopup(f, event) {

    const fields = {
        "Coach": { value: event.coach, renderType: "span", svg: "../person.svg"},
        "Status": { value: event.status, renderType: "span", svg: "../status.svg"},
        "Slots": { value: (event.registeredSlots || 0) + " / " + event.availableSlots, renderType: "span", svg: "../group.svg"},
        "Description": { value: event.description, renderType: "text", svg: "../text.svg"}
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
        </div>
    );
}

function CustomSpan(props) {
    const { children } = props
    return (
        <span className="MuiTypography-root MuiTypography-caption MuiTypography-noWrap css-49fffr" style={{
            width: "100%"
        }}>
            {children}
        </span>
    )
}

export function MyCourses(props) {
    const cal = useRef(null)

    const [courses, setCourses] = useState([])
    const [fields, setFields] = useState([])
    const [coaches, setCoaches] = useState([])

    async function fetchData() {
        try {
            Axios.defaults.headers.Authorization = "Bearer " + (localStorage.getItem("Authorization") || "");
            const res = await Axios.get("/api/v1/course/getCourses");
            const status = res.data.status;
            if (status === 200) {
                const data = res.data.data;
                buildData(data)
            }
        } catch (err) {
            JNotification.danger(err.response.data.message);
        }
    }

    async function fetchCoaches() {
        try {
            Axios.defaults.headers.Authorization = "Bearer " + (localStorage.getItem("Authorization") || "");
            const res = await Axios.get("/api/v1/user/getCoaches");
            const status = res.data.status;
            if (status === 200) {
                const data = res.data.data;
                let result = data.map(x => { return {
                    id: x.id,
                    username: x.username
                }})
                setCoaches(result)
            }
        } catch (err) {
            JNotification.danger(err.response.data.message);
        }
    }

    useEffect(() => {
        fetchData();
        if (props.userInfo.role === "TRAINEE") {
            fetchCoaches();
            cal.current.scheduler.week.cellRenderer = ({ height, start, onClick, ...props }) => (<Button disableRipple={true}></Button>);
        } else {
            delete cal.current.scheduler.week.cellRenderer;
        }
    },[])


    function buildData(data) {
        buildCourses(data);
        buildFields();
    }

    function buildCourses(data) {
        let result = getCoursesFromData(data);
        cal.current.scheduler.handleState(result, "events");
        setCourses(result);
    }

    function getCoursesFromData(data) {
        let isReadOnly = props.userInfo.role === "TRAINEE"
        let result = data.map(x => { return {
            event_id: x.id,
            title: x.title,
            description: x.description,
            start: new Date(x.startTime),
            end: new Date(x.endTime),
            status: x.status,
            coach: x.owner.username,
            availableSlots: x.availableSlots,
            registeredSlots: x.registeredSlots || 0,
            draggable: !isReadOnly,
            deletable: !isReadOnly,
            editable: !isReadOnly
        }});
        return result;
    }

    async function getCoachCourse(id) {
        if (id == "") {
            cal.current.scheduler.handleState(courses, "events");
            return;
        }
        Axios.defaults.headers.Authorization = "Bearer " + (localStorage.getItem("Authorization") || "");
        await Axios.get("/api/v1/course/getCourse/" + id)
            .then(res => {
                if (res.status === 200) {
                    let result = getCoursesFromData(res.data.data)
                    cal.current.scheduler.handleState(courses.concat(result), "events");
                }
            })
            .catch(error => {
                JNotification.danger("Failed to Load Course");
            })
    }

    function buildFields() {
        let res = [
            {
                name: "status",
                type: "select",
                options: [
                    { id: 1, text: "Active", value: "ACTIVE" },
                    { id: 2, text: "Cancelled", value: "CANCELLED" }
                ],
                default: "ACTIVE",
                config: { label: "Status" }
            },
            {
                name: "availableSlots",
                type: "input",
                default: 10,
                config: { label: "Available Slot" }
            },
            {
                name: "description",
                type: "input",
                default: "Course Description...",
                config: { label: "Details", multiline: true, rows: 4 }
            }
        ]
        cal.current.scheduler.handleState(res, "fields")
        setFields(res)
    }

    async function handleConfirm(e, action) {
        Axios.defaults.headers.Authorization = "Bearer " + (localStorage.getItem("Authorization") || "");
        const query = new FormData();
        query.append("startTime", e.start.getTime());
        query.append("endTime", e.end.getTime());
        query.append("availableSlots", e.availableSlots)
        query.append("registeredSlots", e.registeredSlots || 0)
        query.append("title", e.title);
        query.append("description", e.description)
        query.append("status", e.status)
        let url = action === "create" ? "/api/v1/course/createCourse" : "/api/v1/course/editCourse"
        let method = action === "create" ? "post" : "put"
        if (action === "edit") {
            query.append("id", e.event_id)
        }
        await Axios({
            method: method,
            url: url,
            data: query,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (res.status === 200) {
                JNotification.success("Successfully " + action)
                e = getCoursesFromData([res.data.data])[0]
            }
        }).catch(error => {
            JNotification.danger("Failed to " + action);
            throw new Error("Failed to " + action)
        })
        return e;
    }

    async function handleDelete(id) {
        Axios.defaults.headers.Authorization = "Bearer " + (localStorage.getItem("Authorization") || "");
        await Axios.delete("/api/v1/course/deleteCourse/" + id
        ).then(res => {
            if (res.status === 200) {
                JNotification.success("Successfully Deleted")
            } else {
                throw new Error("Failed to Delete")
            }
        }).catch(error => {
            JNotification.danger("Failed to Delete");
            throw new Error("Failed to Delete")
        })
        return id
    }

    return (
        <div style={{width: "80%", "margin": "auto", "background": "white", "border": "1px solid #ccc"}}>
            {
                coaches.length <= 0
                    ? null
                    : (
                        <select
                            onChange={e => getCoachCourse(e.target.value)}
                        >
                            <option key={-1} label="My Courses"/>
                            {
                                coaches.map((coach, index) =>
                                    <option
                                        key={index}
                                        value={coach.id}
                                        label={coach.username}
                                    />
                                )
                            }
                        </select>
                    )
            }
            <button onClick={() => {
                getCoachCourse(1);
            }}>Test</button>
            <Scheduler
                ref={cal}
                view="week"
                day={null}
                month={null}
                // fields={fields}
                // events={courses}
                onConfirm={(e, action) => handleConfirm(e, action)}
                onEventDrop={(d, u, o) => handleConfirm(u, "edit")}
                onDelete={handleDelete}
                viewerExtraComponent={(f, e) => EventPopup(f, e)}
            />
        </div>
    )
}