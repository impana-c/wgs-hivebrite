const API_KEY = 'REPLACE';  
const BASE_USER_URL = 'https://weglobal.us.hivebrite.com/api/admin/v1/users';

async function deactivateHivebriteUser(userId) {
    const url = `${BASE_USER_URL}/${userId}`;
  
    const payload = JSON.stringify({
      user: {
        is_active: false
      }
    });
  
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: payload
      });
  
      const result = await response.json();
  
      if (response.ok) {
        console.log(`User ${userId} has been deactivated.`);
        await printUserInfo(userId);
      } else {
        console.error(`Failed to deactivate user ${userId}. Status: ${response.status}`);
        console.error(result);
      }
    } catch (error) {
      console.error(`Error deactivating user ${userId}:`, error);
    }
  }
  

async function deleteHivebriteUser(userId) {
    const url = `${BASE_USER_URL}/${userId}`;

    try {
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
        'Authorization': `Bearer ${API_KEY}`
        }
    });

    if (response.status === 204) {
        console.log(`User ${userId} successfully deleted.`);
    } else {
        console.error(`Failed to delete user ${userId}. Status: ${response.status}`);
        const body = await response.text();
        console.error(body);
    }
    } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    }
}

async function getUserIdByEmail(email, firstname = '', lastname = '') {
    let page = 1;
    const perPage = 100;

    while (true) {
    const url = new URL(BASE_USER_URL);
    url.searchParams.append('page', page);
    url.searchParams.append('per_page', perPage);
    url.searchParams.append('full_profile', 'true');

    try {
        const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        }
        });

        if (!response.ok) {
        console.error(`Failed to fetch page ${page}:`, response.status);
        return null;
        }

        const { users } = await response.json();

        for (const user of users) {
        if (
            user.email?.toLowerCase() === email.toLowerCase() &&
            (!firstname || user.firstname?.toLowerCase() === firstname.toLowerCase()) &&
            (!lastname || user.lastname?.toLowerCase() === lastname.toLowerCase())
        ) {
            console.log(`Found user: ${user.firstname} ${user.lastname}, ID: ${user.id}`);
            return user.id;
        }
        }

        const linkHeader = response.headers.get('link');
        if (!linkHeader || !linkHeader.includes('rel="next"')) {
        console.log(`User not found.`);
        return null;
        }

        page += 1;
    } catch (error) {
        console.error(`Error fetching users:`, error);
        return null;
    }
    }
}

async function printUserInfo(userId) {
    const url = `${BASE_USER_URL}/${userId}`;

    try {
        const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        }
        });

        const data = await response.json();

        if (response.ok) {
        console.log(`User ${userId} is_active:`, data.is_active);
        } else {
        console.error(`Failed to fetch user info. Status: ${response.status}`);
        console.error(data);
        }
    } catch (error) {
        console.error(`Error fetching user info for ${userId}:`, error);
    }
}
  

const userId = await getUserIdByEmail("test_account@example.com", "Test", "Account");
if (userId) {
    console.log(userId);
}

await deactivateHivebriteUser(userId);
await deleteHivebriteUser(userId); 