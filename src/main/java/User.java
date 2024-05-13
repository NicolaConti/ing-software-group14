public class User {
    public boolean auth;
    public String email;
    public String username;
    public boolean suspended;

    public User() {
    }

    public String getUsername() {
        return this.username;
    }

    public boolean isAuth() {
        return this.auth;
    }

    public boolean isSuspended() {
        return this.suspended;
    }

    public void logout() {
        this.auth = false;
    }

    public void viewMap() {

    }
}
