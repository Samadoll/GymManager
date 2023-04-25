import React, {useEffect, useState} from "react";
import JAxios from "./jAxios";
import JNotification from "./jNotification";
import {Badge, Dialog, PeopleIcon, Select} from "evergreen-ui";

const StateColours = {
    "REQUESTED": "blue",
    "ACTIVE": "green",
    "DECLINED": "red",
    "FINISHED": "neutral"
}

function QuotaCardDeck(props) {
    return props.quotas.length === 0
        ? null
        : props.quotas.map((quota, index) => <QuotaCard key={index} userInfo={props.userInfo} quota={quota} actionCallback={props.actionCallback} />)
}

function QuotaCard(props) {
    const displayName = props.userInfo.role === "COACH" ? props.quota.trainee.username : props.quota.coach.username;
    const isCoach = props.userInfo.role === "COACH";
    const isState = (state) => props.quota.quotaState === state;
    const coachActionable = isCoach && isState("REQUESTED");
    const buttons = [
        {action: "APPROVE", display: coachActionable, color: "success"},
        {action: "DECLINE", display: coachActionable, color: "danger"},
        {action: "CANCEL", display: !isCoach && isState("REQUESTED"), color: "danger"},
        {action: "RENEW", display: !isCoach && isState("FINISHED"), color: "info"},
        {action: "REMOVE", display: !isCoach && (isState("FINISHED") || isState("DECLINED")), fn: () => props.actionCallback("CANCEL", props.quota), color: "danger"}
    ];
    const filteredButtons = buttons.filter(t => t.display);
    const buttonSize = 90 / filteredButtons.length;
    return (
        <div className={"event-panel-element"}>
            <h6 className={"event-element event-title"}>{displayName}</h6>
            <p className={"event-element event-text"}>Quota - {props.quota.quota}</p>
            <Badge color={StateColours[props.quota.quotaState]} style={{verticalAlign: "top"}}>{props.quota.quotaState}</Badge>
            <div className={"quota-element-button-group"}>
                {
                    buttons.filter(t => t.display).map((button, index) =>
                        <button
                            className={"bttn-" + button.color}
                            style={{width: buttonSize + "%"}}
                            key={index}
                            onClick={button.fn !== undefined ? () => button.fn() : () => props.actionCallback(button.action, props.quota)}
                        >{button.action}</button>
                    )
                }
            </div>
        </div>
    )
}

