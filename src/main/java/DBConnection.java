import com.mongodb.*;
import com.mongodb.client.*;
import org.bson.Document;

public class DBConnection {
    String connectionString = "mongodb+srv://continicolaa:NikyZen01@ingsoftwaredb.nocpa6u.mongodb.net/?retryWrites=true&w=majority&appName=IngSoftwareDB";
    ServerApi serverApi = ServerApi.builder()
            .version(ServerApiVersion.V1)
            .build();
    MongoClientSettings settings = MongoClientSettings.builder()
            .applyConnectionString(new ConnectionString(connectionString))
            .serverApi(serverApi)
            .build();
    MongoClient mongoClient = MongoClients.create(settings);

    public void TestConn() {
        try {
            // Send a ping to confirm a successful connection
            MongoDatabase db = mongoClient.getDatabase("ingsoftware_db");
            db.runCommand(new Document("ping", 1));
            System.out.println("Pinged your deployment. You successfully connected to MongoDB!");
        } catch (MongoException e) {
            e.printStackTrace();
        }

    }

    public FindIterable<Document> QueryFind(BasicDBObject query, String collection) {
        try {
            MongoDatabase db = mongoClient.getDatabase("ingsoftware_db");
            // QUERY QUI
            MongoCollection<Document> collect = db.getCollection(collection);
            return collect.find(query);
        } catch (MongoException e) {
            e.printStackTrace();
        }
        return null;
    }

    public void QueryEdit(BasicDBObject query, String collection) {
        try {
            MongoDatabase db = mongoClient.getDatabase("ingsoftware_db");
            // QUERY QUI
            MongoCollection<Document> collect = db.getCollection(collection);
            collect.find(query);


        } catch (MongoException e) {
            e.printStackTrace();
        }
    }

    public void StampaQuery (FindIterable<Document> found) {
        for (Document document : found) {
            System.out.println(document);
        }
    }
}