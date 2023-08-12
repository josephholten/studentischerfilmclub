import {fetchApi} from "./api.js"
import {datetimeFormat} from "./datetimeFormat.js"

let live = false;
let vote_status = {}
let voters = 0;

export function handleElectionsWebsocketMessage(event) {
    const data = JSON.parse(event.data)
    console.log("WS message:", data)
    if ("live" in data) {
        live = data["live"]
        setLiveIcon(live)
        getLiveElection()
    } 
    if ("vote_status" in data) {
        vote_status = data["vote_status"]
    }
    if ("new_voter" in data) {
        voters += data["new_voter"]
    }
    for (let key in data) {
        if (!key in Object({"is_live": null, "vote_status": null, "new_voter": null})) {
            console.log("Unexpected key in websocket message:", data)
        }
    }
}

export async function getElections() {
    getPastElections()
}

function setLiveIcon(live) {
    document.getElementById("election-live").style.visibility = (live ? "visible" : "hidden")
}

async function setLiveElection(candidates) {
    const candidate_rows = candidates.map((candidate) => `<div class="candidate">${candidate}</div>`)
    document.getElementById("live-election").innerHTML = candidate_rows.join("")
}

async function getLiveElection() {
    const live_election = await fetchApi("GET", "elections/live")
}

async function getPastElections() {
    try {
        const elections = await fetchApi("GET", "elections/past")
        document.getElementById("last-elections").innerHTML = createElectionsHtml(elections)
    } catch(err) {
        console.error(err)
    }
}

function createSingleElectionHtml(election) {
    const candidate_rows = Object.entries(election.candidates).map((candidate_and_vote) => {
        return `<div>${candidate_and_vote[0]}</div><div>${candidate_and_vote[1]}</div>`
    })
    return `<div class="election">
        <div>${datetimeFormat(election.published)}</div>
        <div class="candidates">
            ${candidate_rows.join("")}
        <div>
    </div>`
}

function createElectionsHtml(elections) {
    const election_rows = elections.map((election) => createSingleElectionHtml(election))
    return election_rows.join("")
}

async function submitNewElection(e) {
    e.preventDefault()
    const candidates = Object.values(getFormData(e.target))
    try {
        await fetchApi("POST", "elections/post", candidates)
        document.getElementById("new-election").style.visibility = "hidden"
        document.getElementById("new-election-form").reset()
    } catch(err) {
        console.error(resp.status, resp.statusText, err.msg)
        document.getElementById("new-election-error").innerHTML = err.msg
    }
}

async function closeElection() {
    fetchApi("GET", "elections/close")
    getElections()
}
