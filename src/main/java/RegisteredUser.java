public class RegisteredUser extends User{
    public String password;

    public RegisteredUser(String username, String password) {
        this.username = username;
        this.password = password;
    }
}
