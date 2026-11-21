#include <stdio.h>
int chu_vi(int d, int r) { return 2 * (d + r); }
int dien_tich(int d, int r) { return d * r; }
void hien_thi(int cv, int dt) {
    printf("P=%d; S=%d\n", cv, dt);
}
int main(void) {
    int dai = 6, rong = 4;
    hien_thi(chu_vi(dai, rong), dien_tich(dai, rong));
    return 0;
}
