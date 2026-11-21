#include <stdio.h>
struct Item { int id; double price; };
int main(void) {
    struct Item a[] = {{1,10.0},{2,20.0},{3,30.0}};
    FILE *f = fopen("items_v2.bin", "wb");
    if (f == NULL) return 1;
    int write_failed = (fwrite(a, sizeof a[0], 3, f) != 3);
    if (fclose(f) != 0) write_failed = 1;
    if (write_failed) return 1;
    f = fopen("items_v2.bin", "r+b");
    if (f == NULL) return 1;
    struct Item x;
    int found = 0;
    while (1) {
        long pos = ftell(f);
        if (pos < 0) { fclose(f); return 1; }
        if (fread(&x, sizeof x, 1, f) != 1) break;
        if (x.id == 2) {
            x.price = 25.0;
            if (fseek(f, pos, SEEK_SET) != 0 || fwrite(&x, sizeof x, 1, f) != 1) {
                fclose(f); return 1;
            }
            found = 1;
            break;
        }
    }
    if (ferror(f) || fclose(f) != 0 || !found) return 1;
    f = fopen("items_v2.bin", "rb");
    if (f == NULL) return 1;
    if (fseek(f, (long)sizeof(struct Item), SEEK_SET) != 0 ||
        fread(&x, sizeof x, 1, f) != 1) { fclose(f); return 1; }
    if (fclose(f) != 0) return 1;
    printf("ID=%d; gia=%.1f\n", x.id, x.price);
    return 0;
}
