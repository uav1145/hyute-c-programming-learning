#include <stdio.h>
#include <stddef.h>
struct SinhVien { char ten[20]; int diem; };
int main(void) {
    struct SinhVien ds[] = {{"An", 9}, {"Binh", 7}, {"Chi", 8}};
    size_t n = sizeof ds / sizeof ds[0];
    size_t best = 0;
    for (size_t i = 1; i < n; ++i) {
        if (ds[i].diem > ds[best].diem) best = i;
    }
    printf("Cao nhat: %s (%d)\n", ds[best].ten, ds[best].diem);
    return 0;
}
