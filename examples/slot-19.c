#include <stdio.h>
int main(void) {
    FILE *f = fopen("diem.txt", "w");
    if (f == NULL) { perror("Mo ghi"); return 1; }
    if (fprintf(f, "%d\n", 85) < 0) { fclose(f); return 1; }
    if (fclose(f) != 0) return 1;
    f = fopen("diem.txt", "r");
    if (f == NULL) { perror("Mo doc"); return 1; }
    int diem;
    if (fscanf(f, "%d", &diem) != 1) { fclose(f); return 1; }
    printf("Diem = %d\n", diem);
    if (fclose(f) != 0) return 1;
    return 0;
}
