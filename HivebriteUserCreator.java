import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.HashMap;
import java.util.regex.*;

public class HivebriteUserCreator {

    private static final String API_KEY = "REPLACE";  
    private static final String CREATE_USER_URL = "https://weglobal.us.hivebrite.com/api/admin/v1/users";
    private static final String TOPICS_USERS_URL = "https://weglobal.us.hivebrite.com/api/admin/v2/topics/users";

    private static final Map<String, Integer> roleNameToRoleId = new HashMap<>() {{
        put("VIP Lifetime Membership", 659);
        put("Free Gold membership 12 Months", 744);
        put("Free", 579);
        put("Business Essentials", 5588);
        put("Business Growth & Elite", 5589);
    }};

    private static final Map<String, Integer> clusterToSubNetworkId = new HashMap<>() {{
        put("Undefined", 1879);
        put("Founder", 2550);
        put("Funder", 2552);
        put("Entrepreneur In Training", 2557);
        put("Partner", 2553);
        put("Small Business Owner", 2558);
        put("Service Provider", 2555);
        put("Vine Studio Member", 12054);
        put("WE Global Advisory Board/Management Team", 2556);
        put("WE Global Staff", 12062);
        put("Beacon Studio Founder", 12055);
        put("WE Global Advisory Council/Circle Member", 4601);
        put("WE Marketplace", 12058);
        put("WE Global Foodee Advisory Board", 4604);
        put("Ignition Studio Founder", 12057);
        put("Velocity Studio Founder", 12056);
    }};

    private static final Map<String, Integer> groupNameToGroupId = new HashMap<>() {{

    }};


    public static void createHivebriteUser(String firstName, String lastName, String email, String clusterName, String roleName) {
        try {
            if (!clusterToSubNetworkId.containsKey(clusterName)) {
                System.err.println("Error: Unknown cluster '" + clusterName + "'");
                return;
            }

            int subNetworkId = clusterToSubNetworkId.get(clusterName);
            int roleId = roleNameToRoleId.get(roleName);

            HttpClient client = HttpClient.newHttpClient();

            String jsonPayload = String.format(
                "{ \"user\": { \"firstname\": \"%s\", \"lastname\": \"%s\", \"email\": \"%s\", \"sub_network_ids\": [%d], \"role_id\": %d } }",
                firstName, lastName, email, subNetworkId, roleId
            );


            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(CREATE_USER_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + API_KEY)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("Response code: " + response.statusCode());
            System.out.println("Response body: " + response.body());

            Pattern pattern = Pattern.compile("\"user\"\\s*:\\s*\\{[^}]*?\"id\"\\s*:\\s*(\\d+)");
            Matcher matcher = pattern.matcher(response.body());

            if (matcher.find()) {
                int userId = Integer.parseInt(matcher.group(1));
                addUserToGroup(client, userId, 34828, false); //right now, just adding to WEscore group
            } else {
                System.err.println("Could not extract user_id from response.");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void addUserToGroup(HttpClient client, int userId, int groupId, boolean sendEmailInvite) {
        try {
            String body = String.format(
                "{ \"send_email_invitation\": %s, " +
                "\"members\": [ { \"group_id\": %d, \"user_ids\": [%d] } ] }",
                sendEmailInvite, groupId, userId
            );

            HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(TOPICS_USERS_URL))    
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + API_KEY)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

            HttpResponse<String> resp =
                client.send(req, HttpResponse.BodyHandlers.ofString());

            System.out.println("[TOPICS/USERS] code: " + resp.statusCode());
            System.out.println("[TOPICS/USERS] body: " + resp.body());
        } catch (Exception e) {
            System.err.printf("Could not add user %d to group %d%n", userId, groupId);
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        createHivebriteUser("Test", "Account", "test_account@example.com", "Undefined", "Free");
    }
}