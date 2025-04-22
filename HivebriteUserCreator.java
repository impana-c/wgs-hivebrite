import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.HashMap;

public class HivebriteUserCreator {

    private static final String API_KEY = "REPLACE";  
    private static final String URL = "https://weglobal.us.hivebrite.com/api/admin/v1/users";

    // dictionary of the different roles to subnetwork ids
    private static final Map<String, Integer> roleToSubNetworkId = new HashMap<>() {{
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


    public static void createHivebriteUser(String firstName, String lastName, String email, String roleName) {
        try {
            if (!roleToSubNetworkId.containsKey(roleName)) {
                System.err.println("Error: Unknown role '" + roleName + "'");
                return;
            }

            int subNetworkId = roleToSubNetworkId.get(roleName);

            HttpClient client = HttpClient.newHttpClient();

            String jsonPayload = String.format(
                "{ \"user\": { \"firstname\": \"%s\", \"lastname\": \"%s\", \"email\": \"%s\", \"sub_network_ids\": [%d] } }",
                firstName, lastName, email, subNetworkId
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + API_KEY)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("Response code: " + response.statusCode());
            System.out.println("Response body: " + response.body());

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        createHivebriteUser("Test", "Account", "test_account@example.com", "Undefined");
    }
}