export function QuotaList(props) {
    const [requestingQuotas, setRequestingQuotas] = useState([]);
    const [existingQuotas, setExistingQuotas] = useState({});
    const [userSize, setUserSize] = useState(0);
    const [showCoachRegisterModal, setShowCoachRegisterModal] = useState(false);
    const [selectedQuotaID, setSelectedQuotaID] = useState(0);
    const [availableCoaches, setAvailableCoaches] = useState([]);

    const [requestingCoach, setRequestingCoach] = useState(0);
    const [quota, setQuota] = useState(1);

    async function fetchUsers() {
        await JAxios.get("/api/v1/user/getQuotas")
            .then(res => {
                if (res.data.status === 200) {
                    setExistingQuotas({});
                    const requesting = [];
                    const existing = {};
                    res.data.data.forEach(item => {
                        if (item.quotaState === "REQUESTED" || item.quotaState === "DECLINED") {
                            requesting.push(item);
                        } else {
                            existing[item.id] = item;
                        }
                    });
                    setRequestingQuotas([...requesting]);
                    setExistingQuotas({...existing});
                    setUserSize(requesting.length + Object.keys(existing).length);
                } else {
                    JNotification.danger(res.data.message);
                }
            })
            .catch(err => {
                JNotification.danger(err.message);
            });
    }

    useEffect(() => {
        fetchUsers();
    }, [])

    function handleQuotaAction(action, quota) {
        if (action === "RENEW") {
            requestOnClick(action, quota.id);
        } else {
            const userId = props.userInfo.role === "COACH" ? quota.trainee.id : quota.coach.id;
            actionOnQuota(action, userId.toString(), quota.quota.toString());
        }
    }

    function requestOnClick(action, id) {
        if (action === "NEW") {
            loadAvailableCoaches();
        } else if (action === "RENEW") {
            setSelectedQuotaID(id);
            setRequestingCoach(existingQuotas[selectedQuotaID].coach.id);
            setShowCoachRegisterModal(true);
        }
    }

    async function loadAvailableCoaches() {
        await JAxios.get("/api/v1/user/getAvailableCoaches")
            .then(res => {
                if (res.status === 200) {
                    setAvailableCoaches(res.data.data);
                    setShowCoachRegisterModal(true);
                } else {
                    JNotification.danger(res.data.message);
                }
            })
            .catch(err => {
                JNotification.danger(err.message);
            });
    }

    function handleQuotaChange(value) {
        if (+value > 100) setQuota(100);
        else if (+value < 1) setQuota(1);
        else setQuota(+value);
    }

    function handleClose() {
        setShowCoachRegisterModal(false);
        setSelectedQuotaID(0);
        setRequestingCoach(0);
        setQuota(1);
    }

    function handleConfirm(close) {
        if (requestingCoach === 0) {
            JNotification.danger("Please Select a Coach");
            return;
        }
        actionOnQuota("REQUEST", requestingCoach.toString(), quota.toString(), close);
    }

    async function actionOnQuota(action, userId, quota, callback) {
        const query = new FormData();
        query.append("action", action);
        query.append("userId", userId);
        query.append("quota", quota);
        await JAxios.post("/api/v1/user/actionOnQuota", query)
            .then(res => {
                if (callback !== undefined) callback();
                fetchUsers();
            })
            .catch(err => {
                JNotification.danger(err.message);
            })
    }

    return (
        <>
            <div className={"user-list-panel"}>
                <PeopleIcon size={24} color={userSize === 0 ? "disabled" : "muted"}/>
                <label className={"event-panel-title" + (userSize === 0 ? "-empty" : "")}>
                    {
                        userSize === 0
                            ? "No Registered " + (props.userInfo.role === "COACH" ? "Trainees" : "Coaches")
                            : "Your Registered " + (props.userInfo.role === "COACH" ? "Trainees" : "Coaches")
                    }
                </label>
                {
                    props.userInfo.role === "COACH"
                        ? null
                        : (
                            <>
                                <button
                                    style={{marginTop: "10px"}}
                                    onClick={() => requestOnClick("NEW", 0)}
                                    className="info-panel-button login-register-button-primary"
                                >Coach Request
                                </button>
                                {requestingQuotas.length === 0 && Object.values(existingQuotas).length === 0 ? null : <hr style={{borderTop: "1px solid #EDF0F2"}}/>}
                            </>
                        )
                }
                <QuotaCardDeck userInfo={props.userInfo} quotas={[...requestingQuotas]} actionCallback={handleQuotaAction} />
                {requestingQuotas.length === 0 || Object.values(existingQuotas).length === 0 ? null : <hr style={{borderTop: "1px solid #EDF0F2"}}/>}
                <QuotaCardDeck userInfo={props.userInfo} quotas={[...Object.values(existingQuotas)]} actionCallback={handleQuotaAction} />
            </div>
            <Dialog
                isShown={showCoachRegisterModal}
                title={"Request Coach Quota" + (selectedQuotaID === 0 ? "" : (" : " + existingQuotas[selectedQuotaID].coach.username))}
                onCloseComplete={() => handleClose()}
                preventBodyScrolling
                confirmLabel="Request"
                onConfirm={(close) => handleConfirm(close)}
            >
                <form id="coach-register-form">
                    {
                        selectedQuotaID === 0
                            ? (
                                <>
                                    <div>
                                        <label className="input-field-label">Coach:</label>
                                    </div>
                                    <Select
                                        style={{margin: "4px 0 14px 0", width: "100%"}}
                                        onChange={e => setRequestingCoach(+e.target.value)}
                                    >
                                        <option key={-1} label="-- Select A Coach --"/>
                                        {
                                            availableCoaches.map((coach, index) => <option key={index} value={coach.id} label={coach.username}/>)
                                        }
                                    </Select>
                                    <br/>
                                </>
                            )
                            : null
                    }
                    <div>
                        <label className="input-field-label">Quota:</label>
                    </div>
                    <input
                        className="input-field"
                        style={{fontSize: "90%", height: "30px"}}
                        required
                        type="number"
                        value={quota}
                        onChange={e => handleQuotaChange(e.target.value)}
                    />
                </form>
            </Dialog>
        </>
    );
}
