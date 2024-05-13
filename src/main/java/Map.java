public class Map {
    public float area;
    public MapEntry[] entries;

    public Map(float area) {
        this.area = area;
    }

    public void addEntry(MapEntry entry) {
        this.entries[this.entries.length - 1] = entry;
    }

}
