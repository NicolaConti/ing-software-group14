public class MapEntry {
    public int entryID;
    public EntryType tipo;
    public String descrizione;
    public Coordinate coord;
    public Feedback[] linkedfeedback;

    public MapEntry(EntryType tipo, String descrizione, Coordinate coord) {
        this.tipo = tipo;
        this.descrizione = descrizione;
        this.coord = coord;
    }

    public void addFeedback(Feedback feedback) {
        this.linkedfeedback[this.linkedfeedback.length - 1] = feedback;
    }

}
