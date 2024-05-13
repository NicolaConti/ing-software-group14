public class Admin extends User{
    public String password;

    public Admin(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public void closeEntry(Map m, int id){
        for(int i=0; i<m.entries.length; i++){
            if(m.entries[i].entryID == id){
                // da fare
                return;
            }
        }
    }

    public void suspendUser(String username) {

    }

    public void deleteFeedback() {

    }

    public void vediAccessi() {

    }
}
