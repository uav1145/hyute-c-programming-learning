#include <stdio.h>
struct Item { int id; double price; };
int main(void) {
    struct Item a = {7, 12.5}, b;
    FILE *f = fopen("item.bin", "wb");
    if (!f) return 1;
    if (fwrite(&a, sizeof a, 1, f) != 1) { fclose(f); return 1; }
    if (fclose(f) != 0) return 1;
    f = fopen("item.bin", "rb");
    if (!f) return 1;
    if (fread(&b, sizeof b, 1, f) != 1) { fclose(f); return 1; }
    printf("ID=%d, gia=%.1f\n", b.id, b.price);
    if (fclose(f) != 0) return 1;
    return 0;
}
