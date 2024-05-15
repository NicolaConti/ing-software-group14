import com.mongodb.*;
import com.mongodb.client.*;
//import org.bson.Document;

public class DBConnection {
    public static void main(String[] args) {
        String connectionString = "mongodb+srv://continicolaa:NikyZen01@ingsoftwaredb.nocpa6u.mongodb.net/?retryWrites=true&w=majority&appName=IngSoftwareDB";
        ServerApi serverApi = ServerApi.builder()
                .version(ServerApiVersion.V1)
                .build();
        MongoClientSettings settings = MongoClientSettings.builder()
                .applyConnectionString(new ConnectionString(connectionString))
                .serverApi(serverApi)
                .build();
        // Create a new client and connect to the server
        try (MongoClient mongoClient = MongoClients.create(settings)) {
            try {
                // Send a ping to confirm a successful connection
                MongoDatabase database = mongoClient.getDatabase("ingsoftware_db");

                // LA QUERY VA QUI

            } catch (MongoException e) {
                e.printStackTrace();
            }
        }
    }
}