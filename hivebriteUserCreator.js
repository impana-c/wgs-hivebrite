const API_KEY = 'REPLACE';  
const CREATE_USER_URL = "https://weglobal.us.hivebrite.com/api/admin/v1/users";
const TOPICS_USERS_URL = "https://weglobal.us.hivebrite.com/api/admin/v2/topics/users";

const roleNameToRoleId = {
    "VIP Lifetime Membership": 659,
    "Free Gold membership 12 Months": 744,
    "Free": 579,
    "Business Essentials": 5588,
    "Business Growth & Elite": 5589
};

const clusterToSubNetworkId = {
    "Undefined": 1879,
    "Founder": 2550,
    "Funder": 2552,
    "Entrepreneur In Training": 2557,
    "Partner": 2553,
    "Small Business Owner": 2558,
    "Service Provider": 2555,
    "Vine Studio Member": 12054,
    "WE Global Advisory Board/Management Team": 2556,
    "WE Global Staff": 12062,
    "Beacon Studio Founder": 12055,
    "WE Global Advisory Council/Circle Member": 4601,
    "WE Marketplace": 12058,
    "WE Global Foodee Advisory Board": 4604,
    "Ignition Studio Founder": 12057,
    "Velocity Studio Founder": 12056
};

const groupNameToGroupId = {
    "WEscore": 34828, 
    "WE Operations": 14683,
    "Marketing & Sales": 12193,
    "Legal and Finance": 3662,
    "Founder Life": 3661,
    "Beacon Studio": 14660,
    "Business Strategy": 12384,
    "Media Network": 3645,
    "Ignition Studio": 14661,
    "Product Development": 3665,
    "Business Strategy | Legal": 3646,
    "Founder DNA™": 3668,
    "Scaling": 3644,
    "University Entrepreneurs": 3015,
    "Velocity Studio": 14662,
};

async function createHivebriteUserFromData(d) {
    const { firstName, lastName, email, clusterName = "Founder", plan } = d;

    if (!clusterToSubNetworkId.hasOwnProperty(clusterName)) {
        console.error(`Error: Unknown cluster '${clusterName}'`);
        return;
    }

    const subNetworkId = clusterToSubNetworkId[clusterName];
    const roleId = plan === "Essentials" ? roleNameToRoleId["Business Essentials"] : roleNameToRoleId["Business Growth & Elite"];

    const jsonPayload = JSON.stringify({
        user: {
            firstname: firstName,
            lastname: lastName,
            email: email,
            sub_network_ids: [subNetworkId],
            role_id: roleId
        }
    });

    try {
        const response = await fetch(CREATE_USER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: jsonPayload
        });

        const responseBody = await response.json();
        console.log(`Response code: ${response.status}`);
        console.log(`Response body:`, responseBody);

        const userId = responseBody.user?.id;
        if (!userId) {
            console.error("Could not extract user_id from response.");
            return;
        }

        if (plan === "Essentials") {
            await addUserToGroup(userId, groupNameToGroupId["WEscore"], false);
        } else {
            for (const groupId of Object.values(groupNameToGroupId)) {
                await addUserToGroup(userId, groupId, false);
            }
        }

    } catch (error) {
        console.error("Error while creating user:", error);
    }
}

async function addUserToGroup(userId, groupId, sendEmailInvite) {
    const body = JSON.stringify({
        send_email_invitation: sendEmailInvite,
        members: [{
            group_id: groupId,
            user_ids: [userId]
        }]
    });

    try {
        const response = await fetch(TOPICS_USERS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: body
        });

        const responseBody = await response.json();
        console.log(`Topics code: ${response.status}`);
        console.log(`Users body:`, responseBody);
    } catch (error) {
        console.error(`Could not add user ${userId} to group ${groupId}`, error);
    }
}

const d = {
    firstName: "Test",
    lastName: "Account",
    email: "test_account@example.com",
    plan: "Growth",
};

createHivebriteUserFromData(d);
