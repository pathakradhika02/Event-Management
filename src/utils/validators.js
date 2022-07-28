//  function to if any field is missing or has empty value
const isMissingOrEmpty = function (value) {
    if (typeof (value) === 'undefined' || typeof (value) === 'null') return false
    else if (typeof (value) === 'string' && value.trim().length > 0) return true
}


//  function to validate email
const isValidEmail = function (email) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) return true
}


// function to validate objectId
const isValidID = function (id) {
    if (/^[0-9a-fA-F]{24}$/.test(id)) return true
}


const finalInvitees = function (existInvitees, newInvitees) {
    let map = {}

    for(let i = 0; i<existInvitees.length ; i++) {
        if( !map[existInvitees[i].invitee]) map[existInvitees[i].invitee]=1
    }

    for(let i = 0; i<newInvitees.length ; i++) {
        if( !map[newInvitees[i]]) {
            existInvitees.push({invitee: newInvitees[i], invitedAt: new Date()});
        }
    }
    return existInvitees
}


const removeDuplicateInvitees = function(invitees) {
    let map = {}
    let result = [];

    for(let i = 0; i<invitees.length ; i++) {
        if( !map[invitees[i]]) {
            map[invitees[i]]=1
            result.push({invitee: invitees[i], invitedAt: new Date()});
        }
    }
    return result;
}


module.exports = { isMissingOrEmpty, isValidEmail, isValidID, finalInvitees,removeDuplicateInvitees }