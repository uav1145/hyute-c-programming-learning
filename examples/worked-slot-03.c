#include <stdio.h>
int main(void) {
    int x;
    if (scanf("%d", &x) != 1) {
        puts("Du lieu khong hop le");
        return 1;
    }
    if (x < -1000 || x > 1000) {
        puts("Ngoai pham vi");
        return 1;
    }
    long long square = (long long)x * x;
    printf("Binh phuong = %lld\n", square);
    return 0;
}
