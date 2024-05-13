public enum EntryType {
    A(0), B(1), C(2), D(3);

    private final int tipo;

    EntryType(int tipo) {
        this.tipo = tipo;
    }

    public int getTipo() {
        return tipo;
    }
    static public EntryType getEnum(int n){
        return switch (n) {
            case 0 -> EntryType.A;
            case 1 -> EntryType.B;
            case 2 -> EntryType.C;
            default -> EntryType.D;
        };

    }
}
