#include <stdio.h>
int main(void) {
    double diem;
    if (scanf("%lf", &diem) != 1) return 1;
    if (diem < 0 || diem > 10) {
        puts("Khong hop le");
    } else if (diem >= 5) {
        puts("Dat");
    } else {
        puts("Chua dat");
    }
    return 0;
}